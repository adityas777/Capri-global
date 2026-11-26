// Fatal vs non-fatal ring and the two breakdowns it opens (Parameter wise analysis tab)
(function () {
  const IN = (n) => Number(n).toLocaleString('en-IN');
  const ST = (window.CGF = { grain: 'week' });
  const NAMES = { p_open: 'Avoid Delay in Opening', p_greet: 'Greeting & Introduction', p_purpose: 'Purpose of the Call', p_queries: 'Did the Agent Understand & Address All Customer Queries/Concerns?', p_info: 'Complete & Correct Information Provided', p_probe: 'Necessary Probing Done', p_objection: 'Ownership & Effective Objection Handling', p_tone: 'Tone, Articulation, Professional Language, ROS', p_listen: 'Active Listening', p_empathy: 'Empathy / Apology / Personalization / Acknowledgement', p_hold: 'Dead Air/Hold/Conference Procedure Followed', p_dispo: 'Correct Disposition Tagged', p_proactive: 'Demonstrated Proactive Effort to Drive Desired Action', p_closing: 'Closing', p_ethics: 'ZT - Adherence of Conduct & Ethics', p_datasec: 'Data Security / Non-Disclosure Breached', p_aprof: 'Agent Profanity' };
  const DRAWS = ['val', 'pwbar', 'pwcalls', 'fline', 'donut'];
  document.querySelectorAll('.cg-sw-non').forEach((e) => { e.style.background = dash.colors[0]; });
  const setView = (v) => {
    const p = dash.params();
    const next = v && p.fview !== v ? v : null;
    dash.setParams({ fview: next, pwdim: null, pwcat: null });
  };
  document.querySelectorAll('[data-fview]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.fview === '') dash.setParams({ fview: null, pwdim: null, pwcat: null });
    else setView(b.dataset.fview);
  }));
  document.querySelectorAll('[data-allcalls]').forEach((b) => b.addEventListener('click', () => {
    const p = dash.params();
    if (p.pwdim === 'fatal' && p.pwcat === b.dataset.allcalls) dash.setParams({ pwdim: null, pwcat: null });
    else dash.setParams({ pwdim: 'fatal', pwcat: b.dataset.allcalls });
  }));
  document.querySelectorAll('[data-fgrain] button').forEach((b) => b.addEventListener('click', () => { ST.grain = b.dataset.v; sync(); dash.draw('fline'); }));
  let shownView = null;
  function sync() {
    const p = dash.params();
    const v = p.fview || null;
    const fb = document.getElementById('fatal-breakdown'), nb = document.getElementById('nonfatal-breakdown');
    if (fb) fb.hidden = v !== 'fatal';
    if (nb) nb.hidden = v !== 'nonfatal';
    document.querySelectorAll('.cg-fvbtn[data-fview]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fview === v)));
    document.querySelectorAll('[data-allcalls]').forEach((b) => b.setAttribute('aria-pressed', String(p.pwdim === 'fatal' && p.pwcat === b.dataset.allcalls)));
    document.querySelectorAll('[data-fgrain] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === ST.grain)));
    if (v !== shownView) { shownView = v; DRAWS.forEach((n) => dash.draw(n)); }
  }
  dash.onData(sync);
  document.querySelectorAll('.cg-tab').forEach((t) => t.addEventListener('click', () => { dash.draw('donut'); dash.draw('fline'); }));
  window.addEventListener('beforeprint', () => { dash.draw('donut'); dash.draw('fline'); });

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

  // ring: fatal vs non-fatal, each part opens its breakdown
  dash.draw('donut', (el) => {
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    const d = g.status === 'ok' ? g.data[0] : null;
    if (!d || !d.calls) { const p = document.createElement('p'); p.className = 'cg-fail'; p.textContent = g.status === 'error' ? 'Failed to load' : 'No calls match the current filters'; el.replaceChildren(p); return; }
    const W = el.clientWidth; if (!W) return;
    const H = 230, R = Math.min(W, H) / 2 - 8, r0 = R * 0.72, view = dash.params().fview;
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria);
    const parts = [{ k: 'fatal', label: 'Fatal calls', v: d.fatal, pct: d.fatal_pct, c: 'var(--color-bad)' },
      { k: 'nonfatal', label: 'Non-fatal calls', v: d.nonfatal, pct: d.nonfatal_pct, c: dash.colors[0] }];
    const arcs = d3.pie().sort(null).value((p) => p.v)(parts);
    const arc = d3.arc().innerRadius(r0).outerRadius(R), arcOn = d3.arc().innerRadius(r0).outerRadius(R + 6);
    const gg = svg.append('g').attr('transform', `translate(${W / 2},${H / 2})`);
    const tip = tipBox(el);
    gg.selectAll('path').data(arcs).join('path').attr('d', (a) => (a.data.k === view ? arcOn(a) : arc(a)))
      .style('fill', (a) => a.data.c).style('opacity', (a) => (view && a.data.k !== view ? 0.35 : 1)).attr('class', 'cg-click').style('cursor', 'pointer')
      .on('pointermove', (ev, a) => tip.show(a.data.label, [['Calls', IN(a.data.v)], ['Share of all calls', a.data.pct.toFixed(2) + '%'], ['', a.data.k === view ? 'Click to close the breakdown' : 'Click for the breakdown']], ev))
      .on('pointerleave', () => tip.hide())
      .on('click', (ev, a) => { tip.hide(); setView(a.data.k); });
    gg.append('text').attr('class', 'cg-donut-n').attr('text-anchor', 'middle').attr('y', 4).text(IN(d.calls));
    gg.append('text').attr('class', 'cg-donut-l').attr('text-anchor', 'middle').attr('y', 24).text('Total calls');
  });

  // lines over time, one per parameter. The legend chips switch lines on and off (the five largest start on);
  // clicking a point lists the calls behind it.
  const SEL = (ST.sel = ST.sel || {});
  dash.draw('fline', (el) => {
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    const rows = g.status === 'ok' ? g.data.filter((r) => r.grain === ST.grain) : [];
    if (!rows.length) { const p = document.createElement('p'); p.className = 'cg-fail'; p.textContent = g.status === 'error' ? 'Failed to load' : 'No calls match the current filters'; el.replaceChildren(p); return; }
    const W = el.clientWidth; if (!W) return;
    const tot = {};
    for (const r of rows) for (const k of Object.keys(NAMES)) if (r[k]) tot[k] = (tot[k] || 0) + r[k];
    const all = Object.keys(tot).sort((a, b) => tot[b] - tot[a]);
    const key = el.dataset.source;
    if (!SEL[key]) SEL[key] = new Set(all.slice(0, 5));
    const on = SEL[key];
    const colorOf = (k) => { const i = all.indexOf(k); return dash.colors[i % dash.colors.length]; };
    const dashOf = (k) => (Math.floor(all.indexOf(k) / dash.colors.length) % 2 ? '6 4' : null);
    const ser = all.filter((k) => on.has(k));
    el.replaceChildren();
    // legend: every parameter with data, click to show or hide its line
    const leg = document.createElement('div'); leg.className = 'cg-legend cg-legend-toggle';
    for (const k of all) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cg-legbtn' + (on.has(k) ? ' on' : '');
      b.setAttribute('aria-pressed', String(on.has(k)));
      b.title = (on.has(k) ? 'Hide ' : 'Show ') + NAMES[k] + ' (' + IN(tot[k]) + ' calls in total)';
      const sw = document.createElement('i'); sw.className = 'cg-sw'; sw.style.background = colorOf(k);
      b.append(sw, NAMES[k]);
      b.addEventListener('click', () => { if (on.has(k)) on.delete(k); else on.add(k); dash.draw('fline'); });
      leg.appendChild(b);
    }
    const ctl = document.createElement('div'); ctl.className = 'cg-legctl';
    for (const [lab, fn] of [['Show all', () => all.forEach((k) => on.add(k))], ['Clear', () => on.clear()], ['Top 5', () => { on.clear(); all.slice(0, 5).forEach((k) => on.add(k)); }]]) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cg-linkbtn'; b.textContent = lab;
      b.addEventListener('click', () => { fn(); dash.draw('fline'); }); ctl.appendChild(b);
    }
    el.append(leg, ctl);
    if (!ser.length) { const p = document.createElement('p'); p.className = 'cg-fail'; p.textContent = 'Pick at least one parameter above to draw its line.'; el.appendChild(p); return; }
    const H = 260, m = { t: 10, r: 14, b: 28, l: 12 };
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria);
    const y = d3.scaleLinear().domain([0, (d3.max(rows, (r) => d3.max(ser, (k) => r[k] || 0)) || 1) * 1.08]).nice();
    const probe = svg.append('g').attr('class', 'cg-axis').selectAll('text').data(y.ticks(5)).join('text').text(IN);
    m.l = (d3.max(probe.nodes(), (n) => n.getComputedTextLength()) || 20) + 12; svg.select('g.cg-axis').remove();
    y.range([H - m.b, m.t]);
    const x = d3.scalePoint().domain(rows.map((r) => r.key)).range([m.l + 10, W - m.r - 10]);
    svg.append('g').attr('class', 'cg-grid').selectAll('line').data(y.ticks(5)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y);
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data(y.ticks(5)).join('text').attr('x', m.l - 6).attr('y', (v) => y(v) + 4).attr('text-anchor', 'end').text(IN);
    const every = Math.max(1, Math.ceil((rows.length * 90) / (W - m.l - m.r)));
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data(rows.filter((r, i) => i % every === 0)).join('text')
      .attr('x', (r) => x(r.key)).attr('y', H - 8).attr('text-anchor', 'middle').text((r) => r.category);
    for (const k of ser) svg.append('path').datum(rows).attr('class', 'cg-line').style('stroke', colorOf(k)).style('stroke-dasharray', dashOf(k))
      .attr('d', d3.line().x((r) => x(r.key)).y((r) => y(r[k] || 0)));
    const guide = svg.append('line').attr('class', 'cg-guide').attr('y1', m.t).attr('y2', H - m.b).style('opacity', 0);
    const tip = tipBox(el);
    svg.append('rect').attr('class', 'cg-hit').attr('x', m.l).attr('width', W - m.l - m.r).attr('height', H)
      .on('pointermove', (ev) => {
        const px = d3.pointer(ev)[0];
        let best = 0, bd = Infinity;
        rows.forEach((r, i) => { const dd = Math.abs(x(r.key) - px); if (dd < bd) { bd = dd; best = i; } });
        const r = rows[best];
        guide.attr('x1', x(r.key)).attr('x2', x(r.key)).style('opacity', 1);
        tip.show(r.category + ' · ' + IN(r.total) + ' calls', [...ser.map((k) => [NAMES[k], IN(r[k] || 0), colorOf(k)]), ['', 'Click a dot to list its calls']], ev);
      })
      .on('pointerleave', () => { tip.hide(); guide.style('opacity', 0); });
    // dots on top of the hover area so each one can be clicked
    const listDim = el.dataset.listdim, pr = dash.params();
    const pts = [];
    for (const k of ser) for (const r of rows) pts.push({ k, r });
    svg.append('g').selectAll('circle').data(pts).join('circle').attr('class', 'cg-dot-click')
      .attr('r', (d) => (pr.pwdim === listDim && pr.pwcat === d.k + '||' + d.r.key ? 7 : 4.5))
      .attr('cx', (d) => x(d.r.key)).attr('cy', (d) => y(d.r[d.k] || 0)).style('fill', (d) => colorOf(d.k))
      .on('pointermove', (ev, d) => { ev.stopPropagation(); guide.style('opacity', 0); tip.show(d.r.category, [[NAMES[d.k], IN(d.r[d.k] || 0) + ' calls', colorOf(d.k)], ['', 'Click to list these calls']], ev); })
      .on('pointerleave', () => tip.hide())
      .on('click', (ev, d) => { tip.hide(); window.CGpick(listDim, d.k + '||' + d.r.key); });
  });
})();
