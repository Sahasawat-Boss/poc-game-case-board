"use client";

import { useEffect, useState } from "react";
import initSqlJs, { type Database } from "sql.js";
import type { QueryResult, TableSchema } from "@/types";

interface UseDatabase {
  db: Database | null;
  schema: TableSchema[];
  loading: boolean;
  error: string | null;
}

/** โหลด sql.js (wasm) แล้วสร้างฐานข้อมูลในหน่วยความจำจาก seedSql ที่ส่งเข้ามา */
export function useDatabase(seedSql: string): UseDatabase {
  const [db, setDb] = useState<Database | null>(null);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let instance: Database | null = null;

    initSqlJs({ locateFile: (file) => `/${file}` })
      .then((SQL) => {
        if (cancelled) return;
        instance = new SQL.Database();
        instance.run(seedSql);
        setDb(instance);
        setSchema(readSchema(instance));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
      instance?.close();
    };
  }, [seedSql]);

  return { db, schema, loading: !db && !error, error };
}

/** อ่านรายชื่อตารางและคอลัมน์ทั้งหมด ใช้แสดงใน SchemaPanel */
function readSchema(db: Database): TableSchema[] {
  const [tables] = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  if (!tables) return [];
  return tables.values.map((row) => {
    const name = String(row[0]);
    const [info] = db.exec(`PRAGMA table_info(${name})`);
    return { name, columns: info ? info.values.map((c) => String(c[1])) : [] };
  });
}

/** รันคิวรีและคืนผลชุดสุดท้าย (null = ไม่มีแถวที่ตรงเงื่อนไข) */
export function runQuery(db: Database, sql: string): QueryResult | null {
  const results = db.exec(sql);
  if (!results.length) return null;
  const last = results[results.length - 1];
  return { columns: last.columns, values: last.values as QueryResult["values"] };
}
