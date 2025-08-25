import React from 'react';

export function PageNavigator({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (fn: (page: number) => number) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '0.75rem',
        marginBottom: '0.75rem',
      }}
    >
      <button
        onClick={() => setPage((page) => Math.max(0, page - 1))}
        disabled={page === 0}
        style={{ marginRight: '1rem', width: '120px', minWidth: '120px' }}
      >
        Previous
      </button>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => setPage((page) => Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        style={{ marginLeft: '1rem', width: '120px', minWidth: '120px' }}
      >
        Next
      </button>
    </div>
  );
}

// Ensure both default and named export are present for compatibility
const _default = PageNavigator;
export default _default;
