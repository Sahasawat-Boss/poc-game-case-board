/**
 * ข้อมูลตั้งต้นของฐานข้อมูลเมือง Los Zorangeles
 *
 * ชื่อคน (people.name) ไม่ตายตัว — สุ่มใหม่ทุกครั้งที่เริ่มเกม (ดู pickSessionNames)
 * ส่วนคุณสมบัติอื่น ๆ ของแต่ละ id (หมวก, ส่วนสูง, เขต ฯลฯ) และตารางที่เหลือคงที่เสมอ
 * เพราะเงื่อนไขของทุกคดีอิงกับ id ไม่ใช่ชื่อ — สุ่มชื่อแล้วคำตอบยังถูกต้องเหมือนเดิม
 * แค่ผู้เล่นเดาคำตอบจากชื่อที่จำได้จากรอบก่อนไม่ได้ ต้องค้นฐานข้อมูลเองทุกรอบ
 */

import { applyPlaces, DEFAULT_PLACES, type PlaceMap } from "@/data/places";

interface PersonAttrs {
  id: number;
  age: number;
  hatColor: string;
  shirtColor: string;
  heightCm: number;
  district: string;
}

const PEOPLE_ATTRS: PersonAttrs[] = [
  { id: 1, age: 34, hatColor: "red", shirtColor: "white", heightCm: 183, district: "Old Town" },
  { id: 2, age: 28, hatColor: "blue", shirtColor: "black", heightCm: 176, district: "Neon District" },
  { id: 3, age: 41, hatColor: "red", shirtColor: "green", heightCm: 165, district: "Old Town" },
  { id: 4, age: 25, hatColor: "green", shirtColor: "white", heightCm: 170, district: "Riverside" },
  { id: 5, age: 50, hatColor: "black", shirtColor: "blue", heightCm: 181, district: "Neon District" },
  { id: 6, age: 33, hatColor: "red", shirtColor: "red", heightCm: 179, district: "Riverside" },
  { id: 7, age: 29, hatColor: "yellow", shirtColor: "yellow", heightCm: 158, district: "Old Town" },
  { id: 8, age: 45, hatColor: "blue", shirtColor: "grey", heightCm: 190, district: "Downtown" },
  { id: 9, age: 38, hatColor: "none", shirtColor: "pink", heightCm: 162, district: "Downtown" },
  { id: 10, age: 27, hatColor: "black", shirtColor: "black", heightCm: 185, district: "Neon District" },
  { id: 11, age: 31, hatColor: "white", shirtColor: "blue", heightCm: 172, district: "Riverside" },
  { id: 12, age: 36, hatColor: "red", shirtColor: "black", heightCm: 168, district: "Downtown" },
  { id: 13, age: 22, hatColor: "green", shirtColor: "pink", heightCm: 160, district: "Old Town" },
  { id: 14, age: 55, hatColor: "brown", shirtColor: "brown", heightCm: 174, district: "Riverside" },
  { id: 15, age: 30, hatColor: "blue", shirtColor: "white", heightCm: 188, district: "Downtown" },
  { id: 16, age: 26, hatColor: "none", shirtColor: "green", heightCm: 167, district: "Neon District" },
  { id: 17, age: 48, hatColor: "black", shirtColor: "grey", heightCm: 177, district: "Old Town" },
  { id: 18, age: 35, hatColor: "yellow", shirtColor: "white", heightCm: 155, district: "Downtown" },
  { id: 19, age: 40, hatColor: "red", shirtColor: "blue", heightCm: 171, district: "Neon District" },
  { id: 20, age: 44, hatColor: "white", shirtColor: "black", heightCm: 182, district: "Riverside" },
  // ---- ประชากรชุดที่สอง เพิ่มมาพร้อมเขต Harbor และคดีที่ 9 เป็นต้นไป ----
  { id: 21, age: 24, hatColor: "blue", shirtColor: "white", heightCm: 169, district: "Harbor" },
  { id: 22, age: 39, hatColor: "black", shirtColor: "red", heightCm: 178, district: "Harbor" },
  { id: 23, age: 46, hatColor: "none", shirtColor: "blue", heightCm: 165, district: "Harbor" },
  { id: 24, age: 33, hatColor: "white", shirtColor: "green", heightCm: 187, district: "Harbor" },
  { id: 25, age: 29, hatColor: "red", shirtColor: "black", heightCm: 174, district: "Harbor" },
  { id: 26, age: 52, hatColor: "grey", shirtColor: "grey", heightCm: 180, district: "Harbor" },
  { id: 27, age: 31, hatColor: "green", shirtColor: "black", heightCm: 176, district: "Harbor" },
  { id: 28, age: 27, hatColor: "yellow", shirtColor: "blue", heightCm: 163, district: "Harbor" },
  { id: 29, age: 43, hatColor: "black", shirtColor: "white", heightCm: 184, district: "Downtown" },
  { id: 30, age: 35, hatColor: "blue", shirtColor: "pink", heightCm: 159, district: "Downtown" },
  { id: 31, age: 21, hatColor: "none", shirtColor: "yellow", heightCm: 171, district: "Downtown" },
  { id: 32, age: 49, hatColor: "brown", shirtColor: "black", heightCm: 186, district: "Neon District" },
  { id: 33, age: 37, hatColor: "white", shirtColor: "red", heightCm: 173, district: "Neon District" },
  { id: 34, age: 28, hatColor: "red", shirtColor: "white", heightCm: 166, district: "Neon District" },
  { id: 35, age: 58, hatColor: "black", shirtColor: "brown", heightCm: 179, district: "Riverside" },
  { id: 36, age: 23, hatColor: "green", shirtColor: "blue", heightCm: 168, district: "Riverside" },
  { id: 37, age: 41, hatColor: "none", shirtColor: "white", heightCm: 189, district: "Riverside" },
  { id: 38, age: 32, hatColor: "blue", shirtColor: "black", heightCm: 175, district: "Old Town" },
  { id: 39, age: 26, hatColor: "yellow", shirtColor: "green", heightCm: 161, district: "Old Town" },
  { id: 40, age: 47, hatColor: "black", shirtColor: "blue", heightCm: 183, district: "Old Town" },
  { id: 41, age: 30, hatColor: "red", shirtColor: "grey", heightCm: 177, district: "Old Town" },
  { id: 42, age: 36, hatColor: "white", shirtColor: "black", heightCm: 170, district: "Harbor" },
  { id: 43, age: 44, hatColor: "grey", shirtColor: "white", heightCm: 181, district: "Downtown" },
  { id: 44, age: 25, hatColor: "none", shirtColor: "black", heightCm: 164, district: "Neon District" },
];

/**
 * คลังชื่อสำรอง — มากกว่าจำนวนคน (20) เพื่อให้แต่ละรอบเล่นได้ชุดชื่อไม่ซ้ำเดิม
 * ชื่อเล่น (คำแรก) ทุกชื่อในคลังนี้ไม่ซ้ำกัน กันปัญหาสองคนในรอบเดียวกันมีชื่อเล่นชนกัน
 */
const NAME_POOL = [
  "สมชาย มั่งมี",
  "ปรีชา ทองดี",
  "มานี ศรีสุข",
  "วิภา จันทร์เพ็ญ",
  "ธนา รุ่งเรือง",
  "กิตติ แสงทอง",
  "นภา ดาวเรือง",
  "อนันต์ ภูผา",
  "สุดา ไพรวัลย์",
  "วีระ เข้มแข็ง",
  "จิรา สายลม",
  "เอกชัย พลเดช",
  "พิมพ์ใจ หวานเย็น",
  "สมหมาย ใจดี",
  "ชลธี คลื่นลม",
  "รัตนา แก้วใส",
  "ประเสริฐ มั่นคง",
  "อารีย์ สุขสันต์",
  "ณรงค์ ฟ้าใส",
  "บุญมี ทรัพย์เจริญ",
  "สุรชัย เจริญพร",
  "มาลี พรหมมา",
  "วรรณา ทิพย์รส",
  "สมพงษ์ ยิ้มแย้ม",
  "นิรันดร์ เกียรติศักดิ์",
  "ปัทมา แสงจันทร์",
  "ธีระ วงศ์สุวรรณ",
  "กมลา อินทร์แก้ว",
  "ไพโรจน์ ศรีวิไล",
  "สายฝน บัวขาว",
  "ชูชาติ ทองมา",
  "ดวงใจ รักชาติ",
  "อรุณ แจ่มใส",
  "ทวี บุญเรือง",
  "พเยาว์ ดวงดี",
  "ศิริพร วารีรัตน์",
  "ยงยุทธ ชัยชนะ",
  "เพ็ญศรี จันทรา",
  "อดิศักดิ์ พงษ์ไพร",
  "นงลักษณ์ เกิดผล",
  "วิชัย รัตนกุล",
  "จันทนา นิลเนตร",
  "ภานุ เมฆขาว",
  "สมศรี พูนผล",
  "เกรียงไกร ยอดเยี่ยม",
  "ลัดดา วงศ์ทอง",
  "ประยูร สังข์ทอง",
  "อุบล ริมธาร",
  "ธงชัย เดชะ",
  "พิศมัย ชื่นบาน",
  "สุเทพ ผลบุญ",
  "กาญจนา แสงเพชร",
  "ฉัตรชัย ไกรทอง",
  "มะลิ หอมกลิ่น",
  "อนุชา ท่าเรือ",
  "เรวดี ปานทอง",
];

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** สุ่มชื่อชุดใหม่สำหรับหนึ่งรอบเล่น คืนเป็น array ที่ names[i] คือชื่อของคน id = i + 1 */
export function pickSessionNames(): string[] {
  return shuffled(NAME_POOL).slice(0, PEOPLE_ATTRS.length);
}

/** ชื่อชุดตั้งต้น ใช้ตอนเรนเดอร์ฝั่งเซิร์ฟเวอร์ (หน้า Home) ที่ไม่ต้องสุ่มจริง */
export const DEFAULT_NAMES = PEOPLE_ATTRS.map((_, i) => NAME_POOL[i]);

function peopleTableSql(names: string[]): string {
  const rows = PEOPLE_ATTRS.map((p, i) => {
    const name = names[i] ?? NAME_POOL[i];
    return `(${p.id},'${name}',${p.age},'${p.hatColor}','${p.shirtColor}',${p.heightCm},'${p.district}')`;
  }).join(",\n");

  return `CREATE TABLE people (
  id INTEGER PRIMARY KEY, name TEXT, age INTEGER,
  hat_color TEXT, shirt_color TEXT, height_cm INTEGER, district TEXT
);
INSERT INTO people VALUES
${rows};`;
}

/** ตารางที่เหลือ อ้างอิงคนด้วย id ทั้งหมด จึงไม่ผูกกับชื่อ ไม่ต้องสุ่มใหม่ */
const OTHER_TABLES_SQL = `
CREATE TABLE complaints (
  id INTEGER PRIMARY KEY, type TEXT, location TEXT, reported_at TEXT, description TEXT
);
INSERT INTO complaints VALUES
(1,'littering','Zorange Park','2026-03-01 09:12','ถุงขนมกองอยู่ข้างม้านั่ง พยานเห็นชายใส่หมวกแดง สูงเกิน 180 ซม.'),
(2,'noise','Neon Alley','2026-03-02 22:40','เปิดเพลงเสียงดัง'),
(3,'noise','Riverside Walk','2026-03-05 23:15','ตีกลองกลางดึก'),
(4,'graffiti','Old Town Wall','2026-03-06 02:30','พ่นสีสเปรย์บนกำแพงเมืองเก่า'),
(5,'noise','Downtown Plaza','2026-03-07 21:05','คาราโอเกะกลางลาน'),
(6,'littering','Neon Alley','2026-03-08 08:00','ทิ้งแก้วกาแฟ'),
(7,'parking','Zorange Mall','2026-03-08 13:20','จอดขวางทางเข้า'),
(8,'noise','Zorange Park','2026-03-04 20:00','ซ้อมวงดนตรี'),
(9,'noise','Harbor Docks','2026-03-05 22:05','เสียงเครื่องยนต์เรือกลางดึก'),
(10,'noise','Neon Alley','2026-03-06 21:10','เปิดเพลงจากรถ'),
(11,'theft','Harbor Docks','2026-03-09 03:10','ตู้คอนเทนเนอร์ถูกงัด'),
(12,'littering','Harbor Line','2026-03-09 07:30','กองกล่องพัสดุทิ้งไว้ข้างราง'),
(13,'vandalism','Neon Station','2026-03-09 01:40','ตู้ขายตั๋วถูกทุบ'),
(14,'parking','Riverside','2026-03-09 08:50','จอดคร่อมสองช่อง'),
(15,'fraud','Downtown Central','2026-03-10 10:15','แจ้งว่าบัตรโดยสารถูกใช้ซ้อน'),
(16,'theft','Zorange Mall','2026-03-10 16:40','กระเป๋าหายจากร้านกาแฟ'),
(17,'graffiti','Neon Station','2026-03-11 02:20','พ่นสีที่ผนังชานชาลา'),
(18,'theft','Old Town Station','2026-03-11 22:50','จักรยานหายจากที่จอด'),
(19,'smuggling','Harbor Docks','2026-03-11 23:40','พบลังของไม่มีใบขนสินค้า'),
(20,'fraud','Downtown Central','2026-03-12 09:05','เงินโอนเข้าบัญชีถี่ผิดปกติ'),
(21,'parking','Harbor Docks','2026-03-12 07:20','รถบรรทุกจอดขวางประตู 3'),
(22,'vandalism','Riverside Walk','2026-03-13 01:15','ไฟทางถูกทุบ');

CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY, owner_id INTEGER, plate TEXT, color TEXT, model TEXT
);
INSERT INTO vehicles VALUES
(1,5,'ZR-1123','black','sedan'),
(2,8,'ZR-2244','white','pickup'),
(3,2,'ZR-3390','red','hatchback'),
(4,15,'ZR-4471','blue','van'),
(5,20,'ZR-5502','silver','sedan'),
(6,10,'ZR-6613','black','suv'),
(7,12,'ZR-7724','green','sedan'),
(8,14,'ZR-8835','white','truck'),
(9,22,'ZR-9046','black','van'),
(10,24,'ZR-9157','white','sedan'),
(11,27,'ZR-9268','grey','pickup'),
(12,29,'ZR-9379','blue','suv'),
(13,32,'ZR-9480','black','van'),
(14,35,'ZR-9591','red','sedan'),
(15,37,'ZR-9602','white','hatchback'),
(16,40,'ZR-9713','green','pickup'),
(17,43,'ZR-9824','black','sedan'),
(18,30,'ZR-9935','silver','hatchback'),
(19,21,'ZR-1046','yellow','scooter'),
(20,33,'ZR-1157','blue','sedan');

CREATE TABLE parking_tickets (
  id INTEGER PRIMARY KEY, plate TEXT, location TEXT, issued_at TEXT, paid INTEGER
);
INSERT INTO parking_tickets VALUES
(1,'ZR-1123','Zorange Mall','2026-03-02 10:00',1),
(2,'ZR-3390','Zorange Mall','2026-03-08 13:20',0),
(3,'ZR-4471','Old Town','2026-03-03 11:00',0),
(4,'ZR-6613','Zorange Mall','2026-03-05 15:30',1),
(5,'ZR-7724','Riverside','2026-03-06 09:00',0),
(6,'ZR-8835','Zorange Mall','2026-03-07 18:00',1),
(7,'ZR-9046','Harbor Docks','2026-03-09 06:30',0),
(8,'ZR-9157','Zorange Mall','2026-03-09 12:00',1),
(9,'ZR-9268','Old Town','2026-03-10 08:15',0),
(10,'ZR-9379','Downtown','2026-03-10 19:20',1),
(11,'ZR-9480','Harbor Docks','2026-03-11 23:10',0),
(12,'ZR-9591','Riverside','2026-03-12 09:40',0),
(13,'ZR-9602','Zorange Mall','2026-03-12 14:05',1),
(14,'ZR-9713','Old Town','2026-03-13 07:55',1),
(15,'ZR-9824','Downtown','2026-03-13 18:30',0),
(16,'ZR-9935','Harbor Docks','2026-03-14 05:45',0),
(17,'ZR-1046','Neon District','2026-03-14 21:15',0),
(18,'ZR-1157','Zorange Mall','2026-03-14 22:40',1);

CREATE TABLE cctv_logs (
  id INTEGER PRIMARY KEY, camera_location TEXT, person_id INTEGER, seen_at TEXT
);
INSERT INTO cctv_logs VALUES
(1,'Neon Alley',10,'2026-03-02 22:10'),
(2,'Neon Alley',10,'2026-03-02 22:35'),
(3,'Neon Alley',2,'2026-03-02 22:50'),
(4,'Neon Alley',5,'2026-03-03 19:00'),
(5,'Neon Alley',10,'2026-03-04 21:15'),
(6,'Neon Alley',16,'2026-03-05 18:40'),
(7,'Neon Alley',10,'2026-03-06 23:05'),
(8,'Neon Alley',2,'2026-03-07 20:20'),
(9,'Neon Alley',16,'2026-03-08 07:55'),
(10,'Zorange Park',6,'2026-03-01 09:05'),
(11,'Zorange Park',1,'2026-03-01 09:08'),
(12,'Zorange Park',13,'2026-03-04 20:10'),
(13,'Old Town Wall',15,'2026-03-04 01:20'),
(14,'Old Town Wall',12,'2026-03-06 02:15'),
(15,'Old Town Wall',12,'2026-03-06 02:41'),
(16,'Old Town Gate',1,'2026-03-06 01:10'),
(17,'Old Town Gate',3,'2026-03-06 00:40'),
(18,'Old Town Gate',7,'2026-03-06 02:05'),
(19,'Old Town Gate',13,'2026-03-06 03:30'),
(20,'Downtown Plaza',18,'2026-03-07 21:00'),
(21,'Downtown Plaza',9,'2026-03-07 21:30'),
(22,'Riverside Walk',11,'2026-03-05 23:10'),
(23,'Riverside Walk',14,'2026-03-05 23:20'),
(24,'Zorange Mall',2,'2026-03-08 13:15'),
-- คืนวันที่ 6 มี.ค. มีคนเดินผ่านกล้องเมืองเก่ามากกว่าที่คิด
(25,'Old Town Gate',38,'2026-03-06 01:35'),
(26,'Old Town Gate',39,'2026-03-06 02:55'),
(27,'Old Town Wall',40,'2026-03-06 03:15'),
(28,'Old Town Gate',41,'2026-03-06 00:20'),
(29,'Old Town Wall',3,'2026-03-06 01:50'),
(30,'Old Town Wall',13,'2026-03-06 02:05'),
-- บันทึกกล้องช่วงกลางดึกของหลายคืน
(31,'Harbor Docks',27,'2026-03-03 02:20'),
(32,'Harbor Docks',27,'2026-03-05 03:05'),
(33,'Neon Station',27,'2026-03-07 02:50'),
(34,'Harbor Docks',27,'2026-03-09 03:40'),
(35,'Old Town Station',27,'2026-03-11 02:10'),
(36,'Downtown Central',30,'2026-03-08 02:35'),
(37,'Downtown Central',30,'2026-03-10 03:20'),
(38,'Neon Station',30,'2026-03-12 02:45'),
(39,'Harbor Docks',22,'2026-03-09 03:02'),
(40,'Harbor Docks',22,'2026-03-11 02:25'),
(41,'Neon Station',22,'2026-03-13 03:50'),
(42,'Riverside Walk',35,'2026-03-11 02:35'),
(43,'Old Town Station',35,'2026-03-12 03:10'),
-- กล้องทั่วเมืองช่วงสัปดาห์ที่สอง
(44,'Neon Alley',32,'2026-03-09 20:15'),
(45,'Neon Alley',32,'2026-03-10 21:40'),
(46,'Neon Alley',32,'2026-03-12 19:05'),
(47,'Neon Alley',33,'2026-03-09 22:30'),
(48,'Neon Alley',33,'2026-03-13 20:55'),
(49,'Neon Alley',44,'2026-03-10 18:20'),
(50,'Neon Alley',44,'2026-03-14 21:35'),
(51,'Neon Alley',34,'2026-03-11 19:50'),
(52,'Harbor Docks',21,'2026-03-09 06:40'),
(53,'Harbor Docks',23,'2026-03-09 18:10'),
(54,'Harbor Docks',24,'2026-03-10 07:25'),
(55,'Harbor Docks',26,'2026-03-10 17:45'),
(56,'Harbor Docks',28,'2026-03-11 08:05'),
(57,'Harbor Docks',42,'2026-03-11 16:30'),
(58,'Harbor Docks',25,'2026-03-12 06:15'),
(59,'Downtown Plaza',29,'2026-03-08 19:40'),
(60,'Downtown Plaza',31,'2026-03-09 12:25'),
(61,'Downtown Plaza',43,'2026-03-10 20:10'),
(62,'Downtown Central',43,'2026-03-12 09:35'),
(63,'Riverside Walk',36,'2026-03-09 17:55'),
(64,'Riverside Walk',37,'2026-03-10 15:20'),
(65,'Riverside Halt',35,'2026-03-11 21:45'),
(66,'Old Town Station',38,'2026-03-11 22:40'),
(67,'Old Town Station',39,'2026-03-11 23:20'),
(68,'Zorange Mall',30,'2026-03-10 16:35'),
(69,'Zorange Mall',33,'2026-03-12 14:10'),
(70,'Zorange Park',21,'2026-03-13 09:15'),
(71,'Neon Station',34,'2026-03-13 18:40'),
(72,'Neon Station',44,'2026-03-14 19:25'),
(73,'Old Town Gate',40,'2026-03-12 08:30'),
(74,'Old Town Gate',41,'2026-03-13 07:10'),
(75,'Riverside Walk',14,'2026-03-12 20:05'),
(76,'Downtown Plaza',18,'2026-03-13 21:50'),
(77,'Harbor Docks',22,'2026-03-09 23:05'),
(78,'Old Town Station',35,'2026-03-11 23:05'),
(79,'Neon Station',30,'2026-03-11 01:30'),
(80,'Downtown Central',29,'2026-03-09 10:55');

CREATE TABLE hotel_stays (
  id INTEGER PRIMARY KEY, guest_id INTEGER, room INTEGER,
  check_in TEXT, check_out TEXT, actual_checkout TEXT
);
INSERT INTO hotel_stays VALUES
(1,4,201,'2026-03-01 14:00','2026-03-03 12:00','2026-03-03 11:20'),
(2,7,305,'2026-03-02 15:00','2026-03-04 12:00','2026-03-04 15:45'),
(3,13,410,'2026-03-03 13:00','2026-03-05 12:00','2026-03-05 12:00'),
(4,18,112,'2026-03-04 16:00','2026-03-06 12:00','2026-03-06 10:30'),
(5,9,507,'2026-03-05 14:00','2026-03-07 12:00','2026-03-07 11:55'),
(6,21,208,'2026-03-08 14:00','2026-03-10 12:00','2026-03-10 11:40'),
(7,29,415,'2026-03-09 15:30','2026-03-11 12:00','2026-03-11 12:00'),
(8,32,309,'2026-03-09 13:00','2026-03-12 12:00','2026-03-12 10:15'),
(9,35,502,'2026-03-10 16:00','2026-03-12 12:00','2026-03-12 11:50'),
(10,43,610,'2026-03-10 14:30','2026-03-13 12:00','2026-03-13 09:45'),
(11,24,207,'2026-03-11 15:00','2026-03-13 12:00','2026-03-13 12:00'),
(12,30,118,'2026-03-12 13:45','2026-03-14 12:00','2026-03-14 08:20'),
(13,36,404,'2026-03-12 17:00','2026-03-14 12:00','2026-03-14 11:05'),
(14,22,506,'2026-03-13 14:00','2026-03-15 12:00','2026-03-15 10:30');

CREATE TABLE purchases (
  id INTEGER PRIMARY KEY, person_id INTEGER, item TEXT, price REAL, bought_at TEXT, shop TEXT
);
INSERT INTO purchases VALUES
(1,6,'spray paint',180,'2026-03-01 10:00','Old Town Hardware'),
(2,12,'spray paint',195,'2026-03-05 18:00','Downtown Hardware'),
(3,15,'spray paint',175,'2026-03-05 20:00','Downtown Hardware'),
(4,17,'spray paint',180,'2026-03-05 19:30','Old Town Hardware'),
(5,12,'black gloves',250,'2026-03-05 18:10','Downtown Hardware'),
(6,2,'coffee',65,'2026-03-08 08:00','Neon Cafe'),
(7,10,'energy drink',35,'2026-03-02 21:00','Neon Mart'),
(8,9,'karaoke mic',890,'2026-03-06 11:00','Downtown Mall'),
(9,18,'speaker',1290,'2026-03-06 12:00','Downtown Mall'),
(10,7,'drum sticks',320,'2026-03-03 16:00','Music Zorange'),
-- คนซื้อสีสเปรย์มีมากกว่าที่คิด แต่คนที่อยู่หน้ากำแพงคืนนั้นมีไม่กี่คน
(11,21,'spray paint',185,'2026-03-09 11:20','Harbor Hardware'),
(12,33,'spray paint',190,'2026-03-10 15:40','Neon Mart'),
(13,36,'spray paint',175,'2026-03-11 09:10','Riverside Store'),
(14,44,'spray paint',195,'2026-03-12 20:30','Neon Mart'),
-- โทรศัพท์แบบใช้แล้วทิ้ง ของคู่ใจขบวนการเงินเทา
(15,30,'burner phone',1450,'2026-03-09 18:25','Downtown Mall'),
(16,35,'burner phone',1390,'2026-03-10 19:40','Riverside Store'),
(17,41,'burner phone',1420,'2026-03-11 12:15','Old Town Hardware'),
(18,22,'rope',260,'2026-03-09 07:50','Harbor Hardware'),
(19,22,'flashlight',480,'2026-03-09 07:55','Harbor Hardware'),
(20,24,'bolt cutter',1750,'2026-03-10 09:30','Harbor Hardware'),
(21,27,'black gloves',240,'2026-03-11 10:05','Harbor Hardware'),
(22,29,'suitcase',2600,'2026-03-09 13:15','Downtown Mall'),
(23,29,'watch',8900,'2026-03-10 14:20','Downtown Mall'),
(24,32,'laptop',24500,'2026-03-11 16:45','Neon Mart'),
(25,32,'sim card',120,'2026-03-11 16:50','Neon Mart'),
(26,35,'boat fuel',3200,'2026-03-12 06:20','Harbor Hardware'),
(27,43,'watch',12500,'2026-03-12 15:35','Downtown Mall'),
(28,31,'coffee',70,'2026-03-09 08:10','Neon Cafe'),
(29,26,'coffee',65,'2026-03-10 08:05','Harbor Cafe'),
(30,23,'newspaper',30,'2026-03-10 07:40','Harbor Cafe'),
(31,28,'energy drink',40,'2026-03-11 21:55','Neon Mart'),
(32,37,'paint roller',260,'2026-03-11 11:30','Riverside Store'),
(33,38,'padlock',320,'2026-03-12 10:50','Old Town Hardware'),
(34,39,'umbrella',420,'2026-03-12 13:05','Old Town Hardware'),
(35,40,'ladder',2100,'2026-03-13 09:25','Old Town Hardware'),
(36,42,'fishing rod',1850,'2026-03-13 06:35','Harbor Hardware'),
(37,34,'speaker',1290,'2026-03-13 19:15','Neon Mart'),
(38,25,'work boots',990,'2026-03-14 08:45','Harbor Hardware'),
(39,30,'sim card',120,'2026-03-09 18:30','Downtown Mall'),
(40,35,'sim card',120,'2026-03-10 19:45','Riverside Store');

CREATE TABLE phone_calls (
  id INTEGER PRIMARY KEY, caller_id INTEGER, receiver_id INTEGER, called_at TEXT, duration_sec INTEGER
);
INSERT INTO phone_calls VALUES
(1,12,17,'2026-03-04 20:00',300),
(2,12,17,'2026-03-05 09:30',250),
(3,12,17,'2026-03-05 17:10',400),
(4,5,17,'2026-03-03 10:00',100),
(5,5,17,'2026-03-04 10:05',120),
(6,5,17,'2026-03-05 10:02',90),
(7,8,17,'2026-03-05 21:00',900),
(8,20,17,'2026-03-02 12:00',500),
(9,20,17,'2026-03-06 12:00',400),
(10,12,15,'2026-03-05 19:00',150),
-- สายที่โทรเข้าหา id 17 เพิ่มอีกหลายเบอร์ บางเบอร์โทรถี่แต่สั้น บางเบอร์โทรน้อยแต่ยาว
(11,21,17,'2026-03-09 09:00',150),
(12,21,17,'2026-03-09 15:00',180),
(13,21,17,'2026-03-10 10:00',160),
(14,29,17,'2026-03-09 20:00',700),
(15,29,17,'2026-03-10 21:00',650),
(16,30,17,'2026-03-11 08:30',200),
(17,30,17,'2026-03-11 19:45',190),
-- สายภายในขบวนการ
(18,32,43,'2026-03-08 22:10',420),
(19,32,43,'2026-03-10 23:05',380),
(20,30,32,'2026-03-09 18:20',260),
(21,35,30,'2026-03-10 20:05',310),
(22,35,32,'2026-03-11 21:15',480),
(23,43,32,'2026-03-12 09:50',540),
(24,22,24,'2026-03-09 06:15',150),
(25,24,22,'2026-03-10 07:05',210),
(26,27,22,'2026-03-11 01:55',95),
(27,41,35,'2026-03-11 12:40',330),
(28,38,39,'2026-03-12 11:10',120),
(29,44,34,'2026-03-13 20:20',260),
(30,26,23,'2026-03-10 08:15',80),
(31,31,29,'2026-03-09 14:35',175),
(32,37,36,'2026-03-12 16:00',140);

CREATE TABLE transit_cards (
  card_no TEXT PRIMARY KEY, owner_id INTEGER, issued_at TEXT, status TEXT
);
INSERT INTO transit_cards VALUES
('ZC-1001',21,'2026-01-12','active'),
('ZC-1002',22,'2026-01-15','active'),
('ZC-1003',23,'2026-01-20','active'),
('ZC-1004',24,'2026-02-02','active'),
('ZC-1005',26,'2026-02-08','active'),
('ZC-1006',27,'2026-02-11','active'),
('ZC-1007',28,'2026-02-14','active'),
('ZC-1008',42,'2026-02-18','active'),
('ZC-1009',29,'2026-01-05','active'),
('ZC-1010',30,'2026-01-09','active'),
('ZC-1011',31,'2026-01-22','lost'),
('ZC-1012',32,'2026-02-01','active'),
('ZC-1013',33,'2026-02-05','active'),
('ZC-1014',34,'2026-02-09','active'),
('ZC-1015',35,'2026-01-28','active'),
('ZC-1016',36,'2026-02-16','active'),
('ZC-1017',37,'2026-02-21','active'),
('ZC-1018',38,'2026-01-30','active'),
('ZC-1019',39,'2026-02-03','active'),
('ZC-1020',40,'2026-02-12','active'),
('ZC-1021',41,'2026-02-19','active'),
('ZC-1022',43,'2026-01-08','active'),
('ZC-1023',44,'2026-02-24','active'),
('ZC-1024',2,'2026-01-14','active'),
('ZC-1025',10,'2026-01-19','active'),
('ZC-1026',12,'2026-01-26','active'),
('ZC-1027',17,'2026-02-06','active'),
('ZC-1028',5,'2026-02-13','lost'),
('ZC-1029',18,'2026-02-20','active'),
('ZC-1030',9,'2026-02-27','active');

CREATE TABLE transit_taps (
  id INTEGER PRIMARY KEY, card_no TEXT, station TEXT, tapped_at TEXT
);
INSERT INTO transit_taps VALUES
(1,'ZC-1001','Harbor Line','2026-03-09 07:10'),
(2,'ZC-1001','Downtown Central','2026-03-09 08:05'),
(3,'ZC-1002','Harbor Line','2026-03-09 23:10'),
(4,'ZC-1002','Downtown Central','2026-03-09 23:13'),
(5,'ZC-1002','Harbor Line','2026-03-10 06:40'),
(6,'ZC-1003','Harbor Line','2026-03-09 18:20'),
(7,'ZC-1003','Riverside Halt','2026-03-09 19:30'),
(8,'ZC-1004','Harbor Line','2026-03-11 19:05'),
(9,'ZC-1004','Neon Station','2026-03-11 20:10'),
(10,'ZC-1004','Downtown Central','2026-03-11 21:15'),
(11,'ZC-1004','Old Town Station','2026-03-11 22:20'),
(12,'ZC-1004','Riverside Halt','2026-03-11 23:30'),
(13,'ZC-1005','Harbor Line','2026-03-10 17:50'),
(14,'ZC-1005','Neon Station','2026-03-10 18:45'),
(15,'ZC-1006','Neon Station','2026-03-07 02:40'),
(16,'ZC-1006','Old Town Station','2026-03-11 02:05'),
(17,'ZC-1006','Harbor Line','2026-03-09 03:30'),
(18,'ZC-1007','Harbor Line','2026-03-11 08:10'),
(19,'ZC-1007','Downtown Central','2026-03-11 09:05'),
(20,'ZC-1008','Harbor Line','2026-03-11 16:35'),
(21,'ZC-1008','Riverside Halt','2026-03-11 17:40'),
(22,'ZC-1009','Downtown Central','2026-03-09 10:50'),
(23,'ZC-1009','Neon Station','2026-03-09 12:00'),
(24,'ZC-1010','Downtown Central','2026-03-08 02:30'),
(25,'ZC-1010','Neon Station','2026-03-11 01:25'),
(26,'ZC-1010','Old Town Station','2026-03-12 03:15'),
(27,'ZC-1012','Neon Station','2026-03-11 18:30'),
(28,'ZC-1012','Downtown Central','2026-03-11 19:40'),
(29,'ZC-1012','Harbor Line','2026-03-11 21:00'),
(30,'ZC-1012','Old Town Station','2026-03-11 22:10'),
(31,'ZC-1013','Neon Station','2026-03-09 22:25'),
(32,'ZC-1013','Downtown Central','2026-03-12 14:05'),
(33,'ZC-1014','Neon Station','2026-03-13 18:35'),
(34,'ZC-1015','Riverside Halt','2026-03-11 21:40'),
(35,'ZC-1015','Old Town Station','2026-03-11 23:05'),
(36,'ZC-1015','Riverside Halt','2026-03-12 06:15'),
(37,'ZC-1016','Riverside Halt','2026-03-09 17:50'),
(38,'ZC-1017','Riverside Halt','2026-03-10 15:15'),
(39,'ZC-1018','Old Town Station','2026-03-11 22:45'),
(40,'ZC-1018','Downtown Central','2026-03-12 08:20'),
(41,'ZC-1019','Old Town Station','2026-03-11 23:40'),
(42,'ZC-1020','Old Town Station','2026-03-12 08:25'),
(43,'ZC-1021','Old Town Station','2026-03-13 07:05'),
(44,'ZC-1022','Downtown Central','2026-03-10 20:05'),
(45,'ZC-1022','Downtown Central','2026-03-12 09:30'),
(46,'ZC-1023','Neon Station','2026-03-14 19:20'),
(47,'ZC-1024','Neon Station','2026-03-08 13:10'),
(48,'ZC-1025','Neon Station','2026-03-09 21:00'),
(49,'ZC-1026','Downtown Central','2026-03-10 12:35'),
(50,'ZC-1027','Old Town Station','2026-03-10 09:15'),
(51,'ZC-1029','Downtown Central','2026-03-13 21:45'),
(52,'ZC-1030','Downtown Central','2026-03-09 12:20'),
(53,'ZC-1011','Neon Station','2026-03-12 11:10'),
(54,'ZC-1006','Harbor Line','2026-03-11 01:40'),
(55,'ZC-1013','Harbor Line','2026-03-12 15:00'),
(56,'ZC-1005','Harbor Line','2026-03-12 07:30'),
(57,'ZC-1016','Neon Station','2026-03-13 10:20'),
(58,'ZC-1022','Neon Station','2026-03-12 10:40'),
(59,'ZC-1009','Riverside Halt','2026-03-10 08:15'),
(60,'ZC-1017','Downtown Central','2026-03-12 16:25');

CREATE TABLE bank_transactions (
  id INTEGER PRIMARY KEY, person_id INTEGER, amount REAL, tx_at TEXT, kind TEXT, note TEXT
);
INSERT INTO bank_transactions VALUES
(1,43,30000,'2026-03-06 08:00','in','โอนจากบัญชีต่างเมือง'),
(2,29,20000,'2026-03-07 09:00','in','ค่าที่ปรึกษา'),
(3,29,15000,'2026-03-08 10:00','in','ค่าที่ปรึกษา'),
(4,32,12000,'2026-03-08 14:05','in','ค่าคอมมิชชั่น'),
(5,32,12000,'2026-03-08 14:12','in','ค่าคอมมิชชั่น'),
(6,29,20000,'2026-03-09 11:00','in','ค่าที่ปรึกษา'),
(7,30,18000,'2026-03-09 18:00','in','ค่าเดินเอกสาร'),
(8,29,-6500,'2026-03-09 13:20','out','ซื้อของ Downtown Mall'),
(9,43,25000,'2026-03-10 09:00','in','โอนจากบัญชีต่างเมือง'),
(10,32,14000,'2026-03-10 11:30','in','ค่าคอมมิชชั่น'),
(11,35,22000,'2026-03-10 19:00','in','ค่าจ้างขนของ'),
(12,30,-1450,'2026-03-09 18:25','out','ซื้อโทรศัพท์'),
(13,35,-1390,'2026-03-10 19:40','out','ซื้อโทรศัพท์'),
(14,35,21000,'2026-03-11 20:30','in','ค่าจ้างขนของ'),
(15,30,9000,'2026-03-11 10:00','in','ค่าเดินเอกสาร'),
(16,22,7500,'2026-03-11 15:40','in','ค่าแรงท่าเรือ'),
(17,32,15000,'2026-03-12 16:20','in','ค่าคอมมิชชั่น'),
(18,24,6800,'2026-03-12 12:10','in','ค่าแรงท่าเรือ'),
(19,43,-12500,'2026-03-12 15:35','out','ซื้อนาฬิกา'),
(20,35,15000,'2026-03-13 09:10','in','ค่าจ้างขนของ'),
(21,27,5200,'2026-03-13 11:25','in','ค่าแรงท่าเรือ'),
(22,41,4800,'2026-03-11 17:05','in','ค่าจ้างรายวัน'),
(23,21,3900,'2026-03-10 16:45','in','ค่าจ้างรายวัน'),
(24,31,2600,'2026-03-09 14:00','in','ค่าจ้างรายวัน'),
(25,36,3100,'2026-03-12 13:30','in','ค่าจ้างรายวัน'),
(26,38,4200,'2026-03-12 10:00','in','เงินเดือน'),
(27,39,3800,'2026-03-12 10:05','in','เงินเดือน'),
(28,40,5100,'2026-03-13 09:00','in','เงินเดือน'),
(29,42,4400,'2026-03-13 06:20','in','ค่าแรงท่าเรือ'),
(30,26,3300,'2026-03-10 07:50','in','ค่าแรงท่าเรือ'),
(31,23,2900,'2026-03-10 07:20','in','ค่าแรงท่าเรือ'),
(32,25,3600,'2026-03-14 08:30','in','ค่าแรงท่าเรือ'),
(33,44,2400,'2026-03-13 19:00','in','ค่าจ้างรายวัน'),
(34,33,2700,'2026-03-10 15:20','in','ค่าจ้างรายวัน'),
(35,34,2200,'2026-03-13 18:50','in','ค่าจ้างรายวัน'),
(36,37,3500,'2026-03-11 11:10','in','ค่าจ้างรายวัน'),
(37,28,2800,'2026-03-11 21:40','in','ค่าจ้างรายวัน'),
(38,22,6900,'2026-03-13 15:20','in','ค่าแรงท่าเรือ'),
(39,32,-24500,'2026-03-11 16:45','out','ซื้อโน้ตบุ๊ก'),
(40,24,-1750,'2026-03-10 09:30','out','ซื้อคีมตัดเหล็ก');

CREATE TABLE crew_links (
  id INTEGER PRIMARY KEY, person_id INTEGER, recruited_by INTEGER, joined_at TEXT
);
INSERT INTO crew_links VALUES
(1,43,NULL,'2025-11-02'),
(2,14,NULL,'2025-10-15'),
(3,32,43,'2025-12-05'),
(4,29,43,'2025-12-20'),
(5,33,14,'2026-01-05'),
(6,30,32,'2026-01-10'),
(7,22,32,'2026-01-18'),
(8,35,30,'2026-01-22'),
(9,41,30,'2026-02-01'),
(10,31,29,'2026-02-03'),
(11,24,22,'2026-02-09'),
(12,27,22,'2026-02-14'),
(13,23,22,'2026-02-16'),
(14,44,33,'2026-02-20'),
(15,36,35,'2026-02-25'),
(16,21,27,'2026-02-28'),
(17,37,36,'2026-03-01'),
(18,42,24,'2026-03-02'),
(19,25,21,'2026-03-05'),
(20,26,23,'2026-03-06');
`;

/**
 * ประกอบ SQL ตั้งต้นทั้งชุดจากชื่อคนและชื่อสถานที่ของรอบเล่นนี้
 *
 * แทนชื่อสถานที่ทีเดียวตอนท้ายกับ SQL ทั้งก้อน จึงครอบคลุมทุกคอลัมน์ที่เก็บชื่อสถานที่
 * (people.district, complaints.location, cctv_logs.camera_location, parking_tickets.location,
 * transit_taps.station, purchases.shop) รวมถึงที่โผล่ในข้อความบรรยายภาษาไทยด้วย
 */
export function buildSeedSql(names: string[], places: PlaceMap): string {
  return applyPlaces(`${peopleTableSql(names)}\n${OTHER_TABLES_SQL}`, places);
}

/** ชุด SQL แบบชื่อตั้งต้น ใช้ที่ที่ไม่สนใจค่าจริงของชื่อ (เช่น schemaFromSeed อ่านแค่โครงตาราง) */
export const SEED_SQL = buildSeedSql(DEFAULT_NAMES, DEFAULT_PLACES);
