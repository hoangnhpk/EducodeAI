export default function StatusSinhAI() {
  return (
    <div className="btth-status-block" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      background: 'var(--success-soft)',
      border: '1px solid var(--success)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '24px',
      animation: 'fadeInDown 0.4s ease'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--success)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-white)',
        fontSize: '20px'
      }}>
        <i className="bi bi-check-lg" aria-hidden="true" />
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--success-strong)', fontWeight: 700 }}>AI đã soạn xong bài tập!</h4>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--success-strong)' }}>Bạn có thể kiểm tra, chỉnh sửa nội dung và các test case bên dưới trước khi bấm lưu.</p>
      </div>
    </div>
  );
}
