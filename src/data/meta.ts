/**
 * "หน้าตา" ของฐานข้อมูลในสายตาผู้เล่น
 *
 * ผู้เล่นเกมนี้ไม่ต้องรู้ชื่อตารางหรือชื่อคอลัมน์จริงเลย — ทุกอย่างที่เห็นบนจอมาจากไฟล์นี้
 * ชื่อจริงถูกใช้ตอนประกอบ SQL เบื้องหลังเท่านั้น (ดู lib/query.ts)
 *
 * โครงฐานข้อมูลยกมาจากโปรเจกต์ sql-detective ทั้งดุ้น ข้อมูลจึงเหมือนกันเป๊ะ
 * ต่างกันแค่วิธีที่ผู้เล่นเข้าถึงมัน
 */

import type { Relation, TableMeta } from "@/types";

export const TABLES: TableMeta[] = [
  {
    name: "people",
    label: "ทะเบียนราษฎร์",
    icon: "🪪",
    blurb: "รายชื่อคนในเมืองทั้งหมด พร้อมรูปพรรณ อายุ ส่วนสูง และเขตที่อยู่",
    columns: [
      { name: "id", label: "เลขประจำตัว", kind: "id" },
      { name: "name", label: "ชื่อ", kind: "text" },
      { name: "age", label: "อายุ", kind: "number" },
      { name: "hat_color", label: "สีหมวก", kind: "text", hint: "none = ไม่ใส่หมวก" },
      { name: "shirt_color", label: "สีเสื้อ", kind: "text" },
      { name: "height_cm", label: "ส่วนสูง (ซม.)", kind: "number" },
      { name: "district", label: "เขตที่อยู่", kind: "text" },
    ],
  },
  {
    name: "complaints",
    label: "ใบแจ้งเหตุ",
    icon: "📣",
    blurb: "เรื่องร้องเรียนที่ประชาชนแจ้งเข้ามา — ประเภทเหตุ สถานที่ เวลา และคำบอกเล่าพยาน",
    columns: [
      { name: "id", label: "เลขที่ใบแจ้ง", kind: "id" },
      { name: "type", label: "ประเภทเหตุ", kind: "text" },
      { name: "location", label: "สถานที่เกิดเหตุ", kind: "text" },
      { name: "reported_at", label: "เวลาที่แจ้ง", kind: "datetime" },
      { name: "description", label: "คำบอกเล่า", kind: "text" },
    ],
  },
  {
    name: "vehicles",
    label: "ทะเบียนรถ",
    icon: "🚗",
    blurb: "รถทุกคันในเมือง ป้ายทะเบียน สี รุ่น และเจ้าของ",
    columns: [
      { name: "id", label: "เลขที่", kind: "id" },
      { name: "owner_id", label: "เจ้าของ", kind: "id", ref: "people.id" },
      { name: "plate", label: "ป้ายทะเบียน", kind: "text" },
      { name: "color", label: "สีรถ", kind: "text" },
      { name: "model", label: "ประเภทรถ", kind: "text" },
    ],
  },
  {
    name: "parking_tickets",
    label: "ใบสั่งจอดรถ",
    icon: "🎫",
    blurb: "ใบสั่งที่เทศกิจออกให้ — ป้ายทะเบียน จุดที่ถูกจับ เวลา และจ่ายค่าปรับหรือยัง",
    columns: [
      { name: "id", label: "เลขที่ใบสั่ง", kind: "id" },
      { name: "plate", label: "ป้ายทะเบียน", kind: "text", ref: "vehicles.plate" },
      { name: "location", label: "จุดที่ถูกจับ", kind: "text" },
      { name: "issued_at", label: "เวลาที่ออกใบสั่ง", kind: "datetime" },
      { name: "paid", label: "จ่ายค่าปรับแล้ว", kind: "bool" },
    ],
  },
  {
    name: "cctv_logs",
    label: "บันทึกกล้องวงจรปิด",
    icon: "📹",
    blurb: "ใครโผล่หน้ากล้องตัวไหน เวลาเท่าไหร่ — แฟ้มที่ใช้ยืนยันที่อยู่ในเวลาเกิดเหตุ",
    columns: [
      { name: "id", label: "เลขที่บันทึก", kind: "id" },
      { name: "camera_location", label: "จุดติดตั้งกล้อง", kind: "text" },
      { name: "person_id", label: "คนที่ถูกจับภาพ", kind: "id", ref: "people.id" },
      { name: "seen_at", label: "เวลาที่เห็น", kind: "datetime" },
    ],
  },
  {
    name: "hotel_stays",
    label: "ทะเบียนโรงแรม",
    icon: "🏨",
    blurb: "ใครเข้าพักห้องไหน เช็คอินเช็คเอาต์เมื่อไหร่ และออกจริงตอนกี่โมง",
    columns: [
      { name: "id", label: "เลขที่", kind: "id" },
      { name: "guest_id", label: "ผู้เข้าพัก", kind: "id", ref: "people.id" },
      { name: "room", label: "เลขห้อง", kind: "number" },
      { name: "check_in", label: "เวลาเช็คอิน", kind: "datetime" },
      { name: "check_out", label: "กำหนดเช็คเอาต์", kind: "datetime" },
      { name: "actual_checkout", label: "เช็คเอาต์จริง", kind: "datetime" },
    ],
  },
  {
    name: "purchases",
    label: "สลิปการซื้อของ",
    icon: "🧾",
    blurb: "ของทุกชิ้นที่ถูกซื้อในเมือง — ใครซื้อ ซื้ออะไร ราคาเท่าไหร่ ที่ร้านไหน",
    columns: [
      { name: "id", label: "เลขที่สลิป", kind: "id" },
      { name: "person_id", label: "ผู้ซื้อ", kind: "id", ref: "people.id" },
      { name: "item", label: "สินค้า", kind: "text" },
      { name: "price", label: "ราคา", kind: "money" },
      { name: "bought_at", label: "เวลาที่ซื้อ", kind: "datetime" },
      { name: "shop", label: "ร้าน", kind: "text" },
    ],
  },
  {
    name: "phone_calls",
    label: "บันทึกการโทร",
    icon: "📞",
    blurb: "สายที่โทรหากันในเมือง — ใครโทรหาใคร เมื่อไหร่ คุยนานแค่ไหน",
    columns: [
      { name: "id", label: "เลขที่สาย", kind: "id" },
      { name: "caller_id", label: "ผู้โทรออก", kind: "id", ref: "people.id" },
      { name: "receiver_id", label: "ผู้รับสาย", kind: "id", ref: "people.id" },
      { name: "called_at", label: "เวลาที่โทร", kind: "datetime" },
      { name: "duration_sec", label: "นานกี่วินาที", kind: "number" },
    ],
  },
  {
    name: "transit_cards",
    label: "บัตรโดยสาร",
    icon: "💳",
    blurb: "บัตรรถไฟฟ้าของแต่ละคน — เลขบัตร วันที่ออกบัตร และสถานะ",
    columns: [
      { name: "card_no", label: "เลขบัตร", kind: "text" },
      { name: "owner_id", label: "เจ้าของบัตร", kind: "id", ref: "people.id" },
      { name: "issued_at", label: "วันที่ออกบัตร", kind: "date" },
      { name: "status", label: "สถานะบัตร", kind: "text" },
    ],
  },
  {
    name: "transit_taps",
    label: "บันทึกแตะบัตร",
    icon: "🚉",
    blurb: "ทุกครั้งที่มีคนแตะบัตรเข้าสถานี — เลขบัตร สถานี และเวลา",
    columns: [
      { name: "id", label: "เลขที่บันทึก", kind: "id" },
      { name: "card_no", label: "เลขบัตร", kind: "text", ref: "transit_cards.card_no" },
      { name: "station", label: "สถานี", kind: "text" },
      { name: "tapped_at", label: "เวลาที่แตะ", kind: "datetime" },
    ],
  },
  {
    name: "bank_transactions",
    label: "รายการเดินบัญชี",
    icon: "🏦",
    blurb: "เงินเข้าออกบัญชีของแต่ละคน — จำนวน เวลา ทิศทาง และหมายเหตุ",
    columns: [
      { name: "id", label: "เลขที่รายการ", kind: "id" },
      { name: "person_id", label: "เจ้าของบัญชี", kind: "id", ref: "people.id" },
      { name: "amount", label: "จำนวนเงิน", kind: "money", hint: "ติดลบ = เงินออก" },
      { name: "tx_at", label: "เวลาทำรายการ", kind: "datetime" },
      { name: "kind", label: "ทิศทาง", kind: "text", hint: "in = เงินเข้า, out = เงินออก" },
      { name: "note", label: "หมายเหตุ", kind: "text" },
    ],
  },
  {
    name: "crew_links",
    label: "ผังเครือข่าย",
    icon: "🕸️",
    blurb: "ใครดึงใครเข้าขบวนการ และเข้ามาเมื่อไหร่ — ไล่ขึ้นไปเรื่อย ๆ จะเจอต้นสาย",
    columns: [
      { name: "id", label: "เลขที่", kind: "id" },
      { name: "person_id", label: "สมาชิก", kind: "id", ref: "people.id" },
      {
        name: "recruited_by",
        label: "ถูกดึงเข้ามาโดย",
        kind: "id",
        ref: "people.id",
        hint: "ว่าง = ไม่มีใครดึง แปลว่าเป็นต้นสาย",
      },
      { name: "joined_at", label: "วันที่เข้าร่วม", kind: "date" },
    ],
  },
];

export const TABLE_BY_NAME = new Map(TABLES.map((t) => [t.name, t]));

export function tableMeta(name: string): TableMeta {
  const t = TABLE_BY_NAME.get(name);
  if (!t) throw new Error("ไม่รู้จักแฟ้ม " + name);
  return t;
}

export function columnMeta(table: string, column: string) {
  return TABLE_BY_NAME.get(table)?.columns.find((c) => c.name === column);
}

/** ป้ายไทยของคอลัมน์ ถ้าไม่รู้จักก็คืนชื่อดิบไป */
export function columnLabel(table: string, column: string): string {
  return columnMeta(table, column)?.label ?? column;
}

/**
 * เส้นเชื่อมระหว่างแฟ้ม
 *
 * เขียนมือแทนที่จะไล่สร้างจาก ref อัตโนมัติ เพราะป้ายภาษาไทยของสองทิศไม่เหมือนกัน
 * และบางคู่มีสองเส้น (phone_calls ผูกกับ people ทั้งฝั่งคนโทรและฝั่งคนรับ)
 * ผู้เล่นจึงเลือกได้ว่าจะเชื่อม "ในฐานะอะไร" โดยไม่ต้องรู้ว่าสิ่งที่ทำอยู่เรียกว่า JOIN
 */
export const RELATIONS: Relation[] = [
  {
    id: "vehicle_owner",
    left: { table: "vehicles", column: "owner_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติเจ้าของรถ",
    toLeft: "ดูรถที่คนเหล่านี้เป็นเจ้าของ",
  },
  {
    id: "ticket_vehicle",
    left: { table: "parking_tickets", column: "plate" },
    right: { table: "vehicles", column: "plate" },
    toRight: "ดูว่าใบสั่งเป็นของรถคันไหน",
    toLeft: "ดูใบสั่งของรถเหล่านี้",
  },
  {
    id: "cctv_person",
    left: { table: "cctv_logs", column: "person_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติคนที่ติดกล้อง",
    toLeft: "ดูภาพกล้องของคนเหล่านี้",
  },
  {
    id: "hotel_guest",
    left: { table: "hotel_stays", column: "guest_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติผู้เข้าพัก",
    toLeft: "ดูการเข้าพักของคนเหล่านี้",
  },
  {
    id: "purchase_buyer",
    left: { table: "purchases", column: "person_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติผู้ซื้อ",
    toLeft: "ดูของที่คนเหล่านี้ซื้อ",
  },
  {
    id: "call_caller",
    left: { table: "phone_calls", column: "caller_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติผู้โทรออก",
    toLeft: "ดูสายที่คนเหล่านี้โทรออก",
  },
  {
    id: "call_receiver",
    left: { table: "phone_calls", column: "receiver_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติผู้รับสาย",
    toLeft: "ดูสายที่โทรเข้าหาคนเหล่านี้",
  },
  {
    id: "card_owner",
    left: { table: "transit_cards", column: "owner_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติเจ้าของบัตร",
    toLeft: "ดูบัตรโดยสารของคนเหล่านี้",
  },
  {
    id: "tap_card",
    left: { table: "transit_taps", column: "card_no" },
    right: { table: "transit_cards", column: "card_no" },
    toRight: "ดูว่าเป็นการแตะของบัตรใบไหน",
    toLeft: "ดูการแตะบัตรของบัตรเหล่านี้",
  },
  {
    id: "bank_owner",
    left: { table: "bank_transactions", column: "person_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติเจ้าของบัญชี",
    toLeft: "ดูรายการเดินบัญชีของคนเหล่านี้",
  },
  {
    id: "crew_member",
    left: { table: "crew_links", column: "person_id" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติสมาชิกเครือข่าย",
    toLeft: "ดูสถานะในเครือข่ายของคนเหล่านี้",
  },
  {
    id: "crew_recruiter",
    left: { table: "crew_links", column: "recruited_by" },
    right: { table: "people", column: "id" },
    toRight: "ดูประวัติคนที่ดึงเข้ามา",
    toLeft: "ดูว่าคนเหล่านี้ดึงใครเข้าขบวนการบ้าง",
  },
];

export const RELATION_BY_ID = new Map(RELATIONS.map((r) => [r.id, r]));
