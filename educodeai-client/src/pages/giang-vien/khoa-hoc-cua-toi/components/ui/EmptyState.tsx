import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, action }) => (
  <div className="khm-empty">
    <div className="khm-empty-icon">{icon}</div>
    <p className="khm-empty-title">{title}</p>
    {description && <p className="khm-empty-desc">{description}</p>}
    {action && <div style={{ marginTop: 4 }}>{action}</div>}
  </div>
);

export default EmptyState;
