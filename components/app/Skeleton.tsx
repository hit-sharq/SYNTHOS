export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        background: "var(--surface-2)",
        borderRadius: 4,
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

export function StatSkeleton() {
  return (
    <div className="skeleton-stat" style={{ padding: 20, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 4 }}>
      <Skeleton style={{ width: 60, height: 24, marginBottom: 8 }} />
      <Skeleton style={{ width: 100, height: 12, opacity: 0.5 }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-thead" style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--line)", marginBottom: 12 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`col-${i}`} style={{ width: 120, height: 14, flex: 1 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`row-${i}`} style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={`cell-${i}-${j}`} style={{ width: 100, height: 12, flex: 1, opacity: 0.5 + (j * 0.1) }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-cards" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel-soft" style={{ padding: 16 }}>
          <Skeleton style={{ width: "60%", height: 16, marginBottom: 8 }} />
          <Skeleton style={{ width: "100%", height: 12, marginBottom: 6 }} />
          <Skeleton style={{ width: "80%", height: 12, opacity: 0.7 }} />
        </div>
      ))}
    </div>
  )
}
