// Lead-wise tab: its own bar charts, measure toggle and filter chips
(function () {
  const IN = (n) => Number(n).toLocaleString('en-IN');
  const fmt = (v, k) => (v === null || v === undefined || v === '' ? '—' : k === 'pct' ? (+v).toFixed(2) + '%' : k === 'dec' ? (+v).toFixed(2) : IN(Math.round(v)));
  const LM = {
    leads: { field: 'leads', f: 'int', label: 'Leads' }, reached_pct: { field: 'reached_pct', f: 'pct', label: 'Reached' },
    promised_pct: { field: 'promised_pct', f: 'pct', label: 'Promised / will clear' }, paid_pct: { field: 'paid_pct', f: 'pct', label: 'Paid' },
    calls_per_lead: { field: 'calls_per_lead', f: 'dec', label: 'Calls per lead' },
  };
  const LKEYS = { lstatus: 'Best outcome', latt: 'Calls per lead', lprod: 'Product', lemi: 'EMI band', lcycle: 'EMI cycle' };
  const ST = (window.CGL = { lm: 'leads' });
  const toggle = (k, v) => { const p = dash.params(); dash.setParams({ [k]: p[k] === v ? null : v }); };

  function sync() {
    document.querySelectorAll('[data-lseg] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === ST.lm)));
  }
  document.querySelectorAll('[data-lseg] button').forEach((b) => b.addEventListener('click', () => { ST.lm = b.dataset.v; sync(); dash.draw('lbar'); }));
  document.querySelectorAll('[data-lkpi]').forEach((b) => b.addEventListener('click', () => window.CGpick('Lkpi', b.dataset.lkpi)));
  dash.onData(() => { const p = dash.params(); document.querySelectorAll('[data-lkpi]').forEach((b) => b.setAttribute('aria-pressed', String(p.pwdim === 'Lkpi' && p.pwcat === b.dataset.lkpi))); });
  document.querySelectorAll('[data-lclear]').forEach((b) => b.addEventListener('click', () => {
    dash.setParams(Object.fromEntries(Object.keys(LKEYS).map((k) => [k, null])));
  }));
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', () => { dash.draw('lbar'); dash.draw('lchips'); dash.draw('pwcalls'); }));
  window.addEventListener('beforeprint', () => { dash.draw('lbar'); dash.draw('lchips'); });
  sync();

  dash.draw('lchips', (el) => {
    const p = dash.params();
    const on = Object.keys(LKEYS).filter((k) => p[k]);
    el.replaceChildren(...on.map((k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cg-chip';
      const t = document.createElement('span'); t.textContent = LKEYS[k] + ': ';
      const v = document.createElement('b'); v.textContent = p[k];
      const x = document.createElement('span'); x.className = 'cg-x'; x.textContent = '✕'; x.setAttribute('aria-hidden', 'true');
      b.append(t, v, x); b.setAttribute('aria-label', 'Remove lead filter ' + LKEYS[k]);
      b.addEventListener('click', () => dash.setParams({ [k]: null }));
      return b;
    }));
    document.querySelectorAll('.cg-lnofilter').forEach((n) => { n.hidden = on.length > 0; });
    document.querySelectorAll('[data-lclear]').forEach((n) => { n.hidden = on.length === 0; });
  });

  dash.draw('lbar', (el) => {
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    if (g.status !== 'ok' || !g.data.length) {
      const p = document.createElement('p'); p.className = 'cg-fail';
      p.textContent = g.status === 'error' ? 'Failed to load' : 'No leads match the current filters'; el.replaceChildren(p); return;
    }
    const W = el.clientWidth; if (!W) return;
    const dim = el.dataset.dim, key = el.dataset.key, L = el.dataset.label || key;
    const m = el.dataset.measure ? LM[el.dataset.measure] : LM[ST.lm];
    const rows = g.data.filter((r) => r[m.field] != null);
    const sel = dim && dash.params().pwdim === dim ? dash.params().pwcat : null;
    const rowH = 30, H = rows.length * rowH + 4;
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria || 'Bar chart');
    const lab = svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-lab').classed('cg-lab-on', (d) => sel && d[key] === sel)
      .attr('y', (d, i) => i * rowH + rowH / 2 + 4).text((d) => d[L]);
    const lw = Math.min(W * 0.42, (d3.max(lab.nodes(), (n) => n.getComputedTextLength()) || 60));
    const vt = (d) => fmt(d[m.field], m.f) + (m.field === 'leads' && d.share != null ? '  ·  ' + fmt(d.share, 'pct') : '');
    const probe = svg.append('text').attr('class', 'cg-val').text(rows.map(vt).reduce((a, b) => (b.length > a.length ? b : a), ''));
    const vw = probe.node().getComputedTextLength() + 10; probe.remove();
    const defs = rows.map((d) => (window.CGdef && dim ? window.CGdef(dim, d[key], d[L]) : null));
    const iw = defs.some(Boolean) ? 18 : 0;
    const x0 = lw + 10 + iw;
    const max = m.f === 'pct' ? 100 : d3.max(rows, (d) => +d[m.field]) || 1;
    const x = d3.scaleLinear().domain([0, max]).range([0, Math.max(20, W - x0 - vw)]);
    const fill = el.dataset.color === 'ok' ? 'var(--color-ok)' : dash.colors[+(el.dataset.color || 0)];
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-track')
      .attr('x', x0).attr('y', (d, i) => i * rowH + 7).attr('height', rowH - 14).attr('rx', 3).attr('width', x.range()[1]);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('x', x0).attr('y', (d, i) => i * rowH + 7)
      .attr('height', rowH - 14).attr('rx', 3).attr('width', (d) => Math.max(1, x(+d[m.field]))).style('fill', fill)
      .style('opacity', (d) => (sel && d[key] !== sel ? 0.3 : 1));
    svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-val')
      .attr('x', (d) => x0 + x(+d[m.field]) + 6).attr('y', (d, i) => i * rowH + rowH / 2 + 4).text(vt);
    const tipEl = document.createElement('div'); tipEl.className = 'cg-tip'; tipEl.hidden = true; el.appendChild(tipEl);
    const show = (ev, d) => {
      const lines = [['', String(d[L])]];
      for (const k of (el.dataset.tip || 'leads,reached_pct,promised_pct,paid_pct,calls_per_lead').split(',')) if (d[k] !== undefined) lines.push([LM[k] ? LM[k].label : k, fmt(d[k], LM[k] ? LM[k].f : 'int')]);
      if (dim) lines.push(['', d[key] === sel ? 'Click to close the call list' : 'Click to list the calls of these leads']);
      tipEl.replaceChildren(...lines.map(([a, b], i) => {
        const dv = document.createElement('div');
        if (i === 0) { dv.className = 'cg-tip-h'; dv.textContent = b; return dv; }
        const s1 = document.createElement('span'); s1.textContent = a; const s2 = document.createElement('b'); s2.textContent = b; dv.append(s1, s2); return dv;
      }));
      tipEl.hidden = false;
      const r = el.getBoundingClientRect();
      let tx = ev.clientX - r.left + 14, ty = ev.clientY - r.top + 14;
      if (tx + tipEl.offsetWidth > r.width) tx = Math.max(0, ev.clientX - r.left - tipEl.offsetWidth - 14);
      if (ty + tipEl.offsetHeight > r.height) ty = Math.max(0, ev.clientY - r.top - tipEl.offsetHeight - 14);
      tipEl.style.left = tx + 'px'; tipEl.style.top = ty + 'px';
    };
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-hit').classed('cg-click', !!dim)
      .attr('x', 0).attr('y', (d, i) => i * rowH).attr('width', W).attr('height', rowH)
      .on('pointermove', show).on('pointerleave', () => { tipEl.hidden = true; })
      .on('click', (ev, d) => { if (!dim) return; tipEl.hidden = true; window.CGpick(dim, d[key]); });
    if (iw) window.CGinfoIcons(el, svg, rows.map((d, i) => (defs[i] ? { x: lw + 16, y: i * rowH + rowH / 2, text: defs[i] } : null)).filter(Boolean));
  });
})();
