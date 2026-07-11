const fs = require('fs');
const path = require('path');

// Fix ket-qua-do-an.tsx
const ketQuaFile = path.join(__dirname, 'Mobile', 'src', 'app', 'ket-qua-do-an.tsx');
let ketQuaContent = fs.readFileSync(ketQuaFile, 'utf8');
ketQuaContent = ketQuaContent.replace(
  `router.push({ pathname: '/phong-van-do-an', params: { sessionId } })`,
  `router.push({ pathname: '/phong-van-do-an' as any, params: { sessionId } })`
);
fs.writeFileSync(ketQuaFile, ketQuaContent);

// Fix lo-trinh.tsx
const loTrinhFile = path.join(__dirname, 'Mobile', 'src', 'app', 'lo-trinh.tsx');
let loTrinhContent = fs.readFileSync(loTrinhFile, 'utf8');
loTrinhContent = loTrinhContent.replace(
  `lightGray: '#e2e8f0'`,
  `lightGray: '#e2e8f0', primaryLight: '#fff3ed'`
);
fs.writeFileSync(loTrinhFile, loTrinhContent);

// Fix thu-thach.tsx
const thuThachFile = path.join(__dirname, 'Mobile', 'src', 'app', 'thu-thach.tsx');
let thuThachContent = fs.readFileSync(thuThachFile, 'utf8');
thuThachContent = thuThachContent.replace(
  `import { thuThachService, NhiemVuDTO } from '../services/thu-thach.service';`,
  `import { ThuThachService, NhiemVuThuThach } from '../services/thu-thach.service';`
);
thuThachContent = thuThachContent.replace(
  `lightGray: '#e2e8f0'`,
  `lightGray: '#e2e8f0', primaryLight: '#fff3ed'`
);
thuThachContent = thuThachContent.replace(/NhiemVuDTO/g, 'NhiemVuThuThach');
thuThachContent = thuThachContent.replace(/nhiemVus/g, 'nhiemVus'); // it's already there
thuThachContent = thuThachContent.replace(
  `const res = await thuThachService.getNhiemVuHangNgay();`,
  `const res = await ThuThachService.getThuThachTuan();`
);
thuThachContent = thuThachContent.replace(
  `setNhiemVus(res.data);`,
  `setNhiemVus(res.data.danhSachNhiemVu);`
);
thuThachContent = thuThachContent.replace(/nv.loaiNhiemVu/g, 'nv.tieuDe');
thuThachContent = thuThachContent.replace(/nv.soLuongYeuCau/g, 'nv.chiTieu');
thuThachContent = thuThachContent.replace(/nv.tienDo/g, 'nv.giaTriHienTai');
thuThachContent = thuThachContent.replace(/nv.thuongEXP/g, 'nv.expThuong');
thuThachContent = thuThachContent.replace(/nv.thuongThe/g, '(nv.expThuong / 10)');
thuThachContent = thuThachContent.replace(/nv.maNhiemVu/g, 'nv.maMau');
thuThachContent = thuThachContent.replace(
  `await thuThachService.nhanThuongNhiemVu(id);`,
  `await ThuThachService.nhanThuong(id);`
);
// replace !nv.daNhanThuong with nv.trangThai === 'completed'
thuThachContent = thuThachContent.replace(
  `!nv.daNhanThuong ?`,
  `nv.trangThai === 'completed' ?`
);
// replace isDone with nv.trangThai !== 'in_progress'
thuThachContent = thuThachContent.replace(
  `const isDone = nv.giaTriHienTai >= nv.chiTieu;`,
  `const isDone = nv.trangThai !== 'in_progress';`
);

fs.writeFileSync(thuThachFile, thuThachContent);
console.log('Fixed TS errors in newly written V2 files.');
