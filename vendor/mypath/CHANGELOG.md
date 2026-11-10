# Changelog

การเปลี่ยนแปลงของ `@learn/mypath` ทั้งหมดบันทึกไว้ที่นี่ รูปแบบตาม [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) และเลขเวอร์ชันตาม [Semantic Versioning](https://semver.org/) (กติกาช่วง `0.x` ดู `docs/mypath-sdk-plan.md` หัวข้อ "เวอร์ชัน")

## [0.1.0] - ยังไม่ release

### Added

- All (desktop): ธง exam/Mock วันเดียวกัน kind เดียวกัน และสถานะซื้อเหมือนกัน รวมเป็นธงเดียว แสดง 2 label แรกคั่นด้วย comma + "+N" และเห็นครบใน tooltip (`title`)
- `<MyPath>` หน้า Month, All timeline, รายละเอียดคอร์ส, แผงปฏิทินการเรียน และความคืบหน้ารายคอร์ส ครบเท่า prototype `mockup-v1`
- สัญญาข้อมูล `MyPathData` / `StudentPlan`
- `defaultView?: 'month' | 'all'` เลือกหน้าแรกของ `<MyPath>` (ไม่ส่ง = Month)
- `onViewChange` ถูกเรียกเมื่อสลับ Month/All หรือเปลี่ยนเดือน แต่ `view` ยังมีแค่ใน type: SDK เก็บ Month/All และเดือนไว้เองเสมอ (deep link ยังใช้ไม่ได้)
- Library build: `dist/index.js` (ES module) + `.d.ts` + `dist/style.css`, `exports` เปิดแค่ `.` กับ `./style.css`
- peer `react` / `react-dom` `^19.0.0` ไม่มี dependency อื่น (ไอคอนเป็น SVG ของ SDK เอง) รูปฝังเป็น data URI
