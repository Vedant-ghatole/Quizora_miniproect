export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled, onClick, type = 'button', fullWidth = false, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <span className="spinner" style={{ width: 16, height: 16 }} />
          Loading...
        </span>
      ) : children}
    </button>
  )
}
