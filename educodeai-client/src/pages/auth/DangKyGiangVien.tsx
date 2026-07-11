import { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { DANH_MUC_NGAN_HANG_MAC_DINH } from '../../constants/danh-muc-ngan-hang-mac-dinh';
import './DangKyGiangVien.css';

type PaymentMethod = 'BANK' | 'PAYPAL' | 'PAYONEER';


type VerificationStatus = 'idle' | 'pending' | 'verified' | 'failed';

type VerificationState = {
  emailStatus: VerificationStatus;
  emailOtpSent: boolean;
  emailOtpCode: string;
  cccdStatus: VerificationStatus;
  cccdInfo: Record<string, string> | null;
  bankStatus: VerificationStatus;
  bankInfo: Record<string, string> | null;
};


type FormState = {
  hoTen: string;
  email: string;
  taiKhoan: string;
  matKhau: string;
  soDienThoai: string;
  linhVucGiangDay: string;
  tieuSu: string;
  linkedInUrl: string;
  websiteUrl: string;
  soGiayTo: string;
  noiCap: string;
  tenNganHang: string;
  soTaiKhoanNhanTien: string;
  tenChuTaiKhoan: string;
  maSoThue: string;
  loaiDoiTuongThue: 'CaNhan' | 'DoanhNghiep' | '';
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_REGEX = /^[a-zA-Z0-9._-]{3,50}$/;
const FULL_NAME_REGEX = /^[\p{L}][\p{L}\s'.-]{1,149}$/u;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,50}$/;
const PHONE_REGEX = /^\d{9,15}$/;
const CCCD_REGEX = /^(\d{9}|\d{12})$/;
const PASSPORT_REGEX = /^[A-Z0-9]{6,12}$/;
const OTP_REGEX = /^\d{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{6,20}$/;
const TAX_CODE_REGEX = /^(\d{10}|\d{13})$/;

const FILE_ERROR = 'Chỉ chấp nhận file ảnh JPG, JPEG, PNG hoặc WEBP. Kích thước tối đa 5MB.';

export default function DangKyGiangVien() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [docType, setDocType] = useState<'cccd' | 'passport'>('cccd');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewFront, setPreviewFront] = useState<string | null>(null);
  const [previewBack, setPreviewBack] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bankKeyword, setBankKeyword] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [verification, setVerification] = useState<VerificationState>({
    emailStatus: 'idle',
    emailOtpSent: false,
    emailOtpCode: '',
    cccdStatus: 'idle',
    cccdInfo: null,
    bankStatus: 'idle',
    bankInfo: null
  });

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);
  const bankBoxRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<FormState>({
    hoTen: '',
    email: '',
    taiKhoan: '',
    matKhau: '',
    soDienThoai: '',
    linhVucGiangDay: '',
    tieuSu: '',
    linkedInUrl: '',
    websiteUrl: '',
    soGiayTo: '',
    noiCap: '',
    tenNganHang: '',
    soTaiKhoanNhanTien: '',
    tenChuTaiKhoan: '',
    maSoThue: '',
    loaiDoiTuongThue: ''
  });

  const [files, setFiles] = useState({
    anhDaiDien: null as File | null,
    anhGiayToMatTruoc: null as File | null,
    anhGiayToMatSau: null as File | null
  });

  const filteredBanks = useMemo(() => {
    const keyword = bankKeyword.trim().toLowerCase();
    if (!keyword) return DANH_MUC_NGAN_HANG_MAC_DINH;
    return DANH_MUC_NGAN_HANG_MAC_DINH.filter((bank) =>
      bank.tenHienThi.toLowerCase().includes(keyword) ||
      bank.ma.toLowerCase().includes(keyword) ||
      bank.maVietQr.toLowerCase().includes(keyword)
    );
  }, [bankKeyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankBoxRef.current && !bankBoxRef.current.contains(event.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!files.anhDaiDien) return void setPreviewAvatar(null);
    const url = URL.createObjectURL(files.anhDaiDien);
    setPreviewAvatar(url);
    return () => URL.revokeObjectURL(url);
  }, [files.anhDaiDien]);

  useEffect(() => {
    if (!files.anhGiayToMatTruoc) return void setPreviewFront(null);
    const url = URL.createObjectURL(files.anhGiayToMatTruoc);
    setPreviewFront(url);
    return () => URL.revokeObjectURL(url);
  }, [files.anhGiayToMatTruoc]);

  useEffect(() => {
    if (!files.anhGiayToMatSau) return void setPreviewBack(null);
    const url = URL.createObjectURL(files.anhGiayToMatSau);
    setPreviewBack(url);
    return () => URL.revokeObjectURL(url);
  }, [files.anhGiayToMatSau]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }

    if (key === 'email') {
      setVerification((prev) => ({ ...prev, emailStatus: 'idle', emailOtpSent: false, emailOtpCode: '' }));
    }
    if (key === 'soGiayTo') {
      setVerification((prev) => ({ ...prev, cccdStatus: 'idle', cccdInfo: null }));
    }
    if (key === 'soTaiKhoanNhanTien') {
      setVerification((prev) => ({ ...prev, bankStatus: 'idle', bankInfo: null }));
    }
    if (key === 'tenChuTaiKhoan') {
      setVerification((prev) => ({ ...prev, bankStatus: 'idle', bankInfo: null }));
    }
  };

  const setVerifyLoading = (key: string, value: boolean) => {
    setIsVerifying((prev) => ({ ...prev, [key]: value }));
  };

  const statusBadge = (status: VerificationStatus, kind: 'email' | 'cccd' | 'bank' = 'email') => {
    if (status === 'verified') return <span className="dkgv-verify-badge ok"><i className="bi bi-check-circle-fill" /> Đã xác minh</span>;
    if (status === 'failed') return <span className="dkgv-verify-badge fail"><i className="bi bi-x-circle-fill" /> Chưa hợp lệ</span>;
    if (status === 'pending') {
      if (kind === 'email') return <span className="dkgv-verify-badge wait"><i className="bi bi-hourglass-split" /> Đang chờ OTP</span>;
      if (kind === 'cccd') return null; // khong hien badge cho buoc cho xac nhan CCCD
      return <span className="dkgv-verify-badge wait"><i className="bi bi-hourglass-split" /> Đang kiểm tra</span>;
    }
    return <span className="dkgv-verify-badge idle"><i className="bi bi-shield" /> Chưa xác minh</span>;
  };

  const renderInfoBox = (info: Record<string, string> | null) => {
    if (!info) return null;
    return (
      <div className="dkgv-verify-result">
        {Object.entries(info).filter(([label]) => !label.startsWith('__')).map(([label, value]) => (
          <div key={label}><strong>{label}:</strong> <span>{value}</span></div>
        ))}
      </div>
    );
  };

  const normalizeDocNumber = (value: string) => value.replace(/\D/g, '');
  const isUnreadableValue = (value?: string) => {
    if (!value) return true;
    const cleaned = value.trim();
    if (!cleaned) return true;
    if (/^[\W_\d]+$/.test(cleaned)) return true;
    return cleaned.replace(/[^\p{L}\p{N}]/gu, '').length < 4;
  };
  const isValidImage = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) return false;
    if (!file.type.startsWith('image/')) return false;
    if (file.size > MAX_IMAGE_SIZE) return false;
    return true;
  };

  const handleImagePick = (
    file: File | null,
    key: 'anhDaiDien' | 'anhGiayToMatTruoc' | 'anhGiayToMatSau',
    inputRef: React.RefObject<HTMLInputElement | null>,
    errorKey: string
  ) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [key]: null }));
      return;
    }
    if (!isValidImage(file)) {
      setFiles((prev) => ({ ...prev, [key]: null }));
      if (inputRef.current) inputRef.current.value = '';
      setErrors((prev) => ({ ...prev, [errorKey]: FILE_ERROR }));
      Swal.fire('File không hợp lệ', FILE_ERROR, 'warning');
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    if (key === 'anhGiayToMatTruoc' || key === 'anhGiayToMatSau') {
      setVerification((prev) => ({ ...prev, cccdStatus: 'idle', cccdInfo: null }));
    }
  };

  const selectBank = (bankName: string) => {
    setForm((prev) => ({ ...prev, tenNganHang: bankName, tenChuTaiKhoan: '' }));
    setVerification((prev) => ({ ...prev, bankStatus: 'idle', bankInfo: null }));
    setBankKeyword(bankName);
    setIsBankDropdownOpen(false);
    setErrors((prev) => ({ ...prev, tenNganHang: '' }));
  };

  const handleBankSearch = (value: string) => {
    setBankKeyword(value);
    setIsBankDropdownOpen(true);
    setForm((prev) => ({ ...prev, tenNganHang: '', tenChuTaiKhoan: '' }));
    setVerification((prev) => ({ ...prev, bankStatus: 'idle', bankInfo: null }));
  };

  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {};
    const hoTen = form.hoTen.trim();
    const email = form.email.trim();
    const taiKhoan = form.taiKhoan.trim();
    const matKhau = form.matKhau;

    if (!hoTen) nextErrors.hoTen = 'Vui lòng nhập họ và tên.';
    else if (!FULL_NAME_REGEX.test(hoTen)) nextErrors.hoTen = 'Họ và tên không đúng định dạng hoặc vượt quá 150 ký tự.';

    if (!email) nextErrors.email = 'Vui lòng nhập email.';
    else if (email.length > 255) nextErrors.email = 'Email không được vượt quá 255 ký tự.';
    else if (!EMAIL_REGEX.test(email)) nextErrors.email = 'Email không đúng định dạng.';
    else if (verification.emailStatus !== 'verified') nextErrors.email = 'Vui lòng xác minh email bằng OTP trước khi tiếp tục.';

    if (!taiKhoan) nextErrors.taiKhoan = 'Vui lòng nhập tài khoản.';
    else if (!ACCOUNT_REGEX.test(taiKhoan)) nextErrors.taiKhoan = 'Tài khoản phải từ 3-50 ký tự, không có khoảng trắng.';

    if (!matKhau) nextErrors.matKhau = 'Vui lòng nhập mật khẩu.';
    else if (!PASSWORD_REGEX.test(matKhau)) nextErrors.matKhau = 'Mật khẩu phải từ 8-50 ký tự và chứa ít nhất 1 chữ cái, 1 chữ số.';

    if (!form.linhVucGiangDay.trim()) nextErrors.linhVucGiangDay = 'Vui lòng chọn hoặc nhập lĩnh vực giảng dạy.';
    if (!form.tieuSu.trim()) nextErrors.tieuSu = 'Vui lòng nhập tiểu sử ngắn.';
    else if (form.tieuSu.trim().length < 30) nextErrors.tieuSu = 'Tiểu sử cần ít nhất 30 ký tự.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = () => {
    const nextErrors: Record<string, string> = {};
    const phone = form.soDienThoai.trim();
    const doc = form.soGiayTo.trim().toUpperCase();

    if (!phone) nextErrors.soDienThoai = 'Vui lòng nhập số điện thoại.';
    else if (!PHONE_REGEX.test(phone)) nextErrors.soDienThoai = 'Số điện thoại chỉ được chứa 9-15 chữ số.';

    if (!doc) nextErrors.soGiayTo = 'Vui lòng nhập số giấy tờ.';
    else if (docType === 'cccd' && !CCCD_REGEX.test(doc)) nextErrors.soGiayTo = 'CCCD/CMND phải gồm 9 hoặc 12 chữ số.';
    else if (docType === 'passport' && !PASSPORT_REGEX.test(doc)) nextErrors.soGiayTo = 'Hộ chiếu phải gồm 6-12 ký tự chữ hoặc số.';
    else if (verification.cccdStatus !== 'verified') nextErrors.soGiayTo = 'Vui lòng kiểm tra thông tin giấy tờ trước khi tiếp tục.';

    if (!files.anhGiayToMatTruoc) nextErrors.anhGiayToMatTruoc = 'Vui lòng tải ảnh mặt trước giấy tờ.';
    else if (!isValidImage(files.anhGiayToMatTruoc)) nextErrors.anhGiayToMatTruoc = FILE_ERROR;

    if (!files.anhGiayToMatSau) nextErrors.anhGiayToMatSau = 'Vui lòng tải ảnh mặt sau giấy tờ.';
    else if (!isValidImage(files.anhGiayToMatSau)) nextErrors.anhGiayToMatSau = FILE_ERROR;

    if (form.maSoThue.trim() && !TAX_CODE_REGEX.test(form.maSoThue.trim())) nextErrors.maSoThue = 'Mã số thuế phải gồm 10 hoặc 13 chữ số.';
    if (!form.loaiDoiTuongThue) nextErrors.loaiDoiTuongThue = 'Vui lòng chọn loại đối tượng nộp thuế.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep3 = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.tenNganHang.trim()) nextErrors.tenNganHang = 'Vui lòng chọn một ngân hàng từ danh sách.';
    else if (!DANH_MUC_NGAN_HANG_MAC_DINH.some((bank) => bank.tenHienThi === form.tenNganHang)) nextErrors.tenNganHang = 'Ngân hàng chỉ hợp lệ khi bạn chọn từ combobox.';

    if (!form.soTaiKhoanNhanTien.trim()) nextErrors.soTaiKhoanNhanTien = 'Vui lòng nhập số tài khoản nhận tiền.';
    else if (!ACCOUNT_NUMBER_REGEX.test(form.soTaiKhoanNhanTien.trim())) nextErrors.soTaiKhoanNhanTien = 'Số tài khoản phải gồm 6-20 chữ số.';

    if (!form.tenChuTaiKhoan.trim()) nextErrors.tenChuTaiKhoan = 'Vui lòng nhập tên chủ tài khoản.';

    if (verification.bankStatus !== 'verified') nextErrors.soTaiKhoanNhanTien = 'Vui lòng bấm Xác nhận TK sau khi chọn ngân hàng và nhập STK.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendEmailOtp = async () => {
    const email = form.email.trim();
    if (!EMAIL_REGEX.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Vui lòng nhập email đúng định dạng trước.' }));
      return;
    }

    try {
      setVerifyLoading('email', true);
      await authService.sendInstructorEmailOtp(email);
      setVerification((prev) => ({ ...prev, emailStatus: 'pending', emailOtpSent: true, emailOtpCode: '' }));
      setErrors((prev) => ({ ...prev, email: '', emailOtpCode: '' }));
      Swal.fire('Đã gửi OTP email', 'Vui lòng kiểm tra email. Mã có hiệu lực trong 5 phút.', 'success');
    } catch (error: any) {
      setVerification((prev) => ({ ...prev, emailStatus: 'failed', emailOtpSent: false }));
      Swal.fire('Lỗi', error?.response?.data?.message || 'Không gửi được OTP email.', 'error');
    } finally {
      setVerifyLoading('email', false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!OTP_REGEX.test(verification.emailOtpCode)) {
      setErrors((prev) => ({ ...prev, emailOtpCode: 'Mã OTP email phải gồm đúng 6 chữ số.' }));
      return;
    }

    try {
      setVerifyLoading('emailVerify', true);
      await authService.verifyInstructorEmailOtp(form.email.trim(), verification.emailOtpCode);
      setVerification((prev) => ({ ...prev, emailStatus: 'verified' }));
      setErrors((prev) => ({ ...prev, email: '', emailOtpCode: '' }));
      Swal.fire('Đã xác minh', 'Email đã được xác minh thành công.', 'success');
    } catch (error: any) {
      setVerification((prev) => ({ ...prev, emailStatus: 'failed' }));
      setErrors((prev) => ({ ...prev, emailOtpCode: error?.response?.data?.message || 'Mã OTP email không đúng hoặc đã hết hạn.' }));
    } finally {
      setVerifyLoading('emailVerify', false);
    }
  };

  const handleVerifyIdentity = async () => {
    const doc = form.soGiayTo.trim().toUpperCase();
    const nextErrors: Record<string, string> = {};
    if (!doc) nextErrors.soGiayTo = 'Vui lòng nhập số giấy tờ trước khi quét để đối chiếu.';
    else if (docType === 'cccd' && !CCCD_REGEX.test(doc)) nextErrors.soGiayTo = 'CCCD/CMND phải gồm 9 hoặc 12 chữ số.';
    else if (docType === 'passport' && !PASSPORT_REGEX.test(doc)) nextErrors.soGiayTo = 'Hộ chiếu phải gồm 6-12 ký tự chữ hoặc số.';
    if (!form.noiCap.trim()) nextErrors.noiCap = 'Vui lòng nhập nơi cấp giấy tờ.';
    if (!files.anhGiayToMatTruoc) nextErrors.anhGiayToMatTruoc = 'Vui lòng tải ảnh mặt trước giấy tờ.';
    else if (!isValidImage(files.anhGiayToMatTruoc)) nextErrors.anhGiayToMatTruoc = FILE_ERROR;
    if (!files.anhGiayToMatSau) nextErrors.anhGiayToMatSau = 'Vui lòng tải ảnh mặt sau giấy tờ.';
    else if (!isValidImage(files.anhGiayToMatSau)) nextErrors.anhGiayToMatSau = FILE_ERROR;
    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    setVerifyLoading('cccd', true);
    try {
      const fd = new FormData();
      fd.append('LoaiGiayTo', docType === 'cccd' ? 'CCCD' : 'Passport');
      fd.append('AnhMatTruoc', files.anhGiayToMatTruoc as File);
      fd.append('AnhMatSau', files.anhGiayToMatSau as File);

      // axios interceptor da tra ve response.data
      const data: any = await authService.scanIdentityDocument(fd);
      const payload = data?.data && (data.data.soGiayTo || data.data.hoTen || data.data.SoGiayTo || data.data.HoTen) ? data.data : data;

      const soGiayTo = payload?.soGiayTo || payload?.SoGiayTo || '';
      const hoTen = payload?.hoTen || payload?.HoTen || '';
      const ngaySinh = payload?.ngaySinh || payload?.NgaySinh || '';
      const gioiTinh = payload?.gioiTinh || payload?.GioiTinh || '';
      const ngayCap = payload?.ngayCap || payload?.NgayCap || '';
      const diaChi = payload?.diaChi || payload?.DiaChi || '';
      const quocTich = payload?.quocTich || payload?.QuocTich || '';
      const nguyenQuan = payload?.nguyenQuan || payload?.NguyenQuan || '';
      const thanhCong = payload?.thanhCong ?? payload?.ThanhCong ?? true;

      if (!thanhCong) {
        throw { response: { data: payload } };
      }

      const docMismatch = Boolean(soGiayTo && doc && normalizeDocNumber(soGiayTo) !== normalizeDocNumber(doc));
      const scannedInfo: Record<string, string> = {
        'Loại giấy tờ': docType === 'cccd' ? 'CCCD/CMND' : 'Hộ chiếu',
        'Họ tên': hoTen || 'Không đọc được',
        'Ngày sinh': ngaySinh || 'Không đọc được',
        'Giới tính': gioiTinh || 'Không đọc được',
        'Ngày cấp': ngayCap || 'Không đọc được',
        'Nơi cấp': form.noiCap.trim() || 'Chưa nhập',
        'Địa chỉ': diaChi || 'Không đọc được',
        'Quốc tịch': quocTich || 'Không đọc được'
      };
      if (!isUnreadableValue(nguyenQuan)) scannedInfo['Quê quán'] = nguyenQuan;
      // keep scanned number for mismatch check only
      if (soGiayTo) scannedInfo['__soGiayToQuet'] = soGiayTo;

      setVerification((prev) => ({
        ...prev,
        cccdStatus: 'pending',
        cccdInfo: scannedInfo
      }));

      if (docMismatch) {
        setErrors((prev) => ({
          ...prev,
          soGiayTo: 'Số giấy tờ không khớp với ảnh tải lên.',
          anhGiayToMatTruoc: '',
          anhGiayToMatSau: ''
        }));
      } else {
        setErrors((prev) => ({ ...prev, soGiayTo: '', anhGiayToMatTruoc: '', anhGiayToMatSau: '' }));
      }

      Swal.fire('Đã quét xong', 'Vui lòng kiểm tra lại thông tin. Nếu đúng hãy bấm Xác nhận thông tin.', 'success');
    } catch (err: any) {
      const message = err?.response?.data?.thongBao || err?.response?.data?.ThongBao || err?.response?.data?.message || err?.thongBao || err?.message || 'Ảnh bị mờ, không phải giấy tờ hợp lệ hoặc không thể quét. Vui lòng tải lại ảnh rõ hơn.';
      setVerification((prev) => ({ ...prev, cccdStatus: 'failed', cccdInfo: null }));
      if (String(message).toLowerCase().includes('số giấy tờ')) {
        setErrors((prev) => ({ ...prev, soGiayTo: message }));
      }
      Swal.fire('Không quét được giấy tờ', message, 'warning');
    } finally {
      setVerifyLoading('cccd', false);
    }
  };

  const handleConfirmIdentity = () => {
    if (!verification.cccdInfo) return;
    const soGiayTo = (verification.cccdInfo['__soGiayToQuet'] || '').trim();
    if (!soGiayTo || soGiayTo === 'Không đọc được') {
      Swal.fire('Thiếu số giấy tờ', 'Không thể xác nhận vì hệ thống chưa đọc được số giấy tờ.', 'warning');
      return;
    }
    if (normalizeDocNumber(soGiayTo) !== normalizeDocNumber(form.soGiayTo)) {
      setErrors((prev) => ({ ...prev, soGiayTo: 'Số giấy tờ không khớp với ảnh tải lên.' }));
      Swal.fire('Số giấy tờ không khớp', 'Vui lòng kiểm tra lại số giấy tờ đã nhập hoặc tải lại đúng ảnh CCCD.', 'warning');
      return;
    }
    setVerification((prev) => ({ ...prev, cccdStatus: 'verified' }));
    Swal.fire('Đã xác nhận', 'Thông tin giấy tờ đã được xác nhận.', 'success');
  };

  const handleResetIdentityUpload = () => {
    setFiles((prev) => ({ ...prev, anhGiayToMatTruoc: null, anhGiayToMatSau: null }));
    setVerification((prev) => ({ ...prev, cccdStatus: 'idle', cccdInfo: null }));
    setErrors((prev) => ({ ...prev, soGiayTo: '', anhGiayToMatTruoc: '', anhGiayToMatSau: '' }));
    if (frontInputRef.current) frontInputRef.current.value = '';
    if (backInputRef.current) backInputRef.current.value = '';
  };

  const handleVerifyBankAccount = async () => {
    const bank = DANH_MUC_NGAN_HANG_MAC_DINH.find((item) => item.tenHienThi === form.tenNganHang);
    const account = form.soTaiKhoanNhanTien.trim();
    const holderName = form.tenChuTaiKhoan.trim().replace(/\s+/g, ' ');
    const nextErrors: Record<string, string> = {};
    if (!bank) nextErrors.tenNganHang = 'Vui lòng chọn một ngân hàng từ danh sách.';
    if (!ACCOUNT_NUMBER_REGEX.test(account)) nextErrors.soTaiKhoanNhanTien = 'Số tài khoản phải gồm 6-20 chữ số.';
    if (!holderName) nextErrors.tenChuTaiKhoan = 'Vui lòng nhập tên chủ tài khoản đúng như trên app ngân hàng.';
    else if (holderName.length < 3) nextErrors.tenChuTaiKhoan = 'Tên chủ tài khoản quá ngắn.';
    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    // Không có API ngân hàng thật trong dự án: chỉ xác nhận thông tin đã khai báo.
    // (Xác minh tên chủ TK thật cần BankHub/VietQR Lookup trả phí.)
    setVerifyLoading('bank', true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setForm((prev) => ({ ...prev, tenChuTaiKhoan: holderName.toUpperCase() }));
    setVerification((prev) => ({
      ...prev,
      bankStatus: 'verified',
      bankInfo: {
        'Ngân hàng': `${bank!.tenHienThi} (${bank!.ma})`,
        'Số tài khoản': account,
        'Tên chủ tài khoản': holderName.toUpperCase(),
        'Trạng thái': 'Đã xác nhận thông tin nhận tiền (chưa xác minh qua API ngân hàng)'
      }
    }));
    setErrors((prev) => ({ ...prev, tenNganHang: '', soTaiKhoanNhanTien: '', tenChuTaiKhoan: '' }));
    setVerifyLoading('bank', false);
    Swal.fire('Đã xác nhận', 'Thông tin ngân hàng/STK đã được ghi nhận để admin đối chiếu khi duyệt hồ sơ.', 'success');
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      return;
    }
    if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    const ok1 = validateStep1();
    const ok2 = validateStep2();
    const ok3 = validateStep3();
    if (!ok1 || !ok2 || !ok3) {
      if (!ok1) setStep(1);
      else if (!ok2) setStep(2);
      else setStep(3);
      return;
    }

    const fd = new FormData();
    fd.append('HoTen', form.hoTen);
    fd.append('Email', form.email);
    fd.append('TaiKhoan', form.taiKhoan);
    fd.append('MatKhau', form.matKhau);
    fd.append('SoDienThoai', form.soDienThoai);
    fd.append('LinhVucGiangDay', form.linhVucGiangDay);
    fd.append('TieuSu', form.tieuSu);
    fd.append('LinkedInUrl', form.linkedInUrl);
    fd.append('WebsiteUrl', form.websiteUrl);
    fd.append('LoaiGiayTo', docType === 'cccd' ? 'CCCD' : 'Passport');
    fd.append('SoGiayTo', form.soGiayTo);
    fd.append('PhuongThucThanhToan', paymentMethod);
    fd.append('TenNganHang', form.tenNganHang);
    fd.append('SoTaiKhoanNhanTien', form.soTaiKhoanNhanTien);
    fd.append('TenChuTaiKhoan', form.tenChuTaiKhoan);
    fd.append('MaSoThue', form.maSoThue);
    fd.append('LoaiDoiTuongThue', form.loaiDoiTuongThue);
    fd.append('DaXacMinhEmail', String(verification.emailStatus === 'verified'));
    fd.append('DaXacMinhCCCD', String(verification.cccdStatus === 'verified'));
    fd.append('DaXacMinhTaiKhoanNganHang', String(verification.bankStatus === 'verified'));
    if (files.anhDaiDien) fd.append('AnhDaiDien', files.anhDaiDien);
    if (files.anhGiayToMatTruoc) fd.append('AnhGiayToMatTruoc', files.anhGiayToMatTruoc);
    if (files.anhGiayToMatSau) fd.append('AnhGiayToMatSau', files.anhGiayToMatSau);

    try {
      setIsSubmitting(true);
      const result: any = await authService.registerGiangVien(fd);
      await Swal.fire('Thành công', result?.message || 'Hồ sơ đã được gửi để duyệt.', 'success');
      navigate('/dang-nhap');
    } catch (error: any) {
      Swal.fire('Lỗi', error?.response?.data?.message || 'Không thể gửi hồ sơ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileBox = (
    label: string,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onPick: (file: File | null) => void,
    errorKey: string,
    preview: string | null
  ) => (
    <div className="dkgv-upload-box-wrap">
      <div className="dkgv-upload-box-label">{label}</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onPick(e.target.files?.[0] || null)}
      />
      <div className={preview ? 'dkgv-upload-box dkgv-upload-has-preview' : 'dkgv-upload-box'} onClick={() => inputRef.current?.click()} role="button" tabIndex={0}>
        {preview ? (
          <div className="dkgv-preview-container">
            <img src={preview} alt={label} className="dkgv-preview-img" />
          </div>
        ) : (
          <>
            <div className="dkgv-upload-box-icon"><i className="bi bi-image" /></div>
            <div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div>
            <div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div>
          </>
        )}
      </div>
      {file && <div className="small text-success mt-2">Đã chọn: {file.name}</div>}
      {errors[errorKey] && <div className="text-danger small mt-1">{errors[errorKey]}</div>}
    </div>
  );

  return (
    <div className="dkgv-container">
      <div style={{ maxWidth: '860px', margin: '0 auto 20px auto' }}>
        <h1 className="fw-bold mb-2" style={{ color: '#1c1e21', fontSize: '32px' }}>Trở thành Giảng viên EducodeAI</h1>
        <p style={{ color: '#65676b', fontSize: '16px' }}>Chia sẻ kiến thức và nhận thu nhập thụ động</p>
        <p style={{ color: '#65676b', fontSize: '14px', marginTop: '8px' }}>
          Đã nộp hồ sơ? <a href='/trang-thai-ho-so-giang-vien' style={{ color: '#fb873f', fontWeight: 600 }}>Tra cứu trạng thái hồ sơ</a>
        </p>
      </div>

      <div className="dkgv-main-card animate__animated animate__fadeIn">
        {step === 1 && (
          <div className="dkgv-progress-header">
            <div className="dkgv-progress-bar">
              <div className="dkgv-step active"><div className="dkgv-step-circle">1</div><div className="dkgv-step-label">Hồ sơ chuyên môn</div></div>
              <div className="dkgv-progress-line"><div className="dkgv-progress-line-fill" style={{ width: '0%' }} /></div>
              <div className="dkgv-step"><div className="dkgv-step-circle">2</div><div className="dkgv-step-label">Xác minh danh tính</div></div>
              <div className="dkgv-progress-line"><div className="dkgv-progress-line-fill" style={{ width: '0%' }} /></div>
              <div className="dkgv-step"><div className="dkgv-step-circle">3</div><div className="dkgv-step-label">Thanh toán</div></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="dkgv-progress-alt">
            <div className="dkgv-step completed"><div className="dkgv-step-circle">✓</div><div className="dkgv-step-label">Hồ sơ chuyên môn</div></div>
            <div className="dkgv-progress-line" aria-hidden="true" />
            <div className="dkgv-step active"><div className="dkgv-step-circle">2</div><div className="dkgv-step-label">Xác minh danh tính (KYC)</div></div>
            <div className="dkgv-progress-line" aria-hidden="true" />
            <div className="dkgv-step"><div className="dkgv-step-circle">3</div><div className="dkgv-step-label">Thanh toán</div></div>
          </div>
        )}

        {step === 3 && (
          <div className="dkgv-progress-header">
            <div className="dkgv-progress-bar">
              <div className="dkgv-step completed"><div className="dkgv-step-circle">1</div><div className="dkgv-step-label">Hồ sơ chuyên môn</div></div>
              <div className="dkgv-progress-line"><div className="dkgv-progress-line-fill" style={{ width: '100%' }} /></div>
              <div className="dkgv-step completed"><div className="dkgv-step-circle">2</div><div className="dkgv-step-label">Xác minh danh tính</div></div>
              <div className="dkgv-progress-line"><div className="dkgv-progress-line-fill" style={{ width: '100%' }} /></div>
              <div className="dkgv-step active"><div className="dkgv-step-circle">3</div><div className="dkgv-step-label">Thanh toán</div></div>
            </div>
          </div>
        )}

        <div className="dkgv-body">
          {step === 1 && (
            <>
              <div className="dkgv-avatar-upload">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImagePick(e.target.files?.[0] || null, 'anhDaiDien', avatarInputRef, 'anhDaiDien')}
                />
                <div className="dkgv-avatar-circle" onClick={() => avatarInputRef.current?.click()} role="button" tabIndex={0}>
                  {previewAvatar ? <img src={previewAvatar} alt="Ảnh đại diện" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <i className="bi bi-camera dkgv-avatar-icon" />}
                  <div className="dkgv-avatar-edit"><i className="bi bi-pencil-fill" /></div>
                </div>
                <div className="dkgv-avatar-info">
                  <h5>Ảnh đại diện</h5>
                  <p>Sử dụng ảnh chân dung rõ nét. Định dạng JPG, PNG, tối đa 5MB.</p>
                  <button className="dkgv-btn-outline" type="button" onClick={() => avatarInputRef.current?.click()}>Tải ảnh lên</button>
                  {errors.anhDaiDien && <div className="text-danger small mt-2">{errors.anhDaiDien}</div>}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Họ và tên</label><input className={`dkgv-form-control ${errors.hoTen ? 'is-invalid' : ''}`} placeholder="Nhập họ và tên đầy đủ" maxLength={150} value={form.hoTen} onChange={(e) => setField('hoTen', e.target.value)} />{errors.hoTen && <div className="text-danger small mt-1">{errors.hoTen}</div>}</div></div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Lĩnh vực giảng dạy chính</label><select className={`dkgv-form-control ${errors.linhVucGiangDay ? 'is-invalid' : ''}`} value={form.linhVucGiangDay} onChange={(e) => setField('linhVucGiangDay', e.target.value)}><option value="">Chọn lĩnh vực</option><option value="Lập trình Web">Lập trình Web</option><option value="Mobile">Mobile</option><option value="Data / AI">Data / AI</option><option value="DevOps / Cloud">DevOps / Cloud</option><option value="UI/UX Design">UI/UX Design</option><option value="Kiểm thử phần mềm">Kiểm thử phần mềm</option></select>{errors.linhVucGiangDay && <div className="text-danger small mt-1">{errors.linhVucGiangDay}</div>}</div></div>
                <div className="col-12"><div className="dkgv-form-group"><label className="dkgv-form-label">Tiểu sử ngắn</label><textarea className={`dkgv-form-control ${errors.tieuSu ? 'is-invalid' : ''}`} rows={5} maxLength={500} placeholder="Giới thiệu ngắn về kinh nghiệm và chuyên môn của bạn..." value={form.tieuSu} onChange={(e) => setField('tieuSu', e.target.value)} /><div className="dkgv-char-count">{form.tieuSu.length} / 500 ký tự</div>{errors.tieuSu && <div className="text-danger small mt-1">{errors.tieuSu}</div>}</div></div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label"><i className="bi bi-link-45deg me-2" />Link LinkedIn</label><input className="dkgv-form-control" placeholder="https://linkedin.com/in/username" maxLength={255} value={form.linkedInUrl} onChange={(e) => setField('linkedInUrl', e.target.value)} /></div></div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label"><i className="bi bi-globe2 me-2" />Portfolio / Website</label><input className="dkgv-form-control" placeholder="https://yourwebsite.com" maxLength={255} value={form.websiteUrl} onChange={(e) => setField('websiteUrl', e.target.value)} /></div></div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Tài khoản</label><input className={`dkgv-form-control ${errors.taiKhoan ? 'is-invalid' : ''}`} placeholder="Tên tài khoản đăng nhập" maxLength={50} value={form.taiKhoan} onChange={(e) => setField('taiKhoan', e.target.value.replace(/\s/g, ''))} />{errors.taiKhoan && <div className="text-danger small mt-1">{errors.taiKhoan}</div>}</div></div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Mật khẩu</label><input type="password" className={`dkgv-form-control ${errors.matKhau ? 'is-invalid' : ''}`} placeholder="Mật khẩu tối thiểu 8 ký tự" maxLength={50} value={form.matKhau} onChange={(e) => setField('matKhau', e.target.value)} />{errors.matKhau && <div className="text-danger small mt-1">{errors.matKhau}</div>}</div></div>
                <div className="col-md-6">
                  <div className="dkgv-form-group">
                    <label className="dkgv-form-label">Email {statusBadge(verification.emailStatus, 'email')}</label>
                    <div className="dkgv-inline-verify">
                      <input className={`dkgv-form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="name@example.com" maxLength={255} value={form.email} onChange={(e) => setField('email', e.target.value.trim())} />
                      <button className="dkgv-btn-brown" type="button" disabled={isVerifying.email || verification.emailStatus === 'verified'} onClick={handleSendEmailOtp}>{isVerifying.email ? 'Đang kiểm tra...' : 'Gửi OTP'}</button>
                    </div>
                    {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                    {verification.emailOtpSent && verification.emailStatus !== 'verified' && (
                      <div className="dkgv-inline-verify mt-2">
                        <input className={`dkgv-form-control ${errors.emailOtpCode ? 'is-invalid' : ''}`} placeholder="Nhập OTP email (demo: 123456)" maxLength={6} inputMode="numeric" value={verification.emailOtpCode} onChange={(e) => setVerification((prev) => ({ ...prev, emailOtpCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} />
                        <button className="dkgv-btn-outline" type="button" onClick={handleVerifyEmailOtp}>Xác minh</button>
                      </div>
                    )}
                    {errors.emailOtpCode && <div className="text-danger small mt-1">{errors.emailOtpCode}</div>}
                  </div>
                </div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Họ và tên hiển thị</label><input className="dkgv-form-control dkgv-form-control-readonly" placeholder="Tên hiển thị trên hồ sơ" value={form.hoTen} disabled readOnly /></div></div>
              </div>

              <div className="dkgv-info-alert"><i className="bi bi-info-circle" /><span>Hồ sơ giảng viên sẽ được đội ngũ EducodeAI xem xét trước khi kích hoạt.</span></div>

              <div className="dkgv-footer">
                <button className="dkgv-btn-back" type="button" onClick={() => navigate(-1)}>Quay lại</button>
                <button className="dkgv-btn-next" type="button" onClick={goNext}>Tiếp tục</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="dkgv-section-title"><i className="bi bi-telephone" /><span>Số điện thoại liên hệ</span></div>
              <div className="dkgv-phone-input-wrap">
                <div className="dkgv-input-icon"><input className={`dkgv-form-control ${errors.soDienThoai ? 'is-invalid' : ''}`} placeholder="0901234567" maxLength={15} inputMode="numeric" value={form.soDienThoai} onChange={(e) => setField('soDienThoai', e.target.value.replace(/\D/g, ''))} /><i className="bi bi-telephone" /></div>
              </div>
              {errors.soDienThoai && <div className="text-danger small mt-1">{errors.soDienThoai}</div>}

              <div className="dkgv-form-group mt-3"><label className="dkgv-form-label">Số giấy tờ</label><input className={`dkgv-form-control ${errors.soGiayTo ? 'is-invalid' : ''}`} placeholder={docType === 'cccd' ? 'Nhập số CCCD/CMND' : 'Nhập số hộ chiếu'} maxLength={docType === 'cccd' ? 12 : 12} inputMode={docType === 'cccd' ? 'numeric' : 'text'} value={form.soGiayTo} onChange={(e) => setField('soGiayTo', docType === 'cccd' ? e.target.value.replace(/\D/g, '') : e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />{errors.soGiayTo && <div className="text-danger small mt-1">{errors.soGiayTo}</div>}</div>
              <div className="dkgv-form-group mt-3"><label className="dkgv-form-label">Nơi cấp</label><input className={`dkgv-form-control ${errors.noiCap ? 'is-invalid' : ''}`} placeholder="Ví dụ: Cục Cảnh sát QLHC về TTXH / Công an tỉnh..." maxLength={255} value={form.noiCap} onChange={(e) => setField('noiCap', e.target.value)} />{errors.noiCap && <div className="text-danger small mt-1">{errors.noiCap}</div>}</div>

              <div className="dkgv-section-title"><i className="bi bi-card-text" /><span>Tải lên giấy tờ tùy thân</span></div>
              <div className="dkgv-doc-type-toggle">
                <button type="button" className={`dkgv-doc-btn ${docType === 'cccd' ? 'active' : ''}`} onClick={() => { setDocType('cccd'); setVerification((prev) => ({ ...prev, cccdStatus: 'idle', cccdInfo: null })); }}><i className="bi bi-check-circle-fill" /> CCCD / CMND</button>
                <button type="button" className={`dkgv-doc-btn ${docType === 'passport' ? 'active' : ''}`} onClick={() => { setDocType('passport'); setVerification((prev) => ({ ...prev, cccdStatus: 'idle', cccdInfo: null })); }}><i className="bi bi-passport-fill" /> Hộ chiếu (Passport)</button>
              </div>

              <div className="dkgv-upload-grid">
                {fileBox('Mặt trước giấy tờ', files.anhGiayToMatTruoc, frontInputRef, (file) => handleImagePick(file, 'anhGiayToMatTruoc', frontInputRef, 'anhGiayToMatTruoc'), 'anhGiayToMatTruoc', previewFront)}
                {fileBox('Mặt sau giấy tờ', files.anhGiayToMatSau, backInputRef, (file) => handleImagePick(file, 'anhGiayToMatSau', backInputRef, 'anhGiayToMatSau'), 'anhGiayToMatSau', previewBack)}
              </div>

              <div className="mt-3 d-flex gap-2 align-items-center flex-wrap">
                <button className="dkgv-btn-brown" type="button" disabled={isVerifying.cccd || verification.cccdStatus === 'verified'} onClick={handleVerifyIdentity}>{isVerifying.cccd ? 'Đang quét...' : 'Kiểm tra thông tin'}</button>
                {verification.cccdStatus === 'pending' && <button className="dkgv-btn-next" type="button" onClick={handleConfirmIdentity}>Xác nhận thông tin</button>}
                {(verification.cccdStatus === 'pending' || verification.cccdStatus === 'failed' || verification.cccdStatus === 'verified') && <button className="dkgv-btn-outline" type="button" onClick={handleResetIdentityUpload}>Tải lại ảnh</button>}
              </div>
              {renderInfoBox(verification.cccdInfo)}

              <div className="dkgv-section-title"><i className="bi bi-receipt" /><span>Mã số thuế</span></div>
              <div className="dkgv-form-group">
                <label className="dkgv-form-label">Loại đối tượng nộp thuế <span className="text-danger">*</span></label>
                <select
                  className={`dkgv-form-control ${errors.loaiDoiTuongThue ? 'is-invalid' : ''}`}
                  value={form.loaiDoiTuongThue}
                  onChange={(e) => setField('loaiDoiTuongThue', e.target.value as 'CaNhan' | 'DoanhNghiep' | '')}
                >
                  <option value="">-- Chọn loại đối tượng --</option>
                  <option value="CaNhan">Cá nhân</option>
                  <option value="DoanhNghiep">Doanh nghiệp</option>
                </select>
                {errors.loaiDoiTuongThue && <div className="text-danger small mt-1">{errors.loaiDoiTuongThue}</div>}
              </div>
              <div className="dkgv-form-group">
                <label className="dkgv-form-label">Mã số thuế (nếu có)</label>
                <input className={`dkgv-form-control ${errors.maSoThue ? 'is-invalid' : ''}`} maxLength={13} inputMode="numeric" placeholder="Nhập mã số thuế 10 hoặc 13 chữ số" value={form.maSoThue} onChange={(e) => setField('maSoThue', e.target.value.replace(/\D/g, ''))} />
                {errors.maSoThue && <div className="text-danger small mt-1">{errors.maSoThue}</div>}
              </div>

              <div className="dkgv-info-alert"><i className="bi bi-exclamation-triangle" /><span>Lưu ý: Ảnh chụp cần rõ nét, không bị lóa sáng, không mất góc và còn trong thời hạn sử dụng.</span></div>

              <div className="dkgv-footer">
                <button className="dkgv-btn-back" type="button" onClick={() => setStep(1)}><i className="bi bi-arrow-left" /> Quay lại</button>
                <button className="dkgv-btn-next brown" type="button" onClick={goNext}>Tiếp tục <i className="bi bi-arrow-right" /></button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="dkgv-payment-title">Phương thức thanh toán</h2>
              <p className="dkgv-page-subtitle" style={{ marginTop: 6 }}>Chọn cách bạn muốn nhận thu nhập từ các khóa học và dịch vụ hướng dẫn.</p>

              <div className="dkgv-payment-methods">
                <div className={`dkgv-method-card ${paymentMethod === 'BANK' ? 'active' : ''}`} onClick={() => setPaymentMethod('BANK')} role="button" tabIndex={0}>
                  <div className="dkgv-method-icon"><i className="bi bi-bank" /></div>
                  <div className="dkgv-method-title">Chuyển khoản ngân hàng</div>
                  <div className="dkgv-method-desc">Nội địa (Việt Nam)</div>
                </div>
                <div className={`dkgv-method-card ${paymentMethod === 'PAYPAL' ? 'active' : ''}`} onClick={() => setPaymentMethod('PAYPAL')} role="button" tabIndex={0}>
                  <div className="dkgv-method-icon"><i className="bi bi-cash-coin" /></div>
                  <div className="dkgv-method-title">PayPal</div>
                  <div className="dkgv-method-desc">Quốc tế</div>
                </div>
                <div className={`dkgv-method-card ${paymentMethod === 'PAYONEER' ? 'active' : ''}`} onClick={() => setPaymentMethod('PAYONEER')} role="button" tabIndex={0}>
                  <div className="dkgv-method-icon"><i className="bi bi-wallet2" /></div>
                  <div className="dkgv-method-title">Payoneer</div>
                  <div className="dkgv-method-desc">Đối tác toàn cầu</div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="dkgv-form-group">
                    <label className="dkgv-form-label">Tên ngân hàng</label>
                    <div className="dkgv-bank-select" ref={bankBoxRef}>
                      <input className={`dkgv-form-control ${errors.tenNganHang ? 'is-invalid' : ''}`} placeholder="Tìm ngân hàng" value={bankKeyword} onFocus={() => setIsBankDropdownOpen(true)} onChange={(e) => handleBankSearch(e.target.value)} autoComplete="off" />
                      {isBankDropdownOpen && (
                        <div className="dkgv-bank-dropdown">
                          {filteredBanks.length > 0 ? filteredBanks.map((bank) => (
                            <button key={bank.ma} type="button" className={`dkgv-bank-option ${form.tenNganHang === bank.tenHienThi ? 'active' : ''}`} onClick={() => selectBank(bank.tenHienThi)}>
                              <span>{bank.tenHienThi}</span>
                              <small>{bank.ma}</small>
                            </button>
                          )) : <div className="dkgv-bank-empty">Không tìm thấy ngân hàng phù hợp.</div>}
                        </div>
                      )}
                      <div className="dkgv-selected-bank">Đã chọn: {form.tenNganHang || 'Chưa chọn ngân hàng'}</div>
                    </div>
                    {errors.tenNganHang && <div className="text-danger small mt-1">{errors.tenNganHang}</div>}
                  </div>
                </div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Chi nhánh</label><input className="dkgv-form-control" placeholder="Ví dụ: Chi nhánh Ba Đình" maxLength={100} /></div></div>
                <div className="col-md-6">
                  <div className="dkgv-form-group">
                    <label className="dkgv-form-label">Số tài khoản {statusBadge(verification.bankStatus, 'bank')}</label>
                    <div className="dkgv-inline-verify">
                      <input className={`dkgv-form-control ${errors.soTaiKhoanNhanTien ? 'is-invalid' : ''}`} maxLength={20} inputMode="numeric" placeholder="Nhập số tài khoản của bạn" value={form.soTaiKhoanNhanTien} onChange={(e) => setField('soTaiKhoanNhanTien', e.target.value.replace(/\D/g, ''))} />
                      <button className="dkgv-btn-brown" type="button" disabled={isVerifying.bank || verification.bankStatus === 'verified'} onClick={handleVerifyBankAccount}>{isVerifying.bank ? 'Đang xác nhận...' : 'Xác nhận TK'}</button>
                    </div>
                    {errors.soTaiKhoanNhanTien && <div className="text-danger small mt-1">{errors.soTaiKhoanNhanTien}</div>}
                  </div>
                </div>
                <div className="col-md-6"><div className="dkgv-form-group"><label className="dkgv-form-label">Tên chủ tài khoản</label><input className={`dkgv-form-control ${errors.tenChuTaiKhoan ? 'is-invalid' : ''}`} placeholder="Nhập đúng tên chủ TK trên app ngân hàng" maxLength={150} value={form.tenChuTaiKhoan} onChange={(e) => setField('tenChuTaiKhoan', e.target.value.toUpperCase())} />{errors.tenChuTaiKhoan && <div className="text-danger small mt-1">{errors.tenChuTaiKhoan}</div>}</div></div>
                <div className="col-12">{renderInfoBox(verification.bankInfo)}</div>
              </div>

              <div className="dkgv-security-note"><i className="bi bi-lock-fill" /><span>Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối.</span></div>

              <div className="dkgv-footer">
                <button className="dkgv-btn-back" type="button" onClick={() => setStep(2)}><i className="bi bi-arrow-left" /> Quay lại</button>
                <button className="dkgv-btn-next brown" type="button" disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? 'Đang gửi...' : 'Hoàn tất đăng ký'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


