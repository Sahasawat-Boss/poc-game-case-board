"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toolsUnlockedAt } from "@/data/cases";
import type { GameCase } from "@/types";

const STORAGE_KEY = "caseboard.solved.v1";

/**
 * ความคืบหน้าของผู้เล่น
 *
 * เก็บลง localStorage เฉพาะ "เลขคดีที่ปิดแล้ว" อย่างเดียว
 * ส่วนกระดานผังคดีไม่เก็บข้ามรอบ เพราะชื่อคนกับชื่อสถานที่สุ่มใหม่ทุกครั้งที่เปิดหน้า
 * การ์ดเก่าจะอ้างถึงคนที่ไม่มีอยู่แล้วในเมืองรอบนี้ ซึ่งสับสนกว่าการเริ่มกระดานใหม่
 */
export function useGame(cases: GameCase[]) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [solved, setSolved] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setSolved(list.filter((n): n is number => typeof n === "number"));
    } catch {
      // localStorage ใช้ไม่ได้ (โหมดส่วนตัว/ปิดคุกกี้) — เล่นต่อได้ แค่ไม่จำความคืบหน้า
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
    } catch {
      /* เงียบไว้ ไม่ใช่เรื่องคอขาดบาดตาย */
    }
  }, [solved, loaded]);

  const current = cases[caseIndex];

  /** เครื่องมือที่ปลดล็อกแล้ว — สะสมจากคดีที่ 1 ถึงคดีปัจจุบัน */
  const tools = useMemo(() => toolsUnlockedAt(cases, current?.n ?? 1), [cases, current?.n]);

  /** เครื่องมือที่คดีนี้เพิ่งปลดล็อกให้ ใช้ขึ้นป้าย "ของใหม่" */
  const justUnlocked = useMemo(() => new Set(current?.unlocks ?? []), [current]);

  const isSolved = useCallback((n: number) => solved.includes(n), [solved]);

  /** ตรวจคำตอบ — คืน true ถ้าถูก แล้วบันทึกว่าปิดคดีนี้แล้ว */
  const submit = useCallback(
    (given: { kind: "person"; personId: number } | { kind: "choice"; value: string }) => {
      if (!current) return false;
      const want = current.answer;
      const ok =
        want.kind === "person"
          ? given.kind === "person" && given.personId === want.personId
          : given.kind === "choice" && given.value === want.correct;
      if (ok) setSolved((prev) => (prev.includes(current.n) ? prev : [...prev, current.n]));
      return ok;
    },
    [current],
  );

  const reset = useCallback(() => setSolved([]), []);

  return {
    cases,
    current,
    caseIndex,
    setCaseIndex,
    solved,
    isSolved,
    tools,
    justUnlocked,
    submit,
    reset,
  };
}
