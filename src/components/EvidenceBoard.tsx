"use client";

import { useRef, useState } from "react";
import type { BoardState, CardMark, EvidenceCard } from "@/types";

interface Props {
  board: BoardState;
  setBoard: (next: BoardState) => void;
}

const CARD_W = 212;
const CARD_H = 132;

const MARKS: { key: CardMark; label: string; title: string }[] = [
  { key: "suspect", label: "🔴 สงสัย", title: "ทำเครื่องหมายว่าน่าสงสัย" },
  { key: "cleared", label: "✅ ตัดออก", title: "มีข้อแก้ตัวแล้ว ตัดออกจากรายชื่อ" },
  { key: "key", label: "⭐ ตัวหลัก", title: "หลักฐานชิ้นสำคัญของคดีนี้" },
];

/**
 * กระดานผังคดี — ที่ที่การวิเคราะห์เกิดขึ้นจริง
 *
 * ตารางผลลัพธ์ตอบได้แค่ "แถวไหนเข้าเงื่อนไข" แต่คดีที่ต้องเอาเบาะแสจากหลายแฟ้มมาต่อกัน
 * ต้องมีที่วางของกลาง ๆ ให้เห็นพร้อมกันทั้งหมด — ปักหมุด โยงเส้น กาชื่อออกทีละคน
 */
export default function EvidenceBoard({ board, setBoard }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);

  const update = (id: string, patch: Partial<EvidenceCard>) =>
    setBoard({
      ...board,
      cards: board.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const removeCard = (id: string) =>
    setBoard({
      cards: board.cards.filter((c) => c.id !== id),
      links: board.links.filter((l) => l.from !== id && l.to !== id),
    });

  const onPointerDown = (e: React.PointerEvent, card: EvidenceCard) => {
    // อย่าเริ่มลากถ้ากดโดนปุ่มหรือช่องจด ไม่งั้นพิมพ์โน้ตไม่ได้เลย
    if ((e.target as HTMLElement).closest("button, textarea, input")) return;
    const rect = surface.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      id: card.id,
      dx: e.clientX - rect.left - card.x,
      dy: e.clientY - rect.top - card.y,
    };
    setDragging(card.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = surface.current?.getBoundingClientRect();
    if (!d || !rect) return;
    update(d.id, {
      x: clamp(e.clientX - rect.left - d.dx, 0, rect.width - CARD_W),
      y: Math.max(0, e.clientY - rect.top - d.dy),
    });
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(null);
  };

  /** กดปุ่มโยงเส้นที่การ์ดใบแรก แล้วกดที่ใบที่สอง = ได้เชือกหนึ่งเส้น */
  const tapLink = (id: string) => {
    if (!linkFrom) return setLinkFrom(id);
    if (linkFrom === id) return setLinkFrom(null);
    const exists = board.links.some(
      (l) =>
        (l.from === linkFrom && l.to === id) || (l.from === id && l.to === linkFrom),
    );
    if (!exists) {
      setBoard({
        ...board,
        links: [
          ...board.links,
          { id: `l-${linkFrom}-${id}`, from: linkFrom, to: id, label: "" },
        ],
      });
    }
    setLinkFrom(null);
  };

  const center = (id: string) => {
    const c = board.cards.find((x) => x.id === id);
    return c ? { x: c.x + CARD_W / 2, y: c.y + CARD_H / 2 } : null;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-brass/80">
          {linkFrom
            ? "เลือกการ์ดอีกใบเพื่อโยงเชือก (กดใบเดิมซ้ำเพื่อยกเลิก)"
            : "ลากการ์ดจัดวางได้ตามใจ · กด 🔗 ที่การ์ดสองใบเพื่อโยงเชือก"}
        </span>
        {board.links.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={() => setBoard({ ...board, links: [] })}
          >
            ตัดเชือกทั้งหมด
          </button>
        )}
        {board.cards.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={() => setBoard({ cards: [], links: [] })}
          >
            ล้างกระดาน
          </button>
        )}
      </div>

      <div
        ref={surface}
        className="board-surface"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {board.cards.length === 0 && (
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-[13px] leading-relaxed text-manila/70">
            กระดานยังว่าง — กลับไปที่ห้องแฟ้ม แล้วกด 📌 ท้ายแถวที่น่าสนใจ
            <br />
            แถวนั้นจะกลายเป็นการ์ดมาแปะที่นี่
          </p>
        )}

        {/* เชือกแดงวาดเป็นเลเยอร์หลังการ์ด */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {board.links.map((l) => {
            const a = center(l.from);
            const b = center(l.to);
            if (!a || !b) return null;
            // ให้เชือกวาดตัวเองออกมาจากต้นทาง — dasharray เท่าความยาวเส้นพอดี
            const len = Math.hypot(b.x - a.x, b.y - a.y);
            return (
              <line
                key={l.id}
                className="link-line"
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#b8342a"
                strokeWidth={2}
                strokeOpacity={0.75}
                strokeDasharray={len}
                style={{ ["--len" as string]: len } as React.CSSProperties}
              />
            );
          })}
        </svg>

        {board.cards.map((card) => (
          <article
            key={card.id}
            className="pin-card"
            style={{ left: card.x, top: card.y }}
            data-mark={card.mark}
            data-dragging={dragging === card.id}
            data-linking={linkFrom === card.id}
            onPointerDown={(e) => onPointerDown(e, card)}
          >
            <header className="flex items-start gap-1">
              <h4 className="pin-title flex-1">{card.title}</h4>
              <button className="icon-btn" onClick={() => tapLink(card.id)} title="โยงเชือกไปการ์ดอื่น">
                🔗
              </button>
              <button
                className="icon-btn"
                data-danger="true"
                onClick={() => removeCard(card.id)}
                title="เอาการ์ดนี้ออก"
              >
                ✕
              </button>
            </header>

            <div className="mb-1.5">
              {card.lines.map((l, i) => (
                <p key={i} className="pin-line">
                  <span>{l.label}</span>
                  <b>{l.value}</b>
                </p>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {MARKS.map((m) => (
                <button
                  key={m.key}
                  className="mark-btn"
                  data-on={card.mark === m.key}
                  title={m.title}
                  onClick={() => update(card.id, { mark: card.mark === m.key ? "none" : m.key })}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <textarea
              className="pin-note"
              rows={2}
              placeholder="จดไว้กันลืม…"
              value={card.note}
              onChange={(e) => update(card.id, { note: e.target.value })}
            />
          </article>
        ))}
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), Math.max(lo, hi));
}
