// Lead list: every cell is clickable. Dates, outcomes, intent and PTP amount open that exact call in Greylabs;
// the other cells open a list of all the lead's November calls, each with its own call link.
(function () {
  const IN = (n) => Number(n).toLocaleString('en-IN');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = (v) => v.slice(8) + ' ' + MON[+v.slice(5, 7) - 1] + ' ' + v.slice(0, 4);
  const fmt = (v, k) => (v === null || v === undefined || v === '' ? '—'
    : k === 'int' ? IN(v) : k === 'inr' ? '₹' + IN(v) : k === 'date' ? date(v) : k === 'score' ? (+v).toFixed(2) : k === 'sec' ? IN(v) + 's' : String(v));
  const URL = (id) => 'https://app.greylabs.ai/call-details/' + encodeURIComponent(id);
  const LINK = { first_date: 'first_call_id', last_date: 'last_call_id', best: 'best_call_id', best_date: 'best_call_id',
    latest_outcome: 'latest_call_id', latest_date: 'latest_call_id', latest_intent: 'latest_call_id', ptp_amount: 'ptp_call_id' };
  const open = new Set();
  const link = (id, text, title) => {
    const a = document.createElement('a'); a.href = URL(id); a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.className = 'cg-calllink'; a.textContent = text; a.title = title; return a;
  };

  function callsFor(lan) {
    const g = dash.data('calls');
    if (g.status !== 'ok' || !g.data) return [];
    return g.data.filter((r) => r.lan === lan);
  }
  function detailRow(lead, cols) {
    const tr = document.createElement('tr'); tr.className = 'cg-detail';
    const td = document.createElement('td'); td.colSpan = cols;
    const calls = callsFor(lead.lan);
    const head = document.createElement('div'); head.className = 'cg-detail-h';
    head.textContent = 'All ' + calls.length + ' November call' + (calls.length === 1 ? '' : 's') + ' for loan ' + lead.lan_masked + ' — click a call ID to open it';
    const t = document.createElement('table'); t.className = 'cg-table cg-compact';
    const hr = document.createElement('tr');
    for (const h of ['Call', 'Date', 'Hour', 'Agent', 'Attended', 'Outcome', 'Score', 'Duration', '']) { const th = document.createElement('th'); th.textContent = h; hr.appendChild(th); }
    const th0 = document.createElement('thead'); th0.appendChild(hr);
    const tb = document.createElement('tbody');
    const tags = { [lead.first_call_id]: 'First', [lead.best_call_id]: 'Best', [lead.latest_call_id]: 'Latest', [lead.last_call_id]: 'Last' };
    for (const r of calls) {
      const row = document.createElement('tr');
      const c0 = document.createElement('td'); c0.appendChild(link(r.id, String(r.id) + ' ↗', 'Open this call in Greylabs')); row.appendChild(c0);
      const vals = [fmt(r.date, 'date'), String(r.hour).padStart(2, '0') + ':00', r.agent, r.attend || '—',
        r.act ? r.outcome : (r.unanalysed || 'Not audited'), r.act ? fmt(r.score, 'score') : '—', fmt(r.dur, 'sec')];
      for (const v of vals) { const c = document.createElement('td'); c.textContent = v; row.appendChild(c); }
      const ct = document.createElement('td');
      const marks = [];
      if (r.id === lead.first_call_id) marks.push('First');
      if (r.id === lead.best_call_id) marks.push('Best outcome');
      if (r.id === lead.latest_call_id) marks.push('Latest outcome');
      if (r.id === lead.last_call_id && r.id !== lead.first_call_id) marks.push('Last');
      for (const m of marks) { const s = document.createElement('span'); s.className = 'cg-pill cg-tag'; s.textContent = m; ct.appendChild(s); }
      row.appendChild(ct);
      tb.appendChild(row);
    }
    t.append(th0, tb);
    const wrap = document.createElement('div'); wrap.className = 'cg-scroll';
    wrap.appendChild(t);
    td.append(head, wrap); tr.appendChild(td);
    return tr;
  }

  dash.draw('leadtbl', (tb) => {
    const table = tb.closest('table'); if (!table) return;
    const g = dash.data(table.dataset.source);
    if (g.status !== 'ok' || !g.data) { tb.replaceChildren(); return; }
    const ths = [...table.querySelectorAll('thead th')];
    let rows = g.data.slice();
    const sth = ths.find((t) => ['ascending', 'descending'].includes(t.getAttribute('aria-sort')));
    if (sth) {
      const k = sth.dataset.field, dir = sth.getAttribute('aria-sort') === 'ascending' ? 1 : -1;
      rows.sort((a, b) => (a[k] === b[k] ? 0 : a[k] == null ? 1 : b[k] == null ? -1 : a[k] > b[k] ? dir : -dir));
    }
    const out = [];
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.dataset.key = encodeURIComponent(String(r.lan));
      if (open.has(r.lan)) tr.className = 'cg-row-on';
      ths.forEach((th, i) => {
        const td = document.createElement('td'), f = th.dataset.field, v = r[f];
        if (th.classList.contains('cg-num')) td.className = 'cg-num';
        const txt = fmt(v, th.dataset.fmt);
        const id = LINK[f] ? r[LINK[f]] : null;
        if (id != null && v != null) {
          td.appendChild(link(id, txt, 'Open this call in Greylabs'));
        } else {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'cg-cellbtn';
          b.textContent = (i === 0 ? (open.has(r.lan) ? '▾ ' : '▸ ') : '') + txt;
          b.setAttribute('aria-expanded', String(open.has(r.lan)));
          b.title = 'Show all calls for this lead';
          b.addEventListener('click', () => { if (open.has(r.lan)) open.delete(r.lan); else open.add(r.lan); dash.draw('leadtbl'); });
          td.appendChild(b);
        }
        tr.appendChild(td);
      });
      out.push(tr);
      if (open.has(r.lan)) out.push(detailRow(r, ths.length));
    }
    tb.replaceChildren(...out);
  });
  document.querySelectorAll('table[data-source="lead_list"] thead th').forEach((th) => th.addEventListener('click', () => dash.draw('leadtbl')));
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', () => dash.draw('leadtbl')));
  window.addEventListener('beforeprint', () => dash.draw('leadtbl'));
})();
