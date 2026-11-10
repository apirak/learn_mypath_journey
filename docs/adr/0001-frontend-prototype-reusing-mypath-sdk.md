---
status: accepted
---

# Prototype frontend อย่างเดียว ใช้ MyPath SDK จริง

Prototype นี้เป็นแอป Vite + React + TS + Tailwind แยกต่างหาก ไม่มี backend เก็บ state ใน localStorage และเรียก `<MyPath>` จาก `../learn_mypath/packages/mypath` ผ่าน alias ไปที่ source แทนการทำหน้าตารางเรียนใหม่ ข้อมูลหลักสูตรใช้สำเนาของ `learn_tcas/data/browse.json` ข้อมูลคอร์ส วันสอบ และการซื้อใช้ fixtures ของ learn_mypath โดยใช้ desktop เป็นหลักทั้งฝั่งน้องและพี่ (สำหรับ demo)

## Considered Options

- **HTML ไฟล์เดียวแบบ learn_tcas ui:** เปิดง่ายกว่า แต่ต้องวาดหน้า MyPath ใหม่ และจะไม่ตรงกับของจริง
- **ใส่ journey เข้าไปใน host ของ learn_mypath:** host นั้นเป็น mockup as-is ของ Learn Anywhere ตามแผน Phase 1 ไม่ควรมี flow ใหม่ปน

## Consequences

- source ของ SDK คัดลอกไว้ที่ `vendor/mypath/src` (เดิม alias ไป `../learn_mypath` ตรงๆ เปลี่ยนเพื่อให้ build บน GitHub Pages ได้โดยไม่ต้อง checkout repo private) อัปเดตด้วย `pnpm sync` ซึ่งยังต้องมี `../learn_mypath` อยู่ข้างกัน
- ไม่มี algorithm จัดตารางจริง: การวิเคราะห์ = รวมวิชาสอบจาก browse.json + กรองคอร์สตัวอย่าง + การแบ่งเวลาเรียน (ดู GLOSSARY)
- วันนี้ของ demo ตรึงไว้ที่ 2026-11-10 วันสอบและ Mock เป็นวันที่เดาจาก learn_mypath SAMPLE_DATA
