// Trends & suggestions tab: agent trend by week, coaching list, and fixed observations for November.

dash.calc('agent_week', {
  title: 'Agent trend by week',
  description: 'Each agent’s connected calls, quality score, fatal rate and PTP rate in each week. Follows the page filters.',
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
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const g = new Map();
    for (const r of calls) {
      if (!r.act || !keep(r)) continue;
      const k = r.agent + '|' + r.week;
      let o = g.get(k);
      if (!o) g.set(k, o = { agent: r.agent, week: r.week, n: 0, s: 0, f: 0, ptp: 0 });
      o.n++; o.s += r.score || 0; if (r.fatal) o.f++; if (PTP.has(r.outcome)) o.ptp++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g.values()].map((o) => ({ agent: o.agent, week: o.week, connected: o.n, avg_score: Math.round(100 * o.s / o.n) / 100,
      fatal_rate: pc(o.f, o.n), ptp_rate: pc(o.ptp, o.n) })).sort((a, b) => (a.agent < b.agent ? -1 : a.agent > b.agent ? 1 : a.week < b.week ? -1 : 1));
  },
});

dash.calc('coach', {
  title: 'Agents to coach',
  description: 'Agents with at least 30 connected calls in the selection, highest fatal rate first, with the audit parameter they pass least often, the one behind most of their fatal errors, and a coaching tip for the weakest one.',
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
    const LABELS = { p_open: 'Avoid delay in opening', p_greet: 'Greeting & introduction', p_purpose: 'Purpose of the call', p_queries: 'Addressed all queries', p_info: 'Complete & correct info', p_probe: 'Necessary probing', p_objection: 'Objection handling', p_tone: 'Tone & professional language', p_listen: 'Active listening', p_empathy: 'Empathy & acknowledgement', p_hold: 'Dead air / hold procedure', p_dispo: 'Correct disposition tagged', p_proactive: 'Proactive effort', p_closing: 'Closing', p_ethics: 'Conduct & ethics (ZT)', p_datasec: 'No data-security breach', p_aprof: 'No agent profanity' };
    const TIPS = {
      p_open: 'Start speaking within 3 seconds of the customer answering.',
      p_greet: 'Use the full greeting every time: own name, Capri Global, and the customer’s name.',
      p_purpose: 'State the reason for the call (EMI due, amount, date) in the first 15 seconds.',
      p_queries: 'Answer every customer question before moving to the payment ask.',
      p_info: 'Quote the exact due amount, due date and payment options; double-check before quoting.',
      p_probe: 'Ask why the payment is late and when funds will be available before asking for a date.',
      p_objection: 'Practise answers to the top objections: salary delay, bank or mandate issue, dispute.',
      p_tone: 'Keep a calm, respectful tone; no raised voice, slang or sarcasm.',
      p_listen: 'Let the customer finish, then repeat back the key point before responding.',
      p_empathy: 'Acknowledge the customer’s situation in one line before asking for payment.',
      p_hold: 'Ask permission before a hold and come back within 30 seconds; avoid dead air.',
      p_dispo: 'Tag the disposition that matches what actually happened on the call, not the planned outcome.',
      p_proactive: 'Always ask for a specific amount and date, and offer a payment link on the call.',
      p_closing: 'Close by repeating the promise (amount + date), confirming the mode, and thanking the customer.',
      p_ethics: 'Zero-tolerance refresher: no threats, pressure or misleading statements.',
      p_datasec: 'Verify identity before sharing any loan details; never discuss the loan with third parties.',
      p_aprof: 'Zero tolerance for abusive language; review every flagged call with the agent.',
    };
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const g = new Map();
    for (const r of calls) {
      if (!r.act || !keep(r)) continue;
      let o = g.get(r.agent);
      if (!o) { o = { n: 0, s: 0, f: 0, ptp: 0, pa: {}, pp: {}, pf: {} }; g.set(r.agent, o); }
      o.n++; o.s += r.score || 0; if (r.fatal) o.f++; if (PTP.has(r.outcome)) o.ptp++;
      for (const id in LABELS) {
        const v = r[id];
        if (v == null) continue;
        o.pa[id] = (o.pa[id] || 0) + 1;
        if (v === 1) o.pp[id] = (o.pp[id] || 0) + 1;
        if (v === 2) o.pf[id] = (o.pf[id] || 0) + 1;
      }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const rows = [];
    for (const [agent, o] of g) {
      if (o.n < 30) continue;
      let weak = null, weakRate = 101, topF = null, topFn = 0;
      for (const id in LABELS) {
        if ((o.pa[id] || 0) >= 20) { const rate = pc(o.pp[id] || 0, o.pa[id]); if (rate < weakRate) { weakRate = rate; weak = id; } }
        if ((o.pf[id] || 0) > topFn) { topFn = o.pf[id]; topF = id; }
      }
      rows.push({ agent, connected: o.n, avg_score: Math.round(100 * o.s / o.n) / 100, fatal_rate: pc(o.f, o.n), ptp_rate: pc(o.ptp, o.n),
        weakest: weak ? LABELS[weak] : null, weakest_pass: weak ? weakRate : null, top_fatal: topF ? LABELS[topF] : null, top_fatal_calls: topFn,
        tip: weak ? TIPS[weak] : null });
    }
    return rows.sort((a, b) => b.fatal_rate - a.fatal_rate || a.avg_score - b.avg_score);
  },
});

dash.calc('insights', {
  title: 'November observations',
  description: 'Fixed figures for the observations text, worked out from every November call; the page filters do not change them. Week comparisons use full weeks (3+ calling days); wrong-disposition fatal calls use the audit’s fatal reason.',
  inputs: ['calls'],
  fn: (calls) => {
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const PROM = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP', 'Will Clear', 'Payment Done']);
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const allWeeks = [...new Set(calls.map((r) => r.week))].sort();
    // compare full weeks only: a week counts as full when it has at least 3 calling days
    const daysIn = {};
    for (const r of calls) (daysIn[r.week] ??= new Set()).add(r.date);
    const weeks = allWeeks.filter((w) => daysIn[w].size >= 3);
    const W = {}, A = {}, D = { u1: [0, 0, 0, 0], m12: [0, 0, 0, 0], o2: [0, 0, 0, 0] }, P = {}, L = new Map(), AG = {};
    let fat = 0, dispoFat = 0;
    for (const r of calls) {
      if (r.lan != null) {
        let l = L.get(r.lan);
        if (!l) L.set(r.lan, l = { n: 0, first: null, agents: new Set(), prom: 0, paid: 0 });
        l.n++; l.agents.add(r.agent);
        if (r.act && l.first == null) l.first = l.n;
        if (r.act && PROM.has(r.outcome)) l.prom = 1;
        if (r.act && r.outcome === 'Payment Done') l.paid = 1;
      }
      if (!r.act) continue;
      const w = (W[r.week] ??= { n: 0, s: 0, f: 0, ptp: 0 });
      w.n++; w.s += r.score || 0; if (r.fatal) w.f++; if (PTP.has(r.outcome)) w.ptp++;
      const a = (A[r.agent] ??= {}), aw = (a[r.week] ??= { n: 0, s: 0 });
      aw.n++; aw.s += r.score || 0;
      const ag = (AG[r.agent] ??= { n: 0, f: 0 }); ag.n++; if (r.fatal) ag.f++;
      const b = r.dur < 60 ? D.u1 : r.dur < 120 ? D.m12 : D.o2;
      b[0]++; if (PTP.has(r.outcome)) b[1]++; if (r.fatal) b[2]++; b[3] += r.score || 0;
      if (r.fatal) fat++;
      if (r.fatal && r.freason != null && r.freason.split('|').includes('p_dispo')) dispoFat++;
      for (const id of ['p_closing', 'p_empathy', 'p_info', 'p_greet']) if (r[id] != null) { const q = (P[id] ??= [0, 0]); q[0]++; if (r[id] === 1) q[1]++; }
    }
    const f = W[weeks[0]], l = W[weeks[weeks.length - 1]];
    let compared = 0, down = 0, worst = null, worstDrop = 0;
    for (const [agent, a] of Object.entries(A)) {
      const x = a[weeks[0]], y = a[weeks[weeks.length - 1]];
      if (!x || !y || x.n < 20 || y.n < 20) continue;
      compared++;
      const d = y.s / y.n - x.s / x.n;
      if (d < 0) down++;
      if (d < worstDrop) { worstDrop = d; worst = agent; }
    }
    let topAgent = null, topRate = -1;
    for (const [agent, a] of Object.entries(AG)) if (a.n >= 100 && a.f / a.n > topRate) { topRate = a.f / a.n; topAgent = agent; }
    const leads = [...L.values()];
    const once = leads.filter((x) => x.n === 1), six = leads.filter((x) => x.n >= 6);
    const multi = leads.filter((x) => x.agents.size > 1), single = leads.filter((x) => x.agents.size === 1);
    const share = (arr, fn) => pc(arr.filter(fn).length, arr.length);
    return [{
      first_week: weeks[0], last_week: weeks[weeks.length - 1],
      w1_ptp: pc(f.ptp, f.n), wl_ptp: pc(l.ptp, l.n), w1_fatal: pc(f.f, f.n), wl_fatal: pc(l.f, l.n),
      w1_score: Math.round(100 * f.s / f.n) / 100, wl_score: Math.round(100 * l.s / l.n) / 100,
      agents_compared: compared, agents_score_down: down, worst_drop_agent: worst, worst_drop: Math.round(-100 * worstDrop) / 100,
      top_fatal_agent: topAgent, top_fatal_agent_rate: pc(AG[topAgent].f, AG[topAgent].n),
      fatal_calls: fat, dispo_fatal: dispoFat,
      closing_pass: pc(P.p_closing[1], P.p_closing[0]), empathy_pass: pc(P.p_empathy[1], P.p_empathy[0]),
      info_pass: pc(P.p_info[1], P.p_info[0]), greet_pass: pc(P.p_greet[1], P.p_greet[0]),
      u1_ptp: pc(D.u1[1], D.u1[0]), m12_ptp: pc(D.m12[1], D.m12[0]), o2_ptp: pc(D.o2[1], D.o2[0]),
      u1_fatal: pc(D.u1[2], D.u1[0]), o2_fatal: pc(D.o2[2], D.o2[0]),
      leads: leads.length, once_pct: share(leads, (x) => x.n === 1), first_reach_pct: share(leads, (x) => x.first === 1),
      once_prom: share(once, (x) => x.prom || x.paid), six_prom: share(six, (x) => x.prom || x.paid),
      once_paid: share(once, (x) => x.paid), six_paid: share(six, (x) => x.paid), six_leads: six.length,
      multi_pct: share(leads, (x) => x.agents.size > 1), multi_paid: share(multi, (x) => x.paid), single_paid: share(single, (x) => x.paid),
    }];
  },
});
