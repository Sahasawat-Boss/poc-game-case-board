"use client";

import { columnMeta, tableMeta } from "@/data/meta";
import { OP_LABEL, isColumnOp, opsFor, valueSlots } from "@/lib/query";
import type { ColumnKind, Filter, FilterOp } from "@/types";

interface Props {
  filter: Filter;
  /** แฟ้มที่กรองได้ตอนนี้ — excluded คือแฟ้มที่เชื่อมแบบ "ต้องไม่มีข้อมูล" */
  joined: string[];
  excluded: string[];
  tools: Set<string>;
  distinct: (table: string, column: string) => string[];
  onChange: (next: Filter) => void;
  onRemove: () => void;
}

/**
 * ตัวกรองหนึ่งบรรทัด: [ช่อง] [เงื่อนไข] [ค่า]
 *
 * ทุกช่องเป็นเมนูให้เลือก ยกเว้นตัวเลขกับวันที่ที่ต้องกรอกเอง (แต่ก็มี date picker ให้)
 * ค่าที่เลือกได้ดึงมาจากข้อมูลจริงในฐานข้อมูล ผู้เล่นจึงไม่มีทางพิมพ์ผิดจนได้ผลลัพธ์ว่าง
 */
export default function FilterRow({
  filter,
  joined,
  excluded,
  tools,
  distinct,
  onChange,
  onRemove,
}: Props) {
  const meta = columnMeta(filter.table, filter.column);
  const kind: ColumnKind = meta?.kind ?? "text";
  const ops = opsFor(kind, tools);
  const slots = valueSlots(filter.op);

  /** เปลี่ยนคอลัมน์แล้วเงื่อนไขเดิมอาจใช้กับชนิดใหม่ไม่ได้ ต้องรีเซ็ตให้เป็นตัวแรกที่ใช้ได้ */
  const pickColumn = (value: string) => {
    const [table, column] = value.split(".");
    const nextKind = columnMeta(table, column)?.kind ?? "text";
    const nextOps = opsFor(nextKind, tools);
    const op = nextOps.includes(filter.op) ? filter.op : nextOps[0];
    onChange({ ...filter, table, column, op, value: "", value2: "" });
  };

  const pickOp = (op: FilterOp) => {
    // สลับไปเงื่อนไขคนละแบบแล้วค่าเดิมมักใช้ไม่ได้ (เช่นจาก "เท่ากับ red" ไป "อยู่ระหว่าง")
    const keep = valueSlots(op) === slots && isColumnOp(op) === isColumnOp(filter.op);
    onChange({ ...filter, op, value: keep ? filter.value : "", value2: keep ? filter.value2 : "" });
  };

  return (
    <div className="filter-row">
      <select
        className="field"
        value={`${filter.table}.${filter.column}`}
        onChange={(e) => pickColumn(e.target.value)}
        aria-label="ช่องที่จะกรอง"
      >
        {[...joined, ...excluded].map((t) => (
          <optgroup
            key={t}
            label={
              tableMeta(t).label + (excluded.includes(t) ? " (ต้องไม่มีข้อมูลนี้)" : "")
            }
          >
            {tableMeta(t).columns.map((c) => (
              <option key={c.name} value={`${t}.${c.name}`}>
                {c.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        className="field"
        value={filter.op}
        onChange={(e) => pickOp(e.target.value as FilterOp)}
        aria-label="เงื่อนไข"
      >
        {ops.map((op) => (
          <option key={op} value={op}>
            {OP_LABEL[op]}
          </option>
        ))}
      </select>

      <ValueInput
        filter={filter}
        kind={kind}
        distinct={distinct}
        onChange={(value, value2) => onChange({ ...filter, value, value2 })}
      />

      {meta?.hint && <span className="text-[11px] text-brass/70">{meta.hint}</span>}

      <button className="icon-btn ml-auto" data-danger="true" onClick={onRemove} title="ลบตัวกรองนี้">
        ✕
      </button>
    </div>
  );
}

function ValueInput({
  filter,
  kind,
  distinct,
  onChange,
}: {
  filter: Filter;
  kind: ColumnKind;
  distinct: (table: string, column: string) => string[];
  onChange: (value: string, value2?: string) => void;
}) {
  const slots = valueSlots(filter.op);
  if (slots === 0) return null;

  // เทียบกับอีกช่องในแฟ้มเดียวกัน — ให้เลือกจากรายชื่อช่องที่ชนิดเข้ากันได้
  if (isColumnOp(filter.op)) {
    const others = tableMeta(filter.table).columns.filter(
      (c) => c.name !== filter.column && compatible(kind, c.kind),
    );
    return (
      <select
        className="field"
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="ช่องที่เอาไปเทียบ"
      >
        <option value="">— เลือกช่องที่จะเทียบ —</option>
        {others.map((c) => (
          <option key={c.name} value={c.name}>
            {c.label}
          </option>
        ))}
      </select>
    );
  }

  if (filter.op === "timeOfDay") {
    return (
      <>
        <input
          className="field w-[104px]"
          type="time"
          value={filter.value}
          onChange={(e) => onChange(e.target.value, filter.value2)}
          aria-label="ตั้งแต่เวลา"
        />
        <span className="text-[12px] opacity-70">ถึง</span>
        <input
          className="field w-[104px]"
          type="time"
          value={filter.value2 ?? ""}
          onChange={(e) => onChange(filter.value, e.target.value)}
          aria-label="ถึงเวลา"
        />
      </>
    );
  }

  if (slots === 2) {
    const type = kind === "datetime" || kind === "date" ? "date" : "number";
    return (
      <>
        <input
          className="field w-[148px]"
          type={type}
          value={filter.value}
          onChange={(e) => onChange(e.target.value, filter.value2)}
          aria-label="ค่าเริ่มต้น"
        />
        <span className="text-[12px] opacity-70">ถึง</span>
        <input
          className="field w-[148px]"
          type={type}
          value={filter.value2 ?? ""}
          onChange={(e) => onChange(filter.value, e.target.value)}
          aria-label="ค่าสิ้นสุด"
        />
      </>
    );
  }

  if (kind === "bool") {
    return (
      <select className="field" value={filter.value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— เลือก —</option>
        <option value="1">จ่ายแล้ว</option>
        <option value="0">ยังไม่จ่าย</option>
      </select>
    );
  }

  if (kind === "number" || kind === "money" || kind === "id") {
    return (
      <input
        className="field w-[120px]"
        type="number"
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ตัวเลข"
        aria-label="ค่าที่ต้องการ"
      />
    );
  }

  if (kind === "date" || filter.op === "onDate") {
    return (
      <input
        className="field w-[152px]"
        type="date"
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="วันที่"
      />
    );
  }

  if (kind === "datetime") {
    return (
      <input
        className="field w-[190px]"
        type="datetime-local"
        value={filter.value.replace(" ", "T")}
        // ฐานข้อมูลเก็บเป็น 'YYYY-MM-DD HH:MM' แต่ input ใช้ 'T' คั่น เลยต้องแปลงกลับ
        onChange={(e) => onChange(e.target.value.replace("T", " ").slice(0, 16))}
        aria-label="วันเวลา"
      />
    );
  }

  // ข้อความ — ถ้าคอลัมน์นี้มีค่าไม่กี่แบบ ยกมาเป็นเมนูให้เลือกเลย จะได้ไม่ต้องเดาว่าสะกดยังไง
  const options = filter.op === "contains" ? [] : distinct(filter.table, filter.column);
  if (options.length) {
    return (
      <select
        className="field max-w-[220px]"
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="ค่าที่ต้องการ"
      >
        <option value="">— เลือกค่า —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className="field w-[190px]"
      value={filter.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={filter.op === "contains" ? "คำที่อยากค้น" : "ค่าที่ต้องการ"}
      aria-label="ค่าที่ต้องการ"
    />
  );
}

/** ชนิดที่เอามาเทียบกันแล้วมีความหมาย — ตัวเลขกับตัวเลข วันเวลากับวันเวลา */
function compatible(a: ColumnKind, b: ColumnKind): boolean {
  const group = (k: ColumnKind) =>
    k === "number" || k === "money" ? "num" : k === "datetime" || k === "date" ? "time" : k;
  return group(a) === group(b);
}
