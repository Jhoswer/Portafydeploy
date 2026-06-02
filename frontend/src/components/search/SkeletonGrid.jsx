export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="profile-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" aria-hidden>
          <div className="skeleton-card__banner" />
          <div className="skeleton-card__body">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="skel" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="skel" style={{ height: 12, width: "60%" }} />
                <div className="skel" style={{ height: 10, width: "40%" }} />
              </div>
            </div>
            <div className="skel" style={{ height: 10, width: "45%" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skel" style={{ height: 10, width: "100%" }} />
              <div className="skel" style={{ height: 10, width: "80%" }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div className="skel" style={{ height: 20, width: 48 }} />
              <div className="skel" style={{ height: 20, width: 64 }} />
              <div className="skel" style={{ height: 20, width: 40 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="skel" style={{ height: 32 }} />
              <div className="skel" style={{ height: 32 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}