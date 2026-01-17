import { Outlet } from 'react-router-dom';

export default function LayoutHocVien() {
  return (
    <div className="layout-hoc-vien">
      <header className="header-hoc-vien">
        <h1>Học Viên</h1>
      </header>
      <main className="main-hoc-vien">
        <Outlet />
      </main>
    </div>
  );
}
