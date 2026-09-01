import JSZip from 'jszip'
import {
  createCertificateUpload,
  validateCertificateMetadata,
  validateLecturerDocuments
} from './LecturerDocumentUpload'

const file = (name: string, bytes: number[] | Uint8Array) =>
  new File([Uint8Array.from(bytes)], name)

describe('lecturer document validation', () => {
  it('accepts a valid PDF header at the start of the file', async () => {
    const pdf = file('cv.pdf', [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])

    await expect(validateLecturerDocuments([pdf], [])).resolves.toBeNull()
  })

  it('accepts a valid PDF header within the first 1024 bytes', async () => {
    const pdf = file('cv.pdf', [0xef, 0xbb, 0xbf, 0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])

    await expect(validateLecturerDocuments([pdf], [])).resolves.toBeNull()
  })

  it('rejects a renamed non-PDF before submission', async () => {
    const fakePdf = file('cv.pdf', Array.from(new TextEncoder().encode('not a pdf document')))

    await expect(validateLecturerDocuments([fakePdf], []))
      .resolves.toContain('không đúng định dạng PDF')
  })

  it('checks the required DOCX entries instead of trusting the ZIP signature', async () => {
    const invalidArchive = new JSZip()
    invalidArchive.file('readme.txt', 'not a Word document')
    const invalidDocx = new File([await invalidArchive.generateAsync({ type: 'uint8array' })], 'cv.docx')

    const validArchive = new JSZip()
    validArchive.file('[Content_Types].xml', '<Types />')
    validArchive.folder('word')?.file('document.xml', '<document />')
    const validDocx = new File([await validArchive.generateAsync({ type: 'uint8array' })], 'cv.docx')

    await expect(validateLecturerDocuments([invalidDocx], []))
      .resolves.toContain('không đúng định dạng DOCX')
    await expect(validateLecturerDocuments([validDocx], [])).resolves.toBeNull()
  })

  it('requires a title for every selected certificate', () => {
    const certificate = createCertificateUpload(file('certificate.jpg', [0xff, 0xd8, 0xff]))

    expect(validateCertificateMetadata([certificate]))
      .toContain('Vui lòng nhập tên chứng chỉ')
  })

  it('rejects an expiration date before the issue date', () => {
    const certificate = {
      ...createCertificateUpload(file('certificate.jpg', [0xff, 0xd8, 0xff])),
      tenChungChi: 'Cloud Practitioner',
      ngayCap: '2026-08-31',
      ngayHetHan: '2026-08-30'
    }

    expect(validateCertificateMetadata([certificate]))
      .toContain('không được trước ngày cấp')
  })

  it('only accepts HTTPS verification URLs without credentials', () => {
    const certificate = {
      ...createCertificateUpload(file('certificate.jpg', [0xff, 0xd8, 0xff])),
      tenChungChi: 'Cloud Practitioner',
      urlXacMinh: 'https://user:secret@example.com/verify'
    }

    expect(validateCertificateMetadata([certificate]))
      .toContain('phải là địa chỉ HTTPS hợp lệ')
    expect(validateCertificateMetadata([{ ...certificate, urlXacMinh: 'https://example.com/verify' }]))
      .toBeNull()
  })
})
