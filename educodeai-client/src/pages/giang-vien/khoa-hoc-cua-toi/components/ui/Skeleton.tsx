import React from 'react';

// Generic skeleton line / block
export const SkeletonLine: React.FC<{ width?: string; height?: number }> = ({
  width = '100%',
  height = 14,
}) => (
  <div
    className="khm-skeleton"
    style={{ width, height, borderRadius: 6, marginBottom: 6 }}
  />
);

export const SkeletonBlock: React.FC<{
  width?: string | number;
  height?: string | number;
  radius?: number;
}> = ({ width = '100%', height = 140, radius = 12 }) => (
  <div
    className="khm-skeleton"
    style={{ width, height, borderRadius: radius }}
  />
);

// Course card skeleton
export const CourseCardSkeleton: React.FC = () => (
  <div className="khm-skeleton-card">
    <SkeletonBlock height={180} radius={0} />
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <SkeletonLine width="60px" height={20} />
        <SkeletonLine width="50px" height={20} />
      </div>
      <SkeletonLine width="90%" height={18} />
      <SkeletonLine width="60%" height={18} />
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <SkeletonLine width="80px" height={32} />
        <SkeletonLine width="80px" height={32} />
        <SkeletonLine width="80px" height={32} />
      </div>
    </div>
  </div>
);

// List item skeleton
export const ListItemSkeleton: React.FC = () => (
  <div
    className="khm-skeleton-card"
    style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}
  >
    <SkeletonBlock width={24} height={24} radius={6} />
    <SkeletonBlock width={28} height={28} radius={6} />
    <div style={{ flex: 1 }}>
      <SkeletonLine width="65%" height={14} />
      <SkeletonLine width="40%" height={10} />
    </div>
    <SkeletonBlock width={60} height={28} radius={6} />
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC = () => (
  <div>
    {[1, 2, 3].map(i => (
      <div key={i} className="khm-form-section" style={{ marginBottom: 16 }}>
        <div className="khm-form-section-header">
          <SkeletonBlock width={32} height={32} radius={8} />
          <SkeletonLine width="140px" height={16} />
        </div>
        <div className="khm-form-section-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1, 2, 3, 4].map(j => (
              <div key={j}>
                <SkeletonLine width="80px" height={12} />
                <SkeletonBlock width="100%" height={40} radius={8} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);
