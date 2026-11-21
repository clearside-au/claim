/* ClearSide mock F pages, round 2 (20 Nov 2026): scroll drives the one landscape, the layer stack, the timeline and the dust.
   PIN 23 rules: hold then move, same window new data, pull back to join, one warm wash, words one at a time.
   Round 2 lag rules: no layout reads inside the scroll frame (sizes are cached in measure()),
   scroll numbers are set on .world / .scene / .tl only (never on <html>), nothing is written when the value did not change. */
(function(){
  var d=document.documentElement,body=document.body,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var book=body.classList.contains('book'),wide=matchMedia('(min-width:861px)');
  var scene=document.querySelector('.scene'),world=document.querySelector('.world'),tl=document.querySelector('.tl');
  var big=tl?tl.querySelector('.big'):null;var links=tl?[].slice.call(tl.querySelectorAll('a')):[],marks=[];
  var vh=0,max=0,sTop=0,sRange=1,ticking=false,lastS=-1,lastL=-1,lastP=-1,lastPP=-1,lastK=-1,lastX=-1,cur=-1,pulled=null;
  /* 20 Nov phone fix: scroll-linked motion is desktop only. Phones get the still layout + a soft fade (html.lite). */
  if(!rm)d.classList.add('js'); /* 20 Nov pm: his call, phones keep the invoice scene but it runs faster (shorter scene, see f.css) */
  function clamp(v){return v<0?0:v>1?1:v}
  function smooth(v){v=clamp(v);return v*v*(3-2*v)}

  /* ---------- red dirt dust (pin 25): one canvas, capped, only runs while the stack is open ---------- */
  var dust=(function(){
    var c=document.querySelector('.dust'),base=document.querySelector('.l1');
    if(!c||!base||rm||!c.getContext)return{set:function(){},size:function(){}};
    var x=c.getContext('2d'),P=[],target=0,run=false,W=0,H=0,dpr=1,bx=0,by=0,bw=0,bh=0,n=0,then=0;
    var COL=['181,80,42','138,58,30','208,112,60'],CAP=[0,110,64,26,0];
    function size(){dpr=Math.min(phone?1:1.5,window.devicePixelRatio||1);var w=c.offsetWidth,h=c.offsetHeight;if(w===W&&h===H&&c.width)return;W=w;H=h;c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}
    function where(){var a=c.getBoundingClientRect(),b=base.getBoundingClientRect();bx=b.left-a.left;by=b.top-a.top;bw=b.width;bh=b.height}
    function spawn(){
      /* a point on the tilted base sheet: corner + a*u + b*v, in the sheet's own box */
      var a=Math.random(),b=Math.random(),m=1.6+Math.random()*2.2;
      P.push({x:bx+(a*.754+b*.246)*bw,y:by+(.546-a*.546+b*.454)*bh,vx:(Math.random()-.5)*14,vy:-(12+Math.random()*30),
        l:0,m:m,r:.7+Math.random()*1.6,c:COL[(Math.random()*3)|0],w:Math.random()*6.28});
    }
    var phone=!wide.matches,last=0;
    function loop(now){
      /* 21 Nov lag fix: phones draw the dust at 30 frames a second with half the dots */
      if(phone&&now-last<32){if(target>0||P.length){requestAnimationFrame(loop);return}}
      last=now;
      var dt=Math.min(.05,(now-then)/1000||.016);then=now;
      if(++n%30===0)where();
      for(var k=0;k<3&&P.length<target;k++)spawn();
      x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);
      for(var i=P.length-1;i>=0;i--){
        var q=P[i];q.l+=dt;if(q.l>=q.m){P.splice(i,1);continue}
        q.w+=dt*1.7;q.x+=(q.vx+Math.sin(q.w)*9)*dt;q.y+=q.vy*dt;
        x.fillStyle='rgba('+q.c+','+(Math.sin(3.1416*q.l/q.m)*.78).toFixed(3)+')';
        x.beginPath();x.arc(q.x,q.y,q.r,0,6.2832);x.fill();
      }
      if(target>0||P.length)requestAnimationFrame(loop);else{run=false;x.clearRect(0,0,W,H)}
    }
    return{size:size,set:function(layer,open){
      target=d.classList.contains('vplay')?0:Math.round(CAP[layer]*open*(phone?.5:1)); /* 21 Nov v9: no dust while a video plays */ /* 21 Nov: phone 1-1 with desktop */
      if(target>0&&!run){run=true;if(!W)size();where();then=performance.now();requestAnimationFrame(loop)}
    }};
  })();

  /* ---------- sizes are read here, never inside the scroll frame ---------- */
  function measure(){
    vh=window.innerHeight;max=Math.max(0,d.scrollHeight-vh);
    if(scene){sTop=scene.offsetTop;sRange=Math.max(1,scene.offsetHeight-vh)}
    if(tl&&!rm){
      var H=tl.offsetHeight,y0=window.scrollY,prev=-99;tl.style.setProperty('--H',H+'px');
      marks=links.map(function(a){
        var id=a.getAttribute('href').slice(1),el=document.getElementById(id),y=0;
        if(id==='how'&&scene)y=sTop+.3*sRange;
        else if(id!=='top'&&el)y=el.getBoundingClientRect().top+y0;
        y=Math.min(max,Math.max(0,y));
        var px=Math.max(prev+22,max>0?y/max*H:0);prev=px;a.style.top=px.toFixed(1)+'px';
        return{id:id,y:y,a:a};
      });
    }
    dust.size();lastP=lastPP=lastK=-1;tick();
  }
  function frame(){
    ticking=false;
    var y=window.scrollY,i;
    if(!book&&world){
      var PP=max>0?clamp(y/max):0;
      if(PP!==lastPP){lastPP=PP;var sp=PP.toFixed(4);world.style.setProperty('--P',sp);if(tl)tl.style.setProperty('--P',sp)}
    }
    if(marks.length){
      var c=0;for(i=0;i<marks.length;i++)if(marks[i].y<=y+vh*.35)c=i;
      if(c!==cur){if(cur>=0)marks[cur].a.classList.remove('cur');marks[c].a.classList.add('cur');if(big)big.textContent=(c<9?'0':'')+(c+1);marks[c].a.setAttribute('aria-current','true');if(cur>=0)marks[cur].a.removeAttribute('aria-current');cur=c}
    }
    if(!scene||!d.classList.contains('js'))return;
    var t=clamp((y-sTop)/sRange),p=clamp(t/.22);
    p=p*p; /* ease-in, like the tunnel in pin 23 */
    /* k = how far the layer stack is open: opens after the pull back, closes into the flat report at step 3 */
    var k=smooth((t-.2)/.1)*(1-smooth((t-.74)/.1)); /* 21 Nov: phone gets the layer stack too */
    if(p!==lastP){lastP=p;var s1=p.toFixed(4);scene.style.setProperty('--p',s1);if(world)world.style.setProperty('--p',s1)}
    if(k!==lastK){lastK=k;scene.style.setProperty('--k',k.toFixed(4))}
    /* x = the pinned scene is leaving: its words fade before they slide under the logo */
    var x=clamp((y-sTop-sRange)/(vh*.3));if(x!==lastX){lastX=x;scene.style.setProperty('--x',x.toFixed(3))}
    var s=t<.15?0:t<.46?1:t<.74?2:3,L=t<.2?0:t<.46?1:t<.6?2:t<.74?3:4;
    if(s!==lastS){scene.setAttribute('data-step',s);lastS=s}
    if(L!==lastL){scene.setAttribute('data-layer',L);lastL=L}
    var pl=p>.4;if(pl!==pulled){pulled=pl;scene.classList.toggle('pulled',pl)}
    dust.set(L,k);
  }
  function tick(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  addEventListener('scroll',tick,{passive:true});
  /* 21 Nov lag fix: phones fire resize when the address bar slides in on scroll-up. Height-only changes are ignored
     (same width = same layout), so the page is never re-measured mid-scroll. */
  var rz,lastW=window.innerWidth;addEventListener('resize',function(){var w=window.innerWidth;if(w===lastW&&!wide.matches)return;lastW=w;clearTimeout(rz);rz=setTimeout(measure,120)});
  addEventListener('load',measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  measure();frame();

  /* timeline dots and in-page links jump to the measured spot (How it works lives inside the pinned scene) */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||!marks.length)return;
    var id=a.getAttribute('href').slice(1);
    for(var i=0;i<marks.length;i++)if(marks[i].id===id){e.preventDefault();window.scrollTo({top:marks[i].y,behavior:rm?'auto':'smooth'});return}
  });

  if(rm||!('IntersectionObserver' in window))return;
  /* words arrive one at a time, 160 ms each */
  [].forEach.call(document.querySelectorAll('.type'),function(h){
    var words=h.textContent.trim().split(/\s+/);h.setAttribute('aria-label',words.join(' '));h.textContent='';
    words.forEach(function(w,i){var s=document.createElement('span');s.className='w';s.setAttribute('aria-hidden','true');s.style.setProperty('--i',i);s.textContent=w;h.appendChild(s);h.appendChild(document.createTextNode(' '))});
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;
    var el=e.target;io.unobserve(el);el.classList.add('on');
    if(el.hasAttribute('data-wash')){
      d.classList.add('wash-on');
      var h=el.querySelector('.type');if(h)setTimeout(function(){h.classList.add('on')},400);
      setTimeout(function(){d.classList.remove('wash-on')},2200);
    }
  })},{threshold:.3});
  [].forEach.call(document.querySelectorAll('.rv'),function(el){io.observe(el)});
})();

/* 20 Nov round 2: numbers count up when their step shows. Text only, about 1 second, off for reduced motion. */
(function(){
  var scene=document.querySelector('.scene');if(!scene||!window.MutationObserver)return;
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var map={1:'.s-send',2:'.s-check',3:'.s-report'},raf=0;
  function run(sel){
    var els=scene.querySelectorAll('.win '+sel+' .cnt');if(!els.length)return;
    var t0=performance.now();cancelAnimationFrame(raf);
    (function tick(t){
      var p=Math.min(1,(t-t0)/1000),e=1-Math.pow(1-p,3);
      for(var i=0;i<els.length;i++){var el=els[i],to=+el.getAttribute('data-to');
        el.textContent=(el.getAttribute('data-pre')||'')+Math.round(to*e).toLocaleString('en-AU')}
      if(p<1)raf=requestAnimationFrame(tick);
    })(t0);
  }
  new MutationObserver(function(){var s=map[scene.getAttribute('data-step')];if(s)run(s)}).observe(scene,{attributes:true,attributeFilter:['data-step']});
})();

/* 21 Nov v9: while a video plays, the scroll scene rests (no dust, no layer promotion) so the phone spends its power on the video. */
(function(){
  var d=document.documentElement,vs=[].slice.call(document.querySelectorAll('video'));if(!vs.length)return;
  function upd(){d.classList.toggle('vplay',vs.some(function(v){return !v.paused&&!v.ended}))}
  vs.forEach(function(v){['play','playing','pause','ended'].forEach(function(e){v.addEventListener(e,upd)})});
})();
/* 21 Nov v10 (his ruling): on a phone every booking button goes straight to the Cal.com calendar page (the embed does not load on phones). Desktop unchanged: our booking page. */
(function(){
  if(matchMedia('(min-width:861px)').matches)return;
  [].forEach.call(document.querySelectorAll('a[href^="book/"]'),function(a){a.setAttribute('href','https://cal.com/clearside/15min')});
})();
