"use client";

import { useMemo } from "react";
import { RELATION_BY_ID, TABLES, tableMeta } from "@/data/meta";
import { AGG_LABEL, availableJoins, tablesInQuery } from "@/lib/query";
import FilterRow from "@/components/FilterRow";
import type { AggKind, Filter, QueryState } from "@/types";

interface Props {
  query: QueryState;
  setQuery: (next: QueryState) => void;
  tools: Set<string>;
  justUnlocked: Set<string>;
  /** แฟ้มที่คดีปัจจุบันบอกใบ้ว่าน่าจะได้ใช้ */
  hinted: string[];
  distinct: (table: string, column: string) => string[];
}

let filterSeq = 0;

/**
 * แผงประกอบคำถาม — ทุกอย่างที่ผู้เล่นทำกับข้อมูลเกิดขึ้นที่นี่
 * เปิดแฟ้ม → เชื่อมแฟ้ม → ใส่ตัวกรอง → (ถ้าปลดล็อกแล้ว) สรุปยอด
 */
export default function QueryPanel({
  query,
  setQuery,
  tools,
  justUnlocked,
  hinted,
  distinct,
}: Props) {
  const { joined, excluded } = useMemo(() => tablesInQuery(query), [query]);
  const joinOptions = useMemo(() => availableJoins(query), [query]);

  const openFile = (table: string) => setQuery({ table, joins: [], filters: [] });

  const addFilter = () => {
    const table = query.table;
    const column = tableMeta(table).columns[1]?.name ?? tableMeta(table).columns[0].name;
    const filter: Filter = {
      id: `f${++filterSeq}`,
      table,
      column,
      op: "eq",
      value: "",
    };
    setQuery({ ...query, filters: [...query.filters, filter] });
  };

  /**
   * ตัดการเชื่อมทิ้ง — ต้องตัดอันที่ต่อจากมันออกด้วยทั้งหมด
   * เพราะการเชื่อมอันหลัง ๆ อาจอาศัยแฟ้มที่เพิ่งโดนตัดไปเป็นสะพาน
   */
  const removeJoinFrom = (index: number) => {
    const keptJoins = query.joins.slice(0, index);
    const kept = tablesInQuery({ ...query, joins: keptJoins });
    const alive = new Set([...kept.joined, ...kept.excluded]);
    setQuery({
      ...query,
      joins: keptJoins,
      filters: query.filters.filter((f) => alive.has(f.table)),
      sort: query.sort && alive.has(query.sort.table) ? query.sort : undefined,
      group: query.group && alive.has(query.group.table) ? query.group : undefined,
    });
  };

  const toggleJoinMode = (index: number) => {
    const joins = query.joins.map((j, i) =>
      i === index ? { ...j, mode: j.mode === "has" ? ("hasNot" as const) : ("has" as const) } : j,
    );
    // สลับเป็น "ต้องไม่มีข้อมูล" แล้วแฟ้มนั้นหลุดจากตาราง จึงเอาไปเรียง/สรุปยอดไม่ได้อีก
    const next = { ...query, joins };
    const after = tablesInQuery(next);
    if (query.sort && !after.joined.includes(query.sort.table)) next.sort = undefined;
    if (query.group && !after.joined.includes(query.group.table)) next.group = undefined;
    setQuery(next);
  };

  return (
    <div className="space-y-3">
      {/* ---------- ชั้นวางแฟ้ม ---------- */}
      <div className="panel">
        <p className="panel-label">ชั้นวางแฟ้ม — กดเพื่อเปิด</p>
        <div className="rack">
          {TABLES.map((t) => (
            <button
              key={t.name}
              className="file-chip"
              data-active={t.name === query.table}
              data-hinted={hinted.includes(t.name) && t.name !== query.table}
              onClick={() => openFile(t.name)}
              title={t.blurb}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-brass/70">
          {tableMeta(query.table).blurb}
        </p>
      </div>

      {/* ---------- การเชื่อมแฟ้ม ---------- */}
      {tools.has("join") && (
        <div className="panel">
          <p className="panel-label">
            แฟ้มที่ต่ออยู่
            {justUnlocked.has("join") && <span className="ml-2 text-stamp">● ของใหม่</span>}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="join-chip">
              {tableMeta(query.table).icon} {tableMeta(query.table).label}
            </span>

            {query.joins.map((step, i) => {
              const rel = RELATION_BY_ID.get(step.relation);
              if (!rel) return null;
              const before = tablesInQuery({ ...query, joins: query.joins.slice(0, i) });
              const added = before.joined.includes(rel.left.table)
                ? rel.right.table
                : rel.left.table;
              return (
                <span key={step.relation} className="join-chip" data-mode={step.mode}>
                  <span aria-hidden>{step.mode === "hasNot" ? "⛔" : "🔗"}</span>
                  {tableMeta(added).label}
                  {tools.has("hasNot") && (
                    <button
                      className="icon-btn"
                      onClick={() => toggleJoinMode(i)}
                      title={
                        step.mode === "has"
                          ? "สลับเป็น: ต้องไม่มีข้อมูลในแฟ้มนี้"
                          : "สลับกลับเป็น: ต้องมีข้อมูลในแฟ้มนี้"
                      }
                    >
                      ⇄
                    </button>
                  )}
                  <button
                    className="icon-btn"
                    data-danger="true"
                    onClick={() => removeJoinFrom(i)}
                    title="ตัดการเชื่อมนี้ทิ้ง"
                  >
                    ✕
                  </button>
                </span>
              );
            })}

            {joinOptions.length > 0 && (
              <select
                className="field"
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  setQuery({
                    ...query,
                    joins: [...query.joins, { relation: e.target.value, mode: "has" }],
                  });
                }}
                aria-label="เชื่อมแฟ้ม"
              >
                <option value="">🔗 เชื่อมแฟ้ม…</option>
                {joinOptions.map((o) => (
                  <option key={o.relationId} value={o.relationId}>
                    {o.label} ({tableMeta(o.addTable).label})
                  </option>
                ))}
              </select>
            )}
          </div>
          {excluded.length > 0 && (
            <p className="mt-2 text-[11.5px] leading-snug text-stamp/90">
              ⛔ กำลังคัดเฉพาะแถวที่<b> ไม่มี </b>ข้อมูลใน
              {excluded.map((t) => ` “${tableMeta(t).label}”`).join(" และ ")} — ตัวกรองของแฟ้มนั้นจะกลายเป็น
              “ต้องไม่มีแถวที่เข้าเงื่อนไขนี้เลย”
            </p>
          )}
        </div>
      )}

      {/* ---------- ตัวกรอง ---------- */}
      <div className="panel">
        <p className="panel-label">ตัวกรอง — ทุกข้อต้องเป็นจริงพร้อมกัน</p>
        <div className="space-y-1.5">
          {query.filters.map((f) => (
            <FilterRow
              key={f.id}
              filter={f}
              joined={joined}
              excluded={excluded}
              tools={tools}
              distinct={distinct}
              onChange={(next) =>
                setQuery({
                  ...query,
                  filters: query.filters.map((x) => (x.id === next.id ? next : x)),
                })
              }
              onRemove={() =>
                setQuery({ ...query, filters: query.filters.filter((x) => x.id !== f.id) })
              }
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button className="btn btn-ghost" onClick={addFilter}>
            + เพิ่มตัวกรอง
          </button>
          {query.filters.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => setQuery({ ...query, filters: [] })}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
          {query.sort && (
            <span className="join-chip">
              ↕ เรียงตาม {tableMeta(query.sort.table).label} ·{" "}
              {query.sort.dir === "asc" ? "น้อย→มาก" : "มาก→น้อย"}
              <button
                className="icon-btn"
                data-danger="true"
                onClick={() => setQuery({ ...query, sort: undefined })}
                title="เลิกเรียง"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      </div>

      {/* ---------- สรุปยอด ---------- */}
      {tools.has("group") && (
        <GroupPanel query={query} setQuery={setQuery} joined={joined} justUnlocked={justUnlocked} />
      )}
    </div>
  );
}

function GroupPanel({
  query,
  setQuery,
  joined,
  justUnlocked,
}: {
  query: QueryState;
  setQuery: (q: QueryState) => void;
  joined: string[];
  justUnlocked: Set<string>;
}) {
  const g = query.group;

  const numericColumns = joined.flatMap((t) =>
    tableMeta(t)
      .columns.filter((c) => c.kind === "number" || c.kind === "money")
      .map((c) => ({ table: t, column: c.name, label: `${tableMeta(t).label} · ${c.label}` })),
  );

  const enable = () => {
    const t = joined.includes("people") ? "people" : query.table;
    const col = t === "people" ? "name" : tableMeta(t).columns[1]?.name ?? "id";
    setQuery({ ...query, group: { table: t, column: col, agg: "count" }, sort: undefined });
  };

  return (
    <div className="panel">
      <p className="panel-label">
        สรุปยอด
        {justUnlocked.has("group") && <span className="ml-2 text-stamp">● ของใหม่</span>}
      </p>

      {!g ? (
        <button className="btn btn-ghost" onClick={enable}>
          📊 เปิดโหมดสรุปยอด
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] opacity-80">แยกตาม</span>
          <select
            className="field"
            value={`${g.table}.${g.column}`}
            onChange={(e) => {
              const [table, column] = e.target.value.split(".");
              setQuery({ ...query, group: { ...g, table, column } });
            }}
          >
            {joined.map((t) => (
              <optgroup key={t} label={tableMeta(t).label}>
                {tableMeta(t).columns.map((c) => (
                  <option key={c.name} value={`${t}.${c.name}`}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <span className="text-[12px] opacity-80">แล้ว</span>
          <select
            className="field"
            value={g.agg}
            onChange={(e) => {
              const agg = e.target.value as AggKind;
              const needsColumn = agg !== "count";
              const first = numericColumns[0];
              setQuery({
                ...query,
                group: {
                  ...g,
                  agg,
                  aggTable: needsColumn ? g.aggTable ?? first?.table : undefined,
                  aggColumn: needsColumn ? g.aggColumn ?? first?.column : undefined,
                },
              });
            }}
          >
            {(["count", "sum", "avg", "max", "min", "countDistinct"] as AggKind[]).map((a) => (
              <option key={a} value={a}>
                {AGG_LABEL[a]}
              </option>
            ))}
          </select>

          {g.agg !== "count" && (
            <select
              className="field"
              value={g.aggTable && g.aggColumn ? `${g.aggTable}.${g.aggColumn}` : ""}
              onChange={(e) => {
                const [aggTable, aggColumn] = e.target.value.split(".");
                setQuery({ ...query, group: { ...g, aggTable, aggColumn } });
              }}
            >
              <option value="">— เลือกช่อง —</option>
              {(g.agg === "countDistinct"
                ? joined.flatMap((t) =>
                    tableMeta(t).columns.map((c) => ({
                      table: t,
                      column: c.name,
                      label: `${tableMeta(t).label} · ${c.label}`,
                    })),
                  )
                : numericColumns
              ).map((c) => (
                <option key={`${c.table}.${c.column}`} value={`${c.table}.${c.column}`}>
                  {c.label}
                </option>
              ))}
            </select>
          )}

          <span className="text-[12px] opacity-80">เอาเฉพาะกลุ่มที่ได้ตั้งแต่</span>
          <input
            className="field w-[86px]"
            type="number"
            min={1}
            value={g.atLeast ?? ""}
            placeholder="ทั้งหมด"
            onChange={(e) =>
              setQuery({
                ...query,
                group: { ...g, atLeast: e.target.value ? Number(e.target.value) : undefined },
              })
            }
          />

          <button
            className="icon-btn ml-auto"
            data-danger="true"
            onClick={() => setQuery({ ...query, group: undefined })}
            title="ปิดโหมดสรุปยอด"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
