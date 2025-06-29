import { Worker, Job } from 'bullmq';
import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol
} from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  console.error('❌ Missing Azure Storage connection string');
  process.exit(1);
}

const containerName = 'videos';

(async () => {
  const pub = createClient({ url: REDIS_URL });

  try {
    await pub.connect();
    console.log('✅ Worker connected to Redis');
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
    process.exit(1);
  }

  const videoWorker = new Worker(
    'video-generation',
    async (job: Job) => {
      const { code, jobId } = job.data;
      console.log(`🎯 Received job: ${jobId}`);

      const pyFile = `/tmp/${jobId}.py`;
      fs.writeFileSync(pyFile, code);

      try {
        const outputPath = await runManim(pyFile, jobId);
        const videoUrl = await uploadToAzure(outputPath, jobId);

        await pub.publish('video-ready', JSON.stringify({ jobId, videoUrl }));
        console.log(`✅ Job ${jobId} completed and published`);
      } catch (err) {
        console.error(`❌ Job ${jobId} failed to complete:`, err);
      }
    },
    {
      connection: {
        host: new URL(REDIS_URL).hostname,
        port: parseInt(new URL(REDIS_URL).port || '6379'),
      },
    }
  );

  videoWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
  });

  console.log('👷 Worker is listening for jobs...');
})();

// ---- Run Manim CLI ----
function runManim(filePath: string, jobId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFile = `${jobId}.mp4`;

    const manim = spawn('manim', [
      filePath,
      'MyScene',
      '-qm',
      '-o',
      outputFile,
      '--media_dir',
      '/tmp'
    ]);

    manim.stdout.on('data', data => console.log(`🎞️ ${data}`));
    manim.stderr.on('data', data => console.error(`❌ ${data}`));

    manim.on('close', code => {
      if (code === 0) {
        const actualPath = findFileRecursive('/tmp', outputFile);
        if (actualPath) {
          console.log(`✅ Manim rendered video at: ${actualPath}`);
          resolve(actualPath);
        } else {
          reject(new Error(`Rendered video not found in /tmp for ${jobId}`));
        }
      } else {
        reject(new Error(`Manim failed with exit code ${code}`));
      }
    });
  });
}

// ---- Recursively find file ----
function findFileRecursive(dir: string, filename: string): string | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = findFileRecursive(fullPath, filename);
      if (nested) return nested;
    } else if (entry.isFile() && entry.name === filename) {
      return fullPath;
    }
  }

  return null;
}

// ---- Upload and generate signed URL ----
function extractAccountKey(connectionString: string): string {
  const match = connectionString.match(/AccountKey=([^;]+)/);
  if (!match) {
    throw new Error('Could not extract AccountKey from connection string');
  }
  return match[1];
}

async function uploadToAzure(filePath: string, jobId: string): Promise<string> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING!);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `${jobId}.mp4`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const videoData = fs.readFileSync(filePath);
  await blockBlobClient.uploadData(videoData);

  fs.unlinkSync(filePath);

  const accountName = blobServiceClient.accountName;
  const accountKey = extractAccountKey(AZURE_STORAGE_CONNECTION_STRING!);
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasParams = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // 1 hour
      protocol: SASProtocol.Https,
    },
    sharedKeyCredential
  );

  const signedUrl = `${blockBlobClient.url}?${sasParams.toString()}`;
  return signedUrl;
}
