"use client";

import { useState } from "react";
import { METRIC_ALIAS, describeQuery } from "@/lib/query";
import { displayValue, headerFor, splitAlias } from "@/lib/rows";
import type { QueryResult, QueryState } from "@/types";

interface Props {
  query: QueryState;
  setQuery: (next: QueryState) => void;
  result: QueryResult | null;
  error: string | null;
  tools: Set<string>;
  sql: string;
  onPin: (rowIndex: number) => void;
  /** id ของแถวที่ปักไปแล้วรอบนี้ ใช้เปลี่ยนปุ่มเป็น "ปักแล้ว" กันปักซ้ำโดยไม่ตั้งใจ */
  pinnedRows: Set<number>;
}

export default function ResultTable({
  query,
  setQuery,
  result,
  error,
  tools,
  sql,
  onPin,
  pinnedRows,
}: Props) {
  const [showSql, setShowSql] = useState(false);
  const rows = result?.values ?? [];
  const columns = result?.columns ?? [];

  /** กดหัวคอลัมน์เพื่อเรียง กดซ้ำเพื่อสลับทิศ — ไม่ต้องมีปุ่มเรียงแยกให้รก */
  const sortBy = (alias: string) => {
    if (!tools.has("sort") || query.group) return;
    const { table, column } = splitAlias(alias);
    if (!table) return;
    const same = query.sort?.table === table && query.sort?.column === column;
    setQuery({
      ...query,
      sort: { table, column, dir: same && query.sort?.dir === "asc" ? "desc" : "asc" },
    });
  };

  return (
    <div className="panel">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="m-0 text-[12.5px] leading-snug text-brass/90">{describeQuery(query)}</p>
        <span className="shrink-0 font-mono text-[12px] text-brass">
          {error ? "—" : `${rows.length} แถว`}
        </span>
      </div>

      {error ? (
        <p className="msg msg-error m-0">อ่านแฟ้มไม่สำเร็จ: {error}</p>
      ) : rows.length === 0 ? (
        <p className="msg msg-info m-0">
          ไม่มีแถวไหนเข้าเงื่อนไขเลย — ลองถอดตัวกรองออกสักข้อแล้วดูใหม่
        </p>
      ) : (
        <div className="data-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10" title="ปักหมุดขึ้นกระดาน">
                  📌
                </th>
                {columns.map((alias) => {
                  const head = headerFor(alias, query.group?.agg);
                  const { table, column } = splitAlias(alias);
                  const active =
                    query.sort?.table === table && query.sort?.column === column;
                  return (
                    <th key={alias} onClick={() => sortBy(alias)}>
                      {head.label}
                      {active && (query.sort?.dir === "asc" ? " ▲" : " ▼")}
                      {head.from && <small>{head.from}</small>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                // ทยอยโผล่ทีละแถว แต่หน่วงแค่ 12 แถวแรก แถวที่ 13 ขึ้นไปโผล่พร้อมกัน
                // ไม่งั้นผลลัพธ์ร้อยแถวจะรอนานเป็นวินาทีกว่าจะเห็นครบ
                <tr key={i} style={{ animationDelay: `${Math.min(i, 12) * 22}ms` }}>
                  <td>
                    <button
                      className="icon-btn"
                      data-pinned={pinnedRows.has(i)}
                      onClick={() => onPin(i)}
                      title={pinnedRows.has(i) ? "ปักไปแล้ว (กดอีกครั้งเพื่อปักซ้ำ)" : "ปักหมุดขึ้นกระดาน"}
                    >
                      {pinnedRows.has(i) ? "✓" : "📌"}
                    </button>
                  </td>
                  {row.map((cell, j) => {
                    const alias = columns[j];
                    const { table, column } = splitAlias(alias);
                    const text =
                      alias === METRIC_ALIAS
                        ? String(cell)
                        : displayValue(cell as never, table, column);
                    return (
                      <td key={j} data-dim={text === "— ว่าง —"}>
                        {text}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ผู้เล่นไม่ต้องอ่านก็เล่นจบได้ แต่ใครอยากรู้ว่าคลิกเมื่อกี้แปลว่าอะไรก็กางดูได้ */}
      <button
        className="btn btn-ghost mt-2"
        onClick={() => setShowSql((v) => !v)}
        aria-expanded={showSql}
      >
        {showSql ? "▾" : "▸"} คำสั่งเบื้องหลัง (ไม่ต้องอ่านก็เล่นได้)
      </button>
      {showSql && (
        <div className="sql-block mt-2">
          <pre>{sql}</pre>
        </div>
      )}
    </div>
  );
}
