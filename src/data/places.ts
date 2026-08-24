/**
 * ชื่อสถานที่ในเมืองก็สุ่มใหม่ทุกรอบเล่นเหมือนชื่อคน (ดู pickSessionNames ใน seed.ts)
 * เพราะบางคดีตอบเป็น "สถานที่" ไม่ใช่ชื่อคน — ถ้าปล่อยชื่อสถานที่ตายตัว ผู้เล่นก็ยังจำคำตอบได้อยู่ดี
 *
 * วิธีสุ่ม: ไม่ได้สุ่มทีละชื่ออิสระ แต่สุ่มเป็น "โซน" ทั้งเมือง
 *   โซนหนึ่งได้คำนำหน้าหนึ่งคำ แล้วสถานที่ทุกแห่งในโซนนั้นใช้คำนำหน้าเดียวกัน
 *   เขต Old Town จึงคู่กับ Old Town Wall / Old Town Station / Old Town Hardware เสมอ
 *   ถ้าสุ่มทีละชื่อ เมืองจะกลายเป็นชื่อมั่ว ๆ ที่ไม่เกี่ยวกันเลยและเบาะแสจะอ่านไม่รู้เรื่อง
 *
 * คำต่อท้ายก็สุ่มด้วย (Plaza / Square / Commons) กันผู้เล่นจำแบบ "คำตอบคือที่ที่ลงท้ายว่า Plaza"
 */

type ZoneKey = "old" | "neon" | "river" | "down" | "harbor";

/** หมวดสถานที่ ใช้เลือกคำต่อท้าย — คลังคำของแต่ละหมวดต้องไม่ใช้คำซ้ำกัน */
type PlaceKind =
  | "district"
  | "park"
  | "alley"
  | "walk"
  | "wall"
  | "plaza"
  | "mall"
  | "gate"
  | "docks"
  | "station"
  | "hardware"
  | "cafe"
  | "mart"
  | "store"
  | "deptstore"
  | "music";

interface ZoneName {
  /** คำนำหน้าชื่อสถานที่ เช่น "Old Town" → "Old Town Wall" */
  prefix: string;
  /** ค่าที่เก็บใน people.district ซึ่งบางโซนไม่เท่ากับ prefix เช่น prefix "Neon" คู่กับเขต "Neon District" */
  district: string;
}

/** คลังชื่อโซน มากกว่า 5 โซนที่ใช้จริง แต่ละรอบจึงได้ชุดไม่ซ้ำเดิม */
const ZONE_POOL: ZoneName[] = [
  { prefix: "Old Town", district: "Old Town" },
  { prefix: "Neon", district: "Neon District" },
  { prefix: "Riverside", district: "Riverside" },
  { prefix: "Downtown", district: "Downtown" },
  { prefix: "Harbor", district: "Harbor" },
  { prefix: "Chinatown", district: "Chinatown" },
  { prefix: "Uptown", district: "Uptown" },
  { prefix: "Lakeside", district: "Lakeside" },
  { prefix: "Ironworks", district: "Ironworks" },
  { prefix: "Willow", district: "Willow Creek" },
  { prefix: "Cobalt", district: "Cobalt Quarter" },
  { prefix: "Marble", district: "Marble Hill" },
  { prefix: "Sunset", district: "Sunset Row" },
  { prefix: "Foundry", district: "Foundry" },
  { prefix: "Garden", district: "Garden Hill" },
  { prefix: "Amber", district: "Amber Bay" },
];

const SUFFIX_POOL: Record<Exclude<PlaceKind, "district">, string[]> = {
  park: ["Park", "Gardens", "Green"],
  alley: ["Alley", "Lane", "Backstreet"],
  walk: ["Walk", "Promenade", "Boardwalk"],
  wall: ["Wall", "Rampart", "Barrier"],
  plaza: ["Plaza", "Square", "Commons"],
  mall: ["Mall", "Arcade", "Galleria"],
  gate: ["Gate", "Arch", "Checkpoint"],
  docks: ["Docks", "Wharf", "Quay"],
  station: ["Station", "Terminal", "Halt", "Central", "Interchange"],
  hardware: ["Hardware", "Toolshop", "Supply"],
  cafe: ["Cafe", "Roastery", "Coffee House"],
  mart: ["Mart", "Minimart", "Corner Shop"],
  store: ["Store", "General Store", "Depot"],
  deptstore: ["Department Store", "Emporium", "Bazaar"],
  music: ["Records", "Sound", "Music Hall"],
};

/** ชื่อเมือง คงที่เสมอ เพราะเป็นชื่อแบรนด์ของเกม (Los Zorangeles) */
const CITY = "Zorange";

interface PlaceSlot {
  /** ชื่อที่เขียนไว้จริงใน seed.ts และในโจทย์ทุกคดี — ใช้เป็นกุญแจตอนแทนที่ */
  canonical: string;
  /** "city" = สถานที่กลางเมือง ใช้ชื่อเมืองนำหน้าแทนชื่อโซน */
  zone: ZoneKey | "city";
  kind: PlaceKind;
}

/**
 * สถานที่ทุกแห่งที่โผล่ในฐานข้อมูล (complaints.location, cctv_logs.camera_location,
 * parking_tickets.location, transit_taps.station, purchases.shop) และในเนื้อคดี
 *
 * เพิ่มสถานที่ใหม่ใน seed.ts แล้วต้องมาต่อ slot ตรงนี้ด้วย ไม่งั้นชื่อนั้นจะไม่ถูกสุ่ม
 */
const PLACE_SLOTS: PlaceSlot[] = [
  // กลางเมือง
  { canonical: "Zorange Park", zone: "city", kind: "park" },
  { canonical: "Zorange Mall", zone: "city", kind: "mall" },
  { canonical: "Music Zorange", zone: "city", kind: "music" },

  // เมืองเก่า
  { canonical: "Old Town Wall", zone: "old", kind: "wall" },
  { canonical: "Old Town Gate", zone: "old", kind: "gate" },
  { canonical: "Old Town Station", zone: "old", kind: "station" },
  { canonical: "Old Town Hardware", zone: "old", kind: "hardware" },
  { canonical: "Old Town", zone: "old", kind: "district" },

  // ย่านนีออน
  { canonical: "Neon Alley", zone: "neon", kind: "alley" },
  { canonical: "Neon Station", zone: "neon", kind: "station" },
  { canonical: "Neon Mart", zone: "neon", kind: "mart" },
  { canonical: "Neon Cafe", zone: "neon", kind: "cafe" },
  { canonical: "Neon District", zone: "neon", kind: "district" },

  // ริมน้ำ
  { canonical: "Riverside Walk", zone: "river", kind: "walk" },
  { canonical: "Riverside Halt", zone: "river", kind: "station" },
  { canonical: "Riverside Store", zone: "river", kind: "store" },
  { canonical: "Riverside", zone: "river", kind: "district" },

  // ใจกลางเมือง
  { canonical: "Downtown Plaza", zone: "down", kind: "plaza" },
  { canonical: "Downtown Central", zone: "down", kind: "station" },
  { canonical: "Downtown Mall", zone: "down", kind: "deptstore" },
  { canonical: "Downtown Hardware", zone: "down", kind: "hardware" },
  { canonical: "Downtown", zone: "down", kind: "district" },

  // ท่าเรือ
  { canonical: "Harbor Docks", zone: "harbor", kind: "docks" },
  { canonical: "Harbor Line", zone: "harbor", kind: "station" },
  { canonical: "Harbor Hardware", zone: "harbor", kind: "hardware" },
  { canonical: "Harbor Cafe", zone: "harbor", kind: "cafe" },
  { canonical: "Harbor", zone: "harbor", kind: "district" },
];

const ZONE_KEYS: ZoneKey[] = ["old", "neon", "river", "down", "harbor"];

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** แผนที่แทนที่ชื่อสถานที่: ชื่อเดิมที่เขียนไว้ในโค้ด → ชื่อของรอบเล่นนี้ */
export type PlaceMap = Record<string, string>;

/**
 * สุ่มชื่อสถานที่ชุดใหม่สำหรับหนึ่งรอบเล่น
 *
 * โซนทั้ง 5 ได้คำนำหน้าคนละคำ (ไม่ซ้ำกัน) และแต่ละหมวดสุ่มคำต่อท้ายของตัวเอง
 * ผลลัพธ์รับประกันว่าไม่มีสองสถานที่ได้ชื่อชนกัน เพราะภายในโซนเดียวกันไม่มีหมวดซ้ำ
 * และคลังคำต่อท้ายของแต่ละหมวดไม่ใช้คำร่วมกัน
 */
export function pickSessionPlaces(): PlaceMap {
  const zones = shuffled(ZONE_POOL).slice(0, ZONE_KEYS.length);
  const byZone = new Map<ZoneKey, ZoneName>(ZONE_KEYS.map((key, i) => [key, zones[i]]));

  // หมวดหนึ่งใช้คำต่อท้ายเดียวกันทั้งเมือง สถานีทุกแห่งจะได้ลงท้ายเหมือนกันเหมือนระบบขนส่งจริง
  const suffixOf = {} as Record<Exclude<PlaceKind, "district">, string>;
  for (const kind of Object.keys(SUFFIX_POOL) as Exclude<PlaceKind, "district">[]) {
    suffixOf[kind] = pick(SUFFIX_POOL[kind]);
  }

  const map: PlaceMap = {};
  for (const slot of PLACE_SLOTS) {
    if (slot.kind === "district") {
      // เขตใช้ชื่อเขตของโซนตรง ๆ ไม่ต่อท้ายอะไร
      map[slot.canonical] = byZone.get(slot.zone as ZoneKey)!.district;
      continue;
    }
    const prefix = slot.zone === "city" ? CITY : byZone.get(slot.zone)!.prefix;
    map[slot.canonical] = `${prefix} ${suffixOf[slot.kind]}`;
  }
  return map;
}

/** แผนที่แบบไม่เปลี่ยนอะไรเลย ใช้ตอนเรนเดอร์ฝั่งเซิร์ฟเวอร์ที่ไม่ต้องสุ่มจริง */
export const DEFAULT_PLACES: PlaceMap = Object.fromEntries(
  PLACE_SLOTS.map((s) => [s.canonical, s.canonical]),
);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * แทนชื่อสถานที่ทั้งหมดในข้อความหนึ่งก้อน (SQL ตั้งต้น, เนื้อคดี, คำใบ้, เฉลย, คำตอบ)
 *
 * เรียงกุญแจจากยาวไปสั้นแล้วแทนที่รอบเดียว — สำคัญมาก เพราะ "Old Town" เป็นส่วนหนึ่งของ
 * "Old Town Wall" ถ้าแทนคำสั้นก่อนจะได้ผลลัพธ์เพี้ยน และการแทนรอบเดียวทำให้ชื่อใหม่
 * ไม่ถูกนำไปแทนซ้ำอีก
 */
export function applyPlaces(text: string, map: PlaceMap): string {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  if (keys.length === 0) return text;
  const pattern = new RegExp(keys.map(escapeRegExp).join("|"), "g");
  return text.replace(pattern, (hit) => map[hit] ?? hit);
}
