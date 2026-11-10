# MyPath Journey — Prototype

Prototype ของ journey น้องและพี่ ก่อนทำหลังบ้าน (ไม่มี backend · ข้อมูลสมมติทั้งหมด)

- Journey: [docs/journey.md](docs/journey.md)
- ศัพท์: [GLOSSARY.md](GLOSSARY.md)
- การตัดสินใจ: [docs/adr/](docs/adr/)

## รัน

รันได้เลยหลัง `pnpm install` — source ของ `<MyPath>` คัดลอกไว้ใน `vendor/mypath/` แล้ว

`pnpm sync` ต้องมี `../learn_tcas` และ `../learn_mypath` อยู่ข้างกัน

```bash
pnpm install
pnpm sync   # (ไม่บังคับ) คัดลอก browse.json, fixtures, รูปปกคอร์ส และ source MyPath SDK จาก repo ข้างๆ
pnpm dev    # http://localhost:5180
```

## Deploy

GitHub Pages: https://apirak.com/learn_mypath_journey/ — push `main` แล้ว workflow `.github/workflows/pages.yml` build และ deploy ให้

## Demo

เลือกบัญชีตัวอย่างหลังกดปุ่ม login · ปุ่ม "รีเซ็ตเดโม" มุมซ้ายล่างล้างข้อมูลทุกบัญชี · โค้ด MyPath: `ENG70` `SCI70` `TGAT70`

```
src/data/       programs (browse.json), analysis (วิชาที่ต้องสอบ + การแบ่งเวลาเรียน), mypath (fixtures + สรุปแผน), demo (บัญชี น้อง โค้ด)
src/create/     flow สร้าง 4 ขั้น ใช้ทั้งน้องและพี่
src/pages/      login, welcome, mypath, tutor
src/store.tsx   state ทั้งเดโมใน localStorage
```
