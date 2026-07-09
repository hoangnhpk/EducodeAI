import re

with open('DangKyGiangVien.tsx.bak', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern cho mặt trước - thay thế className và inline style
content = content.replace(
    'className="dkgv-upload-box" onClick={() => frontInputRef.current?.click()} role="button" tabIndex={0} style={{ position: \'relative\', overflow: \'hidden\', minHeight: \'240px\' }}',
    'className={previewFront ? "dkgv-upload-box dkgv-upload-has-preview" : "dkgv-upload-box"} onClick={() => frontInputRef.current?.click()} role="button" tabIndex={0}'
)

content = content.replace(
    '{previewFront ? <img src={previewFront} alt="Mặt trước giấy tờ" style={{ position: \'absolute\', inset: 0, width: \'100%\', height: \'100%\', objectFit: \'cover\' }} /> : <div className="dkgv-upload-box-icon"><i className="bi bi-image" /></div>}',
    '{previewFront ? <div className="dkgv-preview-container"><img src={previewFront} alt="Mặt trước giấy tờ" className="dkgv-preview-img" /></div> : <><div className="dkgv-upload-box-icon"><i className="bi bi-image" /></div><div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div><div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div></>}'
)

# Xóa các dòng title và desc thừa cho mặt trước
content = content.replace(
    '<div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div>\n                    <div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div>\n                  </div>\n                  {files.anhGiayToMatTruoc',
    '</div>\n                  {files.anhGiayToMatTruoc'
)

# Pattern cho mặt sau
content = content.replace(
    'className="dkgv-upload-box" onClick={() => backInputRef.current?.click()} role="button" tabIndex={0} style={{ position: \'relative\', overflow: \'hidden\', minHeight: \'240px\' }}',
    'className={previewBack ? "dkgv-upload-box dkgv-upload-has-preview" : "dkgv-upload-box"} onClick={() => backInputRef.current?.click()} role="button" tabIndex={0}'
)

content = content.replace(
    '{previewBack ? <img src={previewBack} alt="Mặt sau giấy tờ" style={{ position: \'absolute\', inset: 0, width: \'100%\', height: \'100%\', objectFit: \'cover\' }} /> : <div className="dkgv-upload-box-icon"><i className="bi bi-image" /></div>}',
    '{previewBack ? <div className="dkgv-preview-container"><img src={previewBack} alt="Mặt sau giấy tờ" className="dkgv-preview-img" /></div> : <><div className="dkgv-upload-box-icon"><i className="bi bi-image" /></div><div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div><div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div></>}'
)

# Xóa các dòng title và desc thừa cho mặt sau  
content = content.replace(
    '</>}\n                    <div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div>\n                    <div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div>\n                  </div>\n                  {files.anhGiayToMatSau',
    '</>}\n                  </div>\n                  {files.anhGiayToMatSau'
)

with open('DangKyGiangVien.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
