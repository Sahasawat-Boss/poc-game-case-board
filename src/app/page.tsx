import Link from "next/link";
import { DEFAULT_CASES } from "@/data/cases";
import { TABLES } from "@/data/meta";

const STEPS = [
  {
    icon: "🗄️",
    title: "เปิดแฟ้ม",
    text: "ชั้นวางมี 12 แฟ้ม ตั้งแต่ทะเบียนราษฎร์ยันรายการเดินบัญชี กดแล้วข้อมูลกางออกมาทั้งตาราง",
  },
  {
    icon: "🔎",
    title: "กรองให้แคบลง",
    text: "เลือกช่อง เลือกเงื่อนไข เลือกค่า — ค่าที่เลือกได้ดึงมาจากข้อมูลจริง ไม่มีทางพิมพ์ผิด",
  },
  {
    icon: "🔗",
    title: "เชื่อมแฟ้ม",
    text: "ใบสั่งบอกแค่ทะเบียนรถ ไม่บอกชื่อเจ้าของ กดเชื่อมแล้วสองแฟ้มมาต่อกันเป็นแถวเดียว",
  },
  {
    icon: "📌",
    title: "ปักหมุดขึ้นกระดาน",
    text: "แถวที่น่าสนใจส่งขึ้นกระดานผังคดีได้ ลากจัดวาง โยงเชือกแดง กาชื่อที่มีข้อแก้ตัวออกทีละคน",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1000px] px-4 py-10">
      <header className="mb-8">
        <p className="eyebrow">แฟ้มคดีลอสโซรานเจลิส</p>
        <h1 className="m-0 font-[var(--font-display)] text-[clamp(26px,5vw,40px)] leading-tight text-manila">
          เกมไขคดีที่ไม่ต้องเขียนคำสั่งอะไรเลย
        </h1>
        <p className="mt-3 max-w-[70ch] text-[14.5px] leading-relaxed text-manila/85">
          ข้อมูลทั้งเมืองอยู่ในแฟ้ม 12 เล่ม คดีก็อยู่ตรงนั้นแหละ — งานของคุณคือหาให้เจอว่าเบาะแส
          ชิ้นไหนต่อกับชิ้นไหน ทุกอย่างทำด้วยการคลิก ไม่มีช่องให้พิมพ์คำสั่ง ไม่มีคำว่า error
          ให้ต้องนั่งแก้
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="btn btn-lg" href="/play">
            เริ่มคดีแรก
          </Link>
        </div>
      </header>

      <section className="sheet mb-6">
        <h2 className="section-title">เล่นยังไง</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.title} className="panel">
              <p className="m-0 mb-1 text-[15px] font-semibold text-manila">
                <span aria-hidden className="mr-1.5">
                  {s.icon}
                </span>
                {s.title}
              </p>
              <p className="m-0 text-[12.5px] leading-relaxed text-manila/75">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-manila/70">
          เครื่องมือไม่ได้ให้มาหมดตั้งแต่แรก — คดีแรก ๆ มีแค่ตัวกรอง แล้วค่อยได้การเรียงลำดับ
          การเชื่อมแฟ้ม การสรุปยอด และท่าไม้ตายอย่าง “ต้องไม่มีข้อมูลในแฟ้มนี้” ทีละอย่างตามคดี
        </p>
      </section>

      <section className="sheet mb-6">
        <h2 className="section-title">สำนวนคดี</h2>
        <p className="section-lead">
          {DEFAULT_CASES.length} คดี เรียงจากง่ายไปยาก ชื่อคนและชื่อสถานที่สุ่มใหม่ทุกครั้งที่เริ่มเล่น
          จำคำตอบจากรอบก่อนไม่ได้ ต้องสืบเองใหม่ทุกรอบ
        </p>
        <ol className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2">
          {DEFAULT_CASES.map((c) => (
            <li key={c.n} className="flex items-baseline gap-2 text-[13px] text-manila/85">
              <span className="font-mono text-[11px] text-brass">
                {String(c.n).padStart(2, "0")}
              </span>
              <span className="flex-1">{c.title}</span>
              <span className="chip chip-dark shrink-0">{c.skill}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sheet">
        <h2 className="section-title">แฟ้มในห้องเก็บเอกสาร</h2>
        <p className="section-lead">
          ทุกคดีไขได้จากข้อมูลชุดนี้ล้วน ๆ ไม่มีเบาะแสที่ซ่อนอยู่นอกแฟ้ม
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TABLES.map((t) => (
            <div key={t.name} className="panel">
              <p className="m-0 text-[13.5px] font-semibold text-manila">
                <span aria-hidden className="mr-1.5">
                  {t.icon}
                </span>
                {t.label}
              </p>
              <p className="m-0 mt-1 text-[12px] leading-relaxed text-manila/70">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
