// Turns the compact column file into one row per call.
dash.loader('calls', {
  description: 'Unpacks calls_nov.json: each column is either a list of values or a dictionary plus codes; this rebuilds one row per call.',
  fn: ({ answer }) => {
    const n = answer.n, cols = answer.cols, keys = Object.keys(cols);
    const rows = new Array(n);
    for (let i = 0; i < n; i++) {
      const row = {};
      for (const k of keys) {
        const c = cols[k];
        if (c.dict) { const code = c.codes[i]; row[k] = code == null ? null : c.dict[code]; }
        else row[k] = c.vals[i];
      }
      rows[i] = row;
    }
    return { data: rows, columns: keys, meta: answer.meta };
  },
});
