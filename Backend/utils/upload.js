import multer from "multer";
import os from "os";
import path from "path";
import fs from "fs";

// On Vercel / AWS Lambda, only /tmp is writable
const uploadDir = process.env.VERCEL 
  ? path.join(os.tmpdir(), "uploads") 
  : path.join(process.cwd(), "uploads");

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create uploads directory:", e.message);
}

export const upload = multer({ dest: uploadDir });
export default upload;
