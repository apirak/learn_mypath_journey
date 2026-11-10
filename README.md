# MyPath Journey — Prototype

Prototype ของ journey น้องและพี่ ก่อนทำหลังบ้าน (ไม่มี backend · ข้อมูลสมมติทั้งหมด)

- Journey: [docs/journey.md](docs/journey.md)
- ศัพท์: [GLOSSARY.md](GLOSSARY.md)
- การตัดสินใจ: [docs/adr/](docs/adr/)

## รัน

ต้องมี `../learn_tcas` และ `../learn_mypath` (ติดตั้ง dependency แล้ว) อยู่ข้างกัน

```bash
pnpm install
pnpm sync   # คัดลอก browse.json, fixtures และรูปปกคอร์สจาก repo ข้างๆ
pnpm dev    # http://localhost:5180
```

## Demo

เลือกบัญชีตัวอย่างหลังกดปุ่ม login · ปุ่ม "รีเซ็ตเดโม" มุมซ้ายล่างล้างข้อมูลทุกบัญชี · โค้ด MyPath: `ENG70` `SCI70` `TGAT70`

```
src/data/       programs (browse.json), analysis (วิชาที่ต้องสอบ + การแบ่งเวลาเรียน), mypath (fixtures + สรุปแผน), demo (บัญชี น้อง โค้ด)
src/create/     flow สร้าง 4 ขั้น ใช้ทั้งน้องและพี่
src/pages/      login, welcome, mypath, tutor
src/store.tsx   state ทั้งเดโมใน localStorage
```
