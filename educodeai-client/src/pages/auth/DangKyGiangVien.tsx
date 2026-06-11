import { useState } from 'react';
import './DangKyGiangVien.css';

const DangKyGiangVien = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [docType, setDocType] = useState<'cccd' | 'passport'>('cccd');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'paypal' | 'payoneer'>('bank');

  // Step names
  const steps = [
    { id: 1, name: 'Hồ sơ chuyên môn' },
    { id: 2, name: 'Xác minh danh tính' },
    { id: 3, name: 'Thanh toán' }
  ];

  return (
    <div className="dkgv-container">
      
      {step === 1 && (
        <div style={{ maxWidth: '860px', margin: '0 auto 20px auto' }}>
          <h1 className="fw-bold mb-2" style={{ color: '#1c1e21', fontSize: '32px' }}>Trở thành Giảng viên EducodeAI</h1>
          <p style={{ color: '#65676b', fontSize: '16px' }}>Chia sẻ kiến thức và nhận thu nhập thụ động</p>
        </div>
      )}

      {step === 2 && (
        <div className="dkgv-progress-alt">
          <div className="dkgv-progress-line">
            <div className="dkgv-progress-line-fill" style={{ width: '50%' }}></div>
          </div>
          {steps.map((s) => (
            <div key={s.id} className={`dkgv-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
              <div className="dkgv-step-circle">
                {step > s.id || (s.id === 1 && step === 2) ? <i className="fas fa-check"></i> : s.id}
              </div>
              <div className="dkgv-step-label">{s.name + (s.id === 2 ? ' (KYC)' : '')}</div>
            </div>
          ))}
        </div>
      )}

      <div className="dkgv-main-card animate__animated animate__fadeIn">
        
        {/* Header with Progress Bar for Step 1 & 3 */}
        {step !== 2 ? (
          <div className="dkgv-progress-header">
            <div className="dkgv-progress-bar">
              <div className="dkgv-progress-line">
                <div 
                  className="dkgv-progress-line-fill" 
                  style={{ width: step === 1 ? '0%' : '100%' }}
                ></div>
              </div>
              
              {steps.map((s) => (
                <div key={s.id} className={`dkgv-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
                  <div className="dkgv-step-circle">
                    {step > s.id ? <i className="fas fa-check"></i> : s.id}
                  </div>
                  <div className="dkgv-step-label">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="dkgv-progress-header step2-header">
            <h2 className="fw-bold mb-2 text-white">Xác minh danh tính</h2>
            <p className="mb-0 text-light opacity-75">Để đảm bảo tính bảo mật và chuyên nghiệp, vui lòng hoàn tất quy trình KYC bên dưới.</p>
          </div>
        )}

        <div className="dkgv-body">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate__animated animate__fadeInRight">
              
              <div className="dkgv-avatar-upload">
                <div className="dkgv-avatar-circle">
                  <i className="fas fa-camera-retro dkgv-avatar-icon"></i>
                  <span style={{ position: 'absolute', fontSize: '18px', color: '#8a8d91', marginLeft: '15px', marginTop: '-15px' }}>+</span>
                  <div className="dkgv-avatar-edit">
                    <i className="fas fa-pen"></i>
                  </div>
                </div>
                <div className="dkgv-avatar-info">
                  <h5>Ảnh đại diện</h5>
                  <p>Sử dụng ảnh chân dung rõ nét. Định dạng JPG, PNG, tối đa 5MB.</p>
                  <button className="dkgv-btn-outline">Tải ảnh lên</button>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="dkgv-form-group">
                    <label className="dkgv-form-label">Họ và tên</label>
                    <input type="text" className="dkgv-form-control" placeholder="Nhập họ và tên đầy đủ" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="dkgv-form-group">
                    <label className="dkgv-form-label">Lĩnh vực giảng dạy chính</label>
                    <select className="dkgv-form-control text-muted">
                      <option>Chọn lĩnh vực</option>
                      <option>Công nghệ thông tin</option>
                      <option>Thiết kế đồ họa</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="dkgv-form-group">
                    <label className="dkgv-form-label">Tiểu sử ngắn</label>
                    <textarea 
                      className="dkgv-form-control" 
                      rows={4} 
                      placeholder="Giới thiệu ngắn về kinh nghiệm và chuyên môn của bạn..."
                    ></textarea>
                    <div className="dkgv-char-count">0 / 500 ký tự</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="dkgv-form-group mb-0">
                    <label className="dkgv-form-label"><i className="fas fa-link me-1"></i> Link LinkedIn</label>
                    <input type="text" className="dkgv-form-control" placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="dkgv-form-group mb-0">
                    <label className="dkgv-form-label"><i className="fas fa-globe me-1"></i> Portfolio / Website</label>
                    <input type="text" className="dkgv-form-control" placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>

              <div className="dkgv-footer">
                <button className="dkgv-btn-back">Quay lại</button>
                <button className="dkgv-btn-next" onClick={() => setStep(2)}>Tiếp tục</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate__animated animate__fadeInRight">
              
              <div className="dkgv-section-title">
                <i className="fas fa-shield-alt"></i> Xác minh số điện thoại
              </div>
              
              <div className="dkgv-form-group mb-4">
                <label className="dkgv-form-label">Số điện thoại di động</label>
                <div className="dkgv-phone-input-wrap">
                  <div className="dkgv-input-icon">
                    <input type="text" className="dkgv-form-control" placeholder="090 123 4567" />
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <button className="dkgv-btn-brown">Gửi mã OTP</button>
                </div>
                <div className="dkgv-note-text">Mã xác nhận sẽ được gửi qua SMS. Vui lòng kiểm tra điện thoại của bạn.</div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '40px 0' }}></div>

              <div className="dkgv-section-title">
                <i className="fas fa-id-card"></i> Tải lên giấy tờ tùy thân
              </div>

              <div className="dkgv-doc-type-toggle">
                <button 
                  className={`dkgv-doc-btn ${docType === 'cccd' ? 'active' : ''}`}
                  onClick={() => setDocType('cccd')}
                >
                  {docType === 'cccd' && <i className="fas fa-check-circle"></i>} CCCD / CMND
                </button>
                <button 
                  className={`dkgv-doc-btn ${docType === 'passport' ? 'active' : ''}`}
                  onClick={() => setDocType('passport')}
                >
                  Hộ chiếu (Passport)
                </button>
              </div>

              <div className="dkgv-upload-grid">
                <div className="dkgv-upload-box-wrap">
                  <div className="dkgv-upload-box-label">Mặt trước giấy tờ</div>
                  <div className="dkgv-upload-box">
                    <i className="fas fa-camera-retro dkgv-upload-box-icon"></i>
                    <span style={{ position: 'absolute', fontSize: '16px', color: '#b75d16', marginLeft: '10px', marginTop: '-10px' }}>+</span>
                    <div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div>
                    <div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div>
                  </div>
                </div>
                <div className="dkgv-upload-box-wrap">
                  <div className="dkgv-upload-box-label">Mặt sau giấy tờ</div>
                  <div className="dkgv-upload-box">
                    <i className="fas fa-camera-retro dkgv-upload-box-icon"></i>
                    <span style={{ position: 'absolute', fontSize: '16px', color: '#b75d16', marginLeft: '10px', marginTop: '-10px' }}>+</span>
                    <div className="dkgv-upload-box-title">Kéo thả hoặc Nhấp để tải lên</div>
                    <div className="dkgv-upload-box-desc">Hỗ trợ JPG, PNG (Tối đa 5MB)</div>
                  </div>
                </div>
              </div>

              <div className="dkgv-info-alert">
                <i className="fas fa-info-circle"></i>
                Lưu ý: Ảnh chụp cần rõ nét, không bị lóa sáng, không mất góc và còn trong thời hạn sử dụng.
              </div>

              <div className="dkgv-footer">
                <button className="dkgv-btn-back" onClick={() => setStep(1)}>
                  <i className="fas fa-arrow-left"></i> Quay lại
                </button>
                <button className="dkgv-btn-next brown" onClick={() => setStep(3)}>
                  Tiếp tục <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate__animated animate__fadeInRight">
              
              <h2 className="dkgv-payment-title">Phương thức thanh toán</h2>
              <p className="dkgv-page-subtitle mb-4">Chọn cách bạn muốn nhận thu nhập từ các khóa học và dịch vụ hướng dẫn.</p>

              <div className="dkgv-payment-methods">
                <div 
                  className={`dkgv-method-card ${paymentMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <i className="fas fa-university dkgv-method-icon"></i>
                  <div className="dkgv-method-title">Chuyển khoản ngân hàng</div>
                  <div className="dkgv-method-desc">Nội địa (Việt Nam)</div>
                </div>
                <div 
                  className={`dkgv-method-card ${paymentMethod === 'paypal' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <i className="fab fa-cc-paypal dkgv-method-icon"></i>
                  <div className="dkgv-method-title">PayPal</div>
                  <div className="dkgv-method-desc">Quốc tế</div>
                </div>
                <div 
                  className={`dkgv-method-card ${paymentMethod === 'payoneer' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('payoneer')}
                >
                  <i className="fas fa-wallet dkgv-method-icon"></i>
                  <div className="dkgv-method-title">Payoneer</div>
                  <div className="dkgv-method-desc">Đối tác toàn cầu</div>
                </div>
              </div>

              {paymentMethod === 'bank' && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="dkgv-form-group">
                      <label className="dkgv-form-label">Tên ngân hàng</label>
                      <select className="dkgv-form-control">
                        <option>Vietcombank</option>
                        <option>Techcombank</option>
                        <option>MB Bank</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dkgv-form-group">
                      <label className="dkgv-form-label">Chi nhánh</label>
                      <input type="text" className="dkgv-form-control" placeholder="Ví dụ: Chi nhánh Ba Đình" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dkgv-form-group">
                      <label className="dkgv-form-label">Số tài khoản</label>
                      <input type="text" className="dkgv-form-control" placeholder="Nhập số tài khoản của bạn" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dkgv-form-group">
                      <label className="dkgv-form-label">Tên chủ tài khoản</label>
                      <input type="text" className="dkgv-form-control" placeholder="Viết hoa không dấu" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="dkgv-form-group mb-0">
                      <label className="dkgv-form-label">
                        Mã số thuế <span className="dkgv-optional-text">(Tùy chọn)</span>
                      </label>
                      <input type="text" className="dkgv-form-control" placeholder="Dùng để xuất hóa đơn và khấu trừ thuế" />
                    </div>
                  </div>
                </div>
              )}

              <div className="dkgv-footer" style={{ borderTop: 'none', paddingTop: '10px' }}>
                <button className="dkgv-btn-back" onClick={() => setStep(2)}>
                  <i className="fas fa-arrow-left"></i> Quay lại
                </button>
                <button className="dkgv-btn-next brown" onClick={() => alert('Hoàn tất đăng ký!')}>
                  Hoàn tất đăng ký
                </button>
              </div>
              
              <div className="dkgv-security-note">
                <i className="fas fa-lock"></i> Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DangKyGiangVien;
