// คัดลอก sql-wasm.wasm จาก node_modules มาไว้ที่ public/ เพื่อให้เกมโหลดแบบออฟไลน์ได้
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// bundler ฝั่ง browser จะ resolve เป็น sql-wasm-browser.js ซึ่งขอไฟล์ sql-wasm-browser.wasm
const files = ["sql-wasm.wasm", "sql-wasm-browser.wasm"];

for (const file of files) {
  const src = path.resolve("node_modules/sql.js/dist", file);
  const dest = path.resolve("public", file);

  if (!existsSync(src)) {
    console.warn(`[copy-wasm] ยังไม่เจอ ${file} ใน node_modules — ข้ามไปก่อน`);
    continue;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
  console.log(`[copy-wasm] copied -> public/${file}`);
}
