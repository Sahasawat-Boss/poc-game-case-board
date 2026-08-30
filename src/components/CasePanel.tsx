"use client";

import { useEffect, useMemo, useState } from "react";
import type { BoardState, GameCase, MessageTone } from "@/types";

interface Props {
  cases: GameCase[];
  current: GameCase;
  caseIndex: number;
  setCaseIndex: (i: number) => void;
  isSolved: (n: number) => boolean;
  submit: (
    given: { kind: "person"; personId: number } | { kind: "choice"; value: string },
  ) => boolean;
  board: BoardState;
  /** ชื่อคนของรอบเล่นนี้ เรียงตาม id (id 1 อยู่ที่ index 0) */
  names: string[];
  onSolved: (title: string) => void;
  onWrong: () => void;
}

export default function CasePanel({
  cases,
  current,
  caseIndex,
  setCaseIndex,
  isSolved,
  submit,
  board,
  names,
  onSolved,
  onWrong,
}: Props) {
  const [hintsOpen, setHintsOpen] = useState(0);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>(null);
  // ตอบผิดแล้วกระดาษสั่นทีนึง — ให้รู้ทันทีโดยไม่ต้องกวาดตาหาข้อความ
  const [shake, setShake] = useState(false);

  // เปลี่ยนคดีแล้วต้องล้างคำใบ้กับข้อความเดิม ไม่งั้นคดีใหม่จะเปิดมาพร้อมคำใบ้ของคดีเก่า
  useEffect(() => {
    setHintsOpen(0);
    setMessage(null);
    setShake(false);
  }, [current.n]);

  /** ผู้ต้องสงสัยที่อยู่บนกระดานตอนนี้ — คนที่ถูก "ตัดออก" ไปแล้วไม่นับ */
  const suspects = useMemo(() => {
    const cleared = new Set<number>();
    const found = new Map<number, boolean>();
    for (const card of board.cards) {
      for (const id of card.personIds) {
        if (card.mark === "cleared") cleared.add(id);
        else found.set(id, true);
      }
    }
    return [...found.keys()]
      .filter((id) => !cleared.has(id))
      .map((id) => ({ id, name: names[id - 1] ?? `คนที่ ${id}` }));
  }, [board, names]);

  const solved = isSolved(current.n);

  const answer = (
    given: { kind: "person"; personId: number } | { kind: "choice"; value: string },
  ) => {
    const ok = submit(given);
    if (ok) {
      setMessage({ tone: "ok", text: "ปิดคดีเรียบร้อย — สำนวนนี้จบแล้ว" });
      onSolved(current.title);
    } else {
      setMessage({
        tone: "error",
        text: "ยังไม่ใช่คนนี้ ลองกลับไปดูเงื่อนไขในสำนวนอีกรอบว่าครบทุกข้อหรือยัง",
      });
      onWrong();
      setShake(false);
      // รอเฟรมถัดไปค่อยติดคลาส ไม่งั้นตอบผิดซ้ำ ๆ แล้วอนิเมชันจะไม่รีสตาร์ต
      requestAnimationFrame(() => setShake(true));
      window.setTimeout(() => setShake(false), 480);
    }
  };

  return (
    <div className="space-y-3">
      {/* แท็บสำนวน */}
      <div className="flex flex-wrap gap-0.5">
        {cases.map((c, i) => (
          <button
            key={c.n}
            className="folder-tab"
            data-active={i === caseIndex}
            data-solved={isSolved(c.n)}
            onClick={() => setCaseIndex(i)}
            title={c.title}
          >
            {isSolved(c.n) ? "✓" : ""}
            {c.n}
          </button>
        ))}
      </div>

      <article className={`paper on-paper${shake ? " shake" : ""}`}>
        {solved && <span className="stamp-mark">ปิดคดีแล้ว</span>}
        <p className="eyebrow">
          สำนวนที่ {current.n} · {current.skill}
        </p>
        <h2 className="paper-title">{current.title}</h2>

        <div
          className="text-[13.5px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: current.brief }}
        />

        <p className="mt-3 border-l-[3px] border-stamp pl-3 text-[13.5px] font-semibold leading-snug">
          {current.goal}
        </p>

        {/* คำใบ้ เปิดทีละใบ */}
        <div className="mt-3">
          {current.hints.slice(0, hintsOpen).map((h, i) => (
            <p
              key={i}
              className="hint-line mb-1.5 text-[12.5px] leading-relaxed text-ink-soft"
              dangerouslySetInnerHTML={{ __html: `<b>ใบที่ ${i + 1}:</b> ${h}` }}
            />
          ))}
          {hintsOpen < current.hints.length && (
            <button className="btn btn-paper" onClick={() => setHintsOpen((n) => n + 1)}>
              💡 ขอคำใบ้ ({hintsOpen}/{current.hints.length})
            </button>
          )}
        </div>

        {/* ช่องสรุปสำนวน */}
        <div className="mt-4 border-t border-ink/15 pt-3">
          <p className="eyebrow">สรุปสำนวน</p>

          {current.answer.kind === "choice" ? (
            <div className="flex flex-wrap gap-1.5">
              <span className="w-full text-[12.5px] text-ink-soft">
                {current.answer.prompt}
              </span>
              {current.answer.options.map((o) => (
                <button
                  key={o}
                  className="btn btn-paper"
                  onClick={() => answer({ kind: "choice", value: o })}
                >
                  {o}
                </button>
              ))}
            </div>
          ) : suspects.length === 0 ? (
            <p className="msg msg-info m-0">
              ยังไม่มีใครอยู่บนกระดาน — ไปที่ห้องแฟ้ม กด 📌 ท้ายแถวของคนที่สงสัย
              แล้วชื่อจะมาโผล่ตรงนี้ให้ชี้ตัว
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <span className="w-full text-[12.5px] text-ink-soft">
                ชี้ตัวจากคนที่อยู่บนกระดาน ({suspects.length} คน)
              </span>
              {suspects.map((s) => (
                <button
                  key={s.id}
                  className="btn btn-paper"
                  onClick={() => answer({ kind: "person", personId: s.id })}
                >
                  👤 {s.name}
                </button>
              ))}
            </div>
          )}

          {message && (
            <p className={`msg msg-${message.tone} mt-2`}>{message.text}</p>
          )}

          {solved && caseIndex < cases.length - 1 && (
            <button className="btn mt-2" onClick={() => setCaseIndex(caseIndex + 1)}>
              เปิดสำนวนถัดไป →
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
