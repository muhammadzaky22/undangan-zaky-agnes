
/* Premium finishing layer: lightweight and progressive-enhancement only. */
(()=>{
  const progress=document.getElementById('premiumProgress');
  const bar=progress?.querySelector('span');
  const opening=document.getElementById('opening');
  const scenes=[...document.querySelectorAll('.site>.scene')];
  const navLinks=[...document.querySelectorAll('#miniNav a[href^="#"]')];

  // Decorative ornaments and soft bokeh are generated without adding text.
  scenes.forEach((scene,idx)=>{
    if(!scene.querySelector(':scope > .premium-ornament')){
      const o=document.createElement('div');o.className='premium-ornament';o.setAttribute('aria-hidden','true');o.innerHTML='<i></i>';scene.prepend(o);
    }
    if(idx%2===0 && !scene.querySelector(':scope > .premium-bokeh')){
      const b=document.createElement('span');b.className='premium-bokeh';
      const size=34+(idx%3)*13;b.style.width=b.style.height=size+'px';
      b.style.left=(idx%4===0?'8%':'78%');b.style.top=(20+(idx*11)%58)+'%';b.style.animationDelay=(-idx*.8)+'s';scene.prepend(b);
    }
  });

  const updateProgress=()=>{
    if(!bar||!progress)return;
    const doc=document.documentElement;
    const max=Math.max(1,doc.scrollHeight-innerHeight);
    const pct=Math.min(100,Math.max(0,scrollY/max*100));
    bar.style.width=pct+'%';
    const opened=opening?.classList.contains('hide')||!document.body.classList.contains('locked');
    progress.classList.toggle('show',!!opened);
  };

  const updateNav=()=>{
    if(!navLinks.length)return;
    const probe=innerHeight*.48;
    let current=null;
    scenes.forEach(s=>{const r=s.getBoundingClientRect();if(r.top<=probe&&r.bottom>=probe)current=s.id});
    const navGroup={agnes:'zaky',book:'zaky'};
    const navCurrent=navGroup[current]||current;
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+navCurrent));
  };

  let raf=0;
  const refresh=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;updateProgress();updateNav()});
  };
  addEventListener('scroll',refresh,{passive:true});
  addEventListener('resize',refresh,{passive:true});
  document.getElementById('openInvitation')?.addEventListener('click',()=>setTimeout(refresh,450),{passive:true});
  refresh();

  // Gentle pointer spotlight on large cards; ignored on touch-only devices.
  if(matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.glass,.profile-card,.event-card,.bank-card,.form-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        card.style.setProperty('--spot-x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
        card.style.setProperty('--spot-y',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
      },{passive:true});
    });
  }
})();
