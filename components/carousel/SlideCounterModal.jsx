'use client';

const OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];

export default function SlideCounterModal({ value, onChange, onStart }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>How many slides do you want to create?</h3>
        <div className="counter-grid">
          {OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              className={`counter-btn ${value === count ? 'active' : ''}`}
              onClick={() => onChange(count)}
            >
              {count}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={onStart}>
          Open Builder
        </button>
      </div>
    </div>
  );
}
