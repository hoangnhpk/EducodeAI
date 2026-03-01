// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { FaEnvelope, FaInfoCircle, FaArrowLeft, FaStar } from 'react-icons/fa';
// import { KhoaHocService } from '@/services/khoa-hoc.service';

// interface HocVienTrongLopDTO {
//     maNguoiDung: number;
//     hoTen: string;
//     email: string;
//     anhDaiDien?: string;
//     ngayDangKy: string;
//     tienDo: number;
//     diemTrungBinh: number;
// }

// interface ChiTietKhoaHocDTO {
//     maKhoaHoc: number;
//     tenKhoaHoc: string;
//     siSo: string;
//     tiLeHoanThanh: number;
//     baiTapChuaCham: number;
//     diemDanhGia: number;
//     danhSachHocVien: HocVienTrongLopDTO[];
// }

// interface Props { idKhoaHoc: number; onQuayLai: () => void; }

// const ChiTietKhoaHoc: React.FC<Props> = ({ idKhoaHoc, onQuayLai }) => {
//     const { data: detail, isLoading, error } = useQuery<ChiTietKhoaHocDTO>({
//         queryKey: ['chi-tiet-khoa-hoc', idKhoaHoc],
//         queryFn: () => KhoaHocService.getChiTietKhoaHoc(idKhoaHoc)
//     });

//     if (isLoading) return <div className="course-container">Đang tải dữ liệu học viên...</div>;
//     if (error) return <div className="course-container">Lỗi khi tải chi tiết khóa học.</div>;

//     return (
//         <div className="course-container">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
//                 <div>
//                     <h2 className="section-title">Chi tiết khoá học</h2>
//                     <p>Lớp: <b>{detail?.tenKhoaHoc}</b></p>
//                 </div>
//             </div>

//             {/* Thống kê từ dữ liệu API */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
//                 <div className="stat-card">
//                     <small style={{ color: '#888', fontWeight: 'bold' }}>SĨ SỐ</small>
//                     <div className="stat-value">{detail?.siSo}</div>
//                 </div>
//                 <div className="stat-card">
//                     <small style={{ color: '#888', fontWeight: 'bold' }}>TỈ LỆ HOÀN THÀNH</small>
//                     <div className="stat-value" style={{ color: '#198754' }}>{detail?.tiLeHoanThanh}%</div>
//                 </div>
//                 <div className="stat-card">
//                     <small style={{ color: '#888', fontWeight: 'bold' }}>BÀI TẬP CHƯA CHẤM</small>
//                     <div className="stat-value" style={{ color: '#dc3545' }}>{detail?.baiTapChuaCham}</div>
//                 </div>
//                 <div className="stat-card">
//                     <small style={{ color: '#888', fontWeight: 'bold' }}>ĐÁNH GIÁ</small>
//                     <div className="stat-value" style={{ color: '#ffc107' }}>
//                         {detail?.diemDanhGia} <FaStar style={{ fontSize: '18px' }} />
//                     </div>
//                 </div>
//             </div>

//             <div className="table-responsive">
//                 <table className="table">
//                     <thead>
//                         <tr>
//                             <th>Học viên</th>
//                             <th>Ngày đăng ký</th>
//                             <th>Tiến độ</th>
//                             <th>Điểm TB</th>
//                             <th>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {/* MAP DỮ LIỆU TỪ API VÀO BẢNG */}
//                         {detail?.danhSachHocVien?.map((hv: any) => (
//                             <tr key={hv.maNguoiDung}>
//                                 <td>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                         <img src={hv.anhDaiDien || "https://via.placeholder.com/40"} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
//                                         <div>
//                                             <div style={{ fontWeight: 'bold' }}>{hv.hoTen}</div>
//                                             <small style={{ color: '#888' }}>{hv.email}</small>
//                                         </div>
//                                     </div>
//                                 </td>
//                                 <td>{new Date(hv.ngayDangKy).toLocaleDateString('vi-VN')}</td>
//                                 <td>
//                                     <div style={{ width: '100px', height: '6px', background: '#eee', borderRadius: '10px' }}>
//                                         <div style={{ width: `${hv.tienDo}%`, background: '#fb873f', height: '100%' }}></div>
//                                     </div>
//                                     <small>{hv.tienDo}%</small>
//                                 </td>
//                                 <td><b>{hv.diemTrungBinh}</b></td>
//                                 <td>
//                                     <FaEnvelope style={{ color: '#fb873f', marginRight: '10px', cursor: 'pointer' }} />
//                                     <FaInfoCircle style={{ color: '#fb873f', cursor: 'pointer' }} />
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             <div style={{ textAlign: 'center', marginTop: '30px' }}>
//                 <button className="btn-orange" style={{ margin: '0 auto', background: '#ff8a44' }} onClick={onQuayLai}>
//                     <FaArrowLeft /> Quay lại
//                 </button>
//             </div>
//         </div>
//     );
// };
// export default ChiTietKhoaHoc;