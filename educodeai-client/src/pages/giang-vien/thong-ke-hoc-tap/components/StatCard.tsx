const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
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
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default StatCard;
