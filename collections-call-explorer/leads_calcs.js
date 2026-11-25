// Lead-wise analysis: one lead = one loan account. Calls are first narrowed by the page's filters,

// then grouped by loan account; the lead tab's own clicks narrow the leads further.

dash.calc('leads', {
  title: 'Leads (loan accounts) in the selection',
  description: 'One row per loan account called in November, built from its calls that match the page filters. Loan and mobile numbers are masked; the lead key is a one-way hash.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
      (!p.agent || r.agent === p.agent) &&
      (!p.lang || r.lang === p.lang) &&
      (!p.campaign || r.campaign === p.campaign) &&
      (!p.outcome || r.outcome === p.outcome) &&
      (!p.intent || r.intent === p.intent) &&
      (!p.cap || r.cap === p.cap) &&
      (!p.reason || r.reason === p.reason) &&
      (!p.rsub || r.rsub === p.rsub) &&
      (!p.sent || r.sent === p.sent) &&
      (!p.attend || r.attend === p.attend) &&
      (!p.dband || r.dband === p.dband) &&
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const RANK = { 'Paid': 7, 'Promised to pay': 6, 'Will clear': 5, 'Callback / follow-up': 4, 'Refused to pay': 3, 'Other connected': 2, 'Not reached': 1 };
    const statusOf = (o) => o === 'Payment Done' ? 'Paid'
      : ['Promise To Pay', 'Penal PTP', 'NACH PTP'].includes(o) ? 'Promised to pay'
      : o === 'Will Clear' ? 'Will clear'
      : ['Call Back', 'Call Back or Follow up', 'CBFU', 'Call Back Hold'].includes(o) ? 'Callback / follow-up'
      : ['Refuse To Pay', 'Penal RTP'].includes(o) ? 'Refused to pay' : 'Other connected';
    const g = new Map();
    for (const r of calls) {
      if (r.lan == null || !keep(r)) continue;
      let o = g.get(r.lan);
      if (!o) g.set(r.lan, o = { lan: r.lan, lan_masked: r.lan_masked, mobile: r.mobile_masked, bestDate: null, latestDate: null, firstId: r.id, lastId: r.id, bestId: null, latestId: null, amtId: null, prod: r.prod, cycle: r.cycle, emi: null, calls: 0, connected: 0, agents: new Set(),
        first: r.date, last: r.date, toConnect: null, best: 'Not reached', latest: null, intent: null, hi: 0, ptp: 0, paid: 0, amt: 0 });
      o.calls++; o.agents.add(r.agent); o.last = r.date; o.lastId = r.id; o.prod = r.prod; o.cycle = r.cycle;
      if (r.mobile_masked != null) o.mobile = r.mobile_masked;
      if (r.emi != null) o.emi = r.emi;
      if (!r.act) continue;
      o.connected++;
      if (o.toConnect == null) o.toConnect = o.calls;
      const s = statusOf(r.outcome);
      if (RANK[s] > RANK[o.best]) { o.best = s; o.bestDate = r.date; o.bestId = r.id; }
      o.latest = r.outcome; o.latestDate = r.date; o.latestId = r.id; o.intent = r.intent;
      if (r.intent === 'High') o.hi = 1;
      if (s === 'Promised to pay' || s === 'Will clear') o.ptp = 1;
      if (s === 'Paid') o.paid = 1;
      if (r.amt > o.amt) { o.amt = r.amt; o.amtId = r.id; }
    }
    const att = (n) => (n === 1 ? '1 call' : n === 2 ? '2 calls' : n === 3 ? '3 calls' : n <= 5 ? '4–5 calls' : '6+ calls');
    const band = (e) => (e == null ? 'Unknown' : e < 5000 ? 'Under ₹5k' : e < 10000 ? '₹5k–10k' : e < 20000 ? '₹10k–20k' : e < 50000 ? '₹20k–50k' : '₹50k and above');
    return [...g.values()].map((o) => ({ lan: o.lan, lan_masked: o.lan_masked, mobile_masked: o.mobile, prod: o.prod, cycle: o.cycle, emi: o.emi, emi_band: band(o.emi),
      calls: o.calls, att_band: att(o.calls), connected: o.connected, agents: o.agents.size, first_date: o.first, last_date: o.last,
      calls_to_connect: o.toConnect, best: o.best, best_date: o.bestDate, latest_outcome: o.latest, latest_date: o.latestDate, latest_intent: o.intent, high_intent: o.hi,
      promised: o.ptp, paid: o.paid, ptp_amount: o.amt || null,
      first_call_id: o.firstId, last_call_id: o.lastId, best_call_id: o.bestId, latest_call_id: o.latestId, ptp_call_id: o.amtId }));
  },
});

dash.calc('lead_kpis', {
  title: 'Lead headline figures',
  description: 'Totals for the leads in the selection, after the lead tab’s own filters.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi) &&
      (!p.lcycle || r.cycle === p.lcycle);
    let n = 0, reached = 0, promised = 0, paid = 0, calls = 0, tc = 0, tcn = 0, multi = 0;
    for (const r of leads) {
      if (!lkeep(r)) continue;
      n++; calls += r.calls;
      if (r.connected) { reached++; tc += r.calls_to_connect; tcn++; }
      if (r.promised || r.paid) promised++;
      if (r.paid) paid++;
      if (r.agents > 1) multi++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [{ leads: n, reached: reached, reached_pct: pc(reached, n), promised: promised, promised_pct: pc(promised, n),
      paid: paid, paid_pct: pc(paid, n), calls_per_lead: n ? Math.round(100 * calls / n) / 100 : null,
      calls_to_connect: tcn ? Math.round(100 * tc / tcn) / 100 : null, multi_agent_pct: pc(multi, n) }];
  },
});

dash.calc('lead_funnel', {
  title: 'Lead funnel',
  description: 'How many leads in the selection reached each stage at least once in November.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi) &&
      (!p.lcycle || r.cycle === p.lcycle);
    const c = [0, 0, 0, 0];
    for (const r of leads) {
      if (!lkeep(r)) continue;
      c[0]++;
      if (r.connected) c[1]++;
      if (r.promised || r.paid) c[2]++;
      if (r.paid) c[3]++;
    }
    const names = ['Leads called', 'Reached (connected call)', 'Promised to pay / will clear', 'Paid'];
    return names.map((stage, i) => ({ stage, leads: c[i], share: c[0] ? Math.round(10000 * c[i] / c[0]) / 100 : null }));
  },
});

dash.calc('lead_by_status', {
  title: 'Leads by best outcome reached',
  description: 'Leads, and the share reached, promised and paid, for each best outcome reached value; ignores its own lead filter.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi) &&
      (!p.lcycle || r.cycle === p.lcycle);
    const ORDER = ['Paid', 'Promised to pay', 'Will clear', 'Callback / follow-up', 'Refused to pay', 'Other connected', 'Not reached'];
    const g = new Map();
    let total = 0;
    for (const r of leads) {
      if (!lkeep(r)) continue;
      const v = r.best;
      let o = g.get(v);
      if (!o) g.set(v, o = { n: 0, reached: 0, promised: 0, paid: 0, calls: 0 });
      o.n++; total++; o.calls += r.calls;
      if (r.connected) o.reached++;
      if (r.promised || r.paid) o.promised++;
      if (r.paid) o.paid++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const rows = [...g].map(([v, o]) => ({ status: v, leads: o.n, share: pc(o.n, total), reached_pct: pc(o.reached, o.n),
      promised_pct: pc(o.promised, o.n), paid_pct: pc(o.paid, o.n), calls_per_lead: Math.round(100 * o.calls / o.n) / 100 }));
    return ORDER ? rows.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)) : rows.sort((a, b) => b.leads - a.leads);
  },
});

dash.calc('lead_by_attempts', {
  title: 'Leads by calls per lead',
  description: 'Leads, and the share reached, promised and paid, for each calls per lead value; ignores its own lead filter.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi) &&
      (!p.lcycle || r.cycle === p.lcycle);
    const ORDER = ['1 call', '2 calls', '3 calls', '4–5 calls', '6+ calls'];
    const g = new Map();
    let total = 0;
    for (const r of leads) {
      if (!lkeep(r)) continue;
      const v = r.att_band;
      let o = g.get(v);
      if (!o) g.set(v, o = { n: 0, reached: 0, promised: 0, paid: 0, calls: 0 });
      o.n++; total++; o.calls += r.calls;
      if (r.connected) o.reached++;
      if (r.promised || r.paid) o.promised++;
      if (r.paid) o.paid++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const rows = [...g].map(([v, o]) => ({ attempts: v, leads: o.n, share: pc(o.n, total), reached_pct: pc(o.reached, o.n),
      promised_pct: pc(o.promised, o.n), paid_pct: pc(o.paid, o.n), calls_per_lead: Math.round(100 * o.calls / o.n) / 100 }));
    return ORDER ? rows.sort((a, b) => ORDER.indexOf(a.attempts) - ORDER.indexOf(b.attempts)) : rows.sort((a, b) => b.leads - a.leads);
  },
});

dash.calc('lead_by_emi_band', {
  title: 'Leads by emi band',
  description: 'Leads, and the share reached, promised and paid, for each emi band value; ignores its own lead filter.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lcycle || r.cycle === p.lcycle);
    const ORDER = ['Under ₹5k', '₹5k–10k', '₹10k–20k', '₹20k–50k', '₹50k and above', 'Unknown'];
    const g = new Map();
    let total = 0;
    for (const r of leads) {
      if (!lkeep(r)) continue;
      const v = r.emi_band;
      let o = g.get(v);
      if (!o) g.set(v, o = { n: 0, reached: 0, promised: 0, paid: 0, calls: 0 });
      o.n++; total++; o.calls += r.calls;
      if (r.connected) o.reached++;
      if (r.promised || r.paid) o.promised++;
      if (r.paid) o.paid++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const rows = [...g].map(([v, o]) => ({ emi_band: v, leads: o.n, share: pc(o.n, total), reached_pct: pc(o.reached, o.n),
      promised_pct: pc(o.promised, o.n), paid_pct: pc(o.paid, o.n), calls_per_lead: Math.round(100 * o.calls / o.n) / 100 }));
    return ORDER ? rows.sort((a, b) => ORDER.indexOf(a.emi_band) - ORDER.indexOf(b.emi_band)) : rows.sort((a, b) => b.leads - a.leads);
  },
});

dash.calc('lead_by_cycle', {
  title: 'Leads by emi cycle',
  description: 'Leads, and the share reached, promised and paid, for each emi cycle value; ignores its own lead filter.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi);
    const ORDER = ['Day 5', 'Day 10', 'Other'];
    const g = new Map();
    let total = 0;
    for (const r of leads) {
      if (!lkeep(r)) continue;
      const v = r.cycle;
      let o = g.get(v);
      if (!o) g.set(v, o = { n: 0, reached: 0, promised: 0, paid: 0, calls: 0 });
      o.n++; total++; o.calls += r.calls;
      if (r.connected) o.reached++;
      if (r.promised || r.paid) o.promised++;
      if (r.paid) o.paid++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const rows = [...g].map(([v, o]) => ({ cycle: v, leads: o.n, share: pc(o.n, total), reached_pct: pc(o.reached, o.n),
      promised_pct: pc(o.promised, o.n), paid_pct: pc(o.paid, o.n), calls_per_lead: Math.round(100 * o.calls / o.n) / 100 }));
    return ORDER ? rows.sort((a, b) => ORDER.indexOf(a.cycle) - ORDER.indexOf(b.cycle)) : rows.sort((a, b) => b.leads - a.leads);
  },
});

dash.calc('lead_list', {
  title: 'Lead list',
  description: 'Up to 300 leads in the selection, most-called first.',
  inputs: ['leads'],
  fn: (leads) => {
    const p = dash.params();
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi) &&
      (!p.lcycle || r.cycle === p.lcycle);
    return leads.filter(lkeep).sort((a, b) => b.calls - a.calls || (a.last_date < b.last_date ? 1 : -1)).slice(0, 300);
  },
});


dash.calc('lead_call_list', {
  title: 'Calls of the clicked leads',
  description: 'All calls (under the page filters) of the leads behind whatever was last clicked on the Lead-wise analysis tab: a headline card, funnel stage, bar or agent row. Newest first.',
  inputs: ['calls', 'leads'],
  fn: (calls, leads) => {
    const p = dash.params();
    if (!p.pwdim || !p.pwcat || p.pwdim[0] !== 'L') return [];
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
      (!p.agent || r.agent === p.agent) &&
      (!p.lang || r.lang === p.lang) &&
      (!p.campaign || r.campaign === p.campaign) &&
      (!p.outcome || r.outcome === p.outcome) &&
      (!p.intent || r.intent === p.intent) &&
      (!p.cap || r.cap === p.cap) &&
      (!p.reason || r.reason === p.reason) &&
      (!p.rsub || r.rsub === p.rsub) &&
      (!p.sent || r.sent === p.sent) &&
      (!p.attend || r.attend === p.attend) &&
      (!p.dband || r.dband === p.dband) &&
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const lkeep = (r) => (!p.lstatus || r.best === p.lstatus) &&
      (!p.latt || r.att_band === p.latt) &&
      (!p.lprod || r.prod === p.lprod) &&
      (!p.lemi || r.emi_band === p.lemi) &&
      (!p.lcycle || r.cycle === p.lcycle);
    const c = p.pwcat;
    const LEAD = {
      Lkpi: (l) => c === 'all' ? true : c === 'reached' ? l.connected > 0 : c === 'promised' ? !!(l.promised || l.paid) : c === 'paid' ? !!l.paid : c === 'multi' ? l.agents > 1 : false,
      Lstage: (l) => c === 'Leads called' ? true : c === 'Reached (connected call)' ? l.connected > 0 : c === 'Promised to pay / will clear' ? !!(l.promised || l.paid) : c === 'Paid' ? !!l.paid : false,
      Lstatus: (l) => l.best === c, Latt: (l) => l.att_band === c, Lemi: (l) => l.emi_band === c, Lcycle: (l) => l.cycle === c, Lagent: () => true,
    };
    const pick = LEAD[p.pwdim];
    if (!pick) return [];
    const ok = new Set(leads.filter((l) => lkeep(l) && pick(l)).map((l) => l.lan));
    const rows = [];
    for (const r of calls) {
      if (r.lan == null || !ok.has(r.lan) || !keep(r)) continue;
      if (p.pwdim === 'Lagent' && r.agent !== c) continue;
      rows.push({ id: String(r.id), loan: r.lan_masked, date: r.date, hour: String(r.hour).padStart(2, '0') + ':00', agent: r.agent, campaign: r.campaign,
        outcome: r.act ? r.outcome : (r.unanalysed || 'Not audited'), score: r.act ? r.score : null, fatal: r.fatal ? 'Yes' : 'No', fatal_on: '', dur: r.dur });
    }
    return rows.reverse();
  },
});
