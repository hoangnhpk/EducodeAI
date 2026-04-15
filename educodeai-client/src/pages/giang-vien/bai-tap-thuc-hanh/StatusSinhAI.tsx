export default function StatusSinhAI() {
  return (
    <div className="btth-status-block" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      background: '#ECFDF5',
      border: '1px solid #34D399',
      borderRadius: '12px',
      marginBottom: '24px',
      animation: 'fadeInDown 0.4s ease'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#10B981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px'
      }}>
        <i className="bi bi-check-lg" />
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '15px', color: '#064E3B', fontWeight: 700 }}>AI đã soạn xong bài tập!</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>Bạn có thể kiểm tra, chỉnh sửa nội dung và các test case bên dưới trước khi bấm lưu.</p>
      </div>
    </div>
  );
}
