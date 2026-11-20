(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,NS='http://www.w3.org/2000/svg';
  function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
  function $(i){return document.getElementById(i)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
  var CX=.866,SY=.5;function P(x,y,z){return [+((x-y)*CX).toFixed(1),+((x+y)*SY-z).toFixed(1)]}
  function poly(pts){return pts.map(function(p){return p.join(',')}).join(' ')}
  function box(g,x,y,z,w,d,h,c){c=c||'';
    el('polygon',{points:poly([P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y+d,z),P(x,y+d,z)]),'class':c},g);
    el('polygon',{points:poly([P(x+w,y,z+h),P(x+w,y+d,z+h),P(x+w,y+d,z),P(x+w,y,z)]),'class':c},g);
    return el('polygon',{points:poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)]),'class':c},g)}
  function line(g,a,b,c){var p=P.apply(null,a),q=P.apply(null,b);return el('line',{x1:p[0],y1:p[1],x2:q[0],y2:q[1],'class':c||'d'},g)}
  function quad(g,pts,c){return el('polygon',{points:poly(pts.map(function(a){return P.apply(null,a)})),'class':(c||'d'),style:'fill:none'},g)}
  function ring(g,x,y,z,r,c){var p=P(x,y,z);return el('ellipse',{cx:p[0],cy:p[1],rx:r*1.2247,ry:r*.7071,'class':c||'d'},g)}
  function dot(g,x,y,z,r,fill){var p=P(x,y,z);return el('ellipse',{cx:p[0],cy:p[1],rx:(r||4)*1.05,ry:(r||4)*.62,style:'fill:'+(fill||'var(--bg)')+';stroke:none'},g)}
  function topText(g,x,y,z,s,size,c){var p=P(x,y,z);var t=el('text',{transform:'matrix(.866,.5,-.866,.5,'+p[0]+','+p[1]+')',style:'font-size:'+(size||12)+'px','class':c||''},g);t.textContent=s;return t}
  function faceText(g,x,y,z,s,size,c){var p=P(x,y,z);var t=el('text',{transform:'matrix(.866,-.5,0,1,'+p[0]+','+p[1]+')',style:'font-size:'+(size||12)+'px','class':c||''},g);t.textContent=s;return t}

  /* top-face drawings: c = line class ('di' on a filled slab) */
  function deco(g,i,W,t,c){var k,m;
    if(i===0){for(k=0;k<3;k++)for(m=0;m<2;m++){var x=14+k*50,y=16+m*72;quad(g,[[x,y,t],[x+40,y,t],[x+40,y+56,t],[x,y+56,t]],c);line(g,[x+8,y+14,t],[x+32,y+14,t],c);line(g,[x+8,y+26,t],[x+26,y+26,t],c);line(g,[x+8,y+38,t],[x+32,y+38,t],c)}}
    if(i===1){[[.18,.2],[.82,.2],[.82,.8],[.18,.8],[.5,.1],[.5,.9]].forEach(function(q){line(g,[W/2,W/2,t],[q[0]*W,q[1]*W,t],c);quad(g,[[q[0]*W-9,q[1]*W-9,t],[q[0]*W+9,q[1]*W-9,t],[q[0]*W+9,q[1]*W+9,t],[q[0]*W-9,q[1]*W+9,t]],c)});ring(g,W/2,W/2,t,W*.14,c);ring(g,W/2,W/2,t,W*.06,c)}
    if(i===2){var N=[[.16,.21],[.41,.13],[.7,.24],[.86,.54],[.65,.75],[.35,.82],[.15,.56],[.5,.48]],E=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]];
      E.forEach(function(e){line(g,[N[e[0]][0]*W,N[e[0]][1]*W,t],[N[e[1]][0]*W,N[e[1]][1]*W,t],c)});N.forEach(function(n){ring(g,n[0]*W,n[1]*W,t,4,c)})}
    if(i===3){[.4,.28,.16].forEach(function(r){ring(g,W/2,W/2,t,W*r,c)});dot(g,W/2,W/2,t,6,c==='di'?'var(--bg)':'var(--fg)');line(g,[W/2,W*.1,t],[W/2,W*.9,t],c);line(g,[W*.1,W/2,t],[W*.9,W/2,t],c)}
    if(i===4){for(k=0;k<4;k++){deco2(g,k,W,t,c)}}
    if(i===5){for(k=1;k<8;k++)line(g,[18,k*W/8,t],[W-18-(k%3)*30,k*W/8,t],c)}
  }
  function deco2(g,k,W,t,c){var x=(k%2)*W/2+14,y=Math.floor(k/2)*W/2+14,s=W/2-28;quad(g,[[x,y,t],[x+s,y,t],[x+s,y+s,t],[x,y+s,t]],c);ring(g,x+s/2,y+s/2,t,s*.2,c)}
  function stack(sv,i,W,H,mode){W=W||170;H=H||32;var pv=sv._i;while(sv.firstChild)sv.removeChild(sv.firstChild);var o=-W/2;
    var lo=el('g',{'class':'lo'},sv),tp=el('g',{'class':'tp'},sv),dir=mode==='in'?'in':(pv!=null&&pv!==i?(i>pv?'dn':'up'):'');
    for(var k=i;k>=1;k--){box(lo,o,o,-k*H,W,W,H)}
    box(tp,o,o,0,W,W,H,'fi');var g=el('g',{transform:'translate('+P(o,o,0).join(',')+')'},tp);deco(g,i,W,H,'di');
    if(dir==='dn'||dir==='up'){var ov=el('g',{'class':'ov'}),oz=dir==='dn'?-H:0;sv.insertBefore(ov,dir==='dn'?tp:null);
      box(ov,o,o,oz,W,W,H,'fi');deco(el('g',{transform:'translate('+P(o,o,oz).join(',')+')'},ov),pv,W,H,'di')}
    sv._i=i;sv.classList.remove('in','dn','up');if(dir){void sv.getBoundingClientRect();sv.classList.add(dir)}}
  function single(sv,i,W,H,on){W=W||170;H=H||28;var o=-W/2;box(sv,o,o,0,W,W,H,on===false?'':'fi');var g=el('g',{transform:'translate('+P(o,o,0).join(',')+')'},sv);deco(g,i,W,H,on===false?'d':'di')}

  /* ---------- router ---------- */
  var views=$$('.view'),cur='';
  function show(name){if(name==='operators')name='chittha';if(!views.some(function(v){return v.dataset.view===name}))name='home';
    views.forEach(function(v){v.classList.toggle('on',v.dataset.view===name)});
    $('cband').style.display=name==='contact'?'none':'';cur=name;document.documentElement.setAttribute('data-view',name);setTimeout(function(){layout();onScroll()},0)}
  function route(){var h=location.hash;$('mmenu').classList.remove('open');$('burger').setAttribute('aria-expanded','false');
    if(!h||h==='#'||h==='#/'||h==='#top'){show('home');window.scrollTo(0,0);return}
    if(h.indexOf('#/')===0){show(h.slice(2));window.scrollTo(0,0);return}
    var t=document.getElementById(h.slice(1));if(!t){show('home');return}
    var v=t.closest('.view');if(v&&v.dataset.view!==cur)show(v.dataset.view);else if(!cur)show('home');
    setTimeout(function(){t.scrollIntoView()},30)}
  window.addEventListener('hashchange',route);
  $('burger').addEventListener('click',function(){var o=$('mmenu').classList.toggle('open');this.setAttribute('aria-expanded',o)});
  $$('.nav .has').forEach(function(h){h.addEventListener('click',function(e){if(e.target.closest('a'))h.blur()})});

  /* ---------- nav inversion ---------- */
  var nav=$('nav');
  function onScroll(){var y=nav.offsetHeight/2,inv=false;$$('[data-dark]').forEach(function(s){if(!s.offsetParent&&s.tagName!=='FOOTER')return;var r=s.getBoundingClientRect();if(r.top<=y&&r.bottom>y)inv=true});
    nav.classList.toggle('inv',inv);pinScroll()}
  window.addEventListener('scroll',onScroll,{passive:true});

  /* ---------- hero pixels ---------- */
  var pix=$('pix'),puzzle=Puzzle.create(pix,{animate:!reduce});
  function buildPix(){puzzle.rebuild()}

  /* ---------- services ---------- */
  var svc=$('platforms'),acc=$$('#acc .acc-i'),svcSvg=$('svcSvg'),sIdx=-1,pinOn=false,pinH=0,STEP=520;
  var accT;
  function openAcc(){acc.forEach(function(a,j){a.classList.toggle('on',j===sIdx)})}
  function setSvc(i){if(i===sIdx)return;var first=sIdx<0;sIdx=i;stack(svcSvg,i);clearTimeout(accT);
    if(reduce||first)openAcc();else accT=setTimeout(openAcc,760)}
  function pinScroll(){if(!pinOn||cur!=='home')return;var r=svc.getBoundingClientRect(),p=(nav.offsetHeight-r.top)/(svc.offsetHeight-pinH);setSvc(Math.max(0,Math.min(2,Math.floor(p*3))))}
  acc.forEach(function(a,i){a.querySelector('.acc-h').addEventListener('click',function(){
    if(pinOn){var top=svc.getBoundingClientRect().top+window.scrollY-nav.offsetHeight;window.scrollTo({top:top+(i+.3)*STEP,behavior:reduce?'auto':'smooth'})}else setSvc(i)})});
  var sm=$('svcM');acc.forEach(function(a,i){var art=document.createElement('article');art.innerHTML='<div class="art"><svg class="iso" viewBox="-170 -150 340 '+(250+i*30)+'"></svg></div><div class="tx">'+a.querySelector('.acc-h').innerHTML+a.querySelector('.acc-b > div').innerHTML+'</div>';sm.appendChild(art);stack(art.querySelector('svg'),i)});
  function layout(){if(cur==='home'){buildPix();
      var wide=matchMedia('(min-width:901px)').matches;svc.style.height='';svc.classList.remove('nopin');
      var internal=document.documentElement.scrollHeight>window.innerHeight+200;
      pinOn=wide&&internal&&!reduce;
      if(pinOn){pinH=svc.querySelector('.svc-pin').offsetHeight;svc.style.height=(pinH+3*STEP)+'px'}else if(wide){svc.classList.add('nopin')}
      if(sIdx<0)setSvc(0)}
    if(cur==='contact'){var fp=$('formPix'),fk=fp.clientWidth+'x'+fp.clientHeight;if(fp.clientWidth&&fp._k!==fk){fp._k=fk;scatter(fp,28,.42,true)}}}
  var rz;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(layout,200)});

  /* ---------- process diagram ---------- */
  (function(){var sv=$('procSvg'),i,cy=120;
    function fan(x0,x1,dir){for(i=0;i<21;i++){var y=6+i*11.9,mx=x0+(x1-x0)*.55;el('path',{d:'M'+x0+','+y+' Q'+mx+','+(cy+(y-cy)*.25)+' '+x1+','+cy,'class':'dt'},sv);
      var tt=.25+((i*37)%50)/100,bx=(1-tt)*(1-tt)*x0+2*(1-tt)*tt*mx+tt*tt*x1,by=(1-tt)*(1-tt)*y+2*(1-tt)*tt*(cy+(y-cy)*.25)+tt*tt*cy;el('circle',{cx:bx,cy:by,r:2.2,style:'fill:var(--bg);stroke:var(--fg);stroke-width:1'},sv)}}
    fan(0,204,1);fan(1440,1236,-1);
    var xs=[327,589,851,1113];xs.forEach(function(x,k){var g=el('g',{transform:'translate('+x+','+cy+')'},sv);icon(g,k);
      if(k<3)el('line',{x1:x+52,y1:cy,x2:xs[k+1]-52,y2:cy,'class':'dt'},sv);el('line',{x1:x,y1:cy+44,x2:x,y2:250,'class':'dt'},sv)})})();
  function icon(g,k){
    if(k===0){box(g,-18,-18,0,36,36,8);ring(g,0,0,8,10);ring(g,0,0,8,4)}
    if(k===1){box(g,-18,-18,0,36,36,5);box(g,-18,-18,9,36,36,5);[ -8,0,8].forEach(function(y){line(g,[-10,y,14],[10,y,14])})}
    if(k===2){box(g,-16,-16,0,32,32,26);line(g,[-16,0,26],[16,0,26]);line(g,[0,-16,26],[0,16,26])}
    if(k===3){box(g,-18,-18,0,36,36,6);[14,9,4].forEach(function(r){ring(g,0,0,6,r)})}}
  $$('svg.ic').forEach(function(s){icon(s,+s.dataset.ic)});
  var steps=$$('#steps .step');
  /* with motion on, motion.js sequences the steps as a flow; without it they simply show */
  if(reduce||!('IntersectionObserver' in window))steps.forEach(function(s){s.classList.add('in')});

  /* ---------- results boxes ---------- */
  (function(){var sv=$('boxSvg'),S=100,H=74;
    function b(x,y,z,big,lab,lab2){box(sv,x,y,z,S,S,H);faceText(sv,x+S,y+S-12,z+H-34,big,26);faceText(sv,x+S,y+S-12,z+H-52,lab,9);if(lab2)faceText(sv,x+S,y+S-12,z+H-63,lab2,9)}
    b(-50,-100,0,'0','follow-ups the','founder makes');b(-50,0,0,'1','conversation,','with us');b(-50,-50,H,'Day 0','in the books')})();
  (function(){var sv=$('envSvg'),W=120,D=80,H=8;box(sv,-W/2,-D/2,0,W,D,H,'fi');var t=H;line(sv,[-W/2,-D/2,t],[0,8,t],'di');line(sv,[W/2,-D/2,t],[0,8,t],'di');line(sv,[-W/2,D/2,t],[-12,0,t],'di');line(sv,[W/2,D/2,t],[12,0,t],'di')})();

  /* ---------- mosaics, scatters ---------- */
  function mosaic(host,cell){var c=document.createElement('canvas');host.insertBefore(c,host.firstChild);var w=Math.max(8,Math.round((host.clientWidth||600)/(cell||26))),h=Math.max(6,Math.round((host.clientHeight||400)/(cell||26)));c.width=w;c.height=h;c.style.imageRendering='pixelated';var x=c.getContext('2d');
    for(var i=0;i<w;i++)for(var j=0;j<h;j++){var a=Math.random();x.fillStyle='rgba(255,255,228,'+(a<.5?0:(a-.5)*.3).toFixed(3)+')';x.fillRect(i,j,1,1)}}
  function scatter(host,C,p,full){host.innerHTML='';var w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;var cols=Math.ceil(w/C),rows=Math.ceil(h/C),f=document.createDocumentFragment();
    for(var c=0;c<cols;c++)for(var r=0;r<rows;r++){var q=full?p:p*(1-c/cols);if(Math.random()<q){var i=document.createElement('i');i.style.cssText='left:'+(c*C)+'px;top:'+(r*C)+'px;width:'+(C-2)+'px;height:'+(C-2)+'px';f.appendChild(i)}}host.appendChild(f)}

  /* ---------- sub-page art ---------- */
  var heroArt={};
  function initArt(){$$('.mosaic[data-art]').forEach(function(m){if(m._d||!m.clientWidth)return;m._d=1;mosaic(m);var i=+m.dataset.art,sv=el('svg',{'class':'iso',viewBox:'-200 -230 400 440'},m);
      if(i<4){for(var k=0;k<3;k++){var g=el('g',{transform:'translate(0,'+(-110+(2-k)*110)+')'},el('g',{'class':'sl',style:'animation-delay:'+(250+k*160)+'ms'},sv));single(g,k,170,22,k===i)}}
      else{[i===4?1:0,5,4].forEach(function(d,k){var g=el('g',{transform:'translate(0,'+(110-k*110)+')'},el('g',{'class':'sl',style:'animation-delay:'+(250+k*160)+'ms'},sv));single(g,d,170,22,k===2)})}});
    $$('.ppl .ph').forEach(function(t){if(t._d||!t.clientWidth)return;t._d=1;mosaic(t,26)});
    $$('[data-tile]').forEach(function(t,k){if(t._d||!t.clientWidth)return;t._d=1;mosaic(t,22);var sv=el('svg',{'class':'iso',viewBox:'-40 -40 80 70'},t);if(k===0){box(sv,-20,-20,0,40,40,30,'fi')}else{box(sv,-22,-22,0,44,44,8,'fi');box(sv,-22,-22,14,44,44,8,'fi')}})}
  var _show=show;show=function(n){_show(n);setTimeout(initArt,0)};

  /* ---------- blog images ---------- */
  $$('#blog .img').forEach(function(m){var i=+m.dataset.img;mosaic(m,30);var sv=el('svg',{'class':'iso',viewBox:i===0?'-210 -105 420 210':'-150 -75 300 150'},m);
    function cube(x,y,s,glyph){var g=el('g',{transform:'translate('+x+','+y+')'},sv);box(g,-s/2,-s/2,0,s,s,s,'fi');if(glyph)faceText(g,s/2,s/2-s*.28,s*.3,glyph,s*.42,'ti')}
    if(i===0){cube(-96,14,72,'0');cube(64,30,88,'45')}
    if(i===1){cube(-30,20,56,'?');cube(48,-4,40,'A')}if(i===2){cube(-44,22,48,'₹');cube(40,4,48,'₹')}
    if(i===3){cube(-70,26,36,'1');cube(-8,18,44,'2');cube(62,10,52,'3')}if(i===4){cube(0,14,62,'10')}});

  /* ---------- tree chips, social ---------- */
  $$('[data-chip]').forEach(function(s){var k=s.dataset.chip;if(k==='disc'){var c=P(0,0,8);el('path',{d:'M'+(c[0]-30)+','+c[1]+' v8 a30,17.3 0 0 0 60,0 v-8',style:'fill:var(--bg);stroke:var(--fg);stroke-width:1.1'},s);el('ellipse',{cx:c[0],cy:c[1],rx:30,ry:17.3,style:'fill:var(--bg);stroke:var(--fg);stroke-width:1.1'},s);for(var i=-3;i<=3;i++)line(s,[i*5,-16,8],[i*5,16,8])}
    else{k=+k;box(s,-16,-16,0,32,32,5);if(k===0){[-8,0,8].forEach(function(y){line(s,[-10,y,5],[10,y,5])})}if(k===1){box(s,-8,-8,5,16,16,8)}if(k===2){[[-11,5],[-3,10],[5,15]].forEach(function(q){box(s,q[0],-3,5,6,6,q[1])})}if(k===3){ring(s,0,0,5,10);ring(s,0,0,5,4)}}});
  $$('[data-soc]').forEach(function(s){var k=+s.dataset.soc;box(s,-34,-34,0,68,68,10,'fi');
    var o=P(-34,34,10),M='matrix(.866,-.5,.866,.5,'+o[0]+','+o[1]+')';
    if(k===0){el('use',{href:'#mk',x:12,y:12,width:44,height:44,transform:M,style:'color:var(--bg)'},s)}
    if(k===1){var t=el('text',{x:34,y:48,'text-anchor':'middle',transform:M,'class':'ti',style:'font-size:40px;font-family:var(--f-b);font-weight:500'},s);t.textContent='in'}
    if(k===2){el('path',{d:'M12 20h44v28h-44z M12 20l22 16l22-16',transform:M,'class':'di',style:'stroke-width:1.6'},s)}});
  scatter($('scat'),30,.75);scatter($('scatH'),30,.5,true);
  /* footer strip is 3 squares wide on phones, 4 on desktop: redraw when the layout switches */
  if(window.matchMedia){var mqf=matchMedia('(max-width:900px)'),rsf=function(){scatter($('scat'),30,.75);scatter($('scatH'),30,.5,true);var v=$('scatV');if(v){v._H=0;v.innerHTML=''}setTimeout(placeV,50)};if(mqf.addEventListener)mqf.addEventListener('change',rsf);else if(mqf.addListener)mqf.addListener(rsf)}
  /* left column beside the contact box: joins the row above to the footer column below */
  function placeV(){var v=$('scatV'),h=$('scatH'),cb=$('cband');if(!v||!h||!cb||!cb.offsetHeight||!h.offsetHeight)return;
    var so=document.querySelector('.soc');if(so)cb.style.setProperty('--vl',Math.max(0,cb.offsetHeight-so.offsetTop-so.offsetHeight)+'px');
    var top=h.offsetTop+h.offsetHeight,H=Math.floor((cb.offsetHeight-top)/30)*30;if(H<30){v.style.height='0';v.innerHTML='';return}
    if(v._H===H&&v.firstChild)return;v._H=H;v.style.height=H+'px';scatter(v,30,.75)}
  placeV();var pvt;window.addEventListener('resize',function(){clearTimeout(pvt);pvt=setTimeout(placeV,300)});window.addEventListener('hashchange',function(){setTimeout(placeV,200)});window.addEventListener('load',function(){setTimeout(placeV,200)});

  /* ---------- code window ---------- */
  var codeTxt='type Company = {\n  name: string\n  founder: string\n  stage: Stage\n  booksCurrentAsOf?: Date\n  peopleToChase?: number\n}\n\nexport async function askVitthaChittha(company: Company) {\n  if (daysBehind(company.booksCurrentAsOf) > 0) {\n    console.warn("The numbers are older than the decision.")\n  }\n\n  if ((company.peopleToChase ?? 0) > 0) {\n    console.warn("That is a lot of follow-ups.")\n  }\n\n  return {\n    booksCurrentAsOf: "today",\n    conversations: 1,\n    followUps: 0,\n  }\n}';
  (function(){var pre=$('code');if(!pre)return;pre.textContent=codeTxt;if(reduce)return;
    /* typed once, then left on screen; the text is already in place so the window is never empty */
    var tn=document.createTextNode(''),c=document.createElement('span'),n=0;c.className='cur';
    function tick(){n=Math.min(codeTxt.length,n+2);tn.data=codeTxt.slice(0,n);if(n<codeTxt.length)setTimeout(tick,22);else setTimeout(function(){c.remove()},2500)}
    function start(){pre.textContent='';pre.appendChild(tn);pre.appendChild(c);tick()}
    if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();start()}},{threshold:.2}).observe(pre)}else start()})();

  /* ---------- chips, forms ---------- */
  var cov=['Revenue','Receivables','Payables','Payroll','Bank accounts','Cards and expenses','GST','TDS','Income tax','Company-law filings','Cap table','ESOPs','Fundraising','Investor rights','Debt and credit lines','Grants and subsidies','Contracts','Subscriptions','Inventory','Fixed assets','Related parties','Foreign exchange','Insurance','Board resolutions','Budgets','Forecasts','Vendor terms','Customer terms','Refunds and disputes','Founder loans'];
  var cv=$('cover');cov.forEach(function(c){var li=document.createElement('li');li.textContent=c;cv.appendChild(li)});
  if(!reduce){var ci=0;setInterval(function(){var ls=cv.children;[].forEach.call(ls,function(l){l.classList.remove('lit')});ls[(ci*7)%ls.length].classList.add('lit');ci++},900)}
  function wire(fid,did){var f=$(fid);f.addEventListener('submit',function(e){e.preventDefault();var bad=null;
    $$('[required]',f).forEach(function(x){var ok=x.value.trim()&&(x.type!=='email'||/.+@.+\..+/.test(x.value));x.style.outline=ok?'':'2px solid currentColor';if(!ok&&!bad)bad=x});
    if(bad){bad.focus();return}$(did).classList.add('show');f.querySelector('button[type=submit]').disabled=true})}
  wire('callForm','callDone');wire('waitForm','waitDone');wire('letterForm','letterDone');
  function copy(e){var btn=e.currentTarget,t='info@vitthachittha.com';function ok(){btn.textContent='Copied: '+t}try{navigator.clipboard.writeText(t).then(ok,function(){btn.textContent=t})}catch(_){btn.textContent=t}}
  $('copyMail').addEventListener('click',copy);$('copyMail2').addEventListener('click',copy);
  $('showMock').addEventListener('change',function(e){document.body.classList.toggle('hide-mock',!e.target.checked)});
  $('yr').textContent=new Date().getFullYear();
  route();
})();
