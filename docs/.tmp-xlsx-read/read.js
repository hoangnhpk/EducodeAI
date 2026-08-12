const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const files = [
  path.resolve(__dirname, '..', 'test-cases-4-module.xlsx'),
  path.resolve(__dirname, '..', 'test-cases-core.xlsx'),
];

let out = '';
for (const f of files) {
  out += '='.repeat(80) + '\n';
  out += 'FILE: ' + path.basename(f) + '\n';
  out += 'exists: ' + fs.existsSync(f) + ' size: ' + (fs.existsSync(f) ? fs.statSync(f).size : 0) + '\n';
  const wb = XLSX.readFile(f);
  out += 'Sheets: ' + wb.SheetNames.join(' | ') + '\n';
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    out += '-'.repeat(60) + '\n';
    out += 'Sheet: ' + name + ' | rows: ' + rows.length + '\n';
    rows.forEach((r, i) => {
      const vals = r.map((v) => String(v).replace(/\r?\n/g, ' / ').trim());
      while (vals.length && vals[vals.length - 1] === '') vals.pop();
      if (!vals.length) return;
      out += String(i + 1).padStart(3, '0') + '| ' + vals.join(' || ') + '\n';
    });
  }
  out += '\n';
}
fs.writeFileSync(path.join(__dirname, 'out.txt'), out, 'utf8');
console.log('Wrote out.txt, chars:', out.length);
