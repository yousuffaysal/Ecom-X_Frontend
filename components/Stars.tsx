export default function Stars({ rating, max = 5, size = '0.8rem' }: { rating: number; max?: number; size?: string }) {
  return (
    <div className="stars-row">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? 'var(--red)' : 'var(--border)', fontSize: size }}>★</span>
      ))}
    </div>
  )
}
