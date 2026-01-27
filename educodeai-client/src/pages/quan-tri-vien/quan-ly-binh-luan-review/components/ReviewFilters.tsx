export default function ReviewFilters() {
return (
<div className="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-4">
<input
type="text"
placeholder="Tìm theo khóa học / học viên"
className="border rounded-xl px-4 py-2 w-64"
/>
<select className="border rounded-xl px-4 py-2">
<option>Tất cả sao</option>
<option>5 sao</option>
<option>4 sao</option>
<option>3 sao</option>
<option>2 sao</option>
<option>1 sao</option>
</select>
<select className="border rounded-xl px-4 py-2">
<option>Tất cả trạng thái</option>
<option>Đã duyệt</option>
<option>Chờ duyệt</option>
<option>Bị ẩn</option>
</select>
<button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
Lọc
</button>
</div>
);
}