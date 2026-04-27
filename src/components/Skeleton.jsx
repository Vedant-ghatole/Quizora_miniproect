export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', marginBottom = '0', className = '' }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        marginBottom,
      }}
    />
  )
}
