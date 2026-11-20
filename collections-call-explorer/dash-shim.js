// Standalone runtime: provides the small `dash` API the explorer's scripts use
// (data loading, calculations, filters and redrawing), so the page runs on any static host.
(function () {
  const CONFIG = window.CG_CONFIG;
  const loaders = {}, calcs = {}, draws = {}, dataFns = [], store = {}, memo = {};
  let pver = 0, dver = 0, queued = false;
  let params = Object.assign({}, CONFIG.params);

  function loadSource(id) {
    if (store[id]) return store[id];
    const src = CONFIG.datasets[id];
    if (!src) return (store[id] = { status: 'missing', data: [] });
    store[id] = { status: 'loading', data: [] };
    Promise.resolve()
      .then(() => (src.data !== undefined ? src.data : fetch(src.url).then((r) => r.json())))
      .then((answer) => {
        let out = loaders[id] ? loaders[id].fn({ answer }) : answer;
        let rows = out, columns, meta;
        if (out && !Array.isArray(out) && Array.isArray(out.data)) { rows = out.data; columns = out.columns; meta = out.meta; }
        store[id] = { status: 'ok', data: rows, columns, meta };
        dver++; schedule();
      })
      .catch((e) => { console.error(e); store[id] = { status: 'error', data: [], message: String(e) }; dver++; schedule(); });
    return store[id];
  }
  function calc(id) {
    const c = calcs[id], key = pver + ':' + dver, m = memo[id];
    if (m && m.key === key) return m.res;
    const ins = c.inputs.map(data);
    let res;
    if (ins.some((i) => i.status === 'error')) res = { status: 'error', data: null };
    else if (ins.some((i) => i.status !== 'ok')) res = { status: 'loading', data: null };
    else {
      try { res = { status: 'ok', data: c.fn(...ins.map((i) => i.data)) }; }
      catch (e) { console.error('calc ' + id, e); res = { status: 'error', data: null, message: String(e) }; }
    }
    res.refreshing = false; res.truncated = false;
    memo[id] = { key: pver + ':' + dver, res };
    return res;
  }
  function data(id) {
    if (calcs[id]) return calc(id);
    const s = loadSource(id);
    return { status: s.status, data: s.data, columns: s.columns, meta: s.meta, message: s.message, refreshing: false, truncated: false };
  }
  const visible = (el) => !el.closest('[hidden]');
  function runDraw(name) {
    const fn = draws[name]; if (!fn) return;
    document.querySelectorAll('[data-draw="' + name + '"]').forEach((el) => {
      if (!visible(el)) return;
      try { fn(el); } catch (e) { console.error('draw ' + name, e); }
    });
  }
  function renderAll() {
    queued = false;
    Object.keys(draws).forEach(runDraw);
    dataFns.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(renderAll); } }

  window.dash = {
    colors: ['var(--cg-s1)', 'var(--cg-s2)', 'var(--cg-s3)', 'var(--cg-s4)', 'var(--cg-s5)', 'var(--cg-s6)', 'var(--cg-s7)', 'var(--cg-s8)'],
    loader(id, o) { loaders[id] = o; },
    calc(id, o) { calcs[id] = o; },
    data,
    draw(name, fn) { if (fn) draws[name] = fn; runDraw(name); },
    onData(fn) { dataFns.push(fn); fn(); },
    params() { return Object.assign({}, params); },
    setParams(o) { for (const k in o) params[k] = o[k] == null ? null : o[k]; pver++; schedule(); },
    resetParams() { params = Object.assign({}, CONFIG.params); pver++; schedule(); },
    setLink(name) { try { history.replaceState(null, '', '#' + name); } catch (e) { /* ignore */ } },
    refresh() {},
  };
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; schedule(); } });
})();
