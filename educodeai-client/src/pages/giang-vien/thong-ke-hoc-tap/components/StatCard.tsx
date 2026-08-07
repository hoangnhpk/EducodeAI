const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  gradient: string;
}) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div>
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        <small className="stat-subtitle">{subtitle}</small>
      </div>

      <div className={`stat-icon ${gradient}`}>
        <i className={`fas ${icon}`} aria-hidden="true" />
      </div>
    </div>
  </div>
);

export default StatCard;
