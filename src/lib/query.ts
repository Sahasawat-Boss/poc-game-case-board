/**
 * หัวใจของเกม — แปล "สิ่งที่ผู้เล่นคลิก" เป็น SQL
 *
 * ผู้เล่นไม่เคยพิมพ์ SQL สักตัว แต่เบื้องหลังยังเป็น SQLite จริง (sql.js) เหมือนเดิม
 * ไฟล์นี้คือชั้นแปลงตรงกลาง: QueryState (สภาพของแผงกรองบนจอ) → ประโยค SELECT
 *
 * ผลพลอยได้คือเอา SQL ที่ประกอบได้ไปโชว์ให้ผู้เล่นดูได้ด้วย (แถบ "คำสั่งเบื้องหลัง")
 * ใครอยากรู้ว่าคลิกเมื่อกี้แปลว่าอะไรก็กางดู ไม่อยากรู้ก็พับทิ้งไว้ ไม่มีผลต่อการเล่น
 */

import { RELATION_BY_ID, columnLabel, columnMeta, tableMeta } from "@/data/meta";
import type {
  AggKind,
  ColumnKind,
  Filter,
  FilterOp,
  JoinStep,
  QueryState,
  Relation,
} from "@/types";

/* ---------- แฟ้มที่อยู่ในคิวรีตอนนี้ ---------- */

/**
 * แยกแฟ้มเป็นสองพวก
 * - joined  = แฟ้มที่เอาข้อมูลมาแสดงได้จริง (แฟ้มตั้งต้น + การเชื่อมแบบ "มีข้อมูล")
 * - excluded = แฟ้มที่ถูกใช้เป็นเงื่อนไข "ต้องไม่มีข้อมูล" เท่านั้น จึงไม่มีคอลัมน์ให้โชว์
 */
export function tablesInQuery(q: QueryState): { joined: string[]; excluded: string[] } {
  const joined = [q.table];
  const excluded: string[] = [];
  for (const step of q.joins) {
    const rel = RELATION_BY_ID.get(step.relation);
    if (!rel) continue;
    const added = addedSide(rel, joined);
    if (!added) continue;
    if (step.mode === "hasNot") excluded.push(added);
    else joined.push(added);
  }
  return { joined, excluded };
}

/** ฝั่งที่ยังไม่อยู่ในคิวรี = ฝั่งที่การเชื่อมครั้งนี้ดึงเข้ามา (null ถ้าเชื่อมไม่ได้) */
function addedSide(rel: Relation, present: string[]): string | null {
  const hasLeft = present.includes(rel.left.table);
  const hasRight = present.includes(rel.right.table);
  if (hasLeft && !hasRight) return rel.right.table;
  if (hasRight && !hasLeft) return rel.left.table;
  return null;
}

export interface JoinOption {
  relationId: string;
  /** แฟ้มที่จะถูกดึงเข้ามา */
  addTable: string;
  /** ป้ายบนปุ่ม เช่น "ดูรถที่คนเหล่านี้เป็นเจ้าของ" */
  label: string;
}

/** เส้นเชื่อมที่กดได้ ณ ตอนนี้ — ฝั่งหนึ่งต้องอยู่ในคิวรีแล้ว อีกฝั่งต้องยังไม่อยู่ */
export function availableJoins(q: QueryState): JoinOption[] {
  const { joined, excluded } = tablesInQuery(q);
  const options: JoinOption[] = [];
  for (const rel of RELATION_BY_ID.values()) {
    if (q.joins.some((j) => j.relation === rel.id)) continue;
    const added = addedSide(rel, joined);
    if (!added || excluded.includes(added)) continue;
    options.push({
      relationId: rel.id,
      addTable: added,
      label: added === rel.right.table ? rel.toRight : rel.toLeft,
    });
  }
  return options;
}

/* ---------- เครื่องมือกรองที่เหมาะกับคอลัมน์แต่ละชนิด ---------- */

export const OP_LABEL: Record<FilterOp, string> = {
  eq: "เท่ากับ",
  neq: "ไม่เท่ากับ",
  contains: "มีคำว่า",
  gt: "มากกว่า",
  gte: "ตั้งแต่",
  lt: "น้อยกว่า",
  lte: "ไม่เกิน",
  between: "อยู่ระหว่าง",
  onDate: "ตรงกับวันที่",
  timeOfDay: "ช่วงเวลาในวัน",
  isNull: "ไม่มีข้อมูล",
  notNull: "มีข้อมูล",
  gtCol: "มากกว่าช่อง",
  ltCol: "น้อยกว่าช่อง",
  neqCol: "ไม่ตรงกับช่อง",
};

/** ตัวกรองที่เทียบกับ "อีกคอลัมน์" ไม่ใช่ค่าคงที่ */
export function isColumnOp(op: FilterOp): boolean {
  return op === "gtCol" || op === "ltCol" || op === "neqCol";
}

export function opsFor(kind: ColumnKind, tools: Set<string>): FilterOp[] {
  const compare = tools.has("compareCol");
  switch (kind) {
    case "text":
      return ["eq", "neq", "contains", "isNull", "notNull"];
    case "number":
    case "money":
      return [
        "eq",
        "neq",
        "gte",
        "gt",
        "lte",
        "lt",
        "between",
        ...(compare ? (["gtCol", "ltCol", "neqCol"] as FilterOp[]) : []),
      ];
    case "datetime":
      return [
        "onDate",
        "between",
        ...(tools.has("time") ? (["timeOfDay"] as FilterOp[]) : []),
        "gte",
        "lte",
        "isNull",
        "notNull",
        ...(compare ? (["gtCol", "ltCol"] as FilterOp[]) : []),
      ];
    case "date":
      return ["eq", "between", "gte", "lte", "isNull", "notNull"];
    case "bool":
      return ["eq"];
    case "id":
      return ["eq", "neq", "isNull", "notNull"];
  }
}

/** ตัวกรองบางแบบใช้ค่าเดียว บางแบบใช้สองค่า บางแบบไม่ใช้เลย */
export function valueSlots(op: FilterOp): 0 | 1 | 2 {
  if (op === "isNull" || op === "notNull") return 0;
  if (op === "between" || op === "timeOfDay") return 2;
  return 1;
}

/* ---------- ประกอบ SQL ---------- */

function quote(value: string): string {
  return "'" + value.replace(/'/g, "''") + "'";
}

function quoteAlias(alias: string): string {
  return '"' + alias.replace(/"/g, '""') + '"';
}

/** ค่าที่เอาไปต่อใน SQL — ชนิดตัวเลขไม่ต้องใส่ '' และต้องกันค่าที่ไม่ใช่ตัวเลขหลุดเข้าไป */
function literal(kind: ColumnKind, raw: string): string {
  if (kind === "number" || kind === "money" || kind === "bool" || kind === "id") {
    const n = Number(raw);
    return Number.isFinite(n) ? String(n) : "NULL";
  }
  return quote(raw);
}

function ref(table: string, column: string): string {
  return `${table}.${column}`;
}

/** ตัวกรองหนึ่งอันแปลงเป็นเงื่อนไข WHERE หนึ่งวรรค (null = ยังกรอกไม่ครบ ข้ามไปก่อน) */
function filterSql(f: Filter): string | null {
  const meta = columnMeta(f.table, f.column);
  if (!meta) return null;
  const col = ref(f.table, f.column);
  const kind = meta.kind;
  const v1 = f.value ?? "";
  const v2 = f.value2 ?? "";

  const needs = valueSlots(f.op);
  if (needs >= 1 && v1 === "") return null;
  if (needs === 2 && v2 === "") return null;

  if (isColumnOp(f.op)) {
    // เทียบกับอีกช่องในแฟ้มเดียวกัน เช่น "เช็คเอาต์จริง มากกว่าช่อง กำหนดเช็คเอาต์"
    if (!columnMeta(f.table, v1)) return null;
    const other = ref(f.table, v1);
    if (f.op === "gtCol") return `${col} > ${other}`;
    if (f.op === "ltCol") return `${col} < ${other}`;
    return `${col} <> ${other}`;
  }

  switch (f.op) {
    case "eq":
      return `${col} = ${literal(kind, v1)}`;
    case "neq":
      return `${col} <> ${literal(kind, v1)}`;
    case "contains":
      return `${col} LIKE ${quote("%" + v1 + "%")}`;
    case "gt":
      return `${col} > ${literal(kind, v1)}`;
    case "gte":
      return `${col} >= ${literal(kind, v1)}`;
    case "lt":
      return `${col} < ${literal(kind, v1)}`;
    case "lte":
      return `${col} <= ${literal(kind, v1)}`;
    case "between":
      // วันเวลาเก็บเป็นข้อความ 'YYYY-MM-DD HH:MM' — ตัด 10 ตัวแรกมาเทียบเป็นช่วงวัน
      // ถ้าเทียบทั้งก้อน วันปลายช่วงจะหลุดทุกแถวที่มีเวลาต่อท้าย ('2026-03-08 13:20' > '2026-03-08')
      return kind === "datetime"
        ? `substr(${col}, 1, 10) BETWEEN ${quote(v1)} AND ${quote(v2)}`
        : `${col} BETWEEN ${literal(kind, v1)} AND ${literal(kind, v2)}`;
    case "onDate":
      return `substr(${col}, 1, 10) = ${quote(v1)}`;
    case "timeOfDay":
      return `substr(${col}, 12, 5) BETWEEN ${quote(v1)} AND ${quote(v2)}`;
    case "isNull":
      return `${col} IS NULL`;
    case "notNull":
      return `${col} IS NOT NULL`;
    default:
      return null;
  }
}

const AGG_SQL: Record<AggKind, (col: string) => string> = {
  count: () => "COUNT(*)",
  countDistinct: (c) => `COUNT(DISTINCT ${c})`,
  sum: (c) => `SUM(${c})`,
  avg: (c) => `ROUND(AVG(${c}), 1)`,
  max: (c) => `MAX(${c})`,
  min: (c) => `MIN(${c})`,
};

export const AGG_LABEL: Record<AggKind, string> = {
  count: "นับจำนวนแถว",
  countDistinct: "นับแบบไม่ซ้ำ",
  sum: "รวมค่า",
  avg: "ค่าเฉลี่ย",
  max: "ค่ามากสุด",
  min: "ค่าน้อยสุด",
};

/** ป้ายหัวคอลัมน์สรุปยอด */
export function metricLabel(agg: AggKind): string {
  return agg === "count" ? "จำนวน" : AGG_LABEL[agg];
}

/**
 * คอลัมน์ที่จะโชว์ในตารางผลลัพธ์ (โหมดปกติ)
 *
 * ซ่อนเลขที่เอกสารของแต่ละแฟ้ม (complaints.id, purchases.id ฯลฯ) เพราะเป็นเลขรันนิ่ง
 * ที่ไม่มีความหมายกับผู้เล่นเลย แต่ <b>ไม่ซ่อน people.id</b> ด้วยเหตุผลสองข้อ
 *   1. หลายคดีอ้างถึงคนด้วยเลขประจำตัว ("ดูสายที่โทรเข้าหา id 17")
 *   2. ระบบใช้เลขนี้รู้ว่าการ์ดที่ปักขึ้นกระดานเป็นของใคร ถ้าไม่มีจะชี้ตัวไม่ได้
 */
export function visibleColumns(q: QueryState): { table: string; column: string }[] {
  const out: { table: string; column: string }[] = [];
  for (const t of tablesInQuery(q).joined) {
    for (const c of tableMeta(t).columns) {
      if (c.name === "id" && c.kind === "id" && t !== "people") continue;
      out.push({ table: t, column: c.name });
    }
  }
  return out;
}

/** ชื่อ alias ของหัวคอลัมน์ใน result set — เก็บ table.column ไว้เพื่อ map กลับไปหา meta ได้ */
export function aliasOf(table: string, column: string): string {
  return `${table}.${column}`;
}

export const METRIC_ALIAS = "_metric";

export function buildSql(q: QueryState): string {
  const { joined } = tablesInQuery(q);
  const lines: string[] = [];

  // ตัวกรองที่ยิงใส่แฟ้มซึ่งถูกเชื่อมแบบ "ต้องไม่มีข้อมูล" ต้องย้ายเข้าไปอยู่ใน NOT EXISTS
  // ถ้าปล่อยไว้ข้างนอกจะอ้างถึงตารางที่ไม่มีใน FROM แล้วคิวรีพัง
  const outerFilters = q.filters.filter((f) => joined.includes(f.table));

  if (q.group) {
    const g = q.group;
    const groupCol = ref(g.table, g.column);
    const aggCol = g.aggTable && g.aggColumn ? ref(g.aggTable, g.aggColumn) : groupCol;
    lines.push(
      `SELECT ${groupCol} AS ${quoteAlias(aliasOf(g.table, g.column))}, ` +
        `${AGG_SQL[g.agg](aggCol)} AS ${quoteAlias(METRIC_ALIAS)}`,
    );
  } else {
    const cols = visibleColumns(q).map(
      (c) => `  ${ref(c.table, c.column)} AS ${quoteAlias(aliasOf(c.table, c.column))}`,
    );
    lines.push("SELECT\n" + cols.join(",\n"));
  }

  lines.push(`FROM ${q.table}`);

  const present = [q.table];
  const antiClauses: string[] = [];

  for (const step of q.joins) {
    const rel = RELATION_BY_ID.get(step.relation);
    if (!rel) continue;
    const added = addedSide(rel, present);
    if (!added) continue;
    const onClause = `${ref(rel.left.table, rel.left.column)} = ${ref(rel.right.table, rel.right.column)}`;

    if (step.mode === "hasNot") {
      const inner = q.filters
        .filter((f) => f.table === added)
        .map(filterSql)
        .filter((s): s is string => s !== null);
      antiClauses.push(
        `NOT EXISTS (SELECT 1 FROM ${added} WHERE ${[onClause, ...inner].join(" AND ")})`,
      );
      continue; // แฟ้มนี้ไม่ได้เข้ามาใน FROM จึงยังไม่นับว่า present
    }

    present.push(added);
    lines.push(`JOIN ${added} ON ${onClause}`);
  }

  const wheres = [
    ...outerFilters.map(filterSql).filter((s): s is string => s !== null),
    ...antiClauses,
  ];
  if (wheres.length) lines.push("WHERE " + wheres.join("\n  AND "));

  if (q.group) {
    lines.push(`GROUP BY ${ref(q.group.table, q.group.column)}`);
    if (q.group.atLeast && q.group.atLeast > 1) {
      const aggCol =
        q.group.aggTable && q.group.aggColumn
          ? ref(q.group.aggTable, q.group.aggColumn)
          : ref(q.group.table, q.group.column);
      lines.push(`HAVING ${AGG_SQL[q.group.agg](aggCol)} >= ${Math.floor(q.group.atLeast)}`);
    }
    lines.push("ORDER BY 2 DESC");
  } else if (q.sort && joined.includes(q.sort.table)) {
    lines.push(
      `ORDER BY ${ref(q.sort.table, q.sort.column)} ${q.sort.dir === "desc" ? "DESC" : "ASC"}`,
    );
  }

  if (q.limit && q.limit > 0) lines.push(`LIMIT ${Math.floor(q.limit)}`);

  return lines.join("\n") + ";";
}

/* ---------- คำบรรยายภาษาไทยของคิวรีปัจจุบัน ---------- */

/**
 * ประโยคสรุปว่าตอนนี้กำลังดูอะไรอยู่ — โชว์เหนือตารางผลลัพธ์
 * ผู้เล่นจะได้ไม่หลงว่าตัวเองกรองอะไรค้างไว้ โดยเฉพาะตอนเชื่อมหลายแฟ้มแล้ว
 */
export function describeQuery(q: QueryState): string {
  const { joined, excluded } = tablesInQuery(q);
  let text = `เปิดแฟ้ม “${tableMeta(q.table).label}”`;

  const others = joined.slice(1).map((t) => tableMeta(t).label);
  if (others.length) text += ` เชื่อมกับ ${others.map((j) => `“${j}”`).join(" และ ")}`;
  if (excluded.length)
    text += ` เอาเฉพาะที่ไม่มีข้อมูลใน ${excluded.map((j) => `“${tableMeta(j).label}”`).join(" และ ")}`;

  if (q.filters.length) {
    const parts = q.filters.map((f) => {
      const label = columnLabel(f.table, f.column);
      if (isColumnOp(f.op)) return `${label} ${OP_LABEL[f.op]} “${columnLabel(f.table, f.value)}”`;
      const slots = valueSlots(f.op);
      if (slots === 0) return `${label} ${OP_LABEL[f.op]}`;
      if (slots === 2) return `${label} ${OP_LABEL[f.op]} ${f.value} – ${f.value2}`;
      return `${label} ${OP_LABEL[f.op]} ${f.value}`;
    });
    text += ` โดยคัดเฉพาะ ${parts.join(" และ ")}`;
  }

  if (q.group) {
    const by = columnLabel(q.group.table, q.group.column);
    const what =
      q.group.agg === "count"
        ? "นับจำนวน"
        : `${AGG_LABEL[q.group.agg]}ของ ${columnLabel(
            q.group.aggTable ?? q.group.table,
            q.group.aggColumn ?? q.group.column,
          )}`;
    text += ` แล้ว${what} แยกตาม${by}`;
    if (q.group.atLeast && q.group.atLeast > 1)
      text += ` เฉพาะกลุ่มที่ได้ตั้งแต่ ${q.group.atLeast} ขึ้นไป`;
  } else if (q.sort) {
    text += ` เรียงตาม${columnLabel(q.sort.table, q.sort.column)}จาก${
      q.sort.dir === "desc" ? "มากไปน้อย" : "น้อยไปมาก"
    }`;
  }

  if (q.limit) text += ` เอาแค่ ${q.limit} แถวแรก`;
  return text;
}

/** คิวรีเปล่าของแฟ้มหนึ่ง */
export function emptyQuery(table: string): QueryState {
  return { table, joins: [], filters: [] };
}
