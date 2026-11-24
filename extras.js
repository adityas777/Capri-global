// Attendance tiles, lead-wise trend chart and agent-wise trend table
(function () {
  const IN = (n) => Number(n).toLocaleString('en-IN');
  const fmt = (v, k) => (v === null || v === undefined ? '—' : k === 'pct' ? (+v).toFixed(1) + '%' : k === 'score' ? (+v).toFixed(2) : IN(Math.round(v)));
  const ST = (window.CGX = { hm: 'avg_score' });
  const toggle = (k, v) => { const p = dash.params(); dash.setParams({ [k]: p[k] === v ? null : v }); };

  // campaign-type buttons: Collection (campaign name not starting with PDM) or Awareness (starts with PDM)
  document.querySelectorAll('[data-ctype]').forEach((b) => b.addEventListener('click', () => toggle('ctype', b.dataset.ctype)));
  // attendance tiles filter the page
  document.querySelectorAll('[data-af]').forEach((b) => b.addEventListener('click', () => toggle(b.dataset.af, b.dataset.av)));
  function sync() {
    const p = dash.params();
    document.querySelectorAll('[data-af]').forEach((b) => b.setAttribute('aria-pressed', String(p[b.dataset.af] === b.dataset.av)));
    document.querySelectorAll('[data-ctype]').forEach((b) => b.setAttribute('aria-pressed', String(p.ctype === b.dataset.ctype)));
    document.querySelectorAll('[data-hseg] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === ST.hm)));
  }
  dash.onData(sync);
  document.querySelectorAll('[data-hseg] button').forEach((b) => b.addEventListener('click', () => { ST.hm = b.dataset.v; sync(); dash.draw('aheat'); }));
  document.querySelectorAll('.cg-sw[data-tsw]').forEach((e) => { e.style.background = dash.colors[+e.dataset.tsw % dash.colors.length]; });
  const redraw = () => { dash.draw('tline'); dash.draw('aheat'); };
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', redraw));
  window.addEventListener('beforeprint', redraw);

  function tipBox(host) {
    const t = document.createElement('div'); t.className = 'cg-tip'; t.hidden = true; host.appendChild(t);
    return {
      show(head, lines, ev) {
        const h = document.createElement('div'); h.className = 'cg-tip-h'; h.textContent = head;
        t.replaceChildren(h, ...lines.map(([k, v, c]) => {
          const d = document.createElement('div');
          if (c) { const sw = document.createElement('i'); sw.className = 'cg-sw'; sw.style.background = c; d.appendChild(sw); }
          const a = document.createElement('span'); a.textContent = k; const b = document.createElement('b'); b.textContent = v; d.append(a, b); return d;
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
  function state(el, g) {
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return false; }
    el.classList.remove('dash-skeleton');
    if (g.status === 'ok' && g.data.length) return true;
    const p = document.createElement('p'); p.className = 'cg-fail';
    p.textContent = g.status === 'error' ? 'Failed to load' : 'Nothing matches the current filters'; el.replaceChildren(p);
    return false;
  }

  // lead-wise trend: several lines over calling days
  dash.draw('tline', (el) => {
    const g = dash.data(el.dataset.source);
    if (!state(el, g)) return;
    const W = el.clientWidth; if (!W) return;
    const rows = g.data, X = el.dataset.x, ys = el.dataset.ys.split(','), names = el.dataset.names.split(',');
    const H = 300, m = { t: 12, r: 14, b: 28, l: 12 };
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria || 'Line chart');
    const y = d3.scaleLinear().domain([0, (d3.max(rows, (r) => d3.max(ys, (k) => r[k])) || 1) * 1.08]).nice();
    const probe = svg.append('g').attr('class', 'cg-axis').selectAll('text').data(y.ticks(5)).join('text').text(IN);
    m.l = (d3.max(probe.nodes(), (n) => n.getComputedTextLength()) || 20) + 12; svg.select('g.cg-axis').remove();
    y.range([H - m.b, m.t]);
    const x = d3.scalePoint().domain(rows.map((r) => r[X])).range([m.l + 8, W - m.r - 8]);
    svg.append('g').attr('class', 'cg-grid').selectAll('line').data(y.ticks(5)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y);
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data(y.ticks(5)).join('text').attr('x', m.l - 6).attr('y', (d) => y(d) + 4).attr('text-anchor', 'end').text(IN);
    const every = Math.max(1, Math.ceil((rows.length * 56) / (W - m.l - m.r)));
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data(rows.filter((r, i) => i % every === 0)).join('text')
      .attr('x', (r) => x(r[X])).attr('y', H - 8).attr('text-anchor', 'middle').text((r) => r[X]);
    ys.forEach((k, i) => {
      const c = dash.colors[i % dash.colors.length];
      svg.append('path').datum(rows).attr('class', 'cg-line').style('stroke', c).attr('d', d3.line().x((r) => x(r[X])).y((r) => y(r[k])));
      svg.append('g').selectAll('circle').data(rows).join('circle').attr('r', 3).attr('cx', (r) => x(r[X])).attr('cy', (r) => y(r[k])).style('fill', c);
    });
    const guide = svg.append('line').attr('class', 'cg-guide').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    const tip = tipBox(el);
    svg.append('rect').attr('class', 'cg-hit').attr('x', m.l).attr('width', W - m.l - m.r).attr('height', H)
      .on('pointermove', (ev) => {
        const px = d3.pointer(ev)[0];
        let best = 0, bd = Infinity;
        rows.forEach((r, i) => { const d = Math.abs(x(r[X]) - px); if (d < bd) { bd = d; best = i; } });
        const r = rows[best];
        guide.attr('x1', x(r[X])).attr('x2', x(r[X])).style('opacity', 1);
        tip.show(String(r[X]), ys.map((k, i) => [names[i], IN(r[k]), dash.colors[i % dash.colors.length]]), ev);
      })
      .on('pointerleave', () => { tip.hide(); guide.style('opacity', 0); });
  });

  // agent-wise trend: agents × weeks table with colour by how good the figure is
  dash.draw('aheat', (el) => {
    const g = dash.data(el.dataset.source);
    if (!state(el, g)) return;
    const k = ST.hm, f = k === 'avg_score' ? 'score' : k === 'connected' ? 'int' : 'pct';
    const weeks = [...new Set(g.data.map((r) => r.week))].sort();
    const by = new Map();
    for (const r of g.data) { if (!by.has(r.agent)) by.set(r.agent, {}); by.get(r.agent)[r.week] = r; }
    const higherBetter = k === 'fatal_rate' ? false : k === 'connected' ? null : true;
    const toneOf = (v) => {
      if (v == null) return '';
      if (k === 'avg_score') return v >= 8.5 ? 'ok' : v >= 7 ? 'warn' : 'bad';
      if (k === 'fatal_rate') return v <= 5 ? 'ok' : v <= 12 ? 'warn' : 'bad';
      if (k === 'ptp_rate') return v >= 50 ? 'ok' : v >= 35 ? 'warn' : 'bad';
      return '';
    };
    const sel = dash.params().agent;
    const rows = [];
    for (const [agent, w] of by) {
      const total = weeks.reduce((s, wk) => s + (w[wk] ? w[wk].connected : 0), 0);
      if (total < 30) continue;
      const have = weeks.filter((wk) => w[wk] && w[wk].connected >= 10);
      const change = have.length >= 2 ? w[have[have.length - 1]][k] - w[have[0]][k] : null;
      rows.push({ agent, w, total, change });
    }
    const worse = (c) => (c == null ? Infinity : higherBetter === false ? -c : c);
    rows.sort((a, b) => worse(a.change) - worse(b.change) || b.total - a.total);
    if (!rows.length) { const p = document.createElement('p'); p.className = 'cg-fail'; p.textContent = 'No agent has 30+ connected calls in the current selection'; el.replaceChildren(p); return; }
    const table = document.createElement('table'); table.className = 'cg-table cg-heat';
    const head = document.createElement('tr');
    for (const h of ['Agent', ...weeks, 'Change']) { const th = document.createElement('th'); th.textContent = h; if (h !== 'Agent') th.className = 'cg-num'; head.appendChild(th); }
    const thead = document.createElement('thead'); thead.appendChild(head);
    const tbody = document.createElement('tbody');
    for (const r of rows) {
      const tr = document.createElement('tr'); tr.className = 'cg-click' + (r.agent === sel ? ' cg-row-on' : ''); tr.tabIndex = 0;
      tr.addEventListener('click', () => toggle('agent', r.agent));
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('agent', r.agent); } });
      const td0 = document.createElement('td'); td0.textContent = r.agent; tr.appendChild(td0);
      for (const wk of weeks) {
        const td = document.createElement('td'); td.className = 'cg-num';
        const cell = r.w[wk];
        if (cell) {
          const t = toneOf(cell[k]);
          const s = document.createElement('span'); s.className = 'cg-pill' + (t ? ' cg-' + t : ''); s.textContent = fmt(cell[k], f);
          s.title = IN(cell.connected) + ' connected calls'; td.appendChild(s);
        } else td.textContent = '—';
        tr.appendChild(td);
      }
      const tc = document.createElement('td'); tc.className = 'cg-num';
      if (r.change == null) tc.textContent = '—';
      else {
        const s = document.createElement('span');
        const good = higherBetter == null || r.change === 0 ? '' : (r.change > 0) === higherBetter ? 'ok' : 'bad';
        s.className = 'cg-pill' + (good ? ' cg-' + good : '');
        const a = Math.abs(r.change);
        s.textContent = (r.change > 0 ? '+' : r.change < 0 ? '−' : '') + (f === 'pct' ? a.toFixed(1) + ' pts' : f === 'score' ? a.toFixed(2) : IN(a));
        tc.appendChild(s);
      }
      tr.appendChild(tc);
      tbody.appendChild(tr);
    }
    table.append(thead, tbody);
    el.replaceChildren(table);
  });
})();
