// app/api/video-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "videos";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  if (!AZURE_STORAGE_CONNECTION_STRING) {
    return NextResponse.json({ error: "Missing Azure Storage credentials" }, { status: 500 });
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${jobId}.mp4`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const accountName = blobServiceClient.accountName;
    const accountKey = extractAccountKey(AZURE_STORAGE_CONNECTION_STRING);
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasParams = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        protocol: SASProtocol.Https,
      },
      sharedKeyCredential
    );

    const signedUrl = `${blockBlobClient.url}?${sasParams.toString()}`;
    return NextResponse.json({ videoUrl: signedUrl });
  } catch (err: any) {
    console.error("❌ Failed to generate signed video URL:", err.message);
    return NextResponse.json({ error: "Failed to get video" }, { status: 500 });
  }
}

function extractAccountKey(connectionString: string): string {
  const match = connectionString.match(/AccountKey=([^;]+)/);
  if (!match) {
    throw new Error("Could not extract AccountKey from connection string");
  }
  return match[1];
}
