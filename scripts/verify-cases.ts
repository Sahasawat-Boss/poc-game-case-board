/**
 * ตรวจว่าทุกคดี "ไขได้จริงด้วยการคลิกอย่างเดียว"
 *
 * แต่ละคดีที่นี่เขียนเป็น QueryState — คือสภาพของแผงกรองที่ผู้เล่นจะประกอบขึ้นมาได้
 * สคริปต์เอา QueryState นั้นไปแปลงเป็น SQL ด้วยตัวแปลตัวจริง (lib/query.ts) แล้วรันกับ
 * ฐานข้อมูลตัวจริง ถ้าคำตอบที่ได้ไม่ตรงกับที่คดีบอกไว้ แปลว่าคดีนั้นพัง (หรือตัวแปลพัง)
 *
 *   npm run verify
 */

import initSqlJs from "sql.js";
import { buildSql } from "../src/lib/query";
import { buildSeedSql, DEFAULT_NAMES } from "../src/data/seed";
import { DEFAULT_PLACES } from "../src/data/places";
import { DEFAULT_CASES } from "../src/data/cases";
import { METRIC_ALIAS } from "../src/lib/query";
import type { Filter, QueryState } from "../src/types";

let seq = 0;
const f = (
  table: string,
  column: string,
  op: Filter["op"],
  value: string,
  value2?: string,
): Filter => ({ id: `f${seq++}`, table, column, op, value, value2 });

/** ชื่อของคนตาม id (id เริ่มที่ 1 แต่ index เริ่มที่ 0) */
const nameOf = (id: number) => DEFAULT_NAMES[id - 1];

interface Expectation {
  n: number;
  query: QueryState;
  /** ตรวจอะไร: "แถวแรกต้องเป็นคนนี้" / "ต้องเหลือกี่แถว" / "ค่าในช่องนี้" */
  expect:
    | { kind: "onlyPerson"; column: string }
    | { kind: "topPerson"; column: string }
    | { kind: "rowCount"; count: number }
    | { kind: "cell"; column: string; value: string };
}

const CHECKS: Expectation[] = [
  {
    n: 1,
    query: {
      table: "people",
      joins: [],
      filters: [f("people", "id", "eq", "9")],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 2,
    query: {
      table: "people",
      joins: [],
      filters: [f("people", "hat_color", "eq", "red")],
    },
    expect: { kind: "rowCount", count: 8 },
  },
  {
    n: 3,
    query: {
      table: "people",
      joins: [],
      filters: [],
      sort: { table: "people", column: "age", dir: "asc" },
      limit: 1,
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 4,
    query: {
      table: "people",
      joins: [],
      filters: [
        f("people", "hat_color", "eq", "red"),
        f("people", "height_cm", "gt", "180"),
      ],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 5,
    query: {
      table: "complaints",
      joins: [],
      filters: [f("complaints", "type", "eq", "noise")],
      sort: { table: "complaints", column: "reported_at", dir: "desc" },
      limit: 1,
    },
    expect: { kind: "cell", column: "complaints.location", value: "Downtown Plaza" },
  },
  {
    n: 6,
    query: {
      table: "parking_tickets",
      joins: [
        { relation: "ticket_vehicle", mode: "has" },
        { relation: "vehicle_owner", mode: "has" },
      ],
      filters: [
        f("parking_tickets", "location", "eq", "Zorange Mall"),
        f("parking_tickets", "issued_at", "onDate", "2026-03-08"),
      ],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 7,
    query: {
      table: "cctv_logs",
      joins: [{ relation: "cctv_person", mode: "has" }],
      filters: [f("cctv_logs", "camera_location", "eq", "Neon Alley")],
      group: { table: "people", column: "name", agg: "count" },
    },
    expect: { kind: "topPerson", column: "people.name" },
  },
  {
    n: 8,
    query: {
      table: "hotel_stays",
      joins: [{ relation: "hotel_guest", mode: "has" }],
      filters: [f("hotel_stays", "actual_checkout", "gtCol", "check_out")],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 9,
    query: {
      table: "cctv_logs",
      joins: [{ relation: "cctv_person", mode: "has" }],
      filters: [f("cctv_logs", "seen_at", "timeOfDay", "02:00", "03:59")],
      group: { table: "people", column: "name", agg: "count" },
    },
    expect: { kind: "topPerson", column: "people.name" },
  },
  {
    n: 10,
    query: {
      table: "people",
      joins: [{ relation: "cctv_person", mode: "hasNot" }],
      filters: [
        f("people", "district", "eq", "Old Town"),
        f("cctv_logs", "seen_at", "onDate", "2026-03-06"),
        f("cctv_logs", "seen_at", "timeOfDay", "00:00", "04:00"),
      ],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 12,
    query: {
      table: "purchases",
      joins: [
        { relation: "purchase_buyer", mode: "has" },
        { relation: "cctv_person", mode: "has" },
      ],
      filters: [
        f("purchases", "item", "eq", "spray paint"),
        f("cctv_logs", "camera_location", "eq", "Old Town Wall"),
        f("cctv_logs", "seen_at", "onDate", "2026-03-06"),
      ],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
  {
    n: 13,
    query: {
      table: "people",
      joins: [{ relation: "card_owner", mode: "hasNot" }],
      filters: [f("people", "district", "eq", "Harbor")],
    },
    expect: { kind: "onlyPerson", column: "people.name" },
  },
];

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(buildSeedSql(DEFAULT_NAMES, DEFAULT_PLACES));

  let failed = 0;

  for (const check of CHECKS) {
    const gameCase = DEFAULT_CASES.find((c) => c.n === check.n)!;
    const sql = buildSql(check.query);
    const res = db.exec(sql);
    const rows = res.length ? res[0].values : [];
    const cols = res.length ? res[0].columns : [];
    const at = (row: unknown[], col: string) => {
      const i = cols.indexOf(col);
      return i < 0 ? null : row[i];
    };

    let problem: string | null = null;
    const e = check.expect;

    if (e.kind === "rowCount") {
      if (rows.length !== e.count) problem = `ได้ ${rows.length} แถว แต่คดีบอกว่าควรได้ ${e.count}`;
    } else if (e.kind === "cell") {
      if (rows.length !== 1) problem = `ควรเหลือแถวเดียว แต่ได้ ${rows.length} แถว`;
      else if (String(at(rows[0], e.column)) !== e.value)
        problem = `ได้ "${at(rows[0], e.column)}" แต่คดีตอบ "${e.value}"`;
    } else {
      const target = gameCase.answer.kind === "person" ? nameOf(gameCase.answer.personId) : "?";
      if (rows.length === 0) problem = "ไม่เหลือแถวเลย";
      // แถวซ้ำได้ (คนเดียวอาจติดกล้องสองครั้ง) แต่ต้องชี้ไปที่ "คนเดียว" เท่านั้น
      else if (
        e.kind === "onlyPerson" &&
        new Set(rows.map((r) => String(at(r, e.column)))).size !== 1
      )
        problem = `ควรเหลือคนเดียว แต่ได้ ${
          new Set(rows.map((r) => String(at(r, e.column)))).size
        } คน — คดีนี้จะกำกวม`;
      else {
        const got = String(at(rows[0], e.column));
        if (got !== target) problem = `แถวบนสุดเป็น "${got}" แต่คดีตอบ "${target}"`;
        // สรุปยอด: ที่หนึ่งต้องทิ้งห่างที่สอง ไม่งั้นผู้เล่นเดาไม่ได้ว่าใครคือคำตอบ
        else if (e.kind === "topPerson" && rows.length > 1) {
          const m = cols.indexOf(METRIC_ALIAS);
          if (m >= 0 && Number(rows[0][m]) === Number(rows[1][m]))
            problem = `ยอดของที่หนึ่งเท่ากับที่สอง (${rows[0][m]}) — คดีนี้มีคำตอบซ้ำ`;
        }
      }
    }

    if (problem) {
      failed++;
      console.log(`\n❌ คดี ${check.n} · ${gameCase.title}\n   ${problem}\n${sql}\n`);
    } else {
      console.log(`✅ คดี ${check.n} · ${gameCase.title}`);
    }
  }

  // คดี 11 ต้องสรุปยอดสองรอบแล้วหาชื่อที่ติดทั้งสองรอบ — ตรวจว่าเหลือคนเดียวจริง
  const callsBase: QueryState = {
    table: "phone_calls",
    joins: [{ relation: "call_caller", mode: "has" }],
    filters: [f("phone_calls", "receiver_id", "eq", "17")],
  };
  const namesFrom = (q: QueryState) => {
    const r = db.exec(buildSql(q));
    return new Set(r.length ? r[0].values.map((row) => String(row[0])) : []);
  };
  const byCount = namesFrom({
    ...callsBase,
    group: { table: "people", column: "name", agg: "count", atLeast: 3 },
  });
  const byDuration = namesFrom({
    ...callsBase,
    group: {
      table: "people",
      column: "name",
      agg: "sum",
      aggTable: "phone_calls",
      aggColumn: "duration_sec",
      atLeast: 601,
    },
  });
  const both = [...byCount].filter((n) => byDuration.has(n));
  const case11 = DEFAULT_CASES.find((c) => c.n === 11)!;
  const want11 = case11.answer.kind === "person" ? nameOf(case11.answer.personId) : "?";
  if (both.length !== 1 || both[0] !== want11) {
    failed++;
    console.log(
      `\n❌ คดี 11 · รอบนับได้ ${byCount.size} คน, รอบรวมเวลาได้ ${byDuration.size} คน, ` +
        `ซ้อนกัน ${both.length} คน (${both.join(", ")}) — คดีตอบ "${want11}"`,
    );
  } else {
    console.log(`✅ คดี 11 · ไล่สองรอบแล้วเหลือ "${both[0]}" คนเดียว`);
  }

  // คดี 14 ไล่สายเอง ตรวจแยก: ต้องไล่จาก 35 ขึ้นไปแล้วจบที่ 43 จริง
  let cursor: number | null = 35;
  const chain: number[] = [];
  while (cursor !== null && chain.length < 20) {
    chain.push(cursor);
    const r = db.exec(`SELECT recruited_by FROM crew_links WHERE person_id = ${cursor}`);
    if (!r.length || !r[0].values.length) break;
    const up = r[0].values[0][0];
    cursor = up === null ? null : Number(up);
  }
  const root = chain[chain.length - 1];
  if (root !== 43) {
    failed++;
    console.log(`\n❌ คดี 14 · ไล่สายจาก 35 ได้ ${chain.join(" → ")} จบที่ ${root} ไม่ใช่ 43`);
  } else {
    console.log(`✅ คดี 14 · ไล่สาย ${chain.join(" → ")} จบที่ต้นสาย 43`);
  }

  // +2 = คดี 11 (สรุปยอดสองรอบ) กับคดี 14 (ไล่สาย) ที่ตรวจแยกจาก CHECKS
  const total = CHECKS.length + 2;
  console.log(failed === 0 ? `\nผ่านครบ ${total} คดี` : `\nมีปัญหา ${failed} จาก ${total} คดี`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
