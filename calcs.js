// Every figure on the page is worked out here from the call-level file, under the filters picked on the page.

// A breakdown ignores its own filter, so every option stays visible and the picked one is highlighted.

dash.calc('kpis', {
  title: 'Headline figures for the selection',
  description: 'Totals and rates for the calls that match the filters picked on the page.',
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
    let n = 0, a = 0, ss = 0, fat = 0, ptp = 0, paid = 0, wc = 0, rtp = 0, hi = 0, dur = 0;
    const agents = new Set(), leads = new Set(), amts = [];
    for (const r of calls) {
      if (!keep(r)) continue;
      n++; dur += r.dur; agents.add(r.agent); if (r.lan != null) leads.add(r.lan);
      if (!r.act) continue;
      a++; ss += r.score || 0;
      if (r.fatal) fat++;
      if (PTP.has(r.outcome)) { ptp++; if (r.amt > 0) amts.push(r.amt); }
      if (r.outcome === 'Payment Done') paid++;
      if (r.outcome === 'Will Clear') wc++;
      if (r.outcome === 'Refuse To Pay' || r.outcome === 'Penal RTP') rtp++;
      if (r.intent === 'High') hi++;
    }
    amts.sort((x, y) => x - y);
    const med = amts.length ? (amts.length % 2 ? amts[(amts.length - 1) / 2] : Math.round((amts[amts.length / 2 - 1] + amts[amts.length / 2]) / 2)) : null;
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [{ calls: n, connected: a, connect_rate: pc(a, n), avg_score: a ? Math.round(100 * ss / a) / 100 : null,
      fatal_calls: fat, fatal_rate: pc(fat, a), ptp_calls: ptp, ptp_rate: pc(ptp, a), payment_done: paid, will_clear: wc,
      refused: rtp, high_intent_pct: pc(hi, a), median_ptp_amount: med, agents: agents.size, leads: leads.size,
      avg_duration_sec: n ? Math.round(dur / n) : null }];
  },
});

dash.calc('trend', {
  title: 'Trend for the selection',
  description: 'Daily, weekly and hourly figures for the calls that match the filters; grain says which.',
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
    const PIDS = ['p_open', 'p_greet', 'p_purpose', 'p_queries', 'p_info', 'p_probe', 'p_objection', 'p_tone', 'p_listen', 'p_empathy', 'p_hold', 'p_dispo', 'p_proactive', 'p_closing', 'p_ethics', 'p_datasec', 'p_aprof'];
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const groups = { day: new Map(), week: new Map(), hour: new Map() };
    for (const r of calls) {
      if (!keep(r)) continue;
      const keys = { day: r.date, week: r.week, hour: String(r.hour).padStart(2, '0') + ':00' };
      for (const grain of ['day', 'week', 'hour']) {
        const m = groups[grain];
        let o = m.get(keys[grain]);
        if (!o) m.set(keys[grain], o = { n: 0, a: 0, ss: 0, fat: 0, ptp: 0, paid: 0, wc: 0, rtp: 0, hi: 0, ang: 0, wil: 0, pp: {}, pa: {} });
        o.n++;
        if (!r.act) continue;
        o.a++; o.ss += r.score || 0;
        if (r.fatal) o.fat++;
        if (PTP.has(r.outcome)) o.ptp++;
        if (r.outcome === 'Payment Done') o.paid++;
        if (r.outcome === 'Will Clear') o.wc++;
        if (r.outcome === 'Refuse To Pay' || r.outcome === 'Penal RTP') o.rtp++;
        if (r.intent === 'High') o.hi++;
        if (r.f_angry) o.ang++;
        if (r.f_wilful) o.wil++;
        for (const id of PIDS) if (r[id] != null) { o.pa[id] = (o.pa[id] || 0) + 1; if (r[id] === 1) o.pp[id] = (o.pp[id] || 0) + 1; }
      }
    }
    const rows = [];
    for (const grain of ['day', 'week', 'hour']) {
      for (const [x, o] of [...groups[grain]].sort((u, v) => (u[0] < v[0] ? -1 : 1))) {
        const label = grain === 'day' ? x.slice(8) + ' ' + MON[+x.slice(5, 7) - 1] : x;
        const row = { grain, x, label, calls: o.n, connected: o.a, ptp_calls: o.ptp, will_clear: o.wc, payment_done: o.paid,
          refused: o.rtp, fatal_calls: o.fat, connect_rate: pc(o.a, o.n), ptp_rate: pc(o.ptp, o.a), fatal_rate: pc(o.fat, o.a),
          high_intent_pct: pc(o.hi, o.a), angry_pct: pc(o.ang, o.a), wilful_pct: pc(o.wil, o.a),
          avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null };
        for (const id of PIDS) row[id] = pc(o.pp[id] || 0, o.pa[id] || 0);
        rows.push(row);
      }
    }
    return rows;
  },
});

dash.calc('by_week', {
  title: 'Calls by week (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each calls by week value, under every filter except this one.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
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
    let total = 0;
    for (const r of calls) {
      const k = r.week;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ week: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_agent', {
  title: 'Calls by agent (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each calls by agent value, under every filter except this one.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
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
    let total = 0;
    for (const r of calls) {
      const k = r.agent;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ agent: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_lang', {
  title: 'Calls by language (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each calls by language value, under every filter except this one.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
      (!p.agent || r.agent === p.agent) &&
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
    let total = 0;
    for (const r of calls) {
      const k = r.lang;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ lang: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_campaign', {
  title: 'Calls by campaign (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each calls by campaign value, under every filter except this one.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
      (!p.agent || r.agent === p.agent) &&
      (!p.lang || r.lang === p.lang) &&
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
    let total = 0;
    for (const r of calls) {
      const k = r.campaign;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ campaign: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_outcome', {
  title: 'Call outcomes (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each call outcomes value, under every filter except this one.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
      (!p.agent || r.agent === p.agent) &&
      (!p.lang || r.lang === p.lang) &&
      (!p.campaign || r.campaign === p.campaign) &&
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
    let total = 0;
    for (const r of calls) {
      const k = r.outcome;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ outcome: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_intent', {
  title: 'Payment intent (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each payment intent value, under every filter except this one.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    const keep = (r) => (!p.ctype || (r.campaign != null && (r.campaign.startsWith('PDM') ? 'Awareness' : 'Collection') === p.ctype)) &&
      (!p.week || r.week === p.week) &&
      (!p.agent || r.agent === p.agent) &&
      (!p.lang || r.lang === p.lang) &&
      (!p.campaign || r.campaign === p.campaign) &&
      (!p.outcome || r.outcome === p.outcome) &&
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
    let total = 0;
    for (const r of calls) {
      const k = r.intent;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ intent: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_cap', {
  title: 'Payment capability (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each payment capability value, under every filter except this one.',
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
      (!p.reason || r.reason === p.reason) &&
      (!p.rsub || r.rsub === p.rsub) &&
      (!p.sent || r.sent === p.sent) &&
      (!p.attend || r.attend === p.attend) &&
      (!p.dband || r.dband === p.dband) &&
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const g = new Map();
    let total = 0;
    for (const r of calls) {
      const k = r.cap;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ cap: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_reason', {
  title: 'Non-payment reasons (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each non-payment reasons value, under every filter except this one.',
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
      (!p.rsub || r.rsub === p.rsub) &&
      (!p.sent || r.sent === p.sent) &&
      (!p.attend || r.attend === p.attend) &&
      (!p.dband || r.dband === p.dband) &&
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const g = new Map();
    let total = 0;
    for (const r of calls) {
      const k = r.reason;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ reason: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_rsub', {
  title: 'Specific non-payment reasons (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each specific non-payment reasons value, under every filter except this one.',
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
      (!p.sent || r.sent === p.sent) &&
      (!p.attend || r.attend === p.attend) &&
      (!p.dband || r.dband === p.dband) &&
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const g = new Map();
    let total = 0;
    for (const r of calls) {
      const k = r.rsub;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ rsub: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_sent', {
  title: 'Customer sentiment (selection)',
  description: 'Calls, PTP rate, fatal rate and quality score for each customer sentiment value, under every filter except this one.',
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
      (!p.attend || r.attend === p.attend) &&
      (!p.dband || r.dband === p.dband) &&
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const PTP = new Set(['Promise To Pay', 'Penal PTP', 'NACH PTP']);
    const g = new Map();
    let total = 0;
    for (const r of calls) {
      const k = r.sent;
      if (k == null || !keep(r)) continue;
      let o = g.get(k);
      if (!o) g.set(k, o = { n: 0, a: 0, ss: 0, ptp: 0, fat: 0 });
      o.n++; total++;
      if (r.act) { o.a++; o.ss += r.score || 0; if (PTP.has(r.outcome)) o.ptp++; if (r.fatal) o.fat++; }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [...g].map(([k, o]) => ({ sent: k, calls: o.n, share: pc(o.n, total), connected: o.a, ptp_rate: pc(o.ptp, o.a),
      fatal_rate: pc(o.fat, o.a), avg_score: o.a ? Math.round(100 * o.ss / o.a) / 100 : null })).sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('by_param', {
  title: 'Audit parameters (selection)',
  description: 'Pass rate of each audit parameter among assessed calls, under every filter except the parameter filter.',
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
      (!p.flag || r[p.flag] === 1);
    const LABELS = { p_open: 'Avoid delay in opening', p_greet: 'Greeting & introduction', p_purpose: 'Purpose of the call', p_queries: 'Addressed all queries', p_info: 'Complete & correct info', p_probe: 'Necessary probing', p_objection: 'Objection handling', p_tone: 'Tone & professional language', p_listen: 'Active listening', p_empathy: 'Empathy & acknowledgement', p_hold: 'Dead air / hold procedure', p_dispo: 'Correct disposition tagged', p_proactive: 'Proactive effort', p_closing: 'Closing', p_ethics: 'Conduct & ethics (ZT)', p_datasec: 'No data-security breach', p_aprof: 'No agent profanity' };
    const o = {};
    for (const id in LABELS) o[id] = { a: 0, pass: 0, fail: 0, fat: 0 };
    for (const r of calls) {
      if (!r.act || !keep(r)) continue;
      for (const id in LABELS) {
        const v = r[id];
        if (v == null) continue;
        o[id].a++;
        if (v === 1) o[id].pass++; else if (v === 2) o[id].fat++; else o[id].fail++;
      }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return Object.keys(LABELS).map((id) => ({ param: id, parameter: LABELS[id], assessed: o[id].a, passed: o[id].pass,
      failed: o[id].fail, fatal: o[id].fat, pass_rate: pc(o[id].pass, o[id].a) })).sort((x, y) => (x.pass_rate ?? 101) - (y.pass_rate ?? 101));
  },
});

dash.calc('by_flag', {
  title: 'Risk flags (selection)',
  description: 'Connected calls carrying each risk or compliance flag, under every filter except the risk-flag filter.',
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
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    const LABELS = { f_fatal: 'Fatal error on call', f_visit: 'Home-visit threat by agent', f_threat: 'Legal / court / bank / social threat', f_aprof: 'Agent profanity', f_cprof: 'Customer profanity', f_datasec: 'Data-security breach', f_dnd: 'DND requested by customer', f_rbi: 'RBI mentioned', f_wilful: 'Wilful default suspected', f_angry: 'Angry or frustrated customer', f_waiver: 'Waiver pitched', f_settle: 'Settlement discussed' };
    const c = {};
    let a = 0;
    for (const id in LABELS) c[id] = 0;
    for (const r of calls) {
      if (!r.act || !keep(r)) continue;
      a++;
      for (const id in LABELS) if (r[id] === 1) c[id]++;
    }
    return Object.keys(LABELS).map((id) => ({ flag: id, label: LABELS[id], calls: c[id], share: a ? Math.round(10000 * c[id] / a) / 100 : null }))
      .sort((x, y) => y.calls - x.calls);
  },
});

dash.calc('attendance', {
  title: 'Attended calls and call length',
  description: 'Total calls split into attended (dialer marked Connected) and not attended, and attended calls by length. Ignores the attended and call-length filters so every tile stays visible.',
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
      (!p.flag || r[p.flag] === 1) &&
      (!p.param || r[p.param] === 0 || r[p.param] === 2);
    let n = 0, att = 0, not = 0, u1 = 0, m12 = 0, o2 = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      n++;
      if (r.attend === 'Attended') att++; else if (r.attend === 'Not attended') not++;
      if (r.dband === 'Under 1 min') u1++; else if (r.dband === '1–2 min') m12++; else if (r.dband === '2 min and over') o2++;
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [{ calls: n, attended: att, attended_pct: pc(att, n), not_attended: not, not_attended_pct: pc(not, n),
      unknown: n - att - not, under_1min: u1, under_1min_pct: pc(u1, att), min_1_2: m12, min_1_2_pct: pc(m12, att),
      over_2min: o2, over_2min_pct: pc(o2, att) }];
  },
});

dash.calc('options', {
  title: 'Filter choices',
  description: 'Every agent, language and campaign in the file, with its call count, for the filter menus.',
  inputs: ['calls'],
  fn: (calls) => {
    const g = new Map();
    for (const r of calls) for (const dim of ['agent', 'lang', 'campaign']) {
      if (r[dim] == null) continue;
      const k = dim + '|' + r[dim];
      g.set(k, (g.get(k) || 0) + 1);
    }
    return [...g].map(([k, n]) => ({ dim: k.split('|')[0], value: k.slice(k.indexOf('|') + 1), calls: n }))
      .sort((x, y) => (x.dim < y.dim ? -1 : x.dim > y.dim ? 1 : x.value < y.value ? -1 : 1));
  },
});
