import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export async function GET(
  request: Request,
  props: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await props.params;
    if (!params.path || params.path.length === 0) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...params.path);

    // Security check: prevent directory traversal (e.g., /uploads/../../secrets)
    const uploadsBase = path.join(process.cwd(), "public", "uploads");
    const relative = path.relative(uploadsBase, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    
    // Detect content type based on file extension
    let contentType = "application/octet-stream";
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".pdf") contentType = "application/pdf";

    // Handle range requests for video streaming/Safari compatibility
    const range = request.headers.get("range");
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      
      const fileStream = fs.createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(fileStream);

      return new NextResponse(webStream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
        },
      });
    }

    // Default: Serve full file
    // For video files, we stream to support range requests. For images/PDFs, read directly to memory buffer to minimize TTFB
    const isVideo = ext === ".mp4" || ext === ".webm";
    if (isVideo) {
      const fileStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(fileStream);

      return new NextResponse(webStream as any, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const buffer = await fs.promises.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Dynamic asset serve error:", error);
    return new NextResponse("Internal Server Error", { status: 550 });
  }
}
