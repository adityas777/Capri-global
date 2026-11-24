// Parameter-wise analysis tab: radar of parameter-category scores
(function () {
  const redraw = () => dash.draw('radar');
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', redraw));
  window.addEventListener('beforeprint', redraw);

  dash.draw('radar', (el) => {
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    const rows = g.status === 'ok' ? g.data.filter((r) => r.score != null) : [];
    if (rows.length < 3) {
      const p = document.createElement('p'); p.className = 'cg-fail';
      p.textContent = g.status === 'error' ? 'Failed to load' : 'Not enough audited calls in the current selection'; el.replaceChildren(p); return;
    }
    const W = el.clientWidth; if (!W) return;
    const H = Math.min(460, Math.max(320, W * 0.8)), cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 70;
    const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / rows.length;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * v / 10, cy + Math.sin(ang(i)) * R * v / 10];
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img')
      .attr('aria-label', 'Radar chart of parameter category scores out of 10');
    const grid = svg.append('g').attr('class', 'cg-grid');
    for (const v of [2, 4, 6, 8, 10]) grid.append('polygon').attr('points', rows.map((r, i) => pt(i, v).join(',')).join(' ')).attr('class', 'cg-ring');
    rows.forEach((r, i) => grid.append('line').attr('x1', cx).attr('y1', cy).attr('x2', pt(i, 10)[0]).attr('y2', pt(i, 10)[1]));
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data([2, 4, 6, 8]).join('text')
      .attr('x', cx + 4).attr('y', (v) => cy - R * v / 10 - 3).text((v) => v);
    svg.append('polygon').attr('points', rows.map((r, i) => pt(i, r.score).join(',')).join(' '))
      .style('fill', dash.colors[0]).style('fill-opacity', 0.35).style('stroke', dash.colors[0]).style('stroke-width', 2);
    rows.forEach((r, i) => {
      const [lx, ly] = pt(i, 11.6), c = Math.cos(ang(i));
      const t = svg.append('text').attr('class', 'cg-lab').attr('x', lx).attr('y', ly)
        .attr('text-anchor', Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end');
      t.append('tspan').text(r.category);
      t.append('tspan').attr('x', lx).attr('dy', '1.2em').attr('class', 'cg-val').text(r.score.toFixed(2));
    });
    const tip = document.createElement('div'); tip.className = 'cg-tip'; tip.hidden = true; el.appendChild(tip);
    svg.append('g').selectAll('circle').data(rows).join('circle').attr('r', 5)
      .attr('cx', (r, i) => pt(i, r.score)[0]).attr('cy', (r, i) => pt(i, r.score)[1]).style('fill', dash.colors[0])
      .on('pointermove', (ev, r) => {
        const h = document.createElement('div'); h.className = 'cg-tip-h'; h.textContent = r.category + ': ' + r.score.toFixed(2) + ' / 10';
        const d = document.createElement('div'); d.textContent = r.parameters; d.style.maxWidth = '240px';
        tip.replaceChildren(h, d); tip.hidden = false;
        const b = el.getBoundingClientRect();
        let x = ev.clientX - b.left + 12, y = ev.clientY - b.top + 12;
        if (x + tip.offsetWidth > b.width) x = Math.max(0, ev.clientX - b.left - tip.offsetWidth - 12);
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
      })
      .on('pointerleave', () => { tip.hidden = true; });
  });
})();

// Call categorisation breakdowns: click a bar to list its calls (with Greylabs links) under the chart
(function () {
  const IN = (n) => Number(n).toLocaleString('en-IN');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = (v) => v.slice(8) + ' ' + MON[+v.slice(5, 7) - 1] + ' ' + v.slice(0, 4);
  const STEP = 100;
  let shown = STEP, lastKey = '';
  const pick = (dim, cat) => {
    const p = dash.params();
    if (p.pwdim === dim && p.pwcat === cat) dash.setParams({ pwdim: null, pwcat: null });
    else dash.setParams({ pwdim: dim, pwcat: cat });
  };
  const redraw = () => { dash.draw('pwbar'); dash.draw('pwcalls'); };
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', redraw));
  window.addEventListener('beforeprint', redraw);

  dash.draw('pwbar', (el) => {
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    if (g.status !== 'ok' || !g.data.length) {
      const p = document.createElement('p'); p.className = 'cg-fail';
      p.textContent = g.status === 'error' ? 'Failed to load' : 'No calls match the current filters'; el.replaceChildren(p); return;
    }
    const W = el.clientWidth; if (!W) return;
    const dim = el.dataset.pwdim, pr = dash.params();
    const sel = pr.pwdim === dim ? pr.pwcat : null;
    let rows = g.data;
    if (el.dataset.limit) rows = rows.slice(0, +el.dataset.limit);
    const rowH = 30, H = rows.length * rowH + 4;
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria || 'Bar chart');
    const lab = svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-lab').classed('cg-lab-on', (d) => d.category === sel)
      .attr('y', (d, i) => i * rowH + rowH / 2 + 4).text((d) => d.category);
    const maxLab = Math.max(80, Math.min(W * 0.42, 230));
    lab.each(function () { let s = this.textContent; while (this.getComputedTextLength() > maxLab && s.length > 4) { s = s.slice(0, -2); this.textContent = s + '…'; } });
    const lw = Math.min(maxLab, d3.max(lab.nodes(), (n) => n.getComputedTextLength()) || 60);
    const vt = (d) => IN(d.calls) + '  ·  ' + (+d.share).toFixed(1) + '%';
    const probe = svg.append('text').attr('class', 'cg-val').text(rows.map(vt).reduce((a, b) => (b.length > a.length ? b : a), ''));
    const vw = probe.node().getComputedTextLength() + 10; probe.remove();
    const x0 = lw + 10;
    const x = d3.scaleLinear().domain([0, d3.max(rows, (d) => d.calls) || 1]).range([0, Math.max(20, W - x0 - vw)]);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-track')
      .attr('x', x0).attr('y', (d, i) => i * rowH + 7).attr('height', rowH - 14).attr('rx', 3).attr('width', x.range()[1]);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('x', x0).attr('y', (d, i) => i * rowH + 7)
      .attr('height', rowH - 14).attr('rx', 3).attr('width', (d) => Math.max(1, x(d.calls))).style('fill', dash.colors[0])
      .style('opacity', (d) => (sel && d.category !== sel ? 0.3 : 1));
    svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-val')
      .attr('x', (d) => x0 + x(d.calls) + 6).attr('y', (d, i) => i * rowH + rowH / 2 + 4).text(vt);
    const tip = document.createElement('div'); tip.className = 'cg-tip'; tip.hidden = true; el.appendChild(tip);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-hit cg-click')
      .attr('x', 0).attr('y', (d, i) => i * rowH).attr('width', W).attr('height', rowH)
      .on('pointermove', (ev, d) => {
        const lines = [[String(d.category)], ['Calls', IN(d.calls)], ['Share of calls', (+d.share).toFixed(1) + '%'], ['', d.category === sel ? 'Click to close the call list' : 'Click to list these calls']];
        tip.replaceChildren(...lines.map((l, i) => {
          const dv = document.createElement('div');
          if (i === 0) { dv.className = 'cg-tip-h'; dv.textContent = l[0]; return dv; }
          const a = document.createElement('span'); a.textContent = l[0]; const b = document.createElement('b'); b.textContent = l[1]; dv.append(a, b); return dv;
        }));
        tip.hidden = false;
        const r = el.getBoundingClientRect();
        let tx = ev.clientX - r.left + 14, ty = ev.clientY - r.top + 14;
        if (tx + tip.offsetWidth > r.width) tx = Math.max(0, ev.clientX - r.left - tip.offsetWidth - 14);
        if (ty + tip.offsetHeight > r.height) ty = Math.max(0, ev.clientY - r.top - tip.offsetHeight - 14);
        tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
      })
      .on('pointerleave', () => { tip.hidden = true; })
      .on('click', (ev, d) => { tip.hidden = true; pick(dim, d.category); });
  });

  dash.draw('pwcalls', (el) => {
    const pr = dash.params();
    if (pr.pwdim !== el.dataset.for || !pr.pwcat) { el.replaceChildren(); el.classList.remove('dash-skeleton'); return; }
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    const key = pr.pwdim + '|' + pr.pwcat + '|' + g.data.length;
    if (key !== lastKey) { shown = STEP; lastKey = key; }
    const rows = g.data;
    const head = document.createElement('div'); head.className = 'cg-pwcalls-h';
    const t = document.createElement('span');
    t.textContent = IN(rows.length) + ' call' + (rows.length === 1 ? '' : 's') + ' in “' + pr.pwcat + '”, newest first. Click a call ID to open it in Greylabs.';
    const close = document.createElement('button'); close.type = 'button'; close.className = 'cg-linkbtn'; close.textContent = 'Close list';
    close.addEventListener('click', () => dash.setParams({ pwdim: null, pwcat: null }));
    head.append(t, close);
    const table = document.createElement('table'); table.className = 'cg-table cg-compact';
    const hr = document.createElement('tr');
    for (const h of ['Call', 'Date', 'Hour', 'Agent', 'Campaign', 'Outcome', 'Score', 'Fatal', 'Duration']) {
      const th = document.createElement('th'); th.textContent = h; if (['Score', 'Duration'].includes(h)) th.className = 'cg-num'; hr.appendChild(th);
    }
    const thead = document.createElement('thead'); thead.appendChild(hr);
    const tb = document.createElement('tbody');
    for (const r of rows.slice(0, shown)) {
      const tr = document.createElement('tr');
      const c0 = document.createElement('td');
      const a = document.createElement('a'); a.href = 'https://app.greylabs.ai/call-details/' + encodeURIComponent(r.id);
      a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'cg-calllink'; a.textContent = r.id + ' ↗'; a.title = 'Open this call in Greylabs';
      c0.appendChild(a); tr.appendChild(c0);
      const vals = [date(r.date), r.hour, r.agent, r.campaign || '—', r.outcome, r.score == null ? '—' : (+r.score).toFixed(2), r.fatal, IN(r.dur) + 's'];
      vals.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i === 5 || i === 7) td.className = 'cg-num'; tr.appendChild(td); });
      tb.appendChild(tr);
    }
    table.append(thead, tb);
    const wrap = document.createElement('div'); wrap.className = 'cg-scroll cg-pwcalls-body'; wrap.appendChild(table);
    const parts = [head, wrap];
    if (rows.length > shown) {
      const more = document.createElement('button'); more.type = 'button'; more.className = 'cg-linkbtn cg-more';
      more.textContent = 'Show ' + IN(Math.min(STEP, rows.length - shown)) + ' more (' + IN(shown) + ' of ' + IN(rows.length) + ' shown)';
      more.addEventListener('click', () => { shown += STEP; dash.draw('pwcalls'); });
      parts.push(more);
    }
    el.replaceChildren(...parts);
  });
})();
