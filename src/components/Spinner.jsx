export default function Spinner({ size = 'medium' }) {
  const sizes = { small: 20, medium: 36, large: 52 }
  const px = sizes[size] || 36

  return (
    <div
      className="spinner"
      style={{ width: px, height: px }}
      role="status"
      aria-label="Loading"
    />
  )
}
