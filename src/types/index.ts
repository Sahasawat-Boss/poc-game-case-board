/* ชนิดข้อมูลกลางของเกม — ใช้ร่วมกันทั้งฝั่งแฟ้ม (Filter Board) และฝั่งกระดาน (Evidence Board) */

/** ชนิดของคอลัมน์ — กำหนดว่าจะให้ผู้เล่นกรองด้วยเครื่องมือแบบไหน */
export type ColumnKind =
  | "id" // เลขอ้างอิง ไม่ค่อยได้กรองตรง ๆ แต่ใช้เชื่อมแฟ้ม
  | "text" // ข้อความ — กรองด้วยเมนูตัวเลือกที่ดึงค่าจริงจากฐานข้อมูล
  | "number"
  | "money"
  | "datetime" // 'YYYY-MM-DD HH:MM'
  | "date" // 'YYYY-MM-DD'
  | "bool"; // 0/1

export interface ColumnMeta {
  name: string;
  /** ชื่อไทยที่ผู้เล่นเห็น — ผู้เล่นไม่ต้องรู้ชื่อคอลัมน์จริงเลย */
  label: string;
  kind: ColumnKind;
  /** คำอธิบายสั้น ๆ โผล่ใต้ชื่อคอลัมน์ในเมนูเลือก */
  hint?: string;
  /** ถ้าคอลัมน์นี้ชี้ไปตารางอื่น เขียนเป็น "people.id" */
  ref?: string;
}

export interface TableMeta {
  name: string;
  /** ชื่อแฟ้มภาษาไทย */
  label: string;
  icon: string;
  /** อธิบายว่าแฟ้มนี้เก็บอะไร ผู้เล่นอ่านแล้วรู้ว่าควรเปิดตอนไหน */
  blurb: string;
  columns: ColumnMeta[];
}

/** ความสัมพันธ์ระหว่างสองแฟ้ม — ผู้เล่นเห็นเป็นปุ่ม "เชื่อมแฟ้ม" ไม่ใช่คำว่า JOIN */
export interface Relation {
  id: string;
  left: { table: string; column: string };
  right: { table: string; column: string };
  /** ป้ายตอนกำลังจะดึงฝั่ง right เข้ามา (มองจากฝั่ง left) */
  toRight: string;
  /** ป้ายตอนกำลังจะดึงฝั่ง left เข้ามา (มองจากฝั่ง right) */
  toLeft: string;
}

/**
 * การเชื่อมแฟ้มหนึ่งครั้ง
 * - has    = เอาเฉพาะแถวที่ "มี" ข้อมูลฝั่งโน้น (JOIN ธรรมดา)
 * - hasNot = เอาเฉพาะแถวที่ "ไม่มี" ข้อมูลฝั่งโน้นเลย (NOT EXISTS)
 *
 * โหมด hasNot คือท่าไม้ตายของนักสืบ — "ใครบ้างที่ไม่มีข้อแก้ตัว" ตอบได้ด้วยคลิกเดียว
 * ทั้งที่ฝั่ง SQL มันคือ anti-join ซึ่งเป็นด่านที่คนเรียน SQL ตกกันเยอะที่สุด
 */
export interface JoinStep {
  relation: string;
  mode: "has" | "hasNot";
}

export type FilterOp =
  | "eq"
  | "neq"
  | "contains"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "onDate"
  | "timeOfDay"
  | "isNull"
  | "notNull"
  /** เทียบกับอีกคอลัมน์ในแฟ้มเดียวกัน — value เก็บชื่อคอลัมน์ */
  | "gtCol"
  | "ltCol"
  | "neqCol";

export interface Filter {
  id: string;
  /** ตารางที่คอลัมน์นี้อยู่ — ต้องระบุ เพราะเชื่อมหลายแฟ้มแล้วชื่อคอลัมน์ซ้ำกันได้ */
  table: string;
  column: string;
  op: FilterOp;
  value: string;
  /** ค่าที่สองของ between / timeOfDay */
  value2?: string;
}

export type AggKind = "count" | "countDistinct" | "sum" | "avg" | "max" | "min";

/** โหมด "สรุปยอด" — แทน GROUP BY โดยผู้เล่นแค่เลือกว่าจะนับตามอะไร */
export interface GroupSpec {
  table: string;
  column: string;
  agg: AggKind;
  /** คอลัมน์ที่เอามาบวก/เฉลี่ย/นับแบบไม่ซ้ำ (count เฉย ๆ ไม่ต้องใช้) */
  aggTable?: string;
  aggColumn?: string;
  /** แสดงเฉพาะกลุ่มที่ค่าสรุป >= ค่านี้ (แทน HAVING) */
  atLeast?: number;
}

export interface QueryState {
  /** แฟ้มตั้งต้น */
  table: string;
  joins: JoinStep[];
  filters: Filter[];
  sort?: { table: string; column: string; dir: "asc" | "desc" };
  group?: GroupSpec;
  limit?: number;
}

export interface QueryResult {
  columns: string[];
  values: (string | number | Uint8Array | null)[][];
}

export interface TableSchema {
  name: string;
  columns: string[];
}

/* ---------- ฝั่งกระดานผังคดี ---------- */

export type CardMark = "none" | "suspect" | "cleared" | "key";

/** การ์ดหลักฐานหนึ่งใบบนกระดาน — มาจากแถวที่ผู้เล่นปักหมุดในตารางผลลัพธ์ */
export interface EvidenceCard {
  id: string;
  /** แฟ้มต้นทาง ใช้เลือกสีและไอคอน */
  table: string;
  title: string;
  /** บรรทัดรายละเอียด — คู่ ป้ายไทย/ค่า */
  lines: { label: string; value: string }[];
  /** id ของคนที่ปรากฏในแถวนี้ ใช้รวมเป็นรายชื่อผู้ต้องสงสัย */
  personIds: number[];
  mark: CardMark;
  note: string;
  x: number;
  y: number;
}

/** เส้นเชือกแดงระหว่างการ์ดสองใบ */
export interface EvidenceLink {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface BoardState {
  cards: EvidenceCard[];
  links: EvidenceLink[];
}

/* ---------- คดี ---------- */

/** เครื่องมือที่ทยอยปลดล็อกตามคดี ไม่ให้ผู้เล่นเจอปุ่มเต็มหน้าจอตั้งแต่คดีแรก */
export type Tool = "sort" | "join" | "group" | "time" | "compareCol" | "hasNot";

export interface GameCase {
  n: number;
  title: string;
  /** ทักษะที่ได้ฝึกรอบนี้ เช่น "กรอง", "เชื่อมแฟ้ม", "สรุปยอด" */
  skill: string;
  /** เนื้อคดี รองรับ <b> <code> */
  brief: string;
  /** คำถามที่ต้องตอบ */
  goal: string;
  /** แฟ้มที่ควรเริ่มดู — ไฮไลต์ให้ในชั้นวางแฟ้ม */
  tables: string[];
  /** คำใบ้ไล่ระดับ เปิดทีละใบ */
  hints: string[];
  /** ชนิดคำตอบ — ชี้ตัวคนจากกระดาน หรือเลือกค่าจากรายการ */
  answer:
    | { kind: "person"; personId: number }
    | { kind: "choice"; prompt: string; options: string[]; correct: string };
  /** เครื่องมือที่คดีนี้ปลดล็อก (สะสมไปเรื่อย ๆ ไม่หายไปไหน) */
  unlocks?: Tool[];
  /** คดีสอนเล่น — แฟ้มจะมีคำแนะนำวิธีเล่นติดมาด้วย */
  tutorial?: boolean;
}

export type MessageTone = "info" | "ok" | "error";
