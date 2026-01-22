const KhoaHocCuaToi = () => {
  // Mock data – sau này thay bằng API
  const courses = [
    {
      id: 1,
      title: "React Cơ Bản",
      progress: 45,
      icon: "⚛️",
    },
    {
      id: 2,
      title: "HTML & CSS Nâng Cao",
      progress: 80,
      icon: "🎨",
    },
    {
      id: 3,
      title: "JavaScript ES6+",
      progress: 60,
      icon: "⚡",
    },
  ];

  if (courses.length === 0) {
    return (
      <div className="khoa-hoc-empty">
        <p>Bạn chưa tham gia khóa học nào</p>
        <button className="btn-primary">Khám phá khóa học</button>
      </div>
    );
  }

  return (
    <div className="khoa-hoc-container">
      <div className="khoa-hoc-header">
        <h2>📚 Khóa Học Của Tôi</h2>
        <p>Danh sách các khóa học bạn đang tham gia</p>
      </div>

      <div className="khoa-hoc-grid">
        {courses.map((course) => (
          <div key={course.id} className="khoa-hoc-card">
            <div className="khoa-hoc-icon">{course.icon}</div>

            <div className="khoa-hoc-info">
              <h3>{course.title}</h3>

              <div className="khoa-hoc-progress">
                <span>{course.progress}% hoàn thành</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <button className="khoa-hoc-btn">Tiếp tục học</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KhoaHocCuaToi;
