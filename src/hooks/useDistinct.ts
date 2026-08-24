"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Database } from "sql.js";

/** ถ้าค่าที่เป็นไปได้เยอะกว่านี้ เมนูจะยาวจนเลื่อนหาไม่เจอ — เปลี่ยนไปให้พิมพ์เองแทน */
const MENU_LIMIT = 60;

/**
 * ดึง "ค่าที่มีอยู่จริง" ของคอลัมน์หนึ่งมาทำเมนูให้เลือก
 *
 * นี่คือจุดที่ทำให้เกมนี้ไม่ต้องพิมพ์อะไรเลย — ผู้เล่นไม่ต้องรู้ว่าสีหมวกเก็บเป็น 'red'
 * ไม่ใช่ 'แดง' หรือ 'Red' เพราะเมนูดึงค่าจากฐานข้อมูลมาให้เลือกตรง ๆ
 * และไม่มีทางพิมพ์ผิดจนได้ผลลัพธ์ว่างเปล่าแล้วงงว่าตัวเองทำอะไรผิด
 */
export function useDistinct(db: Database | null) {
  const cache = useRef(new Map<string, string[]>());

  useEffect(() => {
    cache.current.clear();
  }, [db]);

  return useCallback(
    (table: string, column: string): string[] => {
      if (!db) return [];
      const key = `${table}.${column}`;
      const hit = cache.current.get(key);
      if (hit) return hit;

      let values: string[] = [];
      try {
        const res = db.exec(
          `SELECT DISTINCT ${column} FROM ${table} WHERE ${column} IS NOT NULL ORDER BY 1 LIMIT ${MENU_LIMIT + 1}`,
        );
        const rows = res.length ? res[0].values : [];
        values = rows.length > MENU_LIMIT ? [] : rows.map((r) => String(r[0]));
      } catch {
        values = [];
      }
      cache.current.set(key, values);
      return values;
    },
    [db],
  );
}
