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

  /* ---------- reveal on scroll ---------- */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);if(e.target._on)e.target._on()}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  var io0=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io0.unobserve(e.target)}})},{threshold:0,rootMargin:'0px 0px -10% 0px'});
  function rv(sel,cls,stag,mod){$$(sel).forEach(function(e){if(e._rv)return;e._rv=1;var i=[].indexOf.call(e.parentNode.children,e);e.classList.add(cls||'rv');if(stag)e.style.setProperty('--rd',((mod?i%mod:i)*stag)+'ms');(cls==='rvw'?io0:io).observe(e)})}
  rv('.hrow > *','rv',90);
  rv('.cgrid > div','rv',80,4);rv('.bx','rv');rv('.brf','rv',70);rv('.tsc','rv');rv('.devb','rv');
  rv('#acc','rv');rv('.svc-art','rv');rv('.svc-m article','rv');
  rv('.res','rv');rv('.res2 > div','rv',110);rv('.mstats','rv');
  rv('.blog > a','rv',90);rv('.all','rv');
  rv('.fg','rvw',0);rv('.ppl > *','rv',80,4);rv('.fcols > div','rv',70);rv('.fbot > *','rv',120);
  rv('.win','rvwin');rv('.codew','rvwin');rv('.tree li','rvx',130);rv('.tree-root','rvx');
  rv('.soc','rv');rv('.formv > *','rv',100);rv('.letter-full p','rv',40,6);
  /* process diagram */
  var ps=$('procSvg');if(ps){ps.classList.add('pm');var gi=0,li=0;[].forEach.call(ps.children,function(c){if(c.tagName==='g')c.style.setProperty('--i',gi++);else if(c.tagName==='line')c.style.setProperty('--i',(li++)/2)});io.observe(ps)}
  var st=$('steps');if(st&&st.parentNode)st.parentNode.classList.add('mv');
  /* closing headline */
  var ch=document.querySelector('#cband h2');if(ch){prep(ch);ch._on=function(){roll(ch)};ch.classList.add('rvn');io.observe(ch)}

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
})();
