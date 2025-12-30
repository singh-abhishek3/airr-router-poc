export const dynamic = 'force-dynamic';
import RunManualTaskPopover from './RunManualTaskPopover';

type Stats = {
  ok: boolean;
  total: number;
  successRate: number;
  totalCostUsd: number;
  avgCostUsd: number;
  modelUsage: Record<string, number>;
};

type TaskItem = {
  id: string;
  task_type: string;
  priority: string;
  cost_target: string;
  input_chars: number;
  created_at: string;
  routing_decisions: Array<{
    model_chosen: string;
    estimated_cost_usd: number;
    latency_ms: number | null;
    success: boolean;
    created_at: string;
  }>;
  task_outputs: Array<{
    output_text: string;
    created_at: string;
  }>;
};

async function getStats(): Promise<Stats> {
  const res = await fetch('http://localhost:3000/api/stats', {
    cache: 'no-store',
  });
  return res.json();
}

async function getTasks(): Promise<{ ok: boolean; items: TaskItem[] }> {
  const res = await fetch('http://localhost:3000/api/tasks', {
    cache: 'no-store',
  });
  return res.json();
}

function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

export default async function DashboardPage() {
  const [stats, tasksRes] = await Promise.all([getStats(), getTasks()]);
  const tasks = tasksRes.items ?? [];

  return (
    <main
      style={{
        padding: 24,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
      }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        Airr Router POC — Dashboard
      </h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Minimal UI over <code>/api/execute</code>, <code>/api/tasks</code>,{' '}
        <code>/api/stats</code>
      </p>

      {/* Stats */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 12,
          marginTop: 16,
        }}>
        <Card title='Executions' value={String(stats.total ?? 0)} />
        <Card title='Success rate' value={pct(stats.successRate ?? 0)} />
        <Card
          title='Total cost (USD)'
          value={(stats.totalCostUsd ?? 0).toFixed(4)}
        />
        <Card
          title='Avg cost (USD)'
          value={(stats.avgCostUsd ?? 0).toFixed(4)}
        />
      </section>

      {/* Model usage */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Model usage</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {stats.modelUsage ? (
            Object.entries(stats.modelUsage).map(([model, count]) => (
              <Pill key={model} label={`${model}: ${count}`} />
            ))
          ) : (
            <span style={{ opacity: 0.7 }}>No data yet</span>
          )}
        </div>
      </section>

      {/* Actions */}
      {/* <section
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
        <form action='/dashboard/run' method='post'>
          <button style={buttonStyle}>Run sample task</button>
        </form>
        <a
          href='/dashboard'
          style={{
            ...buttonStyle,
            textDecoration: 'none',
            display: 'inline-block',
          }}>
          Refresh
        </a>
      </section> */}
      <section style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <RunManualTaskPopover />
        <a href='/dashboard' style={{ ...buttonStyle, textDecoration: 'none' }}>
          Refresh
        </a>
      </section>

      {/* Recent tasks */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent tasks</h2>
        <div
          style={{
            overflowX: 'auto',
            border: '1px solid #ddd',
            borderRadius: 10,
          }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f7f7f7' }}>
                <Th>Created</Th>
                <Th>Task</Th>
                <Th>Priority</Th>
                <Th>Target</Th>
                <Th>Model</Th>
                <Th>Cost</Th>
                <Th>Output</Th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <Td style={{ padding: 16, opacity: 0.7 }} colSpan={7}>
                    No tasks yet. Run sample task.
                  </Td>
                </tr>
              ) : (
                tasks.map((t) => {
                  const rd = t.routing_decisions?.[0];
                  const out = t.task_outputs?.[0];
                  return (
                    <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
                      <Td>{new Date(t.created_at).toLocaleString()}</Td>
                      <Td>
                        <code>{t.task_type}</code>
                      </Td>
                      <Td>{t.priority}</Td>
                      <Td>{t.cost_target}</Td>
                      <Td>{rd?.model_chosen ?? '-'}</Td>
                      <Td>
                        {rd ? Number(rd.estimated_cost_usd).toFixed(4) : '-'}
                      </Td>
                      <Td style={{ maxWidth: 520 }}>
                        <span title={out?.output_text ?? ''}>
                          {out?.output_text ?? '-'}
                        </span>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p style={{ marginTop: 18, opacity: 0.7 }}>
        Tip: output may be truncated intentionally for the summarization mock.
      </p>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span
      style={{
        border: '1px solid #ddd',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 13,
      }}>
      {label}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: 10, fontSize: 13, opacity: 0.8 }}>{children}</th>
  );
}

function Td({
  children,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...rest} style={{ padding: 10, fontSize: 13, ...(rest.style || {}) }}>
      {children}
    </td>
  );
}

const buttonStyle: React.CSSProperties = {
  border: '1px solid #111',
  background: '#111',
  color: '#fff',
  padding: '10px 12px',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 14,
};
