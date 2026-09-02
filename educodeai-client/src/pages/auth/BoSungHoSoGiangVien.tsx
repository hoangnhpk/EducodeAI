import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaCheckCircle, FaEnvelope, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import { hoSoGiangVienService } from "@/services/ho-so-giang-vien.service";
import LecturerDocumentUpload, {
  isLecturerDocumentError,
  validateCertificateMetadata,
  validateLecturerDocuments,
  type LecturerCertificateUpload
} from "@/components/LecturerDocumentUpload";
import "./DangKyGiangVien.css";

export default function BoSungHoSoGiangVien() {
  const { maHoSo } = useParams<{ maHoSo: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get("token") ?? "";

  const [daXacThuc, setDaXacThuc] = useState(false);
  const [dangXacThuc, setDangXacThuc] = useState(true);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [daNopRoi, setDaNopRoi] = useState(false);

  const [form, setForm] = useState({
    hoTen: "",
    soDienThoai: "",
    linhVucGiangDay: "",
    soGiayTo: "",
    tenNganHang: "",
    soTaiKhoanNhanTien: "",
    tenChuTaiKhoan: "",
    maSoThue: "",
  });

  const [files, setFiles] = useState({
    anhDaiDien: null as File | null,
    anhGiayToMatTruoc: null as File | null,
    anhGiayToMatSau: null as File | null,
  });

  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<LecturerCertificateUpload[]>([]);
  const [documentError, setDocumentError] = useState("");

  const [dangTai, setDangTai] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  // Xác thực token khi mount
  useEffect(() => {
    if (!maHoSo || !tokenFromUrl) {
      setDangXacThuc(false);
      setThongBao("Vui lòng kiểm tra hộp thư email của bạn và nhấn vào liên kết bổ sung hồ sơ để cập nhật.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setDangXacThuc(true);
        await hoSoGiangVienService.kiemTraQuyenBoSung(Number(maHoSo), tokenFromUrl);
        if (!cancelled) {
          setDaXacThuc(true);
          setDangXacThuc(false);
        }
      } catch (error: any) {
        if (cancelled) return;
        setDangXacThuc(false);
        const msg = error?.response?.data?.message ?? "";
        if (msg.includes("đã được gửi bổ sung") || msg.includes("đợi kết quả")) {
          setDaNopRoi(true);
          setThongBao("Hồ sơ của bạn đã được cập nhật, vui lòng đợi kết quả.");
        } else {
          setThongBao(msg || "Liên kết bổ sung không hợp lệ hoặc đã hết hạn.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [maHoSo, tokenFromUrl]);

  const setField = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const pickFile = (key: keyof typeof files, f: File | null) =>
    setFiles((p) => ({ ...p, [key]: f }));

  const handleSubmit = async () => {
    if (!maHoSo || !tokenFromUrl) {
      Swal.fire("Lỗi", "Thiếu mã xác thực bổ sung.", "error");
      return;
    }

    const documentValidationError = await validateLecturerDocuments(cvFiles, certificates.map((item) => item.file), false)
      || validateCertificateMetadata(certificates);
    if (documentValidationError) {
      setDocumentError(documentValidationError);
      Swal.fire("Tài liệu không hợp lệ", documentValidationError, "warning");
      return;
    }

    const fd = new FormData();
    fd.append("Token", tokenFromUrl);
    if (form.hoTen.trim()) fd.append("HoTen", form.hoTen.trim());
    if (form.soDienThoai.trim()) fd.append("SoDienThoai", form.soDienThoai.trim());
    if (form.linhVucGiangDay.trim()) fd.append("LinhVucGiangDay", form.linhVucGiangDay.trim());
    if (form.soGiayTo.trim()) fd.append("SoGiayTo", form.soGiayTo.trim());
    if (form.tenNganHang.trim()) fd.append("TenNganHang", form.tenNganHang.trim());
    if (form.soTaiKhoanNhanTien.trim()) fd.append("SoTaiKhoanNhanTien", form.soTaiKhoanNhanTien.trim());
    if (form.tenChuTaiKhoan.trim()) fd.append("TenChuTaiKhoan", form.tenChuTaiKhoan.trim());
    if (form.maSoThue.trim()) fd.append("MaSoThue", form.maSoThue.trim());
    if (files.anhDaiDien) fd.append("AnhDaiDien", files.anhDaiDien);
    if (files.anhGiayToMatTruoc) fd.append("AnhGiayToMatTruoc", files.anhGiayToMatTruoc);
    if (files.anhGiayToMatSau) fd.append("AnhGiayToMatSau", files.anhGiayToMatSau);
    cvFiles.forEach((file) => fd.append("CvFiles", file));
    certificates.forEach((certificate, index) => {
      const prefix = `Certificates[${index}]`;
      fd.append(`${prefix}.ClientId`, certificate.clientId);
      fd.append(`${prefix}.File`, certificate.file);
      fd.append(`${prefix}.TenChungChi`, certificate.tenChungChi.trim());
      if (certificate.donViCap.trim()) fd.append(`${prefix}.DonViCap`, certificate.donViCap.trim());
      if (certificate.ngayCap) fd.append(`${prefix}.NgayCap`, certificate.ngayCap);
      if (certificate.ngayHetHan) fd.append(`${prefix}.NgayHetHan`, certificate.ngayHetHan);
      if (certificate.maChungChi.trim()) fd.append(`${prefix}.MaChungChi`, certificate.maChungChi.trim());
      if (certificate.urlXacMinh.trim()) fd.append(`${prefix}.UrlXacMinh`, certificate.urlXacMinh.trim());
      fd.append(`${prefix}.RelativePath`, certificate.relativePath);
    });

    try {
      setDangTai(true);
      const res: any = await hoSoGiangVienService.boSungHoSo(Number(maHoSo), fd);
      Swal.fire("Thành công", res?.message ?? "Đã cập nhật hồ sơ và gửi lại để duyệt.", "success").then(() => {
        setDaNopRoi(true);
        setDaXacThuc(false);
        setThongBao("Hồ sơ của bạn đã được cập nhật, vui lòng đợi kết quả.");
      });
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Không thể cập nhật hồ sơ.";
      if (isLecturerDocumentError(message)) setDocumentError(message);
      await Swal.fire(isLecturerDocumentError(message) ? "Tài liệu không hợp lệ" : "Lỗi", message, "error");
    } finally {
      setDangTai(false);
    }
  };

  const uploadBox = (label: string, file: File | null, ref: React.RefObject<HTMLInputElement | null>, key: keyof typeof files) => (
    <div className="dkgv-upload-box-wrap">
      <div className="dkgv-upload-box-label">{label}</div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pickFile(key, e.target.files?.[0] ?? null)} />
      <div className="dkgv-upload-box" onClick={() => ref.current?.click()} role="button" tabIndex={0}>
        {file ? (
          <div className="dkgv-preview-container">
            <img src={URL.createObjectURL(file)} alt={label} className="dkgv-preview-img" />
          </div>
        ) : (
          <>
            <div className="dkgv-upload-box-icon"><FaUpload /></div>
            <div className="dkgv-upload-box-title">Nhấp để tải lên (tùy chọn)</div>
            <div className="dkgv-upload-box-desc">Chỉ tải lên nếu cần thay thế</div>
          </>
        )}
      </div>
      {file && <div className="small text-success mt-2">Đã chọn: {file.name}</div>}
    </div>
  );

  // --- Trạng thái: đang xác thực token ---
  if (dangXacThuc) {
    return (
      <div className="dkgv-container mx-auto" style={{ maxWidth: "640px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link to="/trang-thai-ho-so-giang-vien" className="text-decoration-none" style={{ color: "#65676b", fontSize: "14px" }}>
            <FaArrowLeft className="me-2" /> Quay lại tra cứu hồ sơ
          </Link>
          <h1 className="fw-bold mt-3" style={{ color: "#1c1e21", fontSize: "28px" }}>
            Bổ sung hồ sơ đăng ký
          </h1>
        </div>
        <div className="dkgv-main-card">
          <div className="dkgv-body" style={{ textAlign: "center", padding: "40px" }}>
            <FaClock style={{ fontSize: "2.5rem", color: "#fb873f" }} />
            <p className="mt-3" style={{ color: "#65676b" }}>Đang xác thực liên kết bổ sung...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Trạng thái: không hợp lệ / đã nộp / thiếu token ---
  if (!daXacThuc) {
    const isDaNop = daNopRoi;
    return (
      <div className="dkgv-container mx-auto" style={{ maxWidth: "640px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link to="/trang-thai-ho-so-giang-vien" className="text-decoration-none" style={{ color: "#65676b", fontSize: "14px" }}>
            <FaArrowLeft className="me-2" /> Quay lại tra cứu hồ sơ
          </Link>
          <h1 className="fw-bold mt-3" style={{ color: "#1c1e21", fontSize: "28px" }}>
            Bổ sung hồ sơ đăng ký
          </h1>
        </div>
        <div className="dkgv-main-card">
          <div className="dkgv-body" style={{ textAlign: "center", padding: "40px" }}>
            {isDaNop ? (
              <FaCheckCircle style={{ fontSize: "2.5rem", color: "#16a34a" }} />
            ) : (
              <FaEnvelope style={{ fontSize: "2.5rem", color: "#fb873f" }} />
            )}
            <p className="mt-3" style={{ color: "#1c1e21", fontSize: "16px", fontWeight: 600 }}>
              {thongBao ?? "Liên kết bổ sung không hợp lệ."}
            </p>
            <p className="mt-2" style={{ color: "#65676b", fontSize: "14px" }}>
              {isDaNop
                ? "Bạn không cần thao tác thêm. Chúng tôi sẽ thông báo kết quả qua email khi hồ sơ được xử lý."
                : "Vui lòng kiểm tra email của bạn và nhấn vào liên kết bổ sung để cập nhật hồ sơ."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Trạng thái: hợp lệ, hiện form ---
  return (
    <div className="dkgv-container mx-auto" style={{ maxWidth: "760px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/trang-thai-ho-so-giang-vien" className="text-decoration-none" style={{ color: "#65676b", fontSize: "14px" }}>
          <FaArrowLeft className="me-2" /> Quay lại tra cứu hồ sơ
        </Link>
        <h1 className="fw-bold mt-3" style={{ color: "#1c1e21", fontSize: "28px" }}>
          Bổ sung hồ sơ đăng ký
        </h1>
        <p style={{ color: "#65676b", fontSize: "15px" }}>
          Hồ sơ #{maHoSo} · Chỉ cần điền/thay đổi thông tin mà admin yêu cầu bổ sung. Các trường để trống sẽ giữ nguyên.
        </p>
      </div>

      <div className="dkgv-main-card">
        <div className="dkgv-body">
          <div className="dkgv-info-alert">
            <FaCheckCircle />
            <span>Liên kết đã được xác thực. Vui lòng cập nhật các thông tin cần bổ sung.</span>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Họ và tên</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.hoTen} onChange={(e) => setField("hoTen", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Số điện thoại</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.soDienThoai} onChange={(e) => setField("soDienThoai", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Lĩnh vực giảng dạy</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.linhVucGiangDay} onChange={(e) => setField("linhVucGiangDay", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Số giấy tờ</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.soGiayTo} onChange={(e) => setField("soGiayTo", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Tên ngân hàng</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.tenNganHang} onChange={(e) => setField("tenNganHang", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Số tài khoản</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.soTaiKhoanNhanTien} onChange={(e) => setField("soTaiKhoanNhanTien", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Tên chủ tài khoản</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.tenChuTaiKhoan} onChange={(e) => setField("tenChuTaiKhoan", e.target.value)} /></div></div>
            <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Mã số thuế</label><input className="dkgv-form-control" placeholder="Bỏ trống nếu không đổi" value={form.maSoThue} onChange={(e) => setField("maSoThue", e.target.value)} /></div></div>
          </div>

          <div className="dkgv-section-title mt-4"><FaUpload /><span>CV và chứng chỉ chuyên môn</span></div>
          <p className="text-muted small">Chỉ chọn tài liệu nếu cần thay thế nhóm tương ứng. Tài liệu cũ sẽ được giữ nguyên nếu không chọn file mới.</p>
          <LecturerDocumentUpload
            cvFiles={cvFiles}
            certificates={certificates}
            onCvFilesChange={(nextFiles) => { setCvFiles(nextFiles); setDocumentError(""); }}
            onCertificatesChange={(nextCertificates) => { setCertificates(nextCertificates); setDocumentError(""); }}
            onError={(message) => { setDocumentError(message); void Swal.fire("Tài liệu không hợp lệ", message, "warning"); }}
            requireCv={false}
          />
          {documentError && <div className="text-danger small mt-2" role="alert">{documentError}</div>}

          <div className="dkgv-section-title mt-4"><FaUpload /><span>Tải lại giấy tờ (nếu admin yêu cầu)</span></div>
          <div className="dkgv-upload-grid">
            {uploadBox("Ảnh đại diện", files.anhDaiDien, avatarRef, "anhDaiDien")}
            {uploadBox("Mặt trước giấy tờ", files.anhGiayToMatTruoc, frontRef, "anhGiayToMatTruoc")}
            {uploadBox("Mặt sau giấy tờ", files.anhGiayToMatSau, backRef, "anhGiayToMatSau")}
          </div>

          <div className="dkgv-footer">
            <button className="dkgv-btn-back" type="button" onClick={() => navigate("/trang-thai-ho-so-giang-vien")}>Quay lại</button>
            <button className="dkgv-btn-next brown" type="button" disabled={dangTai} onClick={handleSubmit}>
              {dangTai ? "Đang gửi..." : "Gửi hồ sơ bổ sung"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}