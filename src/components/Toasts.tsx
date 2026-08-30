"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MessageTone } from "@/types";

interface Toast {
  id: number;
  tone: MessageTone;
  text: string;
  icon?: string;
}

interface ToastApi {
  /** เด้งป้ายแจ้งเตือนลอยกลางบนจอ หายเองใน 3 วิ */
  toast: (text: string, tone?: MessageTone, icon?: string) => void;
  /** โปรยกระดาษสีฉลอง — ใช้ตอนปิดคดีได้ */
  celebrate: () => void;
}

const Ctx = createContext<ToastApi>({ toast: () => {}, celebrate: () => {} });

export const useToast = () => useContext(Ctx);

const LIFE_MS = 3000;
const CONFETTI_COLORS = ["#c99a3e", "#a8332a", "#f1e3c1", "#3e7a52", "#e0b04a"];

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [leaving, setLeaving] = useState<Set<number>>(new Set());
  const [party, setParty] = useState(0);
  const seq = useRef(0);
  // เก็บ timer ไว้เคลียร์ตอน unmount ไม่งั้น setState หลังคอมโพเนนต์ตายแล้ว
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const toast = useCallback(
    (text: string, tone: MessageTone = "info", icon?: string) => {
      const id = ++seq.current;
      setToasts((prev) => [...prev.slice(-2), { id, tone, text, icon }]);
      later(() => setLeaving((prev) => new Set(prev).add(id)), LIFE_MS);
      later(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        setLeaving((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, LIFE_MS + 240);
    },
    [later],
  );

  const celebrate = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setParty((n) => n + 1);
    later(() => setParty(0), 2600);
  }, [later]);

  // สร้างเศษกระดาษครั้งเดียวต่อการฉลองหนึ่งรอบ ไม่ให้ re-render แล้วตำแหน่งกระโดด
  const bits = useMemo(() => {
    if (!party) return [];
    return Array.from({ length: 64 }, (_, i) => ({
      i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.5 + Math.random() * 1.1,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 4 + Math.random() * 5,
      h: 8 + Math.random() * 8,
    }));
  }, [party]);

  const api = useMemo(() => ({ toast, celebrate }), [toast, celebrate]);

  return (
    <Ctx.Provider value={api}>
      {children}

      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast" data-tone={t.tone} data-leaving={leaving.has(t.id)}>
            {t.icon && <span className="text-[16px] leading-none">{t.icon}</span>}
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {bits.length > 0 && (
        <div className="confetti-layer" aria-hidden>
          {bits.map((b) => (
            <span
              key={b.i}
              className="confetti-bit"
              style={{
                left: `${b.left}%`,
                width: b.w,
                height: b.h,
                background: b.color,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.dur}s`,
              }}
            />
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}
