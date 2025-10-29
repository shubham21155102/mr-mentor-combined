import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir, unlink } from "fs/promises";
// import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ========== LOCAL STORAGE (COMMENTED OUT) ==========
    // Uncomment the code below if you want to save files locally before uploading to Google Drive
    
    // const recordingsDir = join(process.cwd(), "public/recordings");
    // await mkdir(recordingsDir, { recursive: true });

    const filename = `recording-${Date.now()}.webm`;
    // const path = join(recordingsDir, filename);

    // await writeFile(path, buffer);
    // console.log(`Saved locally at ${path}`);
    
    // ========== END LOCAL STORAGE ==========

    // Upload directly to Google Drive
    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: file.type }), filename);

    const driveResponse = await fetch(`${request.nextUrl.origin}/api/drive-upload`, {
      method: "POST",
      body: formData,
    });

    const driveResult = await driveResponse.json();

    if (driveResult.success) {
      console.log(`Successfully uploaded ${filename} to Google Drive`);
      
      // ========== DELETE LOCAL FILE (COMMENTED OUT) ==========
      // Uncomment if you enabled local storage above
      // await unlink(path);
      // console.log(`Deleted local file ${path}`);
      // ========== END DELETE LOCAL FILE ==========
    }

    return NextResponse.json({
      success: driveResult.success,
      ...driveResult,
      filename: filename,
    });
  } catch (error) {
    console.error("Error uploading recording:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to upload recording",
    });
  }
}