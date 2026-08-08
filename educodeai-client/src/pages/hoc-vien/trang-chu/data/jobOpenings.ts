export interface JobOpening {
    id: string;
    title: string;
    company: string;
    location: string;
    level: string;
    skills: string[];
    summary: string;
    status: string;
    accent: string;
}

// Dữ liệu mẫu phục vụ demo; sau này có thể thay bằng API tin tuyển dụng.
export const jobOpenings: JobOpening[] = [
    {
        id: 'dak-lak-backend-junior',
        title: 'Junior Backend Developer',
        company: 'EduTech Tây Nguyên',
        location: 'Buôn Ma Thuột, Đắk Lắk',
        level: 'Junior',
        skills: ['C#', '.NET', 'SQL Server'],
        summary: 'Tham gia phát triển API và các sản phẩm giáo dục số cho người học tại Tây Nguyên.',
        status: 'Đang tuyển',
        accent: '#2563eb'
    },
    {
        id: 'dak-lak-frontend-fresher',
        title: 'Frontend Developer',
        company: 'Đắk Lắk Digital',
        location: 'Buôn Ma Thuột, Đắk Lắk',
        level: 'Fresher',
        skills: ['ReactJS', 'TypeScript', 'UI/UX'],
        summary: 'Xây dựng giao diện web hiện đại và tối ưu trải nghiệm khách hàng trên nền tảng số.',
        status: 'Đang tuyển',
        accent: '#7c3aed'
    },
    {
        id: 'remote-data-fresher',
        title: 'Data Analyst',
        company: 'Tây Nguyên Innovation Hub',
        location: 'Đắk Lắk · Hybrid',
        level: 'Fresher',
        skills: ['Python', 'SQL', 'Power BI'],
        summary: 'Phân tích dữ liệu vận hành và chuyển hóa dữ liệu thành quyết định kinh doanh.',
        status: 'Mới đăng',
        accent: '#059669'
    }
];
