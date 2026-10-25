export default function Pagination({ page, totalPages, total, onChange }) {
  return (
    <div className="pagination">
      <button type="button" className="button ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <span className="muted">
        Page {totalPages === 0 ? 0 : page} of {totalPages} · {total} {total === 1 ? 'movie' : 'movies'}
      </span>
      <button type="button" className="button ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </div>
  );
}
