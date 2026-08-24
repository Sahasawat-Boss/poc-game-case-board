/**
 * ทดสอบว่าเล่นได้จริงในเบราว์เซอร์ — ไล่ปิดคดีที่ 1 ด้วยการคลิกล้วน ๆ เหมือนผู้เล่นจริง
 *
 * เปิดแฟ้ม → เพิ่มตัวกรอง → เลือกช่อง/เงื่อนไข/ค่า → ปักหมุดขึ้นกระดาน → ชี้ตัว
 * ถ้าตราปั๊ม "ปิดคดีแล้ว" ขึ้น แปลว่าวงจรทั้งวงต่อกันติดจริง
 *
 *   node scripts/smoke.mjs            (ต้องเปิด npm run dev ไว้ก่อน)
 */
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);

const URL = process.env.URL ?? "http://localhost:3000/play";

const text = (el) => el.evaluate((n) => n.textContent?.trim() ?? "");

/** หาปุ่มจากข้อความบนปุ่ม — เทียบแบบ "มีคำนี้อยู่" เพราะปุ่มหลายอันมีตัวเลขต่อท้าย */
async function clickByText(page, selector, needle) {
  const els = await page.$$(selector);
  for (const el of els) {
    if ((await text(el)).includes(needle)) {
      await el.click();
      return true;
    }
  }
  throw new Error(`ไม่เจอ ${selector} ที่มีข้อความ "${needle}"`);
}

const main = async () => {
  if (!CHROME) throw new Error("ไม่เจอ Chrome หรือ Edge ในเครื่อง");
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });

  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push("console: " + m.text());
  });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));

  await page.goto(URL, { waitUntil: "networkidle2" });
  await page.waitForSelector(".file-chip", { timeout: 20000 });
  console.log("✅ ห้องแฟ้มโหลดขึ้นแล้ว");

  // คดีที่ 1: หาคนที่เลขประจำตัว = 9
  await clickByText(page, "button.btn", "เพิ่มตัวกรอง");
  await page.waitForSelector(".filter-row select");

  const selects = await page.$$(".filter-row select");
  await selects[0].select("people.id");
  await page.waitForFunction(() => document.querySelectorAll(".filter-row select").length >= 2);
  const after = await page.$$(".filter-row select");
  await after[1].select("eq");

  const valueInput = await page.waitForSelector('.filter-row input[type="number"]');
  await valueInput.type("9");
  console.log("✅ ใส่ตัวกรอง เลขประจำตัว = 9");

  await page.waitForFunction(
    () => document.querySelectorAll(".data-table tbody tr").length === 1,
    { timeout: 8000 },
  );
  const name = await page.$eval(".data-table tbody tr td:nth-child(3)", (n) => n.textContent);
  console.log(`✅ เหลือแถวเดียว — ชื่อ "${name?.trim()}"`);

  await page.click(".data-table tbody tr td:first-child button");
  await page.waitForFunction(() => document.body.innerText.includes("ชี้ตัวจากคนที่อยู่บนกระดาน"));
  console.log("✅ ปักหมุดขึ้นกระดานแล้ว ชื่อโผล่ในช่องสรุปสำนวน");

  await clickByText(page, ".paper button.btn", "👤");
  await page.waitForSelector(".stamp-mark", { timeout: 5000 });
  console.log("✅ ปิดคดีที่ 1 ได้จริง — ตราปั๊มขึ้นแล้ว");

  // สลับไปดูกระดานผังคดีว่าการ์ดวาดขึ้นจริง
  await clickByText(page, ".view-tab", "กระดานผังคดี");
  await page.waitForSelector(".pin-card", { timeout: 5000 });
  console.log("✅ กระดานผังคดีมีการ์ดอยู่จริง");

  // ---------- คดีที่ 13: เชื่อมแฟ้มแบบ "ต้องไม่มีข้อมูล" ----------
  // เป็นท่าที่แทน anti-join ซึ่งเป็นจุดที่คนเรียน SQL ตกกันเยอะที่สุด ต้องชัวร์ว่าคลิกแล้วได้จริง
  await clickByText(page, ".folder-tab", "13");
  await page.waitForFunction(() => document.body.innerText.includes("บัตรที่ไม่มีอยู่ในระบบ"));

  // ชื่อเขตสุ่มใหม่ทุกรอบ เลยต้องถามฐานข้อมูลเอาว่าเขตของคนที่ 25 รอบนี้ชื่ออะไร
  await clickByText(page, "button.btn", "เพิ่มตัวกรอง");
  let sel = await page.$$(".filter-row select");
  await sel[0].select("people.id");
  await (await page.waitForSelector('.filter-row input[type="number"]')).type("25");
  await page.waitForFunction(() => document.querySelectorAll(".data-table tbody tr").length === 1);
  const district = await page.evaluate(() => {
    const heads = [...document.querySelectorAll(".data-table thead th")].map(
      (th) => th.childNodes[0]?.textContent?.trim() ?? "",
    );
    const i = heads.indexOf("เขตที่อยู่");
    return document.querySelectorAll(".data-table tbody tr td")[i].textContent?.trim();
  });
  console.log(`✅ เขตท่าเรือรอบนี้ชื่อ "${district}"`);

  sel = await page.$$(".filter-row select");
  await sel[0].select("people.district");
  await page.waitForFunction(
    () => document.querySelectorAll('.filter-row select').length >= 3,
  );
  sel = await page.$$(".filter-row select");
  await sel[2].select(district);
  const harborCount = await page.$$eval(".data-table tbody tr", (r) => r.length);
  console.log(`✅ กรองเขตท่าเรือได้ ${harborCount} คน`);

  await page.select('select[aria-label="เชื่อมแฟ้ม"]', "card_owner");
  await page.waitForSelector(".join-chip[data-mode]");
  await page.click('.join-chip[data-mode="has"] button[title^="สลับเป็น"]');
  await page.waitForSelector('.join-chip[data-mode="hasNot"]');
  await page.waitForFunction(
    () => document.querySelectorAll(".data-table tbody tr").length === 1,
    { timeout: 8000 },
  );
  console.log("✅ สลับเป็น “ต้องไม่มีข้อมูล” แล้วเหลือคนเดียว");

  await page.click(".data-table tbody tr td:first-child button");
  await clickByText(page, ".paper button.btn", "👤");
  await page.waitForSelector(".stamp-mark", { timeout: 5000 });
  console.log("✅ ปิดคดีที่ 13 ได้จริง — anti-join ด้วยการคลิกสองครั้ง");

  await browser.close();

  if (problems.length) {
    console.log("\n⚠️ เจอ error ในเบราว์เซอร์:");
    for (const p of problems) console.log("   " + p);
    process.exit(1);
  }
  console.log("\nผ่านหมด ไม่มี error ในคอนโซลเบราว์เซอร์");
};

main().catch((e) => {
  console.error("❌ " + e.message);
  process.exit(1);
});
