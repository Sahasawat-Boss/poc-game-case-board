"use client";

import dynamic from "next/dynamic";

/**
 * ตัวเกมทำงานฝั่งเบราว์เซอร์ล้วน — ทั้ง sql.js (wasm) และการสุ่มชื่อคน/ชื่อสถานที่รายรอบ
 *
 * ต้องปิด SSR ไปเลย ไม่งั้นฝั่งเซิร์ฟเวอร์จะ prerender ด้วยชื่อคนละชุดกับฝั่งเบราว์เซอร์
 * แล้วเกิด hydration mismatch การ prerender ก็ไม่ได้ประโยชน์อยู่แล้วเพราะทุกอย่างรอ wasm
 */
const GameBoard = dynamic(() => import("./GameBoard"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-[1180px] px-4 pt-20 text-center">
      <p className="font-mono text-[12px] uppercase tracking-[3px] text-brass/80">
        กำลังเปิดห้องแฟ้ม…
      </p>
    </div>
  ),
});

export default function GameBoardClient() {
  return <GameBoard />;
}
