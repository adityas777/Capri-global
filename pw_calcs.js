// Parameter-wise analysis tab: call categorisation breakdowns (every call, non-actionable included)

// and parameter scores out of 10 with category scores. All follow the page filters.

dash.calc('pw_intent', {
  title: 'Calls by payment intent',
  description: 'Every call in the selection by payment intent; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.act ? r.intent : 'Non-Actionable Calls';
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_cap', {
  title: 'Calls by payment capability',
  description: 'Every call in the selection by payment capability; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.act ? r.cap : 'Non-Actionable Calls';
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_reason', {
  title: 'Calls by reason for non-payment',
  description: 'Every call in the selection by reason for non-payment; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.act ? r.reason : 'Non-Actionable Calls';
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_settle', {
  title: 'Calls by settlement intent',
  description: 'Every call in the selection by settlement intent; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.settle;
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_sent', {
  title: 'Calls by customer sentiment',
  description: 'Every call in the selection by customer sentiment; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.act ? r.sent : 'Non-Actionable Calls';
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_waiver', {
  title: 'Calls by waiver request',
  description: 'Every call in the selection by waiver request; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.waiver;
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_aggr', {
  title: 'Calls by agent aggression',
  description: 'Every call in the selection by agent aggression; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.aggr;
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_langeff', {
  title: 'Calls by language efficiency',
  description: 'Every call in the selection by language efficiency; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.langeff;
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_threat', {
  title: 'Calls by threat by agent',
  description: 'Every call in the selection by threat by agent; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.threat;
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_outcome', {
  title: 'Calls by call outcome / disposition',
  description: 'Every call in the selection by call outcome / disposition; calls too short to audit show as Non-Actionable Calls. Share is of all calls in the selection.',
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
    const g = new Map();
    let n = 0;
    for (const r of calls) {
      if (!keep(r)) continue;
      const v = r.act ? r.outcome : 'Non-Actionable Calls';
      if (v == null) continue;
      n++; g.set(v, (g.get(v) || 0) + 1);
    }
    return [...g].map(([category, c]) => ({ category, calls: c, share: n ? Math.round(10000 * c / n) / 100 : null })).sort((a, b) => b.calls - a.calls);
  },
});

dash.calc('pw_params', {
  title: 'Score of each audit parameter',
  description: 'Average score of each scored audit parameter, out of 10. A parameter scores its full weight when passed and 0 when failed or fatal, so the score out of 10 equals the pass rate divided by 10. Ignores the parameter filter so every parameter stays visible.',
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
    const PARAMS = [
      ['p_closing', 'Closing', 8, 'Closing'],
      ['p_empathy', 'Empathy / Apology / Personalization / Acknowledgement', 7, 'Soft Skills'],
      ['p_greet', 'Greeting & Introduction', 8, 'Opening'],
      ['p_info', 'Complete & Correct Information Provided', 7, 'Information Accuracy'],
      ['p_dispo', 'Correct Disposition Tagged', 2, 'Process Adherence'],
      ['p_probe', 'Necessary Probing Done', 5, 'Objection Handling'],
      ['p_hold', 'Dead Air/Hold/Conference Procedure Followed', 5, 'Process Adherence'],
      ['p_listen', 'Active Listening', 6, 'Query Handling'],
      ['p_objection', 'Ownership & Effective Objection Handling', 7, 'Objection Handling'],
      ['p_proactive', 'Demonstrated Proactive Effort to Drive Desired Action', 14, 'Driving Action'],
      ['p_tone', 'Tone, Articulation, Professional Language, ROS', 14, 'Soft Skills'],
      ['p_purpose', 'Purpose of the Call', 5, 'Opening'],
      ['p_open', 'Avoid Delay in Opening', 10, 'Opening'],
      ['p_queries', 'Did the Agent Understand & Address All Customer Queries/Concerns?', 2, 'Query Handling'],
    ];
    const o = {};
    for (const [id] of PARAMS) o[id] = { a: 0, pass: 0, fat: 0 };
    for (const r of calls) {
      if (!r.act || !keep(r)) continue;
      for (const [id] of PARAMS) { const v = r[id]; if (v == null) continue; o[id].a++; if (v === 1) o[id].pass++; else if (v === 2) o[id].fat++; }
    }
    return PARAMS.map(([id, label, weight, category]) => ({ param: id, parameter: label, category, weight, assessed: o[id].a, passed: o[id].pass,
      failed: o[id].a - o[id].pass - o[id].fat, fatal: o[id].fat,
      score: o[id].a ? Math.round(1000 * o[id].pass / o[id].a) / 100 : null,
      pass_rate: o[id].a ? Math.round(1000 * o[id].pass / o[id].a) / 10 : null })).sort((x, y) => (x.score ?? 11) - (y.score ?? 11));
  },
});

dash.calc('pw_categories', {
  title: 'Score of each parameter category',
  description: 'Parameters grouped into categories; each category score (out of 10) is the points scored divided by the points available across its parameters, weighted by each parameter’s weight.',
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
    const PARAMS = [
      ['p_closing', 'Closing', 8, 'Closing'],
      ['p_empathy', 'Empathy / Apology / Personalization / Acknowledgement', 7, 'Soft Skills'],
      ['p_greet', 'Greeting & Introduction', 8, 'Opening'],
      ['p_info', 'Complete & Correct Information Provided', 7, 'Information Accuracy'],
      ['p_dispo', 'Correct Disposition Tagged', 2, 'Process Adherence'],
      ['p_probe', 'Necessary Probing Done', 5, 'Objection Handling'],
      ['p_hold', 'Dead Air/Hold/Conference Procedure Followed', 5, 'Process Adherence'],
      ['p_listen', 'Active Listening', 6, 'Query Handling'],
      ['p_objection', 'Ownership & Effective Objection Handling', 7, 'Objection Handling'],
      ['p_proactive', 'Demonstrated Proactive Effort to Drive Desired Action', 14, 'Driving Action'],
      ['p_tone', 'Tone, Articulation, Professional Language, ROS', 14, 'Soft Skills'],
      ['p_purpose', 'Purpose of the Call', 5, 'Opening'],
      ['p_open', 'Avoid Delay in Opening', 10, 'Opening'],
      ['p_queries', 'Did the Agent Understand & Address All Customer Queries/Concerns?', 2, 'Query Handling'],
    ];
    const ORDER = ['Closing', 'Soft Skills', 'Opening', 'Information Accuracy', 'Driving Action', 'Process Adherence', 'Objection Handling', 'Query Handling'];
    const got = {}, avail = {};
    for (const r of calls) {
      if (!r.act || !keep(r)) continue;
      for (const [id, , w, c] of PARAMS) { const v = r[id]; if (v == null) continue; avail[c] = (avail[c] || 0) + w; if (v === 1) got[c] = (got[c] || 0) + w; }
    }
    return ORDER.map((c) => ({ category: c, score: avail[c] ? Math.round(100 * 10 * (got[c] || 0) / avail[c]) / 100 : null,
      parameters: PARAMS.filter((q) => q[3] === c).map((q) => q[1]).join('; ') }));
  },
});


dash.calc('pw_call_list', {
  title: 'Calls in the clicked category',
  description: 'The calls behind the bar last clicked in a call categorisation breakdown, newest first, under the page filters.',
  inputs: ['calls'],
  fn: (calls) => {
    const p = dash.params();
    if (!p.pwdim || !p.pwcat) return [];
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
    const VAL = {
      intent: (r) => (r.act ? r.intent : 'Non-Actionable Calls'), cap: (r) => (r.act ? r.cap : 'Non-Actionable Calls'),
      reason: (r) => (r.act ? r.reason : 'Non-Actionable Calls'), sent: (r) => (r.act ? r.sent : 'Non-Actionable Calls'),
      outcome: (r) => (r.act ? r.outcome : 'Non-Actionable Calls'), settle: (r) => r.settle, waiver: (r) => r.waiver,
      aggr: (r) => r.aggr, langeff: (r) => r.langeff, threat: (r) => r.threat,
    };
    const val = VAL[p.pwdim];
    if (!val) return [];
    const rows = [];
    for (const r of calls) {
      if (!keep(r) || val(r) !== p.pwcat) continue;
      rows.push({ id: String(r.id), date: r.date, hour: String(r.hour).padStart(2, '0') + ':00', agent: r.agent, campaign: r.campaign,
        outcome: r.act ? r.outcome : (r.unanalysed || 'Not audited'), score: r.act ? r.score : null, fatal: r.fatal ? 'Yes' : 'No', dur: r.dur });
    }
    return rows.reverse();
  },
});
