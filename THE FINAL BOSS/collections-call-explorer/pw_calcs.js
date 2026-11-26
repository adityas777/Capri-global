// Parameter-wise analysis tab: call categorisation breakdowns (every call, non-actionable included)

// and parameter scores out of 100 with category scores. All follow the page filters.

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
  description: 'Average score of each scored audit parameter, out of 100. A parameter scores its full weight when passed and 0 when failed or fatal, so its score out of 100 equals its pass rate. Ignores the parameter filter so every parameter stays visible.',
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
      score: o[id].a ? Math.round(10000 * o[id].pass / o[id].a) / 100 : null,
      pass_rate: o[id].a ? Math.round(10000 * o[id].pass / o[id].a) / 100 : null })).sort((x, y) => (x.score ?? 11) - (y.score ?? 11));
  },
});

dash.calc('pw_categories', {
  title: 'Score of each parameter category',
  description: 'Parameters grouped into categories; each category score (out of 100) is the points scored divided by the points available across its parameters, weighted by each parameter’s weight.',
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
    return ORDER.map((c) => ({ category: c, score: avail[c] ? Math.round(100 * 100 * (got[c] || 0) / avail[c]) / 100 : null,
      parameters: PARAMS.filter((q) => q[3] === c).map((q) => q[1]).join('; ') }));
  },
});


dash.calc('pw_call_list', {
  title: 'Calls behind the clicked bar',
  description: 'The calls behind whatever was last clicked on the page (a card, tile, bar, table row or point), newest first, under the page filters.',
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
    const NA = 'Non-Actionable Calls';
    const MATCH = {
      intent: (r, c) => (r.act ? r.intent : NA) === c, cap: (r, c) => (r.act ? r.cap : NA) === c,
      reason: (r, c) => (r.act ? r.reason : NA) === c, sent: (r, c) => (r.act ? r.sent : NA) === c,
      outcome: (r, c) => (r.act ? r.outcome : NA) === c, settle: (r, c) => r.settle === c, waiver: (r, c) => r.waiver === c,
      aggr: (r, c) => r.aggr === c, langeff: (r, c) => r.langeff === c, threat: (r, c) => r.threat === c,
      fatal: (r, c) => (r.fatal ? 'Fatal' : 'Non-fatal') === c,
      freason: (r, c) => !!r.fatal && r.freason != null && r.freason.split('|').includes(c),
      fagent: (r, c) => !!r.fatal && r.agent === c, fsup: (r, c) => !!r.fatal && r.sup === c,
      nfail: (r, c) => !r.fatal && !!r.act && r[c] === 0,
      nagent: (r, c) => !r.fatal && r.agent === c, nsup: (r, c) => !r.fatal && r.sup === c,
      rsub: (r, c) => !!r.act && r.rsub === c,
      freasont: (r, c) => { const [id, k] = c.split('||'); return !!r.fatal && r.freason != null && r.freason.split('|').includes(id) && (r.week === k || r.date === k); },
      nfailt: (r, c) => { const [id, k] = c.split('||'); return !r.fatal && !!r.act && r[id] === 0 && (r.week === k || r.date === k); },
      rsubc: (r, c) => { const [pa, su] = c.split('||'); return !!r.act && r.reason === pa && (su === '__rest' ? r.rsub == null : r.rsub === su); }, week: (r, c) => r.week === c, tweek: (r, c) => r.week === c,
      tday: (r, c) => r.date === c, thour: (r, c) => r.hour === +String(c).slice(0, 2),
      agent: (r, c) => r.agent === c, agent2: (r, c) => r.agent === c, coach: (r, c) => !!r.act && r.agent === c, aheat: (r, c) => !!r.act && r.agent === c,
      campaign: (r, c) => r.campaign === c,
      param: (r, c) => !!r.act && (r[c] === 0 || r[c] === 2), pfatal: (r, c) => r[c] === 2,
      att: (r, c) => r.attend === c || r.dband === c,
      kpi: (r, c) => c === 'all' ? true : c === 'connected' ? !!r.act : c === 'fatal' ? !!r.fatal
        : c === 'ptp' ? !!r.act && ['Promise To Pay', 'Penal PTP', 'NACH PTP'].includes(r.outcome)
        : c === 'paid' ? !!r.act && r.outcome === 'Payment Done' : c === 'willclear' ? !!r.act && r.outcome === 'Will Clear'
        : c === 'refused' ? !!r.act && (r.outcome === 'Refuse To Pay' || r.outcome === 'Penal RTP')
        : c === 'high' ? !!r.act && r.intent === 'High' : c === 'leads' ? r.lan != null : false,
    };
    const LABELS = { p_open: 'Avoid Delay in Opening', p_greet: 'Greeting & Introduction', p_purpose: 'Purpose of the Call', p_queries: 'Did the Agent Understand & Address All Customer Queries/Concerns?', p_info: 'Complete & Correct Information Provided', p_probe: 'Necessary Probing Done', p_objection: 'Ownership & Effective Objection Handling', p_tone: 'Tone, Articulation, Professional Language, ROS', p_listen: 'Active Listening', p_empathy: 'Empathy / Apology / Personalization / Acknowledgement', p_hold: 'Dead Air/Hold/Conference Procedure Followed', p_dispo: 'Correct Disposition Tagged', p_proactive: 'Demonstrated Proactive Effort to Drive Desired Action', p_closing: 'Closing', p_ethics: 'ZT - Adherence of Conduct & Ethics', p_datasec: 'Data Security / Non-Disclosure Breached', p_aprof: 'Agent Profanity' };
    const match = MATCH[p.pwdim];
    if (!match) return [];
    const rows = [];
    for (const r of calls) {
      if (!keep(r) || !match(r, p.pwcat)) continue;
      rows.push({ id: String(r.id), date: r.date, hour: String(r.hour).padStart(2, '0') + ':00', agent: r.agent, campaign: r.campaign,
        outcome: r.act ? r.outcome : (r.unanalysed || 'Not audited'), score: r.act ? r.score : null, fatal: r.fatal ? 'Yes' : 'No',
        fatal_on: r.freason ? r.freason.split('|').map((id) => LABELS[id]).join(', ') : '', dur: r.dur, loan: r.lan_masked });
    }
    return rows.reverse();
  },
});

dash.calc('fatal_split', {
  title: 'Fatal vs non-fatal calls',
  description: 'All calls in the selection split by whether the audit marked them fatal. Percentages are of all calls.',
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
    let n = 0, f = 0, aud = 0;
    for (const r of calls) { if (!keep(r)) continue; n++; if (r.fatal) f++; else if (r.act) aud++; }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    return [{ calls: n, fatal: f, nonfatal: n - f, fatal_pct: pc(f, n), nonfatal_pct: pc(n - f, n), nonfatal_audited: aud, nonfatal_unaudited: n - f - aud }];
  },
});

dash.calc('fatal_parts', {
  title: 'Fatal calls by reason, agent, supervisor and time',
  description: 'Everything the fatal calls breakdown shows, from the fatal calls in the selection. A call can name more than one fatal reason.',
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
    const LABELS = { p_open: 'Avoid Delay in Opening', p_greet: 'Greeting & Introduction', p_purpose: 'Purpose of the Call', p_queries: 'Did the Agent Understand & Address All Customer Queries/Concerns?', p_info: 'Complete & Correct Information Provided', p_probe: 'Necessary Probing Done', p_objection: 'Ownership & Effective Objection Handling', p_tone: 'Tone, Articulation, Professional Language, ROS', p_listen: 'Active Listening', p_empathy: 'Empathy / Apology / Personalization / Acknowledgement', p_hold: 'Dead Air/Hold/Conference Procedure Followed', p_dispo: 'Correct Disposition Tagged', p_proactive: 'Demonstrated Proactive Effort to Drive Desired Action', p_closing: 'Closing', p_ethics: 'ZT - Adherence of Conduct & Ethics', p_datasec: 'Data Security / Non-Disclosure Breached', p_aprof: 'Agent Profanity' };
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let n = 0, f = 0;
    const reason = {}, agent = {}, sup = {}, week = {}, day = {};
    for (const r of calls) {
      if (!keep(r)) continue;
      n++;
      if (!r.fatal) continue;
      f++;
      agent[r.agent] = (agent[r.agent] || 0) + 1;
      if (r.sup != null) sup[r.sup] = (sup[r.sup] || 0) + 1;
      const ids = r.freason ? r.freason.split('|') : [];
      for (const id of ids) reason[id] = (reason[id] || 0) + 1;
      for (const [m, k] of [[week, r.week], [day, r.date]]) {
        const o = (m[k] ??= { total: 0 });
        o.total++;
        for (const id of ids) o[id] = (o[id] || 0) + 1;
      }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0] || [null, 0];
    const rows = [];
    for (const [id, c] of Object.entries(reason)) rows.push({ part: 'reason', key: id, category: LABELS[id], calls: c, share: pc(c, f) });
    for (const [k, c] of Object.entries(agent)) rows.push({ part: 'agent', key: k, category: k, calls: c, share: pc(c, f) });
    for (const [k, c] of Object.entries(sup)) rows.push({ part: 'sup', key: k, category: k, calls: c, share: pc(c, f) });
    for (const [grain, m] of [['week', week], ['day', day]]) for (const [k, o] of Object.entries(m))
      rows.push({ part: 'time', grain, key: k, category: grain === 'day' ? k.slice(8) + ' ' + MON[+k.slice(5, 7) - 1] : k, calls: o.total, ...o });
    const [tr, trc] = top(reason), [ta, tac] = top(agent), [ts, tsc] = top(sup);
    rows.push({ part: 'kpi', calls: n, fatal: f, fatal_pct: pc(f, n), top_reason: tr ? LABELS[tr] : null, top_reason_calls: trc, top_reason_pct: pc(trc, f),
      top_agent: ta, top_agent_calls: tac, top_agent_pct: pc(tac, f), top_sup: ts, top_sup_calls: tsc, top_sup_pct: pc(tsc, f) });
    return rows;
  },
});

dash.calc('nonfatal_parts', {
  title: 'Non-fatal calls by failed parameter, agent, supervisor and time',
  description: 'Everything the non-fatal calls breakdown shows. Failed-parameter figures use only audited non-fatal calls.',
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
    const LABELS = { p_open: 'Avoid Delay in Opening', p_greet: 'Greeting & Introduction', p_purpose: 'Purpose of the Call', p_queries: 'Did the Agent Understand & Address All Customer Queries/Concerns?', p_info: 'Complete & Correct Information Provided', p_probe: 'Necessary Probing Done', p_objection: 'Ownership & Effective Objection Handling', p_tone: 'Tone, Articulation, Professional Language, ROS', p_listen: 'Active Listening', p_empathy: 'Empathy / Apology / Personalization / Acknowledgement', p_hold: 'Dead Air/Hold/Conference Procedure Followed', p_dispo: 'Correct Disposition Tagged', p_proactive: 'Demonstrated Proactive Effort to Drive Desired Action', p_closing: 'Closing', p_ethics: 'ZT - Adherence of Conduct & Ethics', p_datasec: 'Data Security / Non-Disclosure Breached', p_aprof: 'Agent Profanity' };
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let n = 0, nf = 0, aud = 0;
    const failed = {}, agent = {}, sup = {}, week = {}, day = {};
    for (const r of calls) {
      if (!keep(r)) continue;
      n++;
      if (r.fatal) continue;
      nf++;
      agent[r.agent] = (agent[r.agent] || 0) + 1;
      if (r.sup != null) sup[r.sup] = (sup[r.sup] || 0) + 1;
      if (!r.act) continue;
      aud++;
      const ids = Object.keys(LABELS).filter((id) => r[id] === 0);
      for (const id of ids) failed[id] = (failed[id] || 0) + 1;
      for (const [m, k] of [[week, r.week], [day, r.date]]) {
        const o = (m[k] ??= { total: 0 });
        o.total++;
        for (const id of ids) o[id] = (o[id] || 0) + 1;
      }
    }
    const pc = (x, y) => (y ? Math.round(10000 * x / y) / 100 : null);
    const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0] || [null, 0];
    const rows = [];
    for (const [id, c] of Object.entries(failed)) rows.push({ part: 'failed', key: id, category: LABELS[id], calls: c, share: pc(c, aud) });
    for (const [k, c] of Object.entries(agent)) rows.push({ part: 'agent', key: k, category: k, calls: c, share: pc(c, nf) });
    for (const [k, c] of Object.entries(sup)) rows.push({ part: 'sup', key: k, category: k, calls: c, share: pc(c, nf) });
    for (const [grain, m] of [['week', week], ['day', day]]) for (const [k, o] of Object.entries(m))
      rows.push({ part: 'time', grain, key: k, category: grain === 'day' ? k.slice(8) + ' ' + MON[+k.slice(5, 7) - 1] : k, calls: o.total, ...o });
    const [tf, tfc] = top(failed), [ta, tac] = top(agent), [ts, tsc] = top(sup);
    rows.push({ part: 'kpi', calls: n, nonfatal: nf, nonfatal_pct: pc(nf, n), audited: aud, top_failed: tf ? LABELS[tf] : null, top_failed_calls: tfc,
      top_failed_pct: pc(tfc, aud), top_agent: ta, top_agent_calls: tac, top_agent_pct: pc(tac, nf), top_sup: ts, top_sup_calls: tsc, top_sup_pct: pc(tsc, nf) });
    return rows;
  },
});

dash.calc('fatal_kpi', {
  title: 'Fatal breakdown headline figures',
  description: 'The kpi rows of fatal_parts.',
  inputs: ['fatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'kpi'),
});

dash.calc('fatal_reasons', {
  title: 'Fatal reasons',
  description: 'The reason rows of fatal_parts.',
  inputs: ['fatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'reason').sort((a, b) => b.calls - a.calls),
});

dash.calc('fatal_agents', {
  title: 'Fatal calls by agent',
  description: 'The agent rows of fatal_parts.',
  inputs: ['fatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'agent').sort((a, b) => b.calls - a.calls),
});

dash.calc('fatal_sups', {
  title: 'Fatal calls by supervisor',
  description: 'The sup rows of fatal_parts.',
  inputs: ['fatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'sup').sort((a, b) => b.calls - a.calls),
});

dash.calc('fatal_time', {
  title: 'Fatal calls over time',
  description: 'The time rows of fatal_parts.',
  inputs: ['fatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'time').sort((a, b) => (a.key < b.key ? -1 : 1)),
});

dash.calc('nonfatal_kpi', {
  title: 'Non-fatal breakdown headline figures',
  description: 'The kpi rows of nonfatal_parts.',
  inputs: ['nonfatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'kpi'),
});

dash.calc('nonfatal_failed', {
  title: 'Parameters failed on non-fatal calls',
  description: 'The failed rows of nonfatal_parts.',
  inputs: ['nonfatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'failed').sort((a, b) => b.calls - a.calls),
});

dash.calc('nonfatal_agents', {
  title: 'Non-fatal calls by agent',
  description: 'The agent rows of nonfatal_parts.',
  inputs: ['nonfatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'agent').sort((a, b) => b.calls - a.calls),
});

dash.calc('nonfatal_sups', {
  title: 'Non-fatal calls by supervisor',
  description: 'The sup rows of nonfatal_parts.',
  inputs: ['nonfatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'sup').sort((a, b) => b.calls - a.calls),
});

dash.calc('nonfatal_time', {
  title: 'Failed parameters on non-fatal calls over time',
  description: 'The time rows of nonfatal_parts.',
  inputs: ['nonfatal_parts'],
  fn: (rows) => rows.filter((r) => r.part === 'time').sort((a, b) => (a.key < b.key ? -1 : 1)),
});
