import ReviewFilters from "./components/ReviewFilters";
import ReviewTable from "./components/ReviewTable";
import ReviewStats from "./components/ReviewStats";
import "./components/Review.css";


export default function QuanLyReview() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Quản Lý Bình Luận & Review</h1>
            <div className="review-stats">
                <div className="review-stat-card"><ReviewStats /></div>
            </div>

            <div className="review-filters"><ReviewFilters /></div>

            <table className="review-table"><ReviewTable /></table>
        </div>
    );
}
