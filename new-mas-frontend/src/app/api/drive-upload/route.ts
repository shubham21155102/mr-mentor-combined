import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { join } from "path";
import { readFileSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const uploadedFile = data.get("file");
    if (!uploadedFile || typeof uploadedFile === "string") {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    const arrayBuffer = await (uploadedFile as any).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Check if we have service account credentials or OAuth credentials
    const keyFilePath = join(process.cwd(), "service-account-key.json");
    const credentials = JSON.parse(readFileSync(keyFilePath, "utf8"));

    let auth;
    
    // Check if it's a service account (has client_email and private_key)
    if (credentials.client_email && credentials.private_key) {
      auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });
    } 
    // Check if it's OAuth 2.0 credentials (has client_id and client_secret)
    else if (credentials.client_id && credentials.client_secret) {
      // For OAuth, we need an access token from environment variables
      const accessToken = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
      const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
      
      console.log("Using OAuth 2.0 credentials");
      console.log("Access token present:", !!accessToken);
      console.log("Refresh token present:", !!refreshToken);
      
      if (!accessToken && !refreshToken) {
        throw new Error(
          "OAuth credentials found but no access token or refresh token provided. " +
          "Either use a service account JSON or set GOOGLE_DRIVE_ACCESS_TOKEN/GOOGLE_DRIVE_REFRESH_TOKEN environment variables."
        );
      }
      
      auth = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        "http://localhost:3000/api/auth/google/callback"
      );
      
      auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } else {
      throw new Error(
        "Invalid credentials file. Please provide either:\n" +
        "1. Service account JSON (with client_email and private_key), or\n" +
        "2. OAuth 2.0 credentials (with client_id and client_secret) + access tokens in environment variables"
      );
    }

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      requestBody: {
        name: (uploadedFile as any).name,
        mimeType: (uploadedFile as any).type || "application/octet-stream",
      },
      media: {
        mimeType: (uploadedFile as any).type || "application/octet-stream",
        body: stream,
      },
    });

    // Make the file accessible (set permissions)
    const fileId = response.data.id;
    
    try {
      // Make the file publicly accessible or viewable with link
      await drive.permissions.create({
        fileId: fileId!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permError) {
      console.error("Error setting file permissions:", permError);
      // Continue even if permission setting fails
    }

    // Generate viewable links
    const driveLink = `https://drive.google.com/file/d/${fileId}/view`;
    const directLink = `https://drive.google.com/uc?id=${fileId}&export=download`;

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      driveLink: driveLink,
      directLink: directLink,
      message: "File uploaded successfully to Google Drive",
    });
  } catch (error: any) {
    console.error("Error uploading to Google Drive:", error?.response?.data || error);
    return NextResponse.json({
      success: false,
      error: "Failed to upload to Google Drive",
    });
  }
}