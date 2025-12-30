'use client';

import { useState } from 'react';

export default function RunManualTaskPopover() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      task_type: formData.get('task_type'),
      priority: formData.get('priority'),
      cost_target: formData.get('cost_target'),
      input_text: formData.get('input_text'),
    };

    const res = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError('Failed to run task');
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    window.location.reload();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={buttonStyle}>
        Run manual task
      </button>

      {open && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0, color: '#000' }}>Run manual task</h3>

            <form onSubmit={onSubmit}>
              <div style={row}>
                <select name='task_type' required style={{ color: '#000' }}>
                  <option value='' disabled hidden>
                    Select task type
                  </option>
                  <option value='summarization'>summarization</option>
                  <option value='classification'>classification</option>
                  <option value='extraction'>extraction</option>
                  <option value='rewrite'>rewrite</option>
                </select>

                <select name='priority' required style={{ color: '#000' }}>
                  <option value='' disabled hidden>
                    Select priority
                  </option>
                  <option value='low'>low</option>
                  <option value='medium'>medium</option>
                  <option value='high'>high</option>
                </select>

                <select name='cost_target' required style={{ color: '#000' }}>
                  <option value='' disabled hidden>
                    Select cost target
                  </option>
                  <option value='low'>low</option>
                  <option value='balanced'>balanced</option>
                  <option value='high_accuracy'>high_accuracy</option>
                </select>
              </div>

              <textarea
                name='input_text'
                required
                rows={5}
                placeholder='Paste input text here…'
                style={{
                  width: '100%',
                  marginTop: 8,
                  color: '#000',
                  backgroundColor: '#fff',
                  border: '1px solid #000',
                }}
              />

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  type='submit'
                  disabled={loading}
                  style={{
                    color: '#000',
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                  }}>
                  {loading ? 'Running…' : 'Run task'}
                </button>
                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  style={{
                    color: '#000',
                    backgroundColor: '#fff',
                    border: '1px solid #000',
                  }}>
                  Cancel
                </button>
                {error && <span style={{ color: '#000' }}>{error}</span>}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* styles */

const buttonStyle: React.CSSProperties = {
  border: '1px solid #111',
  background: '#111',
  color: '#fff',
  padding: '8px 12px',
  borderRadius: 8,
  cursor: 'pointer',
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const modal: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 16,
  width: 520,
  maxWidth: '90%',
};

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};
