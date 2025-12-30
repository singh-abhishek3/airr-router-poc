import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const executeUrl = new URL('/api/execute', request.url);

  const res = await fetch(executeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_type: 'summarization',
      priority: 'high',
      cost_target: 'balanced',
      input_text:
        'Customer: ASU. Transcript imports failing for Banner files since Dec 26. INVALID_TERM_CODE. Go-live in 10 days.',
    }),
  });

  // If execute fails, surface it (so you can debug instantly)
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      {
        ok: false,
        where: 'dashboard/run -> api/execute',
        status: res.status,
        body: text,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL('/dashboard', request.url), 303);
}
