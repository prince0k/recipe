import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== "debug_secret_99881122") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Attempt to get PM2 logs
    const { stdout, stderr } = await execAsync("pm2 logs nutriguide --lines 50 --nostream");
    
    // Also check standard environment variables
    const envStatus = {
      AUTH_URL: process.env.AUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      HAS_AUTH_SECRET: !!process.env.AUTH_SECRET,
      HAS_YAHOO_ID: !!process.env.AUTH_YAHOO_ID,
      HAS_YAHOO_SECRET: !!process.env.AUTH_YAHOO_SECRET,
      YAHOO_ID_LENGTH: process.env.AUTH_YAHOO_ID ? process.env.AUTH_YAHOO_ID.length : 0,
    };

    return NextResponse.json({
      envStatus,
      stdout,
      stderr
    });
  } catch (error: any) {
    // If PM2 command fails, let's try reading standard log files or directories
    try {
      // Find log files in default PM2 directory or check files
      const home = process.env.HOME || process.env.USERPROFILE || "";
      const pm2Dir = path.join(home, ".pm2/logs");
      let logs = "";
      if (fs.existsSync(pm2Dir)) {
        const files = fs.readdirSync(pm2Dir);
        logs = `PM2 Dir files: ${files.join(", ")}\n`;
        // Try reading the last 1000 characters of the error log
        const errLogFile = files.find(f => f.includes("error") || f.includes("err"));
        if (errLogFile) {
          const filePath = path.join(pm2Dir, errLogFile);
          const stats = fs.statSync(filePath);
          const stream = fs.createReadStream(filePath, {
            start: Math.max(0, stats.size - 5000),
            end: stats.size
          });
          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          logs += `\nError Log Content:\n${Buffer.concat(chunks).toString()}`;
        }
      } else {
        logs = `PM2 logs directory not found at ${pm2Dir}`;
      }

      return NextResponse.json({
        error: error.message,
        logs
      });
    } catch (innerError: any) {
      return NextResponse.json({
        error: error.message,
        innerError: innerError.message
      });
    }
  }
}
