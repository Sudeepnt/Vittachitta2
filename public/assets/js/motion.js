(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
  function $(i){return document.getElementById(i)}
  var ldr=$('ldr');
  if(reduce){if(ldr)ldr.remove();document.documentElement.classList.remove('ld');return}

  /* ---------- rolling text ---------- */
  var AZ='abcdefghijklmnopqrstuvwxyz';
  function rnd(ch){if(/[a-z]/.test(ch))return AZ[Math.floor(Math.random()*26)];if(/[A-Z]/.test(ch))return AZ[Math.floor(Math.random()*26)].toUpperCase();if(/[0-9]/.test(ch))return String(Math.floor(Math.random()*10));return ch}
  function prep(h){if(h._orig==null)h._orig=h.innerHTML;h.classList.add('roll-pending')}
  function roll(h,step){if(h._orig==null)h._orig=h.innerHTML;if(h._rolling)return;h._rolling=1;h.innerHTML=h._orig;h.style.height='';var hh=h.offsetHeight;if(hh)h.style.height=hh+'px';
    h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());var idx=0,last=null;step=step||26;
    [].slice.call(h.childNodes).forEach(function(n){if(n.nodeType!==3)return;var f=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(' '));return}
        var ws=document.createElement('span');ws.className='rw';ws.setAttribute('aria-hidden','true');
        w.split('').forEach(function(ch){var m=document.createElement('span');m.className='rc';var r=document.createElement('span');r.className='rr';r.style.setProperty('--d',(idx++*step)+'ms');
          [ch,rnd(ch),rnd(ch)].forEach(function(c){var s=document.createElement('span');s.textContent=c;r.appendChild(s)});m.appendChild(r);ws.appendChild(m);last=r});
        f.appendChild(ws)});h.replaceChild(f,n)});
    h.classList.remove('roll-pending');h.classList.add('roll-play');
    var done=function(){h.innerHTML=h._orig;h.style.height='';h.classList.remove('roll-play');h._rolling=0};
    if(last)last.addEventListener('animationend',done);setTimeout(function(){if(h._rolling)done()},idx*step+1600)}

  /* ---------- reveal on scroll: one after another ----------
     Every group of cards/rows reveals in DOM order through a per-group queue: an item never starts sooner than `gap` ms after the
     previous item of its group, so a row of cards, a list or a grid always plays as a sequence, slow scroll or fast.
     Items already scrolled past (anchor jump, reload mid-page) are shown instantly so scrolling back up never finds a hole. */
  var plat=$('platforms'),pending=[],held=[];
  function gated(e){return e._p&&plat&&parseFloat(plat.style.opacity||'1')<.6}
  function dom(a,b){return a.compareDocumentPosition(b)&4?-1:1}
  function drop(a,e){var i=a.indexOf(e);if(i>-1)a.splice(i,1)}
  function show(e,instant){
    if(e._sh)return;e._sh=1;
    var d=e._b||0;
    if(instant){e.classList.add('nt')}
    else if(e._gap){var now=performance.now(),g=e._g,t=Math.max(now,g._q||0);d+=Math.min(t-now,1400);g._q=t+e._gap}
    e.style.setProperty('--rd',Math.round(d)+'ms');
    e.classList.add('in');
    if(e._on)e._on(instant);
    drop(pending,e);drop(held,e)}
  function mkio(th,rm){var o=new IntersectionObserver(function(es){
    es.sort(function(a,b){return dom(a.target,b.target)}).forEach(function(en){var t=en.target;
      if(en.isIntersecting){o.unobserve(t);if(gated(t)){if(held.indexOf(t)<0)held.push(t)}else show(t)}
      else if(en.boundingClientRect.bottom<=0&&en.boundingClientRect.height>0){o.unobserve(t);show(t,true)}})},{threshold:th,rootMargin:rm});return o}
  var ioN=mkio(.12,'0px 0px -6% 0px'),ioW=mkio(0,'0px 0px -10% 0px');
  /* catch-up: anything that was jumped over, and anything held back until the section under the hero is visible */
  var sw=0;
  function sweep(){sw=0;var i,e,r;
    pending.slice().forEach(function(e){var r=e.getBoundingClientRect();if(r.height>0&&r.bottom<-30)show(e,true)});
    held.slice().sort(dom).forEach(function(e){if(gated(e))return;var r=e.getBoundingClientRect();show(e,r.bottom<-30)})}
  window.addEventListener('scroll',function(){if(!sw)sw=requestAnimationFrame(sweep)},{passive:true});
  /* rv(selector, class, {gap: queue gap in ms, b: base delay, step: extra delay per sibling index, g: group selector, w: reveal as soon as it touches the edge}) */
  function rv(sel,cls,o){o=o||{};$$(sel).forEach(function(e){if(e._rv)return;e._rv=1;
    var par=e.parentNode,ix=[].indexOf.call(par.children,e);
    e._g=o.g?(e.closest(o.g)||par):par;e._gap=o.gap||0;e._b=(o.b||0)+(o.step?ix*o.step:0);e._p=!!(plat&&plat.contains(e));
    e.classList.add(cls||'rv');(o.w?ioW:ioN).observe(e);pending.push(e)})}

  /* section headings: the title rises out of its line, then the paragraph follows */
  rv('.hrow > h2','rvh',{g:'.hrow',w:1});rv('.hrow > p,.hrow > div','rv',{g:'.hrow',b:200});
  /* cards on the sub-pages, in reading order */
  rv('.cgrid > div','rvx',{gap:120,g:'.cgrid'});
  rv('.bx','rv');rv('.brf','rvx',{gap:110});rv('.tsc','rv');rv('.devb','rv');
  rv('.days > div','rvx',{gap:130});
  /* services: slab art; the three cards on the left are sequenced by scroll further down */
  rv('.svc-art','rv',{b:120});rv('.svc-m article','rvx',{gap:170,g:'#svcM'});
  var sa=document.querySelector('.svc-art'),sv0=$('svcSvg');
  function drip(s){if(!s)return;s.classList.remove('dn','up');void s.getBoundingClientRect();s.classList.add('dn')}
  if(sa)sa._on=function(){drip(sv0)};
  $$('.svc-m article').forEach(function(a){a._on=function(){drip(a.querySelector('svg'))}});
  /* founders: the three boxes stack up one after another */
  rv('.res','rv');rv('.mstats','rv');rv('.res2 > div','rvx',{gap:150,g:'.res2'});
  var bs=$('boxSvg');
  if(bs){var kids=[].slice.call(bs.children),at=0;
    [6,6,kids.length-12].forEach(function(n,k){var w=document.createElementNS('http://www.w3.org/2000/svg','g');w.setAttribute('class','bxg');w.style.setProperty('--bk',k);bs.insertBefore(w,kids[at]);kids.slice(at,at+n).forEach(function(c){w.appendChild(c)});at+=n});
    var bb=bs.closest('.res');if(bb)bb._on=function(){bs.classList.add('go')}}
  /* letters */
  rv('.blog > a','rv',{gap:130,g:'.blog'});rv('.all','rv');
  /* the table: the window rises, then the tree is drawn root first, one row after another */
  rv('.win','rvwin');rv('.codew','rvwin');rv('.tree-root','rvx');rv('.tree li','rvx',{gap:220,g:'.tree'});
  /* questions: each group draws its frame, then its rows come in top to bottom */
  rv('.fg','rvw',{w:1,gap:160,g:'.pad'});
  $$('.fg').forEach(function(f){$$('details',f).forEach(function(d,k){d.style.setProperty('--k',k)})});
  /* people, forms, letter, closing band, footer */
  rv('.ppl > .ph','rvw',{w:1});rv('.ppl li','rvx',{gap:120,g:'.ppl'});
  rv('.soc','rv',{b:150});rv('.formv .l > *','rvx',{gap:90,g:'.formv'});rv('.letter-full p','rv',{step:40});
  rv('#cband .btns','rv',{b:450});
  rv('.fcols > div','rv',{gap:90,g:'.fcols'});rv('.fbot > *','rv',{gap:150,g:'.fbot'});

  /* ---------- services: the three cards on the left appear one after another as the pinned section scrolls ----------
     Card 1 arrives as the section comes in, card 2 just before its turn to open, card 3 just before its turn.
     The frame around them grows with each arrival; hidden cards keep their place so nothing below ever shifts. */
  (function(){var svc=plat,acc=$('acc'),it=$$('#acc .acc-i'),nav=$('nav'),pin=svc&&svc.querySelector('.svc-pin');if(!svc||!acc||!pin||it.length<3)return;
    var TH=[0,.22,.55],mq=matchMedia('(min-width:901px)'),on=false,last=-1,tm=0,probe={_p:true};
    function pinned(){return mq.matches&&svc.offsetParent!==null&&!!svc.style.height&&!svc.classList.contains('nopin')}
    function cutFor(n){var c=1,k;if(n<1)return acc.offsetHeight+2;for(k=n;k<3;k++)c+=it[k].offsetHeight;return c}
    function fit(n){acc.style.clipPath='inset(-2px -2px '+cutFor(n)+'px -2px)'}
    function upd(){
      if(!pinned()){if(on){on=false;last=-1;acc.classList.remove('sqm');acc.style.clipPath='';it.forEach(function(a){a.classList.remove('sq','sqin');a.style.transitionDelay=''})}return}
      if(!on){on=true;acc.classList.add('sqm');it.forEach(function(a){a.classList.add('sq')})}
      var r=svc.getBoundingClientRect(),H=Math.max(1,svc.offsetHeight-pin.offsetHeight),p=(nav.offsetHeight-r.top)/H,n=0;
      if(!gated(probe)&&r.top<window.innerHeight*.62)n=1;
      if(n&&p>=TH[1])n=2;if(n>1&&p>=TH[2])n=3;
      if(n===last)return;var prev=Math.max(last,0);last=n;
      it.forEach(function(a,k){a.classList.toggle('sqin',k<n);a.style.transitionDelay=(k<n&&k>=prev)?((k-prev)*170)+'ms':''});
      fit(n);clearTimeout(tm);tm=setTimeout(function(){fit(last)},560)}
    window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',function(){setTimeout(upd,260)});
    window.addEventListener('hashchange',function(){setTimeout(upd,120)});window.addEventListener('load',function(){setTimeout(upd,120)});
    setTimeout(upd,250);setTimeout(upd,1200)})();

  /* ---------- "Built inside your company, in order.": a flow, left to right ----------
     funnel in -> step 1 icon -> line draws to step 2 -> ... -> funnel out. Each column hands off to the next:
     the icon lands, a tick runs down to its card, the card's frame wipes open, and the line to the next icon starts drawing. */
  (function(){var ps=$('procSvg'),st=$('steps');if(!ps||!st)return;
    var NS='http://www.w3.org/2000/svg',K=[].slice.call(ps.children),i=0,B0=420,SP=600,side,j,k;
    function tag(e,c,d){e.classList.add(c);e.style.setProperty('--d',Math.round(d)+'ms')}
    if(K.length<95)return;
    ps.classList.add('pm');
    for(side=0;side<2;side++)for(j=0;j<21;j++){var pa=K[i++],ci=K[i++],df=side?B0+SP*3+330:0,fx=(parseFloat(ci.getAttribute('cx'))-(side?1236:0))/204;
      tag(pa,'fp',df+j*20);tag(ci,'fc',df+j*20+Math.max(0,Math.min(1,fx))*560)}
    var first=null;
    for(k=0;k<4;k++){var g=K[i++],w=document.createElementNS(NS,'g');ps.insertBefore(w,g);w.appendChild(g);if(!first)first=w;tag(w,'fi',B0+SP*k);
      if(k<3)tag(K[i++],'fl',B0+SP*k+170);tag(K[i++],'ft',B0+SP*k+300)}
    
    $$('.step',st).forEach(function(s,n){s.style.setProperty('--d',(B0+SP*n+480)+'ms')});
    /* phone: the cards come one after another, each with its connector drawing down from the previous one */
    rv('.step','rvs',{gap:260,g:'#steps'});
    /* once the funnels and lines have drawn, the diagram keeps flowing: hex characters stream into the left funnel,
       squares travel along every connector, squares scatter out of the right funnel */
    var live=(function(){var CY=120,HEX='0123456789abcdef',L=[],R=[],C=[],run=0,vis=true,started=0,raf=0;
      function mk(tag,at){var e=document.createElementNS(NS,tag);for(var a in at)e.setAttribute(a,at[a]);e.style.fill='var(--fg)';e.style.opacity='0';ps.insertBefore(e,first);return e}
      function build(){var i,k,n,y,a,e;
        for(i=0;i<21;i++){y=6+i*11.9;for(n=0;n<2;n++){
          e=mk('text',{'font-size':'15','text-anchor':'middle','dominant-baseline':'central','font-family':'"DM Mono",ui-monospace,monospace'});e.textContent=HEX[(i*5+n*7)%16];
          L.push({e:e,y:y,x0:0,x1:204,ph:((i*37)%50)/50*.5+n*.5,sp:.26+((i*13)%7)*.012,last:2});
          e=mk('rect',{width:'5',height:'5',x:'-2.5',y:'-2.5'});
          R.push({e:e,y:y,x0:1440,x1:1236,ph:((i*29)%50)/50*.5+n*.5,sp:.24+((i*11)%7)*.012})}}
        for(k=0;k<3;k++){a=[327,589,851][k]+52;var b=[589,851,1113][k]-52;
          for(n=0;n<4;n++){e=mk('rect',{width:'5',height:'5',x:'-2.5',y:'-2.5'});C.push({e:e,a:a,b:b,ph:n/4,sp:.34})}}}
      function bz(o,t){var mx=o.x0+(o.x1-o.x0)*.55,cy2=CY+(o.y-CY)*.25,u=1-t;return [u*u*o.x0+2*u*t*mx+t*t*o.x1,u*u*o.y+2*u*t*cy2+t*t*CY]}
      function fade(t){return t<.12?t/.12:t>.88?(1-t)/.12:1}
      function frame(now){raf=0;if(!run||!vis)return;var T=now/1000,i,o,t,p,f;
        for(i=0;i<L.length;i++){o=L[i];t=(T*o.sp+o.ph)%1;if(t<o.last&&o.last-t>.5)o.e.textContent=HEX[Math.floor(Math.random()*16)];o.last=t;p=bz(o,t);f=fade(t);
          o.e.setAttribute('transform','translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') scale('+(1-.5*t).toFixed(2)+')');o.e.style.opacity=(f*.9).toFixed(2)}
        for(i=0;i<R.length;i++){o=R[i];t=1-((T*o.sp+o.ph)%1);p=bz(o,t);f=fade(1-t);
          o.e.setAttribute('transform','translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') scale('+(.45+.9*(1-t)).toFixed(2)+')');o.e.style.opacity=(f*.95).toFixed(2)}
        for(i=0;i<C.length;i++){o=C[i];t=(T*o.sp+o.ph)%1;
          o.e.setAttribute('transform','translate('+(o.a+(o.b-o.a)*t).toFixed(1)+' '+CY+')');o.e.style.opacity=fade(t).toFixed(2)}
        raf=requestAnimationFrame(frame)}
      function kick(){if(run&&vis&&!raf)raf=requestAnimationFrame(frame)}
      if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;kick()},{rootMargin:'120px'}).observe(ps);
      return function(delay){if(started)return;started=1;setTimeout(function(){build();ps.classList.add('live');run=1;kick()},delay)}})();
    st._on=function(instant){ps.classList.add('go');st.classList.add('go');if(instant){ps.classList.add('nt');st.classList.add('nt')}live(instant?250:B0+SP*3+1500)};
    st._g=st;st._gap=0;st._b=0;st._p=false;ioN.observe(st);pending.push(st)})();
  var st0=$('steps');if(st0&&st0.parentNode)st0.parentNode.classList.add('mv');
  /* closing headline */
  var ch=document.querySelector('#cband h2');if(ch){prep(ch);ch._on=function(){roll(ch)};ch.classList.add('rvn');ioN.observe(ch)}

  /* ---------- underline draw ---------- */
  $$('.blog h4,.fcols a,.lnk,.all a,.nav > a.lk,.nav > a.r:not(.cta),.dd a,.tree .nm a').forEach(function(a){if(a.querySelector('.ul')||a.querySelector('svg'))return;a.innerHTML='<span class="ul">'+a.innerHTML+'</span>'});

  /* ---------- nav dropdown panels ---------- */
  $$('.nav .has').forEach(function(h){var dd=h.querySelector('.dd');if(!dd)return;var t=h.firstChild.textContent.trim();dd.classList.add('rich');
    var d=document.createElement('div');d.className='ddi';d.innerHTML='<span>'+t+'</span>';var c=document.createElement('canvas');c.width=19;c.height=6;var x=c.getContext('2d');
    for(var i=0;i<19;i++)for(var j=0;j<6;j++){var a=Math.random();x.fillStyle='rgba(255,255,228,'+(a<.45?0:(a-.45)*.45).toFixed(3)+')';x.fillRect(i,j,1,1)}
    var mz=document.createElement('i');mz.className='ddm';try{mz.style.backgroundImage='url('+c.toDataURL()+')'}catch(_){}d.appendChild(mz);dd.insertBefore(d,dd.firstChild)});

  /* ---------- buttons: pixel fill ---------- */
  if(fine){$$('.btn').forEach(function(b){if(b.id==='copyMail'||b.id==='copyMail2'||b.closest('.mmenu'))return;
    b.innerHTML='<span class="lb">'+b.innerHTML+'</span>';b.classList.add('pxf');
    function build(){if(b._fl&&b._w===b.offsetWidth)return;if(b._fl)b._fl.remove();var w=b.offsetWidth,h=b.offsetHeight,f=document.createElement('span');f.className='fl';f.setAttribute('aria-hidden','true');
      var cols=Math.ceil(w/8),rows=Math.ceil(h/8),cx=(cols-1)/2,cy=(rows-1)/2,mx=Math.sqrt(cx*cx+cy*cy)||1;
      for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var i=document.createElement('i'),d=Math.sqrt((c-cx)*(c-cx)+(r-cy)*(r-cy))/mx;i.style.cssText='left:'+(c*8)+'px;top:'+(r*8)+'px;--dl:'+Math.round(115+305*d)+'ms';f.appendChild(i)}
      b.insertBefore(f,b.firstChild);b._fl=f;b._w=w;void f.offsetWidth}
    b.addEventListener('pointerenter',build);b.addEventListener('focus',build)})}

  /* ---------- faq open / close ---------- */
  $$('.fg details').forEach(function(d){var s=d.querySelector('summary'),p=d.querySelector('p');if(!s||!p||!p.animate)return;
    s.addEventListener('click',function(e){e.preventDefault();if(d._a)d._a.cancel();
      if(!d.open){d.open=true;var h=p.offsetHeight;d._a=p.animate([{height:'0px',opacity:0,paddingBottom:'0px'},{height:h+'px',opacity:1}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'})}
      else{var h2=p.offsetHeight;d._a=p.animate([{height:h2+'px',opacity:1},{height:'0px',opacity:0,paddingBottom:'0px'}],{duration:260,easing:'ease-out'});d._a.onfinish=function(){d.open=false}}})});

  /* ---------- page change + sub-page headline ---------- */
  var first=true;
  function onView(){var v=document.querySelector('.view.on');if(!v)return;
    if(!first){v.classList.remove('pa');void v.offsetWidth;v.classList.add('pa')}
    var h=v.querySelector('.phero h1');if(h){prep(h);setTimeout(function(){roll(h,18)},first?150:220)}
    first=false}
  window.addEventListener('hashchange',function(){setTimeout(onView,20)});

  /* ---------- hero entrance + loader ---------- */
  var h1=document.querySelector('.hero h1'),hp=document.querySelector('.hero-top p'),hr=document.querySelector('.hero-r'),pix=$('pix');
  function heroIn(){if(h1)roll(h1,34);
    setTimeout(function(){if(hp)hp.classList.remove('hid')},350);
    setTimeout(function(){if(pix){[].forEach.call(pix.children,function(i){i.style.animationDelay=Math.round(parseFloat(i.style.left)/60*22+(parseFloat(i.style.bottom)||0)/60*40)+'ms'});pix.classList.add('enter');setTimeout(function(){pix.classList.remove('enter');[].forEach.call(pix.children,function(i){i.style.animationDelay=''})},2400)}},250);
    setTimeout(function(){if(hr)hr.classList.remove('hid')},1100)}
  var homeOn=document.querySelector('.view.on[data-view="home"]');
  if(ldr&&homeOn){if(h1)prep(h1);if(hp)hp.classList.add('hid');if(hr)hr.classList.add('hid');window.scrollTo(0,0);
    var pcs=$$('.pc',ldr);
    var turns=[180,90,270],at=650;
    pcs.forEach(function(p,i){var r=turns[i%3],n=(360-r)/90;p.style.rotate=r+'deg';
      (function(p,r,n,t0){for(var k=1;k<=n;k++)(function(k){setTimeout(function(){p.style.rotate=(r+90*k)+'deg'},t0+80*k)})(k);
        setTimeout(function(){p.classList.add('in')},t0+80*n+80)})(p,r,n,at);
      at+=80*n+80+200});
    setTimeout(function(){var hb=document.querySelector('.hero-b'),y=hb?Math.max(0,Math.round(hb.getBoundingClientRect().top)):0;
      ldr.classList.add('out');ldr.style.clipPath='inset('+y+'px 0 0 0)';document.documentElement.classList.remove('ld');
      setTimeout(heroIn,280);
      setTimeout(function(){ldr.style.transition='opacity .35s';ldr.style.opacity='0';setTimeout(function(){ldr.remove()},380)},820)},at+260)}
  else{if(ldr)ldr.remove();document.documentElement.classList.remove('ld');onView()}
  first=false;

  /* ---------- smooth wheel scrolling ---------- */
  if(fine){var root=document.documentElement,tg=window.scrollY,cur=tg,run=false,mine=-1;root.classList.add('sm');
    function max(){return root.scrollHeight-window.innerHeight}
    function tick(){cur+=(tg-cur)*.115;if(Math.abs(tg-cur)<.4){cur=tg;run=false}mine=Math.round(cur);window.scrollTo(0,cur);if(run)requestAnimationFrame(tick)}
    function inScroller(t){for(;t&&t!==document.body&&t.nodeType===1;t=t.parentNode){var s=getComputedStyle(t);if(/(auto|scroll)/.test(s.overflowY)&&t.scrollHeight>t.clientHeight+1)return true}return false}
    window.addEventListener('wheel',function(e){if(e.ctrlKey||e.metaKey||e.defaultPrevented||root.classList.contains('ld'))return;if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;if(inScroller(e.target))return;
      e.preventDefault();var d=e.deltaY*(e.deltaMode===1?32:e.deltaMode===2?window.innerHeight:1);if(!run){cur=window.scrollY;tg=cur}
      tg=Math.max(0,Math.min(max(),tg+d));if(!run){run=true;requestAnimationFrame(tick)}},{passive:false});
    window.addEventListener('scroll',function(){if(Math.abs(window.scrollY-mine)>2){tg=cur=window.scrollY;run=false}},{passive:true})}

  /* ---------- hero scroll scene (desktop) ----------
     While the hero is pinned, a dark panel grows from the bottom-right corner (the Book a call cell) to fill the hero.
     The puzzle area is pushed left, the headline is pushed up, the arrow rides the panel's top-left corner, and the next
     section fades in underneath. Same sequence as nualt.fr; no copy is touched. */
  (function(){
    var mq=matchMedia('(min-width:901px)'),hero=document.querySelector('.hero'),nav=$('nav'),next=$('platforms');
    if(!hero||!next||!nav)return;
    var S=1.2,wrap=null,exp,lv,lh,top=hero.querySelector('.hero-top'),hb=hero.querySelector('.hero-b'),pixEl=$('pix'),hr=hero.querySelector('.hero-r'),facts=hero.querySelector('.facts'),go=hero.querySelector('.go'),arrow=hero.querySelector('.parrow'),btn=go&&go.querySelector('.btn'),parw=null;
    var M=null,dzF=null,dzB=null,dzA=null,on=false,last=-1,purple='#1C0B26';
    function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
    /* pixel dissolve: a canvas of square cells that switch on as progress passes each cell's threshold */
    function dissolve(host,cols,rows,cell,at){var cv=document.createElement('canvas'),dpr=window.devicePixelRatio||1,w=cols*cell,h=rows*cell,cells=[],c,r,k=0;
      cv.className='dz';cv.setAttribute('aria-hidden','true');cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';host.appendChild(cv);
      var cx=cv.getContext('2d');cx.scale(dpr,dpr);cx.fillStyle=purple;
      var ox=(cols-1)/2,oy=(rows-1)/2,nrm=Math.hypot(ox,oy)||1;
      for(r=0;r<rows;r++)for(c=0;c<cols;c++,k++){var l=(at?at(c,r):1-Math.hypot(c-ox,r-oy)/nrm)+(7919*k%17/17-.5)*.2;cells.push([c*cell,r*cell,.04+.96*clamp(l,0,1)])}
      var cur=-1;
      return{el:cv,set:function(p){if(p===cur)return;cur=p;cx.clearRect(0,0,w,h);for(var i=0;i<cells.length;i++)if(p>=cells[i][2])cx.fillRect(cells[i][0],cells[i][1],cell,cell)},reset:function(){cur=-1}}}
    function metrics(){var a=hero.getBoundingClientRect(),g=go.getBoundingClientRect(),b=hb.getBoundingClientRect(),f=facts.getBoundingClientRect();
      return{c:Math.max(hero.offsetWidth,1),h:Math.max(hero.offsetHeight,1),cx:g.left-a.left,cy:g.top-a.top,T:b.top-a.top,R:f.top-a.top,bh:Math.max(hb.offsetHeight,1),sw:Math.max(hr.offsetWidth,1),fh:Math.max(facts.offsetHeight,1)}}
    function teardown(){if(!wrap)return;
      window.removeEventListener('scroll',frame);
      [dzF,dzB,dzA].forEach(function(d){if(d)d.el.remove()});dzF=dzB=dzA=null;
      [exp,lv,lh].forEach(function(e){if(e&&e.parentNode)e.parentNode.removeChild(e)});
      if(parw&&parw.parentNode){parw.parentNode.insertBefore(arrow,parw);parw.remove()}parw=null;
      hero.classList.remove('hs');['transform','visibility'].forEach(function(p){[top,pixEl,btn,arrow].forEach(function(e){if(e)e.style[p]=''})});
      wrap.parentNode.insertBefore(hero,wrap);wrap.remove();wrap=null;next.style.marginTop='';next.style.opacity='';next.style.pointerEvents='';on=false;last=-1}
    function why(r){document.documentElement.setAttribute('data-hero-scene',r)}
    function build(){
      if(!mq.matches){teardown();why('off: window 900px wide or less');return}
      if(reduce){teardown();why('off: reduce motion');return}
      if(innerHeight<500||!hero.offsetHeight){teardown();why('off: window too short or home hidden');return}
      if(hero.offsetHeight>innerHeight-nav.offsetHeight+60){teardown();why('off: hero taller than window');return}
      purple=getComputedStyle(document.documentElement).getPropertyValue('--purple').trim()||purple;
      teardown();
      wrap=document.createElement('div');wrap.className='hscene on';hero.parentNode.insertBefore(wrap,hero);wrap.appendChild(hero);hero.classList.add('hs');
      exp=document.createElement('div');exp.className='hero-exp';exp.setAttribute('aria-hidden','true');hero.appendChild(exp);
      lv=document.createElement('span');lv.className='hl hl-v';lh=document.createElement('span');lh.className='hl hl-h';[lv,lh].forEach(function(e){e.setAttribute('aria-hidden','true');hb.appendChild(e)});
      parw=document.createElement('span');parw.className='parw';arrow.parentNode.insertBefore(parw,arrow);parw.appendChild(arrow);
      parw.onclick=function(){window.scrollTo({top:M.start+S*M.u,behavior:'smooth'})};
      var m=metrics(),unit=Math.max(innerHeight,800);
      M={m:m,u:unit,len:S*unit,start:0};
      wrap.style.height=(m.h+M.len)+'px';next.style.marginTop='-'+m.h+'px';
      exp.style.transform='scale('+((m.c-m.cx)/m.c)+','+((m.h-m.cy)/m.h)+')';
      var fw=facts.offsetWidth,fhh=facts.offsetHeight,bw=btn?btn.offsetWidth:0,bh=btn?btn.offsetHeight:0,tt=Math.max(1,m.cy-m.R);
      dzF=dissolve(facts,Math.ceil(fw/8)+1,Math.ceil(fhh/8)+1,8,function(c,r){return 1-((r+1)*8+48)/tt});
      if(btn)dzB=dissolve(btn,Math.ceil((bw+2)/8)+1,Math.ceil((bh+2)/8)+1,8);
      dzA=dissolve(parw,12,12,parw.offsetWidth/12);
      on=true;last=-1;window.addEventListener('scroll',frame,{passive:true});measureStart();frame();why('on')}
    function measureStart(){var r=wrap.getBoundingClientRect();M.start=r.top+window.scrollY-nav.offsetHeight}
    function frame(){if(!on)return;
      var m=M.m,u=clamp((window.scrollY-M.start)/M.u,0,S);if(u===last)return;last=u;
      var e=Math.min(1,u),sx0=(m.c-m.cx)/m.c,sy0=(m.h-m.cy)/m.h,sx=sx0+(1-sx0)*e,sy=sy0+(1-sy0)*e,
          t=m.c*(1-sx),r=m.h*(1-sy);
      exp.style.transform='scale('+sx+','+sy+')';
      pixEl.style.transform='translate3d('+Math.min(0,t-m.cx)+'px,0,0)';
      top.style.transform='translate3d(0,'+Math.min(0,r+1-m.T)+'px,0)';
      parw.style.transform='translate3d('+(t-m.cx)+'px,'+(r-m.cy)+'px,0)';
      lv.style.transform='translate3d('+(t-m.cx)+'px,0,0) scaleY('+((m.h-Math.min(r,m.T))/m.bh)+')';
      lh.style.transform='translate3d(0,'+(r-m.cy)+'px,0) scaleX('+((m.c-t)/m.sw)+')';
      dzA.set(clamp((m.T-r)/80,0,1));
      dzF.set(clamp((m.cy-r)/Math.max(1,m.cy-m.R),0,1));
      if(btn){var bp=clamp((u-.02)/.2,0,1);dzB.set(bp);btn.style.visibility=u>=.22?'hidden':''}
      var o=clamp((u-1)/.15,0,1);next.style.opacity=o;next.style.pointerEvents=o>=1?'':'none';
      if(r<=0)nav.classList.add('inv')}
    var rt;function refresh(){clearTimeout(rt);rt=setTimeout(function(){var y=window.scrollY,p=on?last:0;build();if(on)window.scrollTo(0,y)},260)}
    window.addEventListener('resize',refresh);window.addEventListener('hashchange',refresh);
    window.addEventListener('load',function(){setTimeout(build,60)});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){setTimeout(build,60)});
    if(mq.addEventListener)mq.addEventListener('change',refresh);
    build();
  })();
  /* ---------- footer puzzles: the white blocks drift in every direction, one at a time, slowly ----------
     Each tick one block slides one cell up, down, left or right into free space, staying inside its frame. */
  function drift(host,C,every,first){if(!host)return;
    var cells={},tiles=[],cols=0,rows=0,vis=false,tm=0,sig='';
    function key(c,r){return c+','+r}
    function sync(){var kids=[].slice.call(host.children).filter(function(k){return k.tagName==='I'}),s=kids.length+':'+(kids[0]?kids[0].style.left+kids[0].style.top:'');
      if(s===sig&&tiles.length)return;sig=s;cells={};tiles=[];cols=Math.ceil(host.clientWidth/C);rows=Math.ceil(host.clientHeight/C);
      kids.forEach(function(k){var t={e:k,c:Math.round(parseFloat(k.style.left)/C),r:Math.round(parseFloat(k.style.top)/C),busy:0};k.classList.add('dr');tiles.push(t);cells[key(t.c,t.r)]=t});void host.offsetWidth}
    var DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
    function step(){tm=0;if(!vis||document.hidden){return}sync();
      var m=[],i,k,t,d,nc,nr;
      for(i=0;i<tiles.length;i++){t=tiles[i];if(t.busy)continue;
        for(k=0;k<4;k++){d=DIRS[k];nc=t.c+d[0];nr=t.r+d[1];
          if(nc<0||nr<0||nc>=cols||nr>=rows||cells[key(nc,nr)])continue;
          if(t.last&&t.last[0]===-d[0]&&t.last[1]===-d[1]&&Math.random()<.8)continue;
          m.push([t,d,nc,nr])}}
      if(m.length){var pick=m[Math.floor(Math.random()*m.length)];t=pick[0];t.busy=1;delete cells[key(t.c,t.r)];
        t.c=pick[2];t.r=pick[3];t.last=pick[1];cells[key(t.c,t.r)]=t;t.e.style.left=(t.c*C)+'px';t.e.style.top=(t.r*C)+'px';
        setTimeout(function(){t.busy=0},950)}
      tm=setTimeout(step,every)}
    function go(){if(!tm)tm=setTimeout(step,first||every)}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)go()},{rootMargin:'80px'}).observe(host);
    document.addEventListener('visibilitychange',function(){if(!document.hidden&&vis)go()})}
  drift($('scatH'),30,800,600);drift($('scat'),30,450,600);drift($('scatV'),30,450,900);
  /* footer boxes: a small nudge the first time they scroll into view, so people see they react */
  (function(){var soc=document.querySelector('.soc');if(!soc||!('IntersectionObserver' in window))return;
    var o=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;o.disconnect();
      setTimeout(function(){soc.classList.add('hint');setTimeout(function(){soc.classList.remove('hint')},650)},900)},{threshold:.7});o.observe(soc)})();
})();
