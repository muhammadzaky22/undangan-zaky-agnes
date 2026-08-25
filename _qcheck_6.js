
/* Swipe button is below the original script in the HTML, so bind it here
   after the element actually exists. */
(()=>{
  const btn=document.getElementById('swipePremium');
  if(!btn || btn.dataset.bound==='1') return;
  btn.dataset.bound='1';
  const scenes=[...document.querySelectorAll('.site > .scene')];
  const getCurrent=()=>{
    const probe=window.innerHeight*0.48;
    let best=0,dist=Infinity;
    scenes.forEach((s,i)=>{
      const r=s.getBoundingClientRect();
      if(r.top<=probe && r.bottom>=probe){best=i;dist=0;return;}
      if(dist!==0){
        const d=Math.min(Math.abs(r.top-probe),Math.abs(r.bottom-probe));
        if(d<dist){dist=d;best=i;}
      }
    });
    return best;
  };
  const goNext=(e)=>{
    if(e){e.preventDefault();e.stopPropagation();}
    const i=getCurrent();
    const next=scenes[i+1];
    if(next){
      btn.classList.remove('idle');
      next.scrollIntoView({behavior:'smooth',block:'start'});
    }
  };
  btn.addEventListener('click',goNext,{passive:false});
  // keyboard accessibility for desktop testing
  btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){goNext(e)}});
  const refresh=()=>{
    if(document.body.classList.contains('locked')) return;
    const i=getCurrent();
    const atLast=i>=scenes.length-1 || (window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-100);
    const blocked=document.body.classList.contains('lb-open');
    btn.classList.toggle('show',!atLast&&!blocked);
  };
  window.addEventListener('scroll',refresh,{passive:true});
  window.addEventListener('resize',refresh,{passive:true});
  document.getElementById('galleryLightbox')?.addEventListener('transitionend',refresh);
  setTimeout(refresh,500);
})();
