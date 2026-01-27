export default function ReviewStats() {
const stats = [
{ label: "Tổng review", value: 1240 },
{ label: "5 sao", value: 820 },
{ label: "Chờ duyệt", value: 45 },
{ label: "Báo cáo vi phạm", value: 12 },
];


return (
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
{stats.map((s) => (
<div key={s.label} className="bg-white rounded-2xl shadow p-4">
<p className="text-sm text-gray-500">{s.label}</p>
<p className="text-2xl font-semibold">{s.value}</p>
</div>
))}
</div>
);
}