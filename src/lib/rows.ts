/** ตัวช่วยฝั่งผลลัพธ์ — อ่านค่าในแถว แปลงแถวเป็นการ์ดหลักฐาน และจัดรูปค่าให้อ่านง่าย */

import { columnLabel, columnMeta, tableMeta } from "@/data/meta";
import { METRIC_ALIAS, metricLabel } from "@/lib/query";
import type { EvidenceCard, QueryResult, QueryState } from "@/types";

export type Cell = string | number | Uint8Array | null;

/** แยก alias "table.column" กลับเป็นสองส่วน (คอลัมน์สรุปยอดคืน table ว่าง) */
export function splitAlias(alias: string): { table: string; column: string } {
  const i = alias.indexOf(".");
  if (i < 0) return { table: "", column: alias };
  return { table: alias.slice(0, i), column: alias.slice(i + 1) };
}

/** ค่าที่เอาไปโชว์ในตาราง — ค่าว่างต้องเห็นชัดว่า "ว่าง" เพราะหลายคดีเฉลยอยู่ตรงช่องว่างพอดี */
export function displayValue(value: Cell, table: string, column: string): string {
  if (value === null || value === undefined || value === "") return "— ว่าง —";
  const meta = table ? columnMeta(table, column) : undefined;
  if (meta?.kind === "bool") return Number(value) === 1 ? "จ่ายแล้ว" : "ยังไม่จ่าย";
  if (meta?.kind === "money") return Number(value).toLocaleString("th-TH");
  return String(value);
}

/** หัวคอลัมน์ภาษาไทย + ชื่อแฟ้มต้นทางตัวเล็ก ๆ กำกับตอนเชื่อมหลายแฟ้ม */
export function headerFor(alias: string, agg?: string) {
  if (alias === METRIC_ALIAS) return { label: metricLabel((agg ?? "count") as never), from: "" };
  const { table, column } = splitAlias(alias);
  return { label: columnLabel(table, column), from: table ? tableMeta(table).label : "" };
}

/** id ของคนที่โผล่ในแถวนี้ — ใช้รวมเป็นรายชื่อผู้ต้องสงสัยบนกระดาน */
function personIdsIn(columns: string[], row: Cell[]): number[] {
  const ids = new Set<number>();
  columns.forEach((alias, i) => {
    const { table, column } = splitAlias(alias);
    if (!table) return;
    const meta = columnMeta(table, column);
    const isPerson =
      (table === "people" && column === "id") || meta?.ref === "people.id";
    if (!isPerson) return;
    const n = Number(row[i]);
    if (Number.isFinite(n) && n > 0) ids.add(n);
  });
  return [...ids];
}

/** ตั้งชื่อหัวการ์ดจากแถว — เอาชื่อคนก่อน ถ้าไม่มีก็ใช้ค่าแรกที่พออ่านรู้เรื่อง */
function titleFor(query: QueryState, columns: string[], row: Cell[]): string {
  const nameIdx = columns.indexOf("people.name");
  if (nameIdx >= 0 && row[nameIdx]) return String(row[nameIdx]);

  const metricIdx = columns.indexOf(METRIC_ALIAS);
  if (metricIdx >= 0) return String(row[0] ?? "—");

  const base = tableMeta(query.table);
  const first = columns.findIndex((c) => splitAlias(c).table === query.table);
  const value = first >= 0 ? row[first] : null;
  return value ? `${base.icon} ${value}` : base.label;
}

let cardSeq = 0;

/**
 * แปลงแถวหนึ่งในตารางผลลัพธ์ให้เป็นการ์ดบนกระดาน
 * ตำแหน่งเริ่มต้นวางเป็นตารางหลวม ๆ ตามลำดับที่ปัก ผู้เล่นลากจัดใหม่ได้ทีหลัง
 */
export function cardFromRow(
  query: QueryState,
  result: QueryResult,
  rowIndex: number,
  order: number,
): EvidenceCard {
  const row = result.values[rowIndex] as Cell[];
  const cols = result.columns;

  const lines = cols
    .map((alias, i) => {
      const { table, column } = splitAlias(alias);
      const head = headerFor(alias, query.group?.agg);
      return { label: head.label, value: displayValue(row[i], table, column) };
    })
    // การ์ดเล็ก ใส่ได้ราว 6 บรรทัดก็เต็มแล้ว ตัดที่ไม่มีค่าออกก่อน
    .filter((l) => l.value !== "— ว่าง —" || cols.length <= 6)
    .slice(0, 6);

  return {
    id: `card-${++cardSeq}-${Date.now().toString(36)}`,
    table: query.table,
    title: titleFor(query, cols, row),
    lines,
    personIds: personIdsIn(cols, row),
    mark: "none",
    note: "",
    x: 24 + (order % 4) * 232,
    y: 24 + Math.floor(order / 4) * 186,
  };
}
