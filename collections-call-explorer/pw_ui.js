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
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * v / 100, cy + Math.sin(ang(i)) * R * v / 100];
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img')
      .attr('aria-label', 'Radar chart of parameter category scores out of 100');
    const grid = svg.append('g').attr('class', 'cg-grid');
    for (const v of [20, 40, 60, 80, 100]) grid.append('polygon').attr('points', rows.map((r, i) => pt(i, v).join(',')).join(' ')).attr('class', 'cg-ring');
    rows.forEach((r, i) => grid.append('line').attr('x1', cx).attr('y1', cy).attr('x2', pt(i, 100)[0]).attr('y2', pt(i, 100)[1]));
    svg.append('g').attr('class', 'cg-axis').selectAll('text').data([20, 40, 60, 80]).join('text')
      .attr('x', cx + 4).attr('y', (v) => cy - R * v / 100 - 3).text((v) => v);
    svg.append('polygon').attr('points', rows.map((r, i) => pt(i, r.score).join(',')).join(' '))
      .style('fill', dash.colors[0]).style('fill-opacity', 0.35).style('stroke', dash.colors[0]).style('stroke-width', 2);
    rows.forEach((r, i) => {
      const [lx, ly] = pt(i, 116), c = Math.cos(ang(i));
      const t = svg.append('text').attr('class', 'cg-lab').attr('x', lx).attr('y', ly)
        .attr('text-anchor', Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end');
      t.append('tspan').text(r.category);
      t.append('tspan').attr('x', lx).attr('dy', '1.2em').attr('class', 'cg-val').text(r.score.toFixed(2));
    });
    const tip = document.createElement('div'); tip.className = 'cg-tip'; tip.hidden = true; el.appendChild(tip);
    svg.append('g').selectAll('circle').data(rows).join('circle').attr('r', 5)
      .attr('cx', (r, i) => pt(i, r.score)[0]).attr('cy', (r, i) => pt(i, r.score)[1]).style('fill', dash.colors[0])
      .on('pointermove', (ev, r) => {
        const h = document.createElement('div'); h.className = 'cg-tip-h'; h.textContent = r.category + ': ' + r.score.toFixed(2) + ' / 100';
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
  const PNAME = { p_open: 'Avoid Delay in Opening', p_greet: 'Greeting & Introduction', p_purpose: 'Purpose of the Call', p_queries: 'Did the Agent Understand & Address All Customer Queries/Concerns?', p_info: 'Complete & Correct Information Provided', p_probe: 'Necessary Probing Done', p_objection: 'Ownership & Effective Objection Handling', p_tone: 'Tone, Articulation, Professional Language, ROS', p_listen: 'Active Listening', p_empathy: 'Empathy / Apology / Personalization / Acknowledgement', p_hold: 'Dead Air/Hold/Conference Procedure Followed', p_dispo: 'Correct Disposition Tagged', p_proactive: 'Demonstrated Proactive Effort to Drive Desired Action', p_closing: 'Closing', p_ethics: 'ZT - Adherence of Conduct & Ethics', p_datasec: 'Data Security / Non-Disclosure Breached', p_aprof: 'Agent Profanity' };
  const PREFIX = { kpi: '', att: '', param: 'Failed ', pfatal: 'Fatal on ', agent: 'Calls of ', agent2: 'Calls of ', coach: 'Connected calls of ', aheat: 'Connected calls of ', campaign: 'Campaign ', tday: 'Calls on ', tweek: 'Calls in week ', thour: 'Calls at ', week: 'Calls in week ', Lkpi: 'Leads: ', Lstage: 'Leads: ', Lstatus: 'Leads with best outcome ', Latt: 'Leads with ', Lemi: 'Leads with EMI ', Lcycle: 'Leads on ', Lagent: 'Lead calls by ', freason: 'Fatal on ', fagent: 'Fatal calls of ', fsup: 'Fatal calls under ', nfail: 'Non-fatal calls that failed ', nagent: 'Non-fatal calls of ', nsup: 'Non-fatal calls under ' };
  const KPIN = { all: 'All calls', connected: 'Connected & audited calls', fatal: 'Fatal calls', ptp: 'Promise-to-pay calls', paid: 'Payment-done calls', willclear: 'Will-clear calls', refused: 'Refused-to-pay calls', high: 'High payment intent calls', leads: 'Calls with a lead' };
  const LKPIN = { all: 'all leads', reached: 'reached leads', promised: 'leads that promised or will clear', paid: 'paid leads', multi: 'leads handled by 2+ agents' };
  const timeLabel = (pr, pre) => { const [id, k] = pr.pwcat.split('||'); return pre + (PNAME[id] || id) + ' — ' + (/^\d{4}-\d\d-\d\d$/.test(k) ? date(k) : k); };
  const labelOf = (pr) => pr.pwdim === 'freasont' ? timeLabel(pr, 'Fatal on ') : pr.pwdim === 'nfailt' ? timeLabel(pr, 'Non-fatal calls that failed ') : pr.pwdim === 'rsubc' ? pr.pwcat.replace('||__rest', '||Other / not specified').replace('||', ' — ') : pr.pwdim === 'tday' ? 'Calls on ' + date(pr.pwcat) : pr.pwdim === 'kpi' ? KPIN[pr.pwcat] || pr.pwcat : pr.pwdim === 'Lkpi' ? 'Calls of ' + (LKPIN[pr.pwcat] || pr.pwcat) : (PREFIX[pr.pwdim] || '') + (PNAME[pr.pwcat] || pr.pwcat);
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
    const sub = el.dataset.subdim;
    const sel = pr.pwdim === dim || (sub && pr.pwdim === sub) ? pr.pwcat : null;
    let rows = g.data;
    if (el.dataset.limit) rows = rows.slice(0, +el.dataset.limit);
    const rowH = 30, H = rows.length * rowH + 4;
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', el.dataset.aria || 'Bar chart');
    const lab = svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-lab').classed('cg-lab-on', (d) => (d.key ?? d.category) === sel)
      .attr('x', (d) => (d.level ? 14 : 0)).classed('cg-lab-sub', (d) => !!d.level).attr('y', (d, i) => i * rowH + rowH / 2 + 4).text((d) => d.category);
    const maxLab = Math.max(80, Math.min(W * 0.42, 230));
    lab.each(function (d) { let s = this.textContent; while (this.getComputedTextLength() + (d.level ? 14 : 0) > maxLab && s.length > 4) { s = s.slice(0, -2); this.textContent = s + '…'; } });
    const lw = Math.min(maxLab, d3.max(lab.nodes(), (n) => n.getComputedTextLength() + (+n.getAttribute('x') || 0)) || 60);
    const vt = (d) => IN(d.calls) + (d.share == null ? '' : '  ·  ' + (+d.share).toFixed(2) + '%');
    const probe = svg.append('text').attr('class', 'cg-val').text(rows.map(vt).reduce((a, b) => (b.length > a.length ? b : a), ''));
    const vw = probe.node().getComputedTextLength() + 10; probe.remove();
    const defs = rows.map((d) => (window.CGdef ? window.CGdef(el.dataset.defdim || dim, d.key ?? d.category, d.category) : null));
    const iw = defs.some(Boolean) ? 18 : 0;
    const x0 = lw + 10 + iw;
    const x = d3.scaleLinear().domain([0, d3.max(rows, (d) => d.calls) || 1]).range([0, Math.max(20, W - x0 - vw)]);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-track')
      .attr('x', x0).attr('y', (d, i) => i * rowH + 7).attr('height', rowH - 14).attr('rx', 3).attr('width', x.range()[1]);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('x', x0).attr('y', (d, i) => i * rowH + 7)
      .attr('height', rowH - 14).attr('rx', 3).attr('width', (d) => Math.max(1, x(d.calls))).style('fill', el.dataset.color === 'bad' ? 'var(--color-bad)' : dash.colors[0])
      .style('opacity', (d) => (sel && (d.key ?? d.category) !== sel ? 0.3 : d.level ? 0.6 : 1));
    svg.append('g').selectAll('text').data(rows).join('text').attr('class', 'cg-val')
      .attr('x', (d) => x0 + x(d.calls) + 6).attr('y', (d, i) => i * rowH + rowH / 2 + 4).text(vt);
    const tip = document.createElement('div'); tip.className = 'cg-tip'; tip.hidden = true; el.appendChild(tip);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', 'cg-hit cg-click')
      .attr('x', 0).attr('y', (d, i) => i * rowH).attr('width', W).attr('height', rowH)
      .on('pointermove', (ev, d) => {
        const lines = [[String(d.category)], ['Calls', IN(d.calls)], [el.dataset.sharelabel || 'Share of calls', d.share == null ? '—' : (+d.share).toFixed(2) + '%'], ['', (d.key ?? d.category) === sel ? 'Click to close the call list' : 'Click to list these calls']];
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
      .on('click', (ev, d) => { tip.hidden = true; pick(d.level ? el.dataset.subdim : dim, d.key ?? d.category); });
    if (iw) window.CGinfoIcons(el, svg, rows.map((d, i) => (defs[i] ? { x: lw + 16, y: i * rowH + rowH / 2, text: defs[i] } : null)).filter(Boolean));
  });

  // remember where the last click happened (bottom edge of the clicked row, bar, point or button),
  // so a call list can open right below it instead of at the bottom of a long chart or table
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || !t.closest || t.closest('.cg-pwcalls')) return;
    const hit = t.closest('tr, .cg-hit, .cg-svgi, button, .cg-kpi, .cg-tile') || t;
    const r = hit.getBoundingClientRect();
    window.CGlastClick = { y: r.bottom + window.scrollY };
  }, true);
  const place = (el, open) => {
    const host = el.offsetParent;
    if (!open || el.dataset.static || !host || !window.CGlastClick) { el.classList.remove('cg-pop'); el.style.top = ''; return; }
    const top = window.CGlastClick.y - (host.getBoundingClientRect().top + window.scrollY);
    if (top > 0 && top < host.offsetHeight - 30) { el.classList.add('cg-pop'); el.style.top = top + 'px'; }
    else { el.classList.remove('cg-pop'); el.style.top = ''; }
  };

  dash.draw('pwcalls', (el) => {
    const pr = dash.params();
    if (pr.pwdim !== el.dataset.for || !pr.pwcat) { el.replaceChildren(); el.classList.remove('dash-skeleton'); place(el, false); return; }
    const g = dash.data(el.dataset.source);
    if (g.status === 'loading' || g.data == null) { el.classList.add('dash-skeleton'); return; }
    el.classList.remove('dash-skeleton');
    const key = pr.pwdim + '|' + pr.pwcat + '|' + g.data.length;
    if (key !== lastKey) { shown = STEP; lastKey = key; }
    const rows = g.data;
    const head = document.createElement('div'); head.className = 'cg-pwcalls-h';
    const t = document.createElement('span');
    t.textContent = IN(rows.length) + ' call' + (rows.length === 1 ? '' : 's') + ' in “' + labelOf(pr) + '”, newest first. Click a call ID to open it in Greylabs.';
    const close = document.createElement('button'); close.type = 'button'; close.className = 'cg-linkbtn'; close.textContent = 'Close list';
    close.addEventListener('click', () => dash.setParams({ pwdim: null, pwcat: null }));
    const FMAP = { outcome: 'outcome', intent: 'intent', cap: 'cap', reason: 'reason', rsub: 'rsub', sent: 'sent', week: 'week', tweek: 'week',
      agent: 'agent', agent2: 'agent', coach: 'agent', aheat: 'agent', Lagent: 'agent', fagent: 'agent', nagent: 'agent', campaign: 'campaign',
      param: 'param', Lstatus: 'lstatus', Latt: 'latt', Lemi: 'lemi', Lcycle: 'lcycle' };
    let fk = FMAP[pr.pwdim], fv = pr.pwcat;
    if (pr.pwdim === 'att') fk = ['Attended', 'Not attended'].includes(fv) ? 'attend' : 'dband';
    if (pr.pwdim === 'kpi' && fv === 'fatal') { fk = 'flag'; fv = 'f_fatal'; }
    if (pr.pwdim === 'kpi' && fv === 'high') { fk = 'intent'; fv = 'High'; }
    if (pr.pwdim === 'rsubc') { const su = fv.split('||')[1]; fk = su === '__rest' ? null : 'rsub'; fv = su; }
    if (fv === 'Non-Actionable Calls') fk = null;
    const acts = document.createElement('span'); acts.className = 'cg-pwcalls-acts';
    if (fk) {
      const fb = document.createElement('button'); fb.type = 'button'; fb.className = 'cg-linkbtn'; fb.textContent = 'Filter whole page to this';
      fb.title = 'Apply this as a filter to every tab instead of just listing its calls';
      fb.addEventListener('click', () => dash.setParams({ [fk]: fv, pwdim: null, pwcat: null }));
      acts.appendChild(fb);
    }
    acts.appendChild(close);
    head.append(t, acts);
    const table = document.createElement('table'); table.className = 'cg-table cg-compact';
    const hr = document.createElement('tr');
    const withLoan = rows.length && rows[0].loan !== undefined && pr.pwdim[0] === 'L';
    for (const h of ['Call', ...(withLoan ? ['Loan (masked)'] : []), 'Date', 'Hour', 'Agent', 'Campaign', 'Outcome', 'Score /100', 'Fatal', 'Fatal on', 'Duration']) {
      const th = document.createElement('th'); th.textContent = h; if (['Score /100', 'Duration'].includes(h)) th.className = 'cg-num'; hr.appendChild(th);
    }
    const thead = document.createElement('thead'); thead.appendChild(hr);
    const tb = document.createElement('tbody');
    for (const r of rows.slice(0, shown)) {
      const tr = document.createElement('tr');
      const c0 = document.createElement('td');
      const a = document.createElement('a'); a.href = 'https://app.greylabs.ai/call-details/' + encodeURIComponent(r.id);
      a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'cg-calllink'; a.textContent = r.id + ' ↗'; a.title = 'Open this call in Greylabs';
      c0.appendChild(a); tr.appendChild(c0);
      const vals = [...(withLoan ? [r.loan || '—'] : []), date(r.date), r.hour, r.agent, r.campaign || '—', r.outcome, r.score == null ? '—' : (+r.score).toFixed(2), r.fatal, r.fatal_on || '—', IN(r.dur) + 's'];
      const o = withLoan ? 1 : 0;
      vals.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i === 5 + o || i === 8 + o) td.className = 'cg-num'; if (i === 7 + o) td.className = 'cg-wrap'; tr.appendChild(td); });
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
    place(el, true);
  });
})();
