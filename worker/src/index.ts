import { Worker, Job } from 'bullmq';
import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { BlobServiceClient } from '@azure/storage-blob';
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
  // Redis Pub Client
  const pub = createClient({ url: REDIS_URL });

  try {
    await pub.connect();
    console.log('✅ Worker connected to Redis');
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
    process.exit(1);
  }

  // BullMQ Worker
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
    const manim = spawn('manim', [
      filePath,
      'MyScene', // TODO: Make scene name dynamic
      '-qm',
      '-o',
      `${jobId}.mp4`,
    ]);

    manim.stdout.on('data', data => console.log(`🎞️ ${data}`));
    manim.stderr.on('data', data => console.error(`❌ ${data}`));

    manim.on('close', code => {
      if (code === 0) {
        const resultPath = path.join('/tmp', `${jobId}.mp4`);
        resolve(resultPath);
      } else {
        reject(new Error(`Manim failed with exit code ${code}`));
      }
    });
  });
}

// ---- Upload to Azure Blob ----
async function uploadToAzure(filePath: string, jobId: string): Promise<string> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING!);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = `${jobId}.mp4`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const videoData = fs.readFileSync(filePath);
  await blockBlobClient.uploadData(videoData);

  return blockBlobClient.url;
}
