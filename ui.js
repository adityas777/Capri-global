// Capri Global explorer – controls, shared state and drawings
(function () {
  const IN = (n) => Number(n).toLocaleString('en-IN');
  const F = {
    int: (v) => IN(Math.round(v)), pct: (v) => (+v).toFixed(1) + '%', score: (v) => (+v).toFixed(2),
    sec: (v) => IN(v) + 's', inr: (v) => '₹' + IN(v),
    date: (v) => d3.utcFormat('%d %b %Y')(new Date(v + 'T00:00:00Z')), text: (v) => String(v),
  };
  const fmt = (v, k) => (v === null || v === undefined || v === '' ? '—' : (F[k] || F.text)(v));
  const TONE = { ok: 'var(--color-ok)', warn: 'var(--color-warn)', bad: 'var(--color-bad)' };
  const tone = (kind, v) => {
    if (v === null || v === undefined) return '';
    if (kind === 'score') return v >= 8.5 ? 'ok' : v >= 7 ? 'warn' : 'bad';
    if (kind === 'fatal') return v <= 5 ? 'ok' : v <= 12 ? 'warn' : 'bad';
    if (kind === 'pass') return v >= 90 ? 'ok' : v >= 75 ? 'warn' : 'bad';
    return '';
  };

  // ---- series for the trend explorer ----
  const SER = [
    ['Volume', 'calls', 'Calls', 'n', 'int'], ['Volume', 'connected', 'Connected calls', 'n', 'int'],
    ['Volume', 'ptp_calls', 'PTP calls', 'n', 'int'], ['Volume', 'will_clear', 'Will clear', 'n', 'int'],
    ['Volume', 'payment_done', 'Payment done', 'n', 'int'], ['Volume', 'refused', 'Refused to pay', 'n', 'int'],
    ['Volume', 'fatal_calls', 'Fatal calls', 'n', 'int'],
    ['Rates (%)', 'connect_rate', 'Connect rate', 'pct', 'pct'], ['Rates (%)', 'ptp_rate', 'PTP rate', 'pct', 'pct'],
    ['Rates (%)', 'fatal_rate', 'Fatal rate', 'pct', 'pct'], ['Rates (%)', 'high_intent_pct', 'High payment intent', 'pct', 'pct'],
    ['Rates (%)', 'angry_pct', 'Angry / frustrated', 'pct', 'pct'], ['Rates (%)', 'wilful_pct', 'Wilful default', 'pct', 'pct'],
    ['Quality', 'avg_score', 'Avg quality score (/10)', 'score', 'score'],
    ['Audit pass rate (%)', 'p_greet', 'Greeting', 'pct', 'pct'], ['Audit pass rate (%)', 'p_info', 'Complete & correct info', 'pct', 'pct'],
    ['Audit pass rate (%)', 'p_probe', 'Probing', 'pct', 'pct'], ['Audit pass rate (%)', 'p_listen', 'Active listening', 'pct', 'pct'],
    ['Audit pass rate (%)', 'p_empathy', 'Empathy', 'pct', 'pct'], ['Audit pass rate (%)', 'p_hold', 'Dead air / hold', 'pct', 'pct'],
    ['Audit pass rate (%)', 'p_dispo', 'Correct disposition', 'pct', 'pct'], ['Audit pass rate (%)', 'p_closing', 'Closing', 'pct', 'pct'],
    ['Audit pass rate (%)', 'p_tone', 'Tone & language', 'pct', 'pct'], ['Audit pass rate (%)', 'p_datasec', 'No data breach', 'pct', 'pct'],
  ].map(([g, id, label, axis, f], i) => ({ g, id, label, axis, f, i }));
  const SERI = Object.fromEntries(SER.map((s) => [s.id, s]));
  const PRESETS = {
    collections: ['ptp_calls', 'payment_done', 'ptp_rate', 'fatal_rate'],
    volume: ['calls', 'connected', 'connect_rate'],
    quality: ['avg_score', 'fatal_rate', 'ptp_rate'],
    softskills: ['p_closing', 'p_empathy', 'p_greet', 'p_info'],
    customer: ['high_intent_pct', 'angry_pct', 'wilful_pct', 'ptp_rate'],
  };
  const CG = (window.CG = { on: new Set(PRESETS.collections), preset: 'collections', grain: 'day', scale: 'actual', bm: 'calls', am: 'calls', tab: 'trend' });
  const colorOf = (s) => dash.colors[s.i % dash.colors.length];
  const dashOf = (s) => (Math.floor(s.i / dash.colors.length) % 2 ? '6 4' : null);

  const DIM_LABEL = { week: 'Week', agent: 'Agent', lang: 'Language', region: 'Region', outcome: 'Outcome', intent: 'Intent',
    cap: 'Capability', reason: 'Reason', rsub: 'Specific reason', sent: 'Sentiment', flag: 'Risk flag', param: 'Failed parameter' };
  const VAL_LABEL = {
    f_fatal: 'Fatal error', f_visit: 'Home-visit threat', f_threat: 'Legal / other threat', f_aprof: 'Agent profanity',
    f_cprof: 'Customer profanity', f_datasec: 'Data-security breach', f_dnd: 'DND requested', f_rbi: 'RBI mentioned',
    f_wilful: 'Wilful default', f_angry: 'Angry / frustrated', f_waiver: 'Waiver pitched', f_settle: 'Settlement discussed',
    p_open: 'Avoid delay in opening', p_greet: 'Greeting & introduction', p_purpose: 'Purpose of the call', p_queries: 'Addressed all queries',
    p_info: 'Complete & correct info', p_probe: 'Necessary probing', p_objection: 'Objection handling', p_tone: 'Tone & professional language',
    p_listen: 'Active listening', p_empathy: 'Empathy & acknowledgement', p_hold: 'Dead air / hold procedure', p_dispo: 'Correct disposition tagged',
    p_proactive: 'Proactive effort', p_closing: 'Closing', p_ethics: 'Conduct & ethics (ZT)', p_datasec: 'No data-security breach', p_aprof: 'No agent profanity',
  };
  const MEASURE = {
    calls: { field: 'calls', f: 'int', label: 'Calls' }, ptp_rate: { field: 'ptp_rate', f: 'pct', label: 'PTP rate' },
    fatal_rate: { field: 'fatal_rate', f: 'pct', label: 'Fatal rate' }, avg_score: { field: 'avg_score', f: 'score', label: 'Avg score' },
  };
  const toggleParam = (k, v) => { const p = dash.params(); dash.setParams({ [k]: p[k] === v ? null : v }); };

  // ---- controls: listen, and reflect state through aria/checked/class only ----
  function sync() {
    const p = dash.params();
    document.querySelectorAll('[data-seg]').forEach((g) => {
      const seg = g.dataset.seg;
      const cur = seg === 'week' ? p.week || '' : CG[seg];
      g.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === cur)));
    });
    document.querySelectorAll('input[data-s]').forEach((i) => {
      i.checked = CG.on.has(i.dataset.s);
      i.closest('label').classList.toggle('on', i.checked);
    });
    document.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === CG.preset)));
    document.querySelectorAll('[data-toggle-flag]').forEach((b) => b.setAttribute('aria-pressed', String(p.flag === b.dataset.toggleFlag)));
    document.querySelectorAll('.cg-tab').forEach((t) => t.setAttribute('aria-selected', String(t.getAttribute('aria-controls') === CG.tab)));
  }
  document.querySelectorAll('.cg-sw[data-s]').forEach((e) => { const s = SERI[e.dataset.s]; if (s) e.style.background = colorOf(s); });
  document.querySelectorAll('[data-seg] button').forEach((b) => b.addEventListener('click', () => {
    const seg = b.closest('[data-seg]').dataset.seg;
    if (seg === 'week') { dash.setParams({ week: b.dataset.v || null }); return; }
    CG[seg] = b.dataset.v; sync();
    dash.draw(seg === 'grain' || seg === 'scale' ? 'trend' : 'cbar');
  }));
  document.querySelectorAll('input[data-s]').forEach((i) => i.addEventListener('change', () => {
    if (i.checked) CG.on.add(i.dataset.s); else CG.on.delete(i.dataset.s);
    CG.preset = ''; sync(); dash.draw('trend');
  }));
  document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.preset;
    CG.on = new Set(PRESETS[k] || []); CG.preset = k; sync(); dash.draw('trend');
  }));
  document.querySelectorAll('[data-toggle-flag]').forEach((b) => b.addEventListener('click', () => toggleParam('flag', b.dataset.toggleFlag)));
  document.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', () => dash.resetParams()));
  const DRAWS = ['val', 'cbar', 'trend', 'tbl', 'chips', 'opts'];
  function openTab(id, link) {
    if (!document.getElementById(id)) return;
    CG.tab = id;
    document.querySelectorAll('.cg-sec').forEach((s) => { s.hidden = s.id !== id; });
    sync();
    if (link) dash.setLink(id);
    DRAWS.forEach((n) => dash.draw(n));
  }
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', () => openTab(t.getAttribute('aria-controls'), true)));
  document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => openTab(b.dataset.goto, true)));
  const h = (location.hash || '').slice(1);
  if (h && document.querySelector('.cg-sec#' + CSS.escape(h))) openTab(h, false);
  dash.onData(sync);
  sync();
  window.addEventListener('beforeprint', () => { document.querySelectorAll('.cg-sec').forEach((s) => { s.hidden = false; }); DRAWS.forEach((n) => dash.draw(n)); });
  window.addEventListener('afterprint', () => openTab(CG.tab, false));

  // ---- helpers ----
  function ready(el, g) {
    if (g.status === 'loading') { el.classList.add('dash-skeleton'); return false; }
    el.classList.remove('dash-skeleton');
    if (g.status === 'ok' && Array.isArray(g.data) && g.data.length) return true;
    if (g.status === 'error' || g.status === 'ok') {
      const p = document.createElement('p'); p.className = 'cg-fail';
      p.textContent = g.status === 'error' ? 'Failed to load' : 'No calls match the current filters';
      el.replaceChildren(p);
    }
    return false;
  }
  function tooltip(host) {
    const t = document.createElement('div'); t.className = 'cg-tip'; t.hidden = true; host.appendChild(t);
    return {
      show(lines, ev) {
        t.replaceChildren(...lines.map((l, i) => {
          const d = document.createElement('div');
          if (i === 0) { d.className = 'cg-tip-h'; d.textContent = l; return d; }
          if (l[2]) { const sw = document.createElement('i'); sw.className = 'cg-sw'; sw.style.background = l[2]; d.appendChild(sw); }
          const k = document.createElement('span'); k.textContent = l[0];
          const v = document.createElement('b'); v.textContent = l[1];
          d.append(k, v); return d;
        }));
        t.hidden = false;
        const r = host.getBoundingClientRect();
        let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
        if (x + t.offsetWidth > r.width) x = Math.max(0, ev.clientX - r.left - t.offsetWidth - 14);
        if (y + t.offsetHeight > r.height) y = Math.max(0, ev.clientY - r.top - t.offsetHeight - 14);
        t.style.left = x + 'px'; t.style.top = y + 'px';
      },
      hide() { t.hidden = true; },
    };
  }
  const trim = (node, max) => { let s = node.textContent; while (node.getComputedTextLength() > max && s.length > 4) { s = s.slice(0, -2); node.textContent = s + '…'; } };

  // ---- single values ----
  dash.draw('val', (el) => {
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    const row = g.status === 'ok' ? g.data[+(el.dataset.row || 0)] : null;
    el.textContent = row ? fmt(row[el.dataset.field], el.dataset.fmt) : '—';
  });

  // ---- active filter chips ----
  dash.draw('chips', (el) => {
    const p = dash.params();
    const on = Object.keys(DIM_LABEL).filter((k) => p[k]);
    el.replaceChildren(...on.map((k) => {
      const b = document.createElement('button');
      b.className = 'cg-chip'; b.type = 'button';
      const t = document.createElement('span'); t.textContent = DIM_LABEL[k] + ': ';
      const v = document.createElement('b'); v.textContent = VAL_LABEL[p[k]] || p[k];
      const x = document.createElement('span'); x.className = 'cg-x'; x.textContent = '✕'; x.setAttribute('aria-hidden', 'true');
      b.append(t, v, x);
      b.setAttribute('aria-label', 'Remove filter ' + DIM_LABEL[k]);
      b.addEventListener('click', () => dash.setParams({ [k]: null }));
      return b;
    }));
    document.querySelectorAll('.cg-nofilter').forEach((n) => { n.hidden = on.length > 0; });
    document.querySelectorAll('[data-clear]').forEach((n) => { n.hidden = on.length === 0; });
  });

  // ---- filter menus ----
  dash.draw('opts', (sel) => {
    const g = dash.data('options');
    const dim = sel.dataset.dim, cur = dash.params()[dim] || '';
    const rows = g.status === 'ok' && g.data ? g.data.filter((r) => r.dim === dim) : [];
    sel.replaceChildren(new Option(sel.dataset.all, ''), ...rows.map((r) => new Option(r.value + ' (' + IN(r.calls) + ')', r.value)));
    sel.value = cur;
    sel.onchange = () => dash.setParams({ [dim]: sel.value || null });
  });

  // ---- clickable bars ----
  dash.draw('cbar', (el) => {
    const g = dash.data(el.dataset.source);
    if (!ready(el, g)) return;
    const W = el.clientWidth; if (!W) return;
    const dim = el.dataset.dim, key = el.dataset.key || dim, L = el.dataset.label || dim;
    const m = el.dataset.measure ? { field: el.dataset.measure, f: el.dataset.mfmt || 'pct', label: el.dataset.mlabel || 'Value' } : MEASURE[CG[el.dataset.mgroup] || 'calls'];
    const minConn = +(el.dataset.minconn || 0);
    let rows = g.data.filter((r) => r[m.field] !== null && r[m.field] !== undefined);
    if (m.field !== 'calls' && minConn) rows = rows.filter((r) => (r.connected ?? minConn) >= minConn);
    if (el.dataset.sort === 'key') rows = rows.slice().sort((a, b) => (a[key] < b[key] ? -1 : 1));
    else if (el.dataset.sort !== 'none') rows = rows.slice().sort((a, b) => b[m.field] - a[m.field]);
    if (el.dataset.limit) rows = rows.slice(0, +el.dataset.limit);
    const sel = dim === 'none' ? null : dash.params()[dim];
    const rowH = 30, H = rows.length * rowH + 4;
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria || 'Bar chart');
    const lab = svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-lab')
      .classed('cg-lab-on', (d) => d[key] === sel).attr('y', (d, i) => i * rowH + rowH / 2 + 4).text((d) => d[L]);
    const maxLab = Math.max(80, Math.min(W * 0.42, 230));
    lab.each(function () { trim(this, maxLab); });
    const lw = Math.min(maxLab, d3.max(lab.nodes(), (n) => n.getComputedTextLength()) || 60);
    const share = m.field === 'calls' && el.dataset.share !== 'no';
    const vt = (d) => fmt(d[m.field], m.f) + (share && d.share != null ? '  ·  ' + fmt(d.share, 'pct') : '');
    const probe = svg.append('text').attr('class', 'cg-val').text(rows.map(vt).reduce((a, b) => (b.length > a.length ? b : a), ''));
    const vw = probe.node().getComputedTextLength() + 10; probe.remove();
    const x0 = lw + 10;
    const max = m.f === 'pct' && el.dataset.max100 ? 100 : m.f === 'score' ? 10 : d3.max(rows, (d) => +d[m.field]) || 1;
    const x = d3.scaleLinear().domain([0, max]).range([0, Math.max(20, W - x0 - vw)]);
    const fill = (d) => {
      if (el.dataset.tone) return TONE[tone(el.dataset.tone, d[m.field])] || dash.colors[0];
      if (m.field === 'fatal_rate' || el.dataset.color === 'bad') return 'var(--color-bad)';
      if (m.field === 'avg_score') return TONE[tone('score', d[m.field])];
      return dash.colors[+(el.dataset.color || 0)];
    };
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-track')
      .attr('x', x0).attr('y', (d, i) => i * rowH + 7).attr('height', rowH - 14).attr('rx', 3).attr('width', x.range()[1]);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('x', x0).attr('y', (d, i) => i * rowH + 7)
      .attr('height', rowH - 14).attr('rx', 3).attr('width', (d) => Math.max(1, x(+d[m.field]))).style('fill', fill)
      .style('opacity', (d) => (sel && d[key] !== sel ? 0.3 : 1));
    svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-val')
      .attr('x', (d) => x0 + x(+d[m.field]) + 6).attr('y', (d, i) => i * rowH + rowH / 2 + 4).text(vt);
    const tip = tooltip(el);
    const extra = (el.dataset.tip || 'calls:int:Calls,connected:int:Connected,ptp_rate:pct:PTP rate,fatal_rate:pct:Fatal rate,avg_score:score:Avg score')
      .split(',').map((s) => s.split(':'));
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-hit')
      .attr('x', 0).attr('y', (d, i) => i * rowH).attr('width', W).attr('height', rowH)
      .classed('cg-click', dim !== 'none')
      .on('pointermove', (ev, d) => tip.show([String(d[L]), ...extra.map(([f, k, n]) => [n, fmt(d[f], k)]),
        ...(dim === 'none' ? [] : [['', d[key] === sel ? 'Click to clear filter' : 'Click to filter']])], ev))
      .on('pointerleave', () => tip.hide())
      .on('click', (ev, d) => { if (dim === 'none') return; tip.hide(); toggleParam(dim, d[key]); });
  });

  // ---- trend explorer ----
  dash.draw('trend', (el) => {
    const g = dash.data('trend');
    if (!ready(el, g)) return;
    const W = el.clientWidth; if (!W) return;
    const rows = g.data.filter((r) => r.grain === CG.grain);
    const vis = SER.filter((s) => CG.on.has(s.id));
    el.replaceChildren();
    if (!vis.length || !rows.length) {
      const p = document.createElement('p'); p.className = 'cg-fail';
      p.textContent = vis.length ? 'No calls match the current filters' : 'Tick at least one line above to draw the chart.';
      el.appendChild(p); return;
    }
    const idx = CG.scale === 'index';
    const H = 380, m = { t: 14, r: 12, b: 30, l: 12 };
    const val = (s, r) => { const v = r[s.id]; return v == null ? null : s.axis === 'score' && !idx ? v * 10 : v; };
    const smax = Object.fromEntries(vis.map((s) => [s.id, d3.max(rows, (r) => r[s.id]) || 1]));
    const plot = (s, r) => { const v = val(s, r); return v == null ? null : idx ? (100 * r[s.id]) / smax[s.id] : v; };
    const hasN = !idx && vis.some((s) => s.axis === 'n');
    const hasP = idx || vis.some((s) => s.axis !== 'n');
    const yN = d3.scaleLinear().domain([0, (d3.max(vis.filter((s) => s.axis === 'n'), (s) => smax[s.id]) || 1) * 1.08]).nice();
    const yP = d3.scaleLinear().domain([0, idx ? 100 : Math.max(10, d3.max(vis.filter((s) => s.axis !== 'n'), (s) => d3.max(rows, (r) => val(s, r))) || 10) * 1.05]).nice();
    if (!idx && yP.domain()[1] > 100) yP.domain([0, 100]);
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img')
      .attr('aria-label', 'Line chart of ' + vis.map((s) => s.label).join(', ') + ' by ' + CG.grain);
    const tN = (v) => IN(v), tP = (v) => (idx ? String(v) : v + '%');
    const meas = (vals, f) => { const t = svg.append('g').attr('class', 'cg-axis').selectAll('text').data(vals).join('text').text(f); const w = d3.max(t.nodes(), (n) => n.getComputedTextLength()) || 0; svg.selectAll('g.cg-axis').remove(); return w; };
    if (hasN) m.l = meas(yN.ticks(5), tN) + 12; else if (hasP) m.l = meas(yP.ticks(5), tP) + 12;
    if (hasN && hasP) m.r = meas(yP.ticks(5), tP) + 12;
    yN.range([H - m.b, m.t]); yP.range([H - m.b, m.t]);
    const x = d3.scalePoint().domain(rows.map((r) => r.x)).range([m.l + 8, W - m.r - 8]);
    const leftY = hasN ? yN : yP;
    svg.append('g').attr('class', 'cg-grid').selectAll('line').data(leftY.ticks(5)).join('line')
      .attr('x1', m.l).attr('x2', W - m.r).attr('y1', leftY).attr('y2', leftY);
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data(leftY.ticks(5)).join('text')
      .attr('x', m.l - 6).attr('y', (d) => leftY(d) + 4).attr('text-anchor', 'end').text(hasN ? tN : tP);
    if (hasN && hasP) svg.append('g').attr('class', 'cg-axis').selectAll('text').data(yP.ticks(5)).join('text')
      .attr('x', W - m.r + 6).attr('y', (d) => yP(d) + 4).text(tP);
    const every = Math.max(1, Math.ceil((rows.length * 60) / (W - m.l - m.r)));
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data(rows.filter((r, i) => i % every === 0)).join('text')
      .attr('x', (r) => x(r.x)).attr('y', H - 8).attr('text-anchor', 'middle').text((r) => (CG.grain === 'week' ? r.label.split(' – ')[0] + ' wk' : r.label));
    for (const s of vis) {
      const y = s.axis === 'n' && !idx ? yN : yP;
      const pts = rows.map((r) => [x(r.x), plot(s, r)]);
      svg.append('path').attr('class', 'cg-line').style('stroke', colorOf(s)).style('stroke-dasharray', dashOf(s))
        .attr('d', d3.line().defined((p) => p[1] != null).x((p) => p[0]).y((p) => y(p[1]))(pts));
      svg.append('g').selectAll('circle').data(pts.filter((p) => p[1] != null)).join('circle').attr('r', rows.length > 20 ? 2.5 : 3.5)
        .attr('cx', (p) => p[0]).attr('cy', (p) => y(p[1])).style('fill', colorOf(s));
    }
    const guide = svg.append('line').attr('class', 'cg-guide').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    const tip = tooltip(el);
    svg.append('rect').attr('class', 'cg-hit').attr('x', m.l).attr('width', W - m.l - m.r).attr('height', H)
      .on('pointermove', (ev) => {
        const px = d3.pointer(ev)[0];
        let best = 0, bd = Infinity;
        rows.forEach((r, i) => { const d = Math.abs(x(r.x) - px); if (d < bd) { bd = d; best = i; } });
        const r = rows[best];
        guide.attr('x1', x(r.x)).attr('x2', x(r.x)).style('opacity', 1);
        tip.show([(CG.grain === 'day' ? fmt(r.x, 'date') : CG.grain === 'hour' ? r.x + ' – ' + r.x.slice(0, 2) + ':59' : r.label) + '  ·  ' + IN(r.calls) + ' calls',
          ...vis.map((s) => [s.label, fmt(r[s.id], s.f), colorOf(s)])], ev);
      })
      .on('pointerleave', () => { tip.hide(); guide.style('opacity', 0); });
  });

  // ---- tables ----
  dash.draw('tbl', (tb) => {
    const table = tb.closest('table'); if (!table) return;
    const g = dash.data(table.dataset.source);
    if (g.status !== 'ok' || !g.data) { tb.replaceChildren(); return; }
    const ths = [...table.querySelectorAll('thead th')];
    const key = table.dataset.rowKey, dim = table.dataset.dim, sel = dim ? dash.params()[dim] : null;
    let rows = g.data.slice();
    const sth = ths.find((t) => ['ascending', 'descending'].includes(t.getAttribute('aria-sort')));
    if (sth) {
      const k = sth.dataset.field, dir = sth.getAttribute('aria-sort') === 'ascending' ? 1 : -1;
      rows.sort((a, b) => (a[k] === b[k] ? 0 : a[k] == null ? 1 : b[k] == null ? -1 : a[k] > b[k] ? dir : -dir));
    }
    tb.replaceChildren(...rows.map((r) => {
      const tr = document.createElement('tr');
      if (key) tr.dataset.key = encodeURIComponent(String(r[key]));
      if (dim) {
        tr.className = 'cg-click' + (r[key] === sel ? ' cg-row-on' : '');
        tr.tabIndex = 0;
        tr.addEventListener('click', () => toggleParam(dim, r[key]));
        tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleParam(dim, r[key]); } });
      }
      ths.forEach((th) => {
        const td = document.createElement('td'), v = r[th.dataset.field];
        if (th.classList.contains('cg-num')) td.className = 'cg-num';
        if (th.dataset.fmt === 'link') {
          const a = document.createElement('a'); a.href = 'https://app.greylabs.ai/call-details/' + encodeURIComponent(v);
          a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = String(v); td.appendChild(a);
        } else if (th.dataset.tone && tone(th.dataset.tone, v)) {
          const s = document.createElement('span'); s.className = 'cg-pill cg-' + tone(th.dataset.tone, v); s.textContent = fmt(v, th.dataset.fmt); td.appendChild(s);
        } else td.textContent = fmt(v, th.dataset.fmt);
        if (th.dataset.wrap) td.classList.add('cg-wrap');
        tr.appendChild(td);
      });
      return tr;
    }));
  });
  document.querySelectorAll('table.cg-sortable thead th').forEach((th) => th.addEventListener('click', () => {
    const was = th.getAttribute('aria-sort'), num = th.classList.contains('cg-num');
    const next = was === 'descending' ? 'ascending' : was === 'ascending' ? 'descending' : num ? 'descending' : 'ascending';
    th.closest('thead').querySelectorAll('th').forEach((o) => o.setAttribute('aria-sort', 'none'));
    th.setAttribute('aria-sort', next);
    dash.draw('tbl');
  }));
})();
