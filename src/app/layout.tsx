import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "แฟ้มคดีลอสโซรานเจลิส — เกมไขคดีแบบคลิก",
  description:
    "ไขคดีด้วยการเปิดแฟ้ม กรอง เชื่อมข้อมูล แล้วปักหมุดขึ้นกระดานผังคดี — ไม่ต้องเขียนคำสั่งอะไรเลย",
};

export const viewport: Viewport = {
  themeColor: "#2A2018",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
