
/* Professional final pass: cinematic reveal, loader, lazy decoding, safe music fallback. */
(()=>{
  const loader=document.getElementById('proLoader');
  const hideLoader=()=>{ if(!loader)return; loader.classList.add('hide'); setTimeout(()=>loader.remove(),600); };
  if(document.readyState==='complete') setTimeout(hideLoader,220);
  else addEventListener('load',()=>setTimeout(hideLoader,220),{once:true});
  setTimeout(hideLoader,2600);

  const scenes=[...document.querySelectorAll('.site>.scene')];
  scenes.forEach(s=>s.classList.add('pro-cine'));
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('pro-cine-in')}),{threshold:.08,rootMargin:'8% 0px -8% 0px'});
    scenes.forEach(s=>io.observe(s));
  }else scenes.forEach(s=>s.classList.add('pro-cine-in'));

  // Noncritical embedded photos decode lazily; opening portrait remains untouched/eager.
  document.querySelectorAll('#story img,#gallery img,.gallery-lightbox img,.pass-qr-wrap img').forEach((img,idx)=>{
    try{img.decoding='async'; if(!img.closest('.gallery-lightbox')) img.loading='lazy'; if(idx>1) img.fetchPriority='low';}catch(e){}
  });

  // If browser blocks autoplay, keep the visible music control as a clear fallback.
  const music=document.getElementById('music');
  const musicBtn=document.getElementById('musicBtn');
  if(music&&musicBtn){
    const sync=()=>musicBtn.setAttribute('aria-label',music.paused?'Putar musik':'Jeda musik');
    music.addEventListener('play',sync);music.addEventListener('pause',sync);sync();
  }
})();
