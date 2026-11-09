(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  /* links to the old single-page addresses (/#story) keep working */
  var oldHash = location.hash.slice(1);
  if(location.pathname === '/' && ["home","story","platforms","thesis","leadership","network","notes","careers","contact","legal"].indexOf(oldHash) > 0){ location.replace('/' + oldHash); return; }
  var current = null, curView = null, panels = [], activeIdx = -1;
  var hdr = document.getElementById('top');

  /* ================= canvas scenes ================= */
  var ptr = {x:0, y:0, on:false}, active = null, raf = null, t0 = 0;
  function Scene(cv){ this.cv = cv; this.mode = cv.getAttribute('data-mode'); this.ctx = cv.getContext && cv.getContext('2d'); }
  Scene.prototype.build = function(){
    var r = this.cv.getBoundingClientRect(); this.W = r.width; this.H = r.height;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(this.W*dpr); this.cv.height = Math.round(this.H*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    var W = this.W, H = this.H, narrow = W < 860, seed = 11;
    function rnd(){ seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; }
    this.left = narrow ? W*.06 : W*.46; this.right = W*.97;
    var y0 = narrow ? H*.10 : H*.14, y1 = narrow ? H*.44 : H*.86, gap = narrow ? 22 : 30;
    this.rows = []; for(var y=y0; y<=y1; y+=gap) this.rows.push(y);
    this.marginX = this.left + 26;
    this.cx = narrow ? W*.62 : W*.72; this.cy = narrow ? H*.26 : H*.5; this.R = Math.min(W,H) * (narrow ? .2 : .26);
    var n = narrow ? 100 : 240, span = this.right - this.marginX;
    var cols = [this.marginX+14, this.marginX + span*.18, this.marginX + span*.62, this.marginX + span*.82];
    this.p = [];
    for(var i=0;i<n;i++){
      var ci = Math.floor(rnd()*cols.length), len = ci===1 ? 40+rnd()*110 : 14+rnd()*30, col = Math.floor(rnd()*3);
      this.p.push({ x:this.left - 40 + rnd()*(W-this.left+80), y:rnd()*H, vx:(rnd()-.5)*.35, vy:(rnd()-.5)*.35,
        tx: Math.min(cols[ci] + rnd()*20, this.right-10), ty: this.rows[Math.floor(rnd()*this.rows.length)], len:len,
        ctx: this.marginX + (span/3)*col + 14 + rnd()*(span/3 - 70),
        a:.18+rnd()*.45, brass: rnd()<.09, ph: rnd()*6.283, ang: rnd()*6.283 });
    }
  };
  function smooth(e){ return e<0?0:e>1?1:e*e*(3-2*e); }
  function order(s){ var c = s % 15; if(c<3.5) return 0; if(c<7.5) return smooth((c-3.5)/4); if(c<12) return 1; return 1-smooth((c-12)/3); }
  Scene.prototype.draw = function(s){
    var c = this.ctx, W = this.W, H = this.H, o = reduce ? 1 : order(s), m = this.mode, i, e;
    c.clearRect(0,0,W,H);
    if(m === 'dots'){
      var g = W < 860 ? 22 : 28, sweep = ((s*70) % (W*1.3)) - W*.1;
      for(var x = this.left; x < W; x += g){ for(var y = g; y < H; y += g){
        var d = Math.abs(x - sweep), pd = ptr.on ? Math.hypot(x - ptr.x, y - ptr.y) : 999; if(pd < d) d = pd; var hot = !reduce && d < 60;
        c.fillStyle = hot ? 'rgba(207,167,98,' + (0.75 - d/90).toFixed(3) + ')' : 'rgba(238,232,220,.10)';
        c.beginPath(); c.arc(x, y, hot ? 1.8 : 1.1, 0, 6.283); c.fill();
      } }
      return;
    }
    if(m === 'ledger' || m === 'columns'){
      c.lineWidth = 1; c.strokeStyle = 'rgba(238,232,220,' + (0.035 + 0.07*o) + ')';
      for(i=0;i<this.rows.length;i++){ c.beginPath(); c.moveTo(this.marginX-40, this.rows[i]+5.5); c.lineTo(W*.99, this.rows[i]+5.5); c.stroke(); }
      var yT = this.rows[0]-24, yB = this.rows[this.rows.length-1]+28;
      if(m === 'ledger'){ c.strokeStyle = 'rgba(208,96,74,' + (0.12 + 0.45*o) + ')'; c.beginPath(); c.moveTo(this.marginX, yT); c.lineTo(this.marginX, yB); c.stroke(); }
      else { var sp = (this.right - this.marginX)/3; c.strokeStyle = 'rgba(207,167,98,' + (0.12 + 0.35*o) + ')'; for(var k=1;k<3;k++){ c.beginPath(); c.moveTo(this.marginX + sp*k, yT); c.lineTo(this.marginX + sp*k, yB); c.stroke(); } }
    } else {
      c.strokeStyle = 'rgba(208,96,74,' + (0.10 + 0.4*o) + ')'; c.lineWidth = 1; c.setLineDash([3,6]);
      c.beginPath(); if(m === 'loop') c.ellipse(this.cx, this.cy, this.R, this.R*.62, 0, 0, 6.283); else c.arc(this.cx, this.cy, this.R, 0, 6.283); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(207,167,98,' + (0.25 + 0.5*o) + ')'; c.beginPath(); c.arc(this.cx, this.cy, 5 + 4*o, 0, 6.283); c.fill();
    }
    for(i=0;i<this.p.length;i++){
      e = this.p[i];
      if(!reduce){ e.x += e.vx + Math.sin(s*.5+e.ph)*.15; e.y += e.vy + Math.cos(s*.4+e.ph)*.15;
        if(e.x < -40) e.x = W+20; if(e.x > W+40) e.x = -20; if(e.y < -20) e.y = H+10; if(e.y > H+20) e.y = -10; }
      var tx = e.tx, ty = e.ty, ang, a2 = e.ang;
      if(m === 'converge'){ tx = this.cx + Math.cos(e.ang)*this.R; ty = this.cy + Math.sin(e.ang)*this.R; }
      if(m === 'loop'){ a2 = e.ang + s*.18; tx = this.cx + Math.cos(a2)*this.R; ty = this.cy + Math.sin(a2)*this.R*.62; }
      if(m === 'columns'){ tx = e.ctx; }
      var x = e.x + (tx - e.x)*o, y2 = e.y + (ty - e.y)*o;
      var boost = 0; if(ptr.on && !reduce){ var dx = x - ptr.x, dy = y2 - ptr.y, dd = Math.hypot(dx, dy); if(dd < 150 && dd > 0.5){ boost = 1 - dd/150; x += dx/dd*boost*26; y2 += dy/dd*boost*26; } }
      var curved = (m === 'converge' || m === 'loop');
      ang = (1-o)*Math.sin(e.ph + s*.3)*.9 + (curved ? o*(a2 + 1.5708) : 0);
      var len = (curved ? 14 : e.len) * (0.55 + 0.45*o);
      c.strokeStyle = (e.brass || boost > .55) ? 'rgba(207,167,98,' + Math.min(1, 0.45 + 0.4*o + boost*.4) + ')' : 'rgba(238,232,220,' + Math.min(1, e.a*(0.55+0.45*o) + boost*.5) + ')';
      c.lineWidth = e.brass ? 2 : 1.6;
      c.beginPath(); c.moveTo(x, y2); c.lineTo(x + Math.cos(ang)*len, y2 + Math.sin(ang)*len); c.stroke();
    }
  };

  var scenes = [];
  function buildScenes(view){ stopScene(); active = null; scenes = []; Array.prototype.forEach.call(view.querySelectorAll('canvas[data-mode]'), function(cv, i){ cv.setAttribute('data-sid', i); scenes.push(new Scene(cv)); }); }
  function loop(ts){ if(!t0) t0 = ts; active.draw((ts - t0)/1000); raf = requestAnimationFrame(loop); }
  function stopScene(){ if(raf){ cancelAnimationFrame(raf); raf = null; } }
  function startScene(cv){
    if(active && cv && active.cv === cv && (raf || reduce)) return;
    stopScene(); active = null;
    if(!cv) return;
    var sc = scenes[+cv.getAttribute('data-sid')]; if(!sc || !sc.ctx) return;
    active = sc; active.build(); t0 = 0;
    if(reduce) active.draw(0); else raf = requestAnimationFrame(loop);
  }
  document.addEventListener('pointermove', function(e){ if(!active) return; var r = active.cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = ptr.y >= 0 && ptr.y <= r.height; }, {passive:true});
  document.addEventListener('pointerleave', function(){ ptr.on = false; });

  /* ================= headline splitting ================= */
  function decorate(view){
  Array.prototype.forEach.call(view.querySelectorAll('[data-split]'), function(h){
    var txt = h.textContent.trim(), words = txt.split(/\s+/); h.setAttribute('aria-label', txt); h.textContent = '';
    words.forEach(function(w, i){ var o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden','true'); var s = document.createElement('span'); s.style.setProperty('--i', i); s.textContent = w; o.appendChild(s); h.appendChild(o); if(i < words.length - 1) h.appendChild(document.createTextNode(' ')); });
  });
  /* stagger children */
  Array.prototype.forEach.call(view.querySelectorAll('.pnl-in, .col'), function(c){ Array.prototype.forEach.call(c.children, function(ch, i){ ch.style.setProperty('--d', i); }); });

  /* ================= static viz builders ================= */
  var waf = view.querySelector('.waffle');
  if(waf){ for(var i=0;i<100;i++){ var c = document.createElement('i'); c.style.setProperty('--i', i); if(i < 38) c.className = 'on'; waf.appendChild(c); } }
  var wk = view.querySelector('.week');
  if(wk){ for(var j=0;j<46;j++){ var b = document.createElement('i'); b.style.setProperty('--i', j); if(j === 45) b.className = 'half'; else if((j*7) % 46 < 16) b.className = 'ad'; wk.appendChild(b); } }
  }

  /* ================= charts ================= */
  var NS = 'http://www.w3.org/2000/svg';
  var C = { brass:'#CFA762', brass2:'#8E7547', madder:'#D0604A', mut:'#3A4356', dim:'#6B7486', fg:'#EEE8DC', bg:'#070C16' };
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for(var k in attrs){ if(attrs[k] !== undefined) e.setAttribute(k, attrs[k]); } if(parent) parent.appendChild(e); return e; }
  function tx(parent, x, y, s, cls, anchor){ var t = el('text', {x:x, y:y, 'class':cls || 'ax', 'text-anchor':anchor || 'start'}, parent); t.textContent = s; return t; }
  function fmt(n){ return n.toLocaleString('en-IN'); }
  function svgFor(box, W, H){ box.innerHTML = ''; return el('svg', {viewBox:'0 0 '+W+' '+H, width:W, height:H, 'aria-hidden':'true'}, box); }
  function drawable(path){ try{ var L = path.getTotalLength(); path.style.setProperty('--len', Math.ceil(L)); path.classList.add('draw'); }catch(e){} }


  var charts = {
    dpiit: function(box, W){
      var narrow = W < 600, H = +box.getAttribute('data-h') || (narrow ? 260 : 340), m = {l:46, r: narrow ? 70 : 104, t:24, b:34};
      var s = svgFor(box, W, H), iw = W - m.l - m.r, ih = H - m.t - m.b;
      var d = [['2016-12-31',502,'Dec 2016'],['2023-12-31',117254,'Dec 2023'],['2024-06-30',140803,'Jun 2024'],['2025-06-30',180000,'Jun 2025 (over 1.8 lakh)'],['2025-12-31',207135,'Dec 2025'],['2026-03-31',223000,'Mar 2026 (over 2.23 lakh)']];
      var t0 = Date.parse('2016-01-01'), t1 = Date.parse('2026-06-30');
      var X = function(dt){ return m.l + (Date.parse(dt) - t0) / (t1 - t0) * iw; }, Y = function(v){ return m.t + ih - v / 250000 * ih; };
      for(var v=0; v<=250000; v+=50000){ el('line',{x1:m.l,x2:m.l+iw,y1:Y(v),y2:Y(v),'class':v ? 'grid' : 'base'}, s); tx(s, m.l-10, Y(v)+4, v ? (v/100000)+' L' : '0', 'ax', 'end'); }
      var step = narrow ? 4 : 2;
      for(var y=2016; y<=2026; y+=step){ var xx = X(y+'-01-01'); tx(s, xx, H-10, String(y), 'ax', 'middle'); }
      var defs = el('defs',{},s), g = el('linearGradient',{id:'ga',x1:0,x2:0,y1:0,y2:1},defs);
      el('stop',{offset:'0','stop-color':C.brass,'stop-opacity':.28},g); el('stop',{offset:'1','stop-color':C.brass,'stop-opacity':0},g);
      var solid = d.slice(1), area = 'M'+X(solid[0][0])+' '+Y(0);
      solid.forEach(function(p){ area += 'L'+X(p[0])+' '+Y(p[1]); }); area += 'L'+X(solid[solid.length-1][0])+' '+Y(0)+'Z';
      el('path',{d:area,fill:'url(#ga)','class':'rise'},s);
      var dash = el('path',{d:'M'+X(d[0][0])+' '+Y(d[0][1])+'L'+X(d[1][0])+' '+Y(d[1][1]),fill:'none',stroke:C.brass,'stroke-width':1.5,'stroke-dasharray':'4 6',opacity:.7,'class':'pop'},s);
      var line = el('path',{d:'M'+solid.map(function(p){ return X(p[0])+' '+Y(p[1]); }).join('L'),fill:'none',stroke:C.brass,'stroke-width':2.5,'stroke-linejoin':'round','stroke-linecap':'round'},s); drawable(line);
      d.forEach(function(p, i){
        var last = i === d.length - 1;
        if(last) el('circle',{cx:X(p[0]),cy:Y(p[1]),r:6,fill:'none',stroke:C.brass,'stroke-width':1.5,'class':'ping'},s);
        el('circle',{cx:X(p[0]),cy:Y(p[1]),r:last ? 6 : 4,fill:last ? C.brass : C.bg,stroke:C.brass,'stroke-width':2,'class':'pop'},s);
        el('circle',{cx:X(p[0]),cy:Y(p[1]),r:16,'class':'hit','data-tip':p[2]+': '+fmt(p[1])+' recognised startups'},s);
      });
      tx(s, X(d[0][0])+10, Y(d[0][1])-12, '502', 'lbl', 'start');
      var lp = d[d.length-1]; tx(s, X(lp[0])+12, Y(lp[1])+5, '2.23 L+', 'lbl', 'start');
      tx(s, X(lp[0])+12, Y(lp[1])+22, 'Mar 2026', 'lbl-m', 'start');
    },
    funding: function(box, W){
      var H = +box.getAttribute('data-h') || (W < 600 ? 280 : 320), m = {l:40, r:12, t:40, b:34}, s = svgFor(box, W, H), iw = W-m.l-m.r, ih = H-m.t-m.b;
      var d = [['2022',25.0],['2023',11.0],['2024',12.7],['2025',10.5]], max = 30;
      var Y = function(v){ return m.t + ih - v/max*ih; }, band = iw / d.length, bw = Math.min(band*.56, 96);
      for(var v=0; v<=max; v+=10){ el('line',{x1:m.l,x2:m.l+iw,y1:Y(v),y2:Y(v),'class':v ? 'grid' : 'base'}, s); tx(s, m.l-8, Y(v)+4, '$'+v+'B', 'ax', 'end'); }
      d.forEach(function(p, i){
        var cx = m.l + band*i + band/2, x = cx - bw/2, y = Y(p[1]), h = Y(0) - y, r = 4, last = i === d.length-1;
        el('path',{d:'M'+x+' '+Y(0)+'V'+(y+r)+'Q'+x+' '+y+' '+(x+r)+' '+y+'H'+(x+bw-r)+'Q'+(x+bw)+' '+y+' '+(x+bw)+' '+(y+r)+'V'+Y(0)+'Z',fill:last ? C.brass : C.mut,'class':'bar',style:'--i:'+i}, s);
        el('rect',{x:x-6,y:m.t,width:bw+12,height:ih,'class':'hit','data-tip':p[0]+': $'+p[1].toFixed(1)+'B raised'+(last ? ' across 1,518 rounds' : '')}, s);
        tx(s, cx, y-10, '$'+p[1].toFixed(1)+'B', 'lbl', 'middle');
        tx(s, cx, H-10, p[0], 'ax', 'middle');
      });
      var x0 = m.l + band/2 + bw/2 + 6, x1 = m.l + band*3.5 - bw/2 - 6, y0 = Y(25), yy = Y(10.5);
      var ann = el('path',{d:'M'+x0+' '+y0+'C'+(x0+(x1-x0)*.55)+' '+y0+' '+(x1-(x1-x0)*.2)+' '+(yy-30)+' '+x1+' '+(yy-18),fill:'none',stroke:C.madder,'stroke-width':1.5,'stroke-dasharray':'3 5'}, s);
      ann.classList.add('pop');
      var tl = tx(s, m.l + band*2, Y(22), '−58%', 'lbl', 'middle'); tl.setAttribute('fill', C.madder); tl.classList.add('pop'); tl.setAttribute('style','font-size:22px');
    },
    loi: function(box, W){
      var H = +box.getAttribute('data-h') || (W < 600 ? 280 : 320), m = {l:40, r: W < 600 ? 60 : 150, t:28, b:34}, s = svgFor(box, W, H), iw = W-m.l-m.r, ih = H-m.t-m.b;
      var Y = function(v){ return m.t + ih - v/25*ih; }, xa = m.l + 86, xb = m.l + iw - 10;
      for(var v=0; v<=25; v+=5){ el('line',{x1:m.l,x2:m.l+iw,y1:Y(v),y2:Y(v),'class':v ? 'grid' : 'base'}, s); tx(s, m.l-8, Y(v)+4, v+'%', 'ax', 'end'); }
      tx(s, xa, H-10, '2023', 'ax', 'middle'); tx(s, xb, H-10, '2024', 'ax', 'middle');
      [[19.1,21.5,C.dim,'Other diligence',2],[10.6,15.4,C.madder,'Earnings (QoE)',3]].forEach(function(r){
        var p = el('path',{d:'M'+xa+' '+Y(r[0])+'L'+xb+' '+Y(r[1]),stroke:r[2],'stroke-width':r[4],fill:'none','stroke-linecap':'round'}, s); drawable(p);
        [[xa,r[0]],[xb,r[1]]].forEach(function(q, k){
          el('circle',{cx:q[0],cy:Y(q[1]),r:5,fill:r[2],stroke:C.bg,'stroke-width':2,'class':'pop'}, s);
          el('circle',{cx:q[0],cy:Y(q[1]),r:16,'class':'hit','data-tip':r[3]+', '+(k ? '2024' : '2023')+': '+q[1]+'% of broken LOIs'}, s);
          tx(s, q[0] + (k ? 12 : -12), Y(q[1])+5, q[1]+'%', 'lbl', k ? 'start' : 'end');
        });
        if(W >= 600) tx(s, xb + 62, Y(r[1])+5, r[3], 'lbl-m', 'start');
      });
    },
    gcc: function(box, W){
      var narrow = W < 600, H = +box.getAttribute('data-h') || (narrow ? 280 : 360), m = {l:50, r: narrow ? 20 : 150, t:28, b:34}, s = svgFor(box, W, H), iw = W-m.l-m.r, ih = H-m.t-m.b;
      var X = function(fy){ return m.l + (fy - 23) / 7 * iw; }, Y = function(v){ return m.t + ih - v/5500*ih; };
      for(var v=0; v<=5000; v+=1000){ el('line',{x1:m.l,x2:m.l+iw,y1:Y(v),y2:Y(v),'class':v ? 'grid' : 'base'}, s); tx(s, m.l-8, Y(v)+4, fmt(v), 'ax', 'end'); }
      for(var fy=23; fy<=30; fy+= narrow ? 1 : 1){ if(narrow && fy % 2 === 0 && fy !== 30) continue; tx(s, X(fy), H-10, 'FY'+fy, 'ax', 'middle'); }
      el('rect',{x:X(24),y:Y(2200),width:X(30)-X(24),height:Math.max(3, Y(2100)-Y(2200)),fill:C.brass,'fill-opacity':.2,'class':'pop'}, s);
      el('line',{x1:X(24),x2:X(30),y1:Y(2200),y2:Y(2200),stroke:C.brass,'stroke-dasharray':'3 4','stroke-opacity':.8,'class':'pop'}, s);
      el('rect',{x:X(24),y:Y(2200)-10,width:X(30)-X(24),height:Y(2100)-Y(2200)+20,'class':'hit','data-tip':'2030 forecast made in Sept 2024: 2,100–2,200 GCCs'}, s);
      var fl = tx(s, X(30), Y(2200)-12, '2030 forecast', 'lbl-m', 'end');
      var d = [[23,1580],[24,1700],[26,2117]];
      var line = el('path',{d:'M'+d.map(function(p){ return X(p[0])+' '+Y(p[1]); }).join('L'),fill:'none',stroke:C.brass,'stroke-width':2.5,'stroke-linecap':'round'}, s); drawable(line);
      d.forEach(function(p, i){ var last = i === d.length-1;
        if(last) el('circle',{cx:X(p[0]),cy:Y(p[1]),r:6,fill:'none',stroke:C.brass,'stroke-width':1.5,'class':'ping'}, s);
        el('circle',{cx:X(p[0]),cy:Y(p[1]),r:last ? 6 : 4,fill:last ? C.brass : C.bg,stroke:C.brass,'stroke-width':2,'class':'pop'}, s);
        el('circle',{cx:X(p[0]),cy:Y(p[1]),r:16,'class':'hit','data-tip':'FY'+p[0]+': '+fmt(p[1])+' GCCs'}, s);
        if(!narrow || last) tx(s, X(p[0]), Y(p[1]) + (last ? 32 : 24), fmt(p[1]), 'lbl', 'middle');
      });
      var gx = X(30), gy = Y(5000);
      el('path',{d:'M'+X(26)+' '+Y(2117)+'L'+gx+' '+gy,stroke:C.fg,'stroke-opacity':.35,'stroke-dasharray':'2 6',fill:'none','class':'pop'}, s);
      el('circle',{cx:gx,cy:gy,r:7,fill:'none',stroke:C.fg,'stroke-width':2,'class':'pop'}, s);
      el('circle',{cx:gx,cy:gy,r:16,'class':'hit','data-tip':'Government ambition: about 5,000 GCCs by 2030'}, s);
      tx(s, gx + (narrow ? -12 : 14), gy + 5, '~5,000', 'lbl', narrow ? 'end' : 'start');
      if(!narrow){ tx(s, gx + 14, gy + 22, 'ambition, 2030', 'lbl-m', 'start'); tx(s, X(26) + 14, Y(2117) - 14, 'already inside', 'lbl-m', 'start'); }
    },
    network: function(box, W){
      var side = W >= 760, pw = side ? (W - 40)/2 : W, ph = side ? (+box.getAttribute('data-h') || 380) : 340, H = side ? ph : ph*2 + 44;
      var s = svgFor(box, W, H), defs = el('defs',{},s);
      var names = ['Auditor','Company sec.','Tax adviser','Banker','Investor','Lender','Accountant','Legal'];
      function glow(id, col){ var g = el('radialGradient',{id:id},defs); el('stop',{offset:'0','stop-color':col,'stop-opacity':.38},g); el('stop',{offset:'.55','stop-color':col,'stop-opacity':.1},g); el('stop',{offset:'1','stop-color':col,'stop-opacity':0},g); }
      glow('net-r', C.madder); glow('net-g', C.brass);
      function arc(a, b, bend){ var mx = (a[0]+b[0])/2, my = (a[1]+b[1])/2, dx = b[0]-a[0], dy = b[1]-a[1]; return 'M'+a[0]+' '+a[1]+'Q'+(mx - dy*bend)+' '+(my + dx*bend)+' '+b[0]+' '+b[1]; }
      function edge(c, p, r){ var dx = p[0]-c[0], dy = p[1]-c[1], d = Math.hypot(dx, dy) || 1; return [c[0] + dx/d*r, c[1] + dy/d*r]; }
      function line(g, d, stroke, w, op, i){ var p = el('path',{d:d,stroke:stroke,'stroke-width':w,'stroke-opacity':op,fill:'none','stroke-linecap':'round'}, g); p.style.setProperty('--i', i); drawable(p); return p; }
      function flow(g, d, w){ el('path',{d:d,stroke:C.brass,'stroke-width':w,fill:'none','stroke-linecap':'round','stroke-dasharray':'1 15','class':'flow'}, g); }
      function pill(g, x, y, label, strong, i){
        var w = label.length * 7.4 + 26, n = el('g',{'class':'net-n',style:'--i:'+i}, g);
        el('rect',{x:x-w/2,y:y-15,width:w,height:30,rx:15,fill:strong ? '#1B1A17' : '#0E1626',stroke:strong ? C.brass : 'rgba(238,232,220,.24)','stroke-width':strong ? 1.75 : 1}, n);
        var t = tx(n, x, y+5, label, 'lbl', 'middle'); t.setAttribute('style','font-size:13px;font-weight:500');
      }
      function panel(ox, oy, after){
        var g = el('g',{transform:'translate('+ox+','+oy+')'}, s), base = after ? 12 : 0;
        var cx = pw/2, cy = ph/2 + (after ? 22 : 16), rx = Math.min(pw/2 - 66, 215), ry = ph/2 - (after ? 64 : 58), R = after ? 42 : 34, c = [cx, cy], col = after ? C.brass : C.madder;
        var t = tx(g, 0, 18, after ? 'With VitthaChittha' : 'Today', 'lbl-m', 'start'); t.setAttribute('style','letter-spacing:.14em;text-transform:uppercase;fill:'+col);
        tx(g, 0, 38, after ? 'One line to hold' : 'Eight lines to hold, plus every handoff', 'lbl-m', 'start');
        var pts = names.map(function(n, i){ var a = -Math.PI/2 + i * Math.PI*2/names.length + Math.PI/names.length; return [cx + Math.cos(a)*rx, cy + Math.sin(a)*ry]; });
        el('circle',{cx:cx,cy:cy,r:R*2.7,fill:'url(#net-'+(after ? 'g' : 'r')+')','class':'pop'}, g);
        if(!after){
          [[0,3],[1,5],[2,6],[4,7],[0,5],[3,6],[1,4],[2,7]].forEach(function(e, k){ line(g, arc(pts[e[0]], pts[e[1]], k % 2 ? .2 : -.2), C.fg, 1, .15, k); });
          pts.forEach(function(p, i){ line(g, arc(edge(c, p, R), p, i % 2 ? .16 : -.16), C.madder, 1.4, .9, base + i); });
          el('circle',{cx:cx,cy:cy,r:R,fill:'none',stroke:C.madder,'stroke-width':1.5,'class':'ping hot'}, g);
          el('circle',{cx:cx,cy:cy,r:R,fill:'#1C1414',stroke:C.madder,'stroke-width':1.75}, g);
          var f = tx(g, cx, cy+5, 'Founder', 'lbl', 'middle'); f.setAttribute('style','font-size:14px');
          el('circle',{cx:cx,cy:cy,r:R+2,'class':'hit','data-tip':'8 direct lines, plus every handoff between them'}, g);
        } else {
          el('ellipse',{cx:cx,cy:cy,rx:rx,ry:ry,fill:'none',stroke:C.brass,'stroke-opacity':.22,'stroke-dasharray':'2 7','class':'pop'}, g);
          pts.forEach(function(p, i){ var a = edge(c, p, R), d = 'M'+a[0]+' '+a[1]+'L'+p[0]+' '+p[1]; line(g, d, C.brass, 1.1, .55, base + i); flow(g, d, 2.2); });
          var fy = 46, fd = 'M'+cx+' '+(fy+15)+'L'+cx+' '+(cy-R);
          line(g, fd, C.brass, 2.5, 1, base + 8); flow(g, fd, 3);
          el('circle',{cx:cx,cy:cy,r:R,fill:'none',stroke:C.brass,'stroke-width':1.5,'class':'ping'}, g);
          el('circle',{cx:cx,cy:cy,r:R,fill:'#17171A',stroke:C.brass,'stroke-width':1.75}, g);
          el('image',{href:'/img/logo-mark.webp',x:cx-25,y:cy-23.5,width:50,height:47,'class':'pop'}, g);
          el('circle',{cx:cx,cy:cy,r:R+2,'class':'hit','data-tip':'One office holds every adviser line'}, g);
          pill(g, cx, fy, 'Founder', true, base + 10);
          el('rect',{x:cx-50,y:fy-16,width:100,height:32,'class':'hit','data-tip':'One line to the founder'}, g);
        }
        pts.forEach(function(p, i){ pill(g, p[0], p[1], names[i], false, base + i); });
      }
      panel(0, 0, false);
      panel(side ? pw + 40 : 0, side ? 0 : ph + 44, true);
    }
  };


  var chartBoxes = [], widths = new WeakMap();
  function renderCharts(force){
    chartBoxes.forEach(function(b){
      if(b.offsetParent === null) return;
      var W = Math.round(b.clientWidth); if(!W) return;
      if(!force && widths.get(b) === W) return;
      widths.set(b, W); var fn = charts[b.getAttribute('data-chart')]; if(fn) fn(b, W);
    });
  }

  /* ================= panels: numbering, switcher ================= */
  function numberPanels(v){
    var ps = v.querySelectorAll(':scope > .pnl'), n = ps.length;
    Array.prototype.forEach.call(ps, function(p, i){
      var tag = document.createElement('span'); tag.className = 'pnl-no'; tag.setAttribute('aria-hidden','true');
      tag.innerHTML = '<b>' + String(i+1).padStart(2,'0') + '</b> / ' + String(n).padStart(2,'0') + ' &nbsp;' + p.getAttribute('data-label');
      p.appendChild(tag);
    });
  }
  var sw = document.querySelector('#switch ol'), swM = document.getElementById('switchM'), swLab = document.getElementById('switchLab');
  var prevB = document.getElementById('prevP'), nextB = document.getElementById('nextP'), track = document.getElementById('track');
  function goPanel(i){
    var p = panels[i]; if(!p) return;
    if(pin && !pin.classList.contains('done') && panels.indexOf(pin) > i && insideOnes()) collapseOnes();
    var y = p.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(p).scrollMarginTop) || 0);
    window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  }
  function buildSwitch(){
    sw.innerHTML = '';
    panels.forEach(function(p, i){
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.innerHTML = '<span>' + String(i+1).padStart(2,'0') + ' · ' + p.getAttribute('data-label') + '</span><i></i>';
      b.setAttribute('aria-label', 'Go to ' + p.getAttribute('data-label'));
      b.addEventListener('click', function(){ goPanel(i); });
      li.appendChild(b); sw.appendChild(li);
    });
    document.getElementById('switch').hidden = panels.length < 2;
  }
  prevB.addEventListener('click', function(){ goPanel(Math.max(0, activeIdx - 1)); });
  nextB.addEventListener('click', function(){ goPanel(Math.min(panels.length - 1, activeIdx + 1)); });

  function setActive(i){
    if(i === activeIdx) return; activeIdx = i;
    var p = panels[i]; if(!p) return;
    p.classList.add('seen');
    Array.prototype.forEach.call(sw.querySelectorAll('button'), function(b, k){ b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    swLab.innerHTML = '<b>' + String(i+1).padStart(2,'0') + ' / ' + String(panels.length).padStart(2,'0') + '</b>' + p.getAttribute('data-label');
    prevB.disabled = i === 0; nextB.disabled = i === panels.length - 1;
    startScene(p.querySelector(':scope > canvas'));
  }
  var ticking = false;
  function onScroll(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var mid = window.innerHeight * .45, idx = 0;
      for(var i=0;i<panels.length;i++){ if(panels[i].getBoundingClientRect().top <= mid) idx = i; }
      setActive(idx);
      /* mark any panel that is mostly visible as seen (tall panels on phones) */
      panels.forEach(function(p){ var r = p.getBoundingClientRect(); if(r.top < window.innerHeight * .75 && r.bottom > 0) p.classList.add('seen'); });
      hdr.classList.toggle('solid', window.scrollY > 40);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      track.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
      var foot = document.querySelector('.foot').getBoundingClientRect();
      swM.classList.toggle('away', foot.top < window.innerHeight - 40 || panels.length < 2);
      onesGuard();
      updateOnes();
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  /* keyboard switching on desktop (native snap handles wheel/touch) */
  document.addEventListener('keydown', function(e){
    if(!menu.hidden || e.target.closest('input,textarea,button,a,summary,select')) return;
    if(e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)){ e.preventDefault(); goPanel(Math.min(panels.length-1, activeIdx+1)); }
    if(e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)){ e.preventDefault(); goPanel(Math.max(0, activeIdx-1)); }
  });

  /* ================= the one: pinned word sequence ================= */
  var ones = [
    ['Accountable.','We own whether it closes. Not whether we tried.'],
    ['Real-time.','If it happened today, it is in the books today.'],
    ['Independent.','We keep the books. We never audit them.'],
    ['Founder-first.','We answer to you. Not to the task.'],
    ['Early.','We find the crack before it becomes the crisis.'],
    ['Quiet.','Every escalation we do not send is a small win.'],
    ['Exacting.','Reconciled to the last rupee. Every month.'],
    ['Orchestral.','Twelve experts. One score. One conductor.'],
    ['Relentless.','We fix the cheap thing, every day, so the costly thing never comes.'],
    ['Patient.','From the first filing to the final exit.']
  ];
  var pin = null, oWord, oLine, oCount, oBar, oList, oi = 0;
  function setupOnes(view){
    pin = view.querySelector('#pinOnes'); if(!pin) return;
    oWord = view.querySelector('#onesWord'); oLine = view.querySelector('#onesLine'); oCount = view.querySelector('#onesCount'); oBar = view.querySelector('#onesBar'); oList = view.querySelector('#onesList');
    pin.style.setProperty('--n', ones.length);
    ones.forEach(function(o, i){
      var m = document.createElement('div'); m.className = 'mark'; m.style.top = (i*100) + 'svh'; pin.appendChild(m);
      var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span>' + String(i+1).padStart(2,'0') + '</span>' + o[0].replace('.','');
      b.addEventListener('click', function(){ scrollToOne(i); }); li.appendChild(b); oList.appendChild(li);
    });
    document.getElementById('onesSkip').addEventListener('click', function(e){ e.preventDefault(); var k = panels.indexOf(pin); goPanel(k + 1); });
  }
  function scrollToOne(i){ onesNav = Date.now() + 1500; var y = pin.getBoundingClientRect().top + window.scrollY + i * window.innerHeight; window.scrollTo({top:y, behavior: reduce ? 'auto' : 'smooth'}); }
  function paintOne(i, animate){
    var btns = oList.querySelectorAll('button'); for(var k=0;k<btns.length;k++) btns[k].setAttribute('aria-current', k === i ? 'true' : 'false');
    oCount.textContent = String(i+1).padStart(2,'0') + ' / ' + String(ones.length).padStart(2,'0');
    oBar.style.width = ((i+1)/ones.length*100) + '%';
    if(!animate || reduce){ oWord.textContent = ones[i][0]; oLine.textContent = ones[i][1]; return; }
    oWord.classList.add('out'); oLine.classList.add('out');
    clearTimeout(paintOne.t); paintOne.t = setTimeout(function(){ oWord.textContent = ones[oi][0]; oLine.textContent = ones[oi][1]; oWord.classList.remove('out'); oLine.classList.remove('out'); }, 260);
  }
  function updateOnes(){
    if(!pin || curView !== pin.closest('.view') || pin.classList.contains('done')) return;
    var r = pin.getBoundingClientRect(), vh = window.innerHeight;
    var i = Math.max(0, Math.min(ones.length - 1, Math.round(-r.top / vh)));
    if(i !== oi){ oi = i; paintOne(i, true); }
  }

  /* ================= thesis index ================= */
  function setupThesis(view){
    var thIndex = view.querySelector('#thIndex'); if(!thIndex) return;
    var tps = view.querySelectorAll(':scope > .pnl');
    Array.prototype.forEach.call(tps, function(p, i){ if(i === 0 || i > 9) return;
      var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<span>' + String(i).padStart(2,'0') + '</span>' + p.getAttribute('data-label');
      b.addEventListener('click', function(){ goPanel(i); }); thIndex.appendChild(b); });
  }

  /* ================= router + curtain ================= */
  var menu = document.getElementById('menu'), menuBtn = document.getElementById('menuBtn'), curtain = document.getElementById('curtain');
  function setSnap(){
    root.classList.remove('snap','snap-soft');
    var big = window.innerWidth >= 1024 && window.innerHeight >= 680;
    root.classList.add(big ? 'snap' : 'snap-soft');
  }
  /* The word sequence plays once on the way down. Once it has been passed, or the
     visitor turns back inside it, it folds into a single card, so scrolling up never
     replays it in reverse. It re-arms when it is fully below the screen again. */
  var lastY = 0, onesNav = 0, onesIdle = null;
  function insideOnes(){ var r = pin.getBoundingClientRect(); return r.top < -2 && r.bottom > window.innerHeight * .5; }
  function collapseOnes(){
    if(!pin || pin.classList.contains('done')) return;
    var stuck = insideOnes(), bottom = pin.getBoundingClientRect().bottom;
    pin.classList.add('done');
    root.style.scrollBehavior = 'auto';
    if(stuck){ var m = parseFloat(getComputedStyle(pin).scrollMarginTop) || 0; window.scrollTo(0, pin.getBoundingClientRect().top + window.scrollY - m); }
    else { var d = pin.getBoundingClientRect().bottom - bottom; if(Math.abs(d) > 1) window.scrollBy(0, d); }
    root.style.scrollBehavior = '';
    lastY = window.scrollY;
  }
  function onesGuard(){
    if(!pin || curView !== pin.closest('.view')) return;
    var y = window.scrollY, up = y < lastY - 1, r = pin.getBoundingClientRect(), vh = window.innerHeight;
    lastY = y;
    if(pin.classList.contains('done')){
      if(r.top >= vh - 2){ pin.classList.remove('done'); oi = 0; paintOne(0, false); }
      return;
    }
    if(up && insideOnes() && Date.now() > onesNav){ clearTimeout(onesIdle); collapseOnes(); return; }
    clearTimeout(onesIdle);
    if(r.bottom <= vh * .2) onesIdle = setTimeout(function(){ if(pin && pin.getBoundingClientRect().bottom <= window.innerHeight * .2) collapseOnes(); }, 160);
  }

  /* Thesis: each graph fills as it arrives and refills when it comes back. */
  var vizIO = null;
  function countUp(unit){
    if(reduce) return;
    var items = [];
    Array.prototype.forEach.call(unit.querySelectorAll('.hbs-b b, .stack-row span, .seg, .chart text.lbl'), function(e){
      var fin = e.getAttribute('data-final') || e.textContent, m = /^([^\d]*)([\d,]*\.?\d+)(.*)$/.exec(fin);
      if(!m) return;
      e.setAttribute('data-final', fin);
      var raw = m[2], dec = (raw.split('.')[1] || '').length, comma = raw.indexOf(',') > -1;
      items.push({ e: e, fin: fin, pre: m[1], post: m[3], to: parseFloat(raw.replace(/,/g, '')), dec: dec, comma: comma });
    });
    if(!items.length) return;
    cancelAnimationFrame(unit.vcCount);
    var t0 = 0, dur = 1400;
    function fmt(it, v){ return it.pre + (it.comma ? v.toLocaleString('en-IN', {minimumFractionDigits: it.dec, maximumFractionDigits: it.dec}) : v.toFixed(it.dec)) + it.post; }
    function tick(ts){
      if(!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      items.forEach(function(it){ if(it.e.isConnected) it.e.textContent = p === 1 ? it.fin : fmt(it, it.to * e); });
      if(p < 1) unit.vcCount = requestAnimationFrame(tick);
    }
    unit.vcCount = requestAnimationFrame(tick);
  }
  function watchViz(view){
    if(vizIO){ vizIO.disconnect(); vizIO = null; }
    if(view.getAttribute('data-view') !== 'thesis') return;
    var units = Array.prototype.slice.call(view.querySelectorAll('.viz, .orbit, .tl, .cases, .crack'));
    if(reduce || !window.IntersectionObserver){ units.forEach(function(u){ u.classList.add('in'); }); return; }
    vizIO = new IntersectionObserver(function(list){
      list.forEach(function(en){
        var u = en.target;
        if(en.intersectionRatio >= .2 && !u.classList.contains('in')){ u.classList.add('in'); countUp(u); }
        else if(!en.isIntersecting && u.classList.contains('in')){ u.classList.remove('in'); cancelAnimationFrame(u.vcCount); }
      });
    }, {threshold: [0, .2]});
    units.forEach(function(u){ vizIO.observe(u); });
  }

  function setup(view){ decorate(view); numberPanels(view); setupOnes(view); setupThesis(view); setupForm(view); }
  /* Called once per page: on first load, then by components/Navigator.tsx after each route change. */
  function page(){
    var v = document.querySelector('main.view');
    if(!v) return false;
    if(v === curView) return true;
    var first = !curView;
    curView = v; current = v.getAttribute('data-view');
    setup(v); buildScenes(v);
    Array.prototype.forEach.call(document.querySelectorAll('.ov-links a'), function(a){ if(a.getAttribute('href') === '/'+current) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    closeMenu();
    panels = Array.prototype.slice.call(v.querySelectorAll(':scope > .pnl'));
    panels.forEach(function(p){ p.classList.remove('seen'); });
    activeIdx = -1; buildSwitch();
    root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); root.style.scrollBehavior = '';
    chartBoxes = Array.prototype.slice.call(v.querySelectorAll('.chart[data-chart]'));
    renderCharts(true);
    watchViz(v);
    lastY = window.scrollY;
    oi = 0; if(pin) paintOne(0, false);
    requestAnimationFrame(function(){ requestAnimationFrame(onScroll); });
    if(!first && !reduce){ curtain.classList.add('lift'); curtain.classList.remove('cover'); setTimeout(function(){ curtain.classList.remove('lift'); }, 600); }
    return true;
  }
  /* Bring the curtain down, then navigate behind it. */
  function cover(go){
    if(reduce){ go(); return; }
    if(curtain.classList.contains('cover')) return;
    curtain.classList.remove('lift'); void curtain.offsetWidth; curtain.classList.add('cover');
    setTimeout(go, 460);
  }

  function openMenu(){ menu.hidden = false; menuBtn.setAttribute('aria-expanded','true'); document.body.style.overflow = 'hidden'; document.getElementById('menuClose').focus(); }
  function closeMenu(){ if(menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded','false'); document.body.style.overflow = ''; }
  menuBtn.addEventListener('click', openMenu);
  document.getElementById('menuClose').addEventListener('click', function(){ closeMenu(); menuBtn.focus(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
  menu.addEventListener('click', function(e){ var a = e.target.closest('a'); if(a && a.getAttribute('href') === location.pathname){ closeMenu(); goPanel(0); } });

  var rz; window.addEventListener('resize', function(){ clearTimeout(rz); rz = setTimeout(function(){ setSnap(); renderCharts(false); if(active){ active.build(); if(reduce) active.draw(0); } onScroll(); }, 160); });
  document.addEventListener('visibilitychange', function(){ if(document.hidden) stopScene(); else if(panels[activeIdx]) { var cv = panels[activeIdx].querySelector(':scope > canvas'); active = null; startScene(cv); } });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ renderCharts(true); });

  /* ================= tooltip ================= */
  var tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; tip.setAttribute('role','status'); document.body.appendChild(tip);
  document.addEventListener('pointerover', function(e){ var t = e.target.closest && e.target.closest('[data-tip]'); if(!t){ tip.hidden = true; return; } tip.textContent = t.getAttribute('data-tip'); tip.hidden = false; });
  document.addEventListener('pointermove', function(e){ if(tip.hidden) return; tip.style.left = Math.min(window.innerWidth - 130, Math.max(130, e.clientX)) + 'px'; tip.style.top = e.clientY + 'px'; });
  window.addEventListener('scroll', function(){ tip.hidden = true; }, {passive:true});

  /* ================= contact ================= */
  function setupForm(view){
  var form = view.querySelector('#contactForm'); if(!form) return;
  var done = view.querySelector('#formDone'), err = view.querySelector('#formErr');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var nm = document.getElementById('f-name'), em = document.getElementById('f-email'), msg = '', target = null;
    if(!nm.value.trim()){ msg = 'Add your name so we know who to reply to.'; target = nm; }
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())){ msg = 'Add a work email, like name@company.com.'; target = em; }
    if(msg){ err.textContent = msg; err.hidden = false; target.focus(); return; }
    err.hidden = true; form.hidden = true; done.hidden = false;
  });
  document.getElementById('formReset').addEventListener('click', function(){ form.reset(); done.hidden = true; form.hidden = false; document.getElementById('f-name').focus(); });
  }

  document.getElementById('yr').textContent = new Date().getFullYear();
  setSnap();
  root.classList.add('armed');
  /* ================= cookie notice ================= */
  var ck = document.getElementById('cookie'), ckDone = null;
  try { ckDone = localStorage.getItem('vc-cookie-consent'); } catch(e){}
  if(ck && ckDone !== 'accepted'){
    ck.hidden = false;
    document.getElementById('cookieAccept').addEventListener('click', function(){ try { localStorage.setItem('vc-cookie-consent', 'accepted'); } catch(e){} ck.hidden = true; });
  }

  window.VC = { page: page, closeMenu: closeMenu, cover: cover };
  page();
})();
