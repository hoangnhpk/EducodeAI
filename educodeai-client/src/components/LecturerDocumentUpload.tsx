import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import JSZip from "jszip";

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "jpg", "jpeg", "png"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const MAX_CV_FILES = 2;
const MAX_CERTIFICATE_FILES = 20;
const PDF_HEADER_SCAN_SIZE = 1024;

export const LECTURER_DOCUMENT_ACCEPT = ".pdf,.docx,.jpg,.jpeg,.png";

const fileKey = (file: File) => {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
  return `${relativePath}:${file.size}:${file.lastModified}`;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const extensionOf = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

const validateFileMetadata = (files: File[]) => {
  for (const file of files) {
    const extension = extensionOf(file);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return `File ${file.name} phải là PDF, DOCX, JPG, JPEG hoặc PNG.`;
    }
    if (file.size <= 0) return `File ${file.name} đang trống.`;
    if (file.size > MAX_FILE_SIZE) return `File ${file.name} vượt quá 10MB.`;
  }
  return null;
};

const containsSequence = (source: Uint8Array, expected: number[]) => {
  if (source.length < expected.length) return false;
  for (let start = 0; start <= source.length - expected.length; start += 1) {
    if (expected.every((value, index) => source[start + index] === value)) return true;
  }
  return false;
};

const readBlob = (blob: Blob): Promise<ArrayBuffer> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as ArrayBuffer);
  reader.onerror = () => reject(reader.error ?? new Error("Không thể đọc nội dung file."));
  reader.readAsArrayBuffer(blob);
});

const hasValidContent = async (file: File) => {
  const extension = extensionOf(file);
  const header = new Uint8Array(await readBlob(file.slice(0, PDF_HEADER_SCAN_SIZE)));

  if (extension === "pdf") {
    // PDF readers permit the header within the first 1024 bytes, not necessarily at byte zero.
    return containsSequence(header, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }
  if (extension === "jpg" || extension === "jpeg") {
    return header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }
  if (extension === "png") {
    return header.length >= 8
      && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => header[index] === value);
  }
  if (extension !== "docx" || header.length < 4
    || header[0] !== 0x50 || header[1] !== 0x4b || header[2] !== 0x03 || header[3] !== 0x04) {
    return false;
  }

  try {
    const archive = await JSZip.loadAsync(file);
    return Boolean(archive.file("[Content_Types].xml") && archive.file("word/document.xml"));
  } catch {
    return false;
  }
};

const validateFileContents = async (files: File[]) => {
  for (const file of files) {
    if (!await hasValidContent(file)) {
      return `Nội dung file ${file.name} không đúng định dạng ${extensionOf(file).toUpperCase()}. Vui lòng chọn lại đúng file gốc.`;
    }
  }
  return null;
};

export const validateLecturerDocuments = async (
  cvFiles: File[],
  certificateFiles: File[],
  requireCv = true
) => {
  if (requireCv && cvFiles.length === 0) return "Vui lòng tải lên ít nhất một file CV.";
  if (cvFiles.length > MAX_CV_FILES) return `Chỉ được tải tối đa ${MAX_CV_FILES} file CV.`;
  if (certificateFiles.length > MAX_CERTIFICATE_FILES) return `Chỉ được tải tối đa ${MAX_CERTIFICATE_FILES} file chứng chỉ.`;
  const allFiles = [...cvFiles, ...certificateFiles];
  const fileError = validateFileMetadata(allFiles);
  if (fileError) return fileError;
  if (allFiles.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
    return "Tổng dung lượng CV và chứng chỉ không được vượt quá 50MB.";
  }
  return validateFileContents(allFiles);
};

export const isLecturerDocumentError = (message: string) => {
  const normalized = message.toLocaleLowerCase("vi");
  return [
    "nội dung file",
    "tài liệu tải lên",
    "file cv",
    "file chứng chỉ",
    "file ",
    "cv và chứng chỉ",
    "tải lên ít nhất một file cv",
    "định dạng"
  ].some((part) => normalized.includes(part));
};

export interface LecturerCertificateUpload {
  clientId: string;
  file: File;
  tenChungChi: string;
  donViCap: string;
  ngayCap: string;
  ngayHetHan: string;
  maChungChi: string;
  urlXacMinh: string;
  relativePath: string;
}

const newClientId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};

export const createCertificateUpload = (file: File): LecturerCertificateUpload => ({
  clientId: newClientId(),
  file,
  tenChungChi: "",
  donViCap: "",
  ngayCap: "",
  ngayHetHan: "",
  maChungChi: "",
  urlXacMinh: "",
  relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
});

export const validateCertificateMetadata = (certificates: LecturerCertificateUpload[]) => {
  for (const certificate of certificates) {
    if (!certificate.tenChungChi.trim()) return `Vui lòng nhập tên chứng chỉ cho file ${certificate.file.name}.`;
    if (certificate.ngayCap && certificate.ngayHetHan && certificate.ngayHetHan < certificate.ngayCap) {
      return `Ngày hết hạn của ${certificate.tenChungChi.trim()} không được trước ngày cấp.`;
    }
    if (certificate.urlXacMinh.trim()) {
      try {
        const url = new URL(certificate.urlXacMinh.trim());
        if (url.protocol !== "https:" || url.username || url.password) throw new Error();
      } catch {
        return `URL xác minh của ${certificate.tenChungChi.trim()} phải là địa chỉ HTTPS hợp lệ.`;
      }
    }
  }
  return null;
};

interface CertificateFieldErrors {
  tenChungChi?: string;
  ngayHetHan?: string;
  urlXacMinh?: string;
}

const validateCertificateFields = (certificate: LecturerCertificateUpload): CertificateFieldErrors => {
  const errors: CertificateFieldErrors = {};
  if (!certificate.tenChungChi.trim()) errors.tenChungChi = "Vui lòng nhập tên chứng chỉ.";
  if (certificate.ngayCap && certificate.ngayHetHan && certificate.ngayHetHan < certificate.ngayCap) {
    errors.ngayHetHan = "Ngày hết hạn không được trước ngày cấp.";
  }
  if (certificate.urlXacMinh.trim()) {
    try {
      const url = new URL(certificate.urlXacMinh.trim());
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    } catch {
      errors.urlXacMinh = "URL xác minh phải là địa chỉ HTTPS hợp lệ.";
    }
  }
  return errors;
};

interface LecturerDocumentUploadProps {
  cvFiles: File[];
  certificates: LecturerCertificateUpload[];
  onCvFilesChange: (files: File[]) => void;
  onCertificatesChange: (certificates: LecturerCertificateUpload[]) => void;
  onError: (message: string) => void;
  requireCv?: boolean;
  showCv?: boolean;
}

export default function LecturerDocumentUpload({
  cvFiles,
  certificates,
  onCvFilesChange,
  onCertificatesChange,
  onError,
  requireCv = true,
  showCv = true
}: LecturerDocumentUploadProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [certificateErrors, setCertificateErrors] = useState<Record<string, CertificateFieldErrors>>({});
  const validationGeneration = useRef(0);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const certificateFolderInputRef = useRef<HTMLInputElement>(null);
  const certificateFiles = certificates.map((item) => item.file);

  const addCvFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;
    const generation = ++validationGeneration.current;
    const existing = new Set(cvFiles.map(fileKey));
    const combined = [...cvFiles, ...selected.filter((file) => !existing.has(fileKey(file)))];
    if (combined.length > MAX_CV_FILES) {
      onError(`Chỉ được chọn tối đa ${MAX_CV_FILES} file CV.`);
      return;
    }
    setIsChecking(true);
    try {
      const error = await validateLecturerDocuments(combined, certificateFiles, requireCv);
      if (generation !== validationGeneration.current) return;
      if (error) return onError(error);
      onCvFilesChange(combined);
    } finally {
      if (generation === validationGeneration.current) setIsChecking(false);
    }
  };

  const addCertificateFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;
    const generation = ++validationGeneration.current;
    const existing = new Set(certificateFiles.map(fileKey));
    const fresh = selected.filter((file) => !existing.has(fileKey(file)));
    const combinedFiles = [...certificateFiles, ...fresh];
    if (combinedFiles.length > MAX_CERTIFICATE_FILES) {
      onError(`Chỉ được chọn tối đa ${MAX_CERTIFICATE_FILES} file chứng chỉ.`);
      return;
    }
    setIsChecking(true);
    try {
      const error = await validateLecturerDocuments(cvFiles, combinedFiles, false);
      if (generation !== validationGeneration.current) return;
      if (error) return onError(error);
      onCertificatesChange([...certificates, ...fresh.map(createCertificateUpload)]);
    } finally {
      if (generation === validationGeneration.current) setIsChecking(false);
    }
  };

  const updateCertificate = (clientId: string, patch: Partial<LecturerCertificateUpload>) => {
    const updated = certificates.map((item) => item.clientId === clientId ? { ...item, ...patch } : item);
    const certificate = updated.find((item) => item.clientId === clientId);
    if (certificate) {
      setCertificateErrors((current) => ({
        ...current,
        [clientId]: validateCertificateFields(certificate)
      }));
    }
    onCertificatesChange(updated);
  };

  const removeCertificate = (clientId: string) => {
    setCertificateErrors((current) => {
      const next = { ...current };
      delete next[clientId];
      return next;
    });
    onCertificatesChange(certificates.filter((item) => item.clientId !== clientId));
  };

  const cvFileList = cvFiles.length > 0 && (
    <div className="dkgv-document-list">
      {cvFiles.map((file, index) => (
        <div className="dkgv-document-item" key={fileKey(file)}>
          <div><strong>{file.name}</strong><span>{formatBytes(file.size)}</span></div>
          <button type="button" disabled={isChecking} onClick={() => onCvFilesChange(cvFiles.filter((_, i) => i !== index))} aria-label={`Xóa ${file.name}`}>
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );

  const totalFiles = cvFiles.length + certificates.length;
  const totalSize = [...cvFiles, ...certificateFiles].reduce((total, file) => total + file.size, 0);

  return (
    <div className="dkgv-document-section" aria-busy={isChecking}>
      <div className="dkgv-document-help">
        Tài liệu được kiểm tra ngay khi chọn và lưu riêng tư trong khi chờ duyệt. Hỗ trợ PDF, DOCX, JPG, JPEG, PNG; tối đa 10MB/file và 50MB tổng cộng.
      </div>
      <div className={`dkgv-document-grid ${showCv ? "" : "dkgv-document-grid--certificate-only"}`}>
        {showCv && (
          <div className="dkgv-document-picker">
            <div className="dkgv-upload-box-label">CV {requireCv && <span className="text-danger">*</span>}</div>
            <button type="button" className="dkgv-document-button" disabled={isChecking} onClick={() => cvInputRef.current?.click()}>
              <i className="bi bi-file-earmark-person" aria-hidden="true" />
              {isChecking ? "Đang kiểm tra file..." : "Chọn CV (tối đa 2 file)"}
            </button>
            <input ref={cvInputRef} className="dkgv-visually-hidden-file-input" type="file" multiple disabled={isChecking} accept={LECTURER_DOCUMENT_ACCEPT} onChange={(event) => void addCvFiles(event)} />
            {cvFileList}
          </div>
        )}
        <div className="dkgv-document-picker">
          <div className="dkgv-upload-box-label">Chứng chỉ liên quan</div>
          <div className="dkgv-document-actions">
            <button type="button" className="dkgv-document-button" disabled={isChecking} onClick={() => certificateInputRef.current?.click()}>
              <i className="bi bi-files" aria-hidden="true" />Chọn nhiều file
            </button>
            <input ref={certificateInputRef} className="dkgv-visually-hidden-file-input" type="file" multiple disabled={isChecking} accept={LECTURER_DOCUMENT_ACCEPT} onChange={(event) => void addCertificateFiles(event)} />
            <button type="button" className="dkgv-document-button dkgv-document-button--secondary" disabled={isChecking} onClick={() => certificateFolderInputRef.current?.click()}>
              <i className="bi bi-folder2-open" aria-hidden="true" />Chọn thư mục
            </button>
            <input ref={certificateFolderInputRef} className="dkgv-visually-hidden-file-input" type="file" multiple disabled={isChecking} accept={LECTURER_DOCUMENT_ACCEPT} {...({ webkitdirectory: "", directory: "" } as InputHTMLAttributes<HTMLInputElement>)} onChange={(event) => void addCertificateFiles(event)} />
          </div>
          {certificates.length > 0 && (
            <div className="dkgv-certificate-list">
              {certificates.map((certificate) => (
                <div className="dkgv-certificate-editor" key={certificate.clientId}>
                  <div className="dkgv-document-item">
                    <div><strong>{certificate.relativePath}</strong><span>{formatBytes(certificate.file.size)}</span></div>
                    <button type="button" disabled={isChecking} onClick={() => removeCertificate(certificate.clientId)} aria-label={`Xóa ${certificate.file.name}`}>
                      <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="dkgv-certificate-fields">
                    <label>
                      Tên chứng chỉ <span className="text-danger">*</span>
                      <input
                        maxLength={200}
                        value={certificate.tenChungChi}
                        onChange={(event) => updateCertificate(certificate.clientId, { tenChungChi: event.target.value })}
                        placeholder="Ví dụ: AWS Certified Cloud Practitioner"
                        aria-invalid={Boolean(certificateErrors[certificate.clientId]?.tenChungChi)}
                        aria-describedby={certificateErrors[certificate.clientId]?.tenChungChi ? `${certificate.clientId}-title-error` : undefined}
                      />
                      {certificateErrors[certificate.clientId]?.tenChungChi && <span id={`${certificate.clientId}-title-error`} className="dkgv-field-error">{certificateErrors[certificate.clientId].tenChungChi}</span>}
                    </label>
                    <label>Đơn vị cấp<input maxLength={200} value={certificate.donViCap} onChange={(event) => updateCertificate(certificate.clientId, { donViCap: event.target.value })} placeholder="Ví dụ: Amazon Web Services" /></label>
                    <label>Ngày cấp<input type="date" value={certificate.ngayCap} onChange={(event) => updateCertificate(certificate.clientId, { ngayCap: event.target.value })} /></label>
                    <label>
                      Ngày hết hạn
                      <input
                        type="date"
                        min={certificate.ngayCap || undefined}
                        value={certificate.ngayHetHan}
                        onChange={(event) => updateCertificate(certificate.clientId, { ngayHetHan: event.target.value })}
                        aria-invalid={Boolean(certificateErrors[certificate.clientId]?.ngayHetHan)}
                        aria-describedby={certificateErrors[certificate.clientId]?.ngayHetHan ? `${certificate.clientId}-expiration-error` : undefined}
                      />
                      {certificateErrors[certificate.clientId]?.ngayHetHan && <span id={`${certificate.clientId}-expiration-error`} className="dkgv-field-error">{certificateErrors[certificate.clientId].ngayHetHan}</span>}
                    </label>
                    <label>Mã chứng chỉ<input maxLength={100} value={certificate.maChungChi} onChange={(event) => updateCertificate(certificate.clientId, { maChungChi: event.target.value })} /></label>
                    <label>
                      URL xác minh
                      <input
                        type="url"
                        maxLength={500}
                        value={certificate.urlXacMinh}
                        onChange={(event) => updateCertificate(certificate.clientId, { urlXacMinh: event.target.value })}
                        placeholder="https://..."
                        aria-invalid={Boolean(certificateErrors[certificate.clientId]?.urlXacMinh)}
                        aria-describedby={certificateErrors[certificate.clientId]?.urlXacMinh ? `${certificate.clientId}-url-error` : undefined}
                      />
                      {certificateErrors[certificate.clientId]?.urlXacMinh && <span id={`${certificate.clientId}-url-error`} className="dkgv-field-error">{certificateErrors[certificate.clientId].urlXacMinh}</span>}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="dkgv-document-summary" role="status">
        {isChecking ? "Đang kiểm tra nội dung file..." : `Đã chọn ${totalFiles} file · ${formatBytes(totalSize)}`}
      </div>
    </div>
  );
}
