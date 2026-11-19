/* Puzzle: the hero's block-stacking board, as a standalone component.
   Usage:  var p = Puzzle.create(hostElement, { fallMsPerRow: 600 });  p.rebuild();  p.destroy();
   Everything adjustable is in Puzzle.defaults below. Nothing here knows about the page around it. */
(function (root) {
  'use strict';

  var defaults = {
    /* grid */
    targetCell: 48,        // wanted cell size in px; the real size is width / cols so cells always fit exactly
    minCols: 20,           // never fewer columns than this
    minRows: 10,
    gapRatio: 0.05,        // gap between tiles as a share of the cell
    /* look: null uses the CSS variable --pz-cell, falling back to the page's --cream */
    color: null,
    /* settled blocks */
    ground: { rows: 2, gapWidth: 4, gapFromRight: 8 },  // full rows along the bottom with one gap; gap starts this many columns from the right
    block: { col: 4, width: 4, fromRow: 2, rows: 2 },   // the starting block the pieces stack on
    /* pieces: cells are [dx, dy] with dy counted upward */
    shapes: {
      L: [[0, 1], [0, 0], [1, 0], [2, 0]],
      J: [[0, 1], [1, 1], [2, 1], [2, 0]],
      O: [[0, 0], [1, 0], [0, 1], [1, 1]],
      I: [[0, 0], [1, 0], [2, 0], [3, 0]]
    },
    /* the loop: [shape, column]. Each piece falls onto whatever is below it. 'clear' empties the tower and restarts. */
    loop: [['L', 4], ['J', 5], ['L', 4], ['O', 0], ['I', 8], ['J', 5], 'clear'],
    prePlaced: 4,          // how many pieces of the loop are already settled when the page opens
    /* timing (ms) */
    fallMsPerRow: 450,
    startDelay: 700,
    spawnDelay: 400,
    clearHold: 900,
    clearAfter: 600,
    /* behaviour */
    animate: true,         // false draws the settled board and stops
    pauseOffscreen: true   // stop scheduling while the board is off screen or the tab is hidden
  };

  function merge(a, b) {
    var o = {}, k;
    for (k in a) o[k] = a[k];
    for (k in b) o[k] = b[k];
    return o;
  }

  function create(host, overrides) {
    var cfg = merge(defaults, overrides || {});
    var gen = 0, timer = null, pending = null, paused = false, io = null, onVis = null;

    function later(fn, ms) {
      var g = gen;
      timer = setTimeout(function () {
        if (g !== gen) return;
        if (paused) pending = fn; else fn();
      }, ms);
    }

    function setPaused(p) {
      paused = p;
      if (!p && pending) { var f = pending; pending = null; f(); }
    }

    function rebuild() {
      gen++; clearTimeout(timer); pending = null;
      host.innerHTML = '';
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;

      var N = Math.max(cfg.minCols, Math.round(w / cfg.targetCell)),
          C = w / N,
          g = Math.max(1.5, C * cfg.gapRatio),
          S = C - g,
          R = Math.max(cfg.minRows, Math.floor(h / C + 0.001)),
          grid = {}, H = [], c, r, k;
      for (c = 0; c < N; c++) H[c] = 0;
      if (cfg.color) host.style.setProperty('--pz-cell', cfg.color);

      function mk(c, r) {
        var i = document.createElement('i');
        i.style.cssText = 'width:' + S + 'px;height:' + S + 'px;left:' + (c * C + g / 2) + 'px;bottom:' + (r * C + g / 2) + 'px';
        host.appendChild(i);
        return i;
      }
      function settle(c, r, el) { grid[c + ',' + r] = el; if (r + 1 > H[c]) H[c] = r + 1; }
      function put(c, r) { settle(c, r, mk(c, r)); }
      function heights() {
        for (var x = 0; x < N; x++) { H[x] = 0; for (var y = 0; y < R + 4; y++) if (grid[x + ',' + y]) H[x] = y + 1; }
      }

      /* settled blocks */
      var gs = N - cfg.ground.gapFromRight;
      for (c = 0; c < N; c++) {
        if (c >= gs && c < gs + cfg.ground.gapWidth) continue;
        for (r = 0; r < cfg.ground.rows; r++) put(c, r);
      }
      var b = cfg.block;
      for (c = b.col; c < b.col + b.width; c++) for (r = b.fromRow; r < b.fromRow + b.rows; r++) put(c, r);

      /* pieces */
      function landOf(sh, col) {
        var l = 0;
        sh.forEach(function (d) { l = Math.max(l, H[col + d[0]] - d[1]); });
        return l;
      }
      function placeNow(sh, col) {
        var l = landOf(sh, col);
        sh.forEach(function (d) { put(col + d[0], l + d[1]); });
      }
      function clearBoard() {
        Object.keys(grid).forEach(function (key) {
          var q = key.split(','), cc = +q[0], rr = +q[1];
          var inBlock = cc >= b.col && cc < b.col + b.width && rr >= b.fromRow && rr < b.fromRow + b.rows;
          if (rr >= cfg.ground.rows && !inBlock) { grid[key].remove(); delete grid[key]; }
        });
        heights();
      }

      var idx = 0, loop = cfg.loop;
      for (k = 0; k < cfg.prePlaced; k++) { placeNow(cfg.shapes[loop[k][0]], loop[k][1]); idx++; }

      function next(first) {
        var it = loop[idx % loop.length]; idx++;
        if (it === 'clear') {
          later(function () { clearBoard(); later(next, cfg.clearAfter); }, cfg.clearHold);
          return;
        }
        var sh = cfg.shapes[it[0]], col = it[1], l = landOf(sh, col),
            top = Math.max.apply(null, sh.map(function (d) { return d[1]; })),
            r0 = first ? l + 2 : R - top + 1,
            dur = (r0 - l) * cfg.fallMsPerRow,
            els = sh.map(function (d) { var e = mk(col + d[0], r0 + d[1]); e.style.transition = 'none'; return e; });
        void host.offsetWidth;
        els.forEach(function (e, j) {
          e.style.transition = 'bottom ' + dur + 'ms linear';
          e.style.bottom = ((l + sh[j][1]) * C + g / 2) + 'px';
        });
        later(function () {
          els.forEach(function (e, j) { e.style.transition = ''; settle(col + sh[j][0], l + sh[j][1], e); });
          later(next, cfg.spawnDelay);
        }, dur + 30);
      }

      if (!cfg.animate) { placeNow(cfg.shapes.I, 8); idx++; }
      else later(function () { next(true); }, cfg.startDelay);
    }

    if (cfg.pauseOffscreen && cfg.animate) {
      if ('IntersectionObserver' in root) {
        io = new IntersectionObserver(function (es) { setPaused(!es[es.length - 1].isIntersecting || document.hidden); });
        io.observe(host);
      }
      onVis = function () { setPaused(document.hidden); };
      document.addEventListener('visibilitychange', onVis);
    }

    function destroy() {
      gen++; clearTimeout(timer); pending = null;
      if (io) io.disconnect();
      if (onVis) document.removeEventListener('visibilitychange', onVis);
      host.innerHTML = '';
    }

    return { rebuild: rebuild, destroy: destroy, pause: function () { setPaused(true); }, resume: function () { setPaused(false); } };
  }

  root.Puzzle = { create: create, defaults: defaults };
})(window);
