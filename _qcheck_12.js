
(()=>{
  // PWA registration. Fails silently in local file previews; works on HTTPS/GitHub Pages.
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}),{once:true});
  }

  // Small section progress label complements the existing progress bar + smart dock.
  const labels={verse:'Doa',count:'Hitung Mundur',zaky:'Mempelai',agnes:'Mempelai',events:'Acara & Lokasi',rundown:'Rangkaian Acara',dresscode:'Dress Code',livestream:'Live Streaming',story:'Our Story',cinematic:'Kisah Kami',gallery:'Galeri',guestphotos:'Foto Tamu',gift:'Hadiah',rsvp:'RSVP & Ucapan',closing:'Penutup'};
  const status=document.createElement('div');status.className='pro-section-status';status.id='proSectionStatus';status.innerHTML='<i></i><b>Undangan</b><span>0%</span>';document.body.appendChild(status);
  const sections=[...document.querySelectorAll('.site>.scene[id]')];
  let raf=0;
  const refreshStatus=()=>{raf=0;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const pct=Math.round(Math.min(100,Math.max(0,scrollY/max*100)));const probe=innerHeight*.45;let current=sections[0];sections.forEach(s=>{const r=s.getBoundingClientRect();if(r.top<=probe&&r.bottom>=probe)current=s});status.querySelector('b').textContent=labels[current?.id]||'Undangan';status.querySelector('span').textContent=pct+'%'};
  addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(refreshStatus)},{passive:true});addEventListener('resize',refreshStatus,{passive:true});refreshStatus();

  // Image loading skeleton — only while the browser is decoding.
  document.querySelectorAll('img').forEach(img=>{
    img.classList.add('pro-media-loading');
    const ready=()=>{img.classList.remove('pro-media-loading');img.classList.add('pro-media-ready')};
    if(img.complete&&img.naturalWidth)ready();else{img.addEventListener('load',ready,{once:true});img.addEventListener('error',ready,{once:true})}
  });

  // Install prompt appears only on browsers that support PWA install.
  let installPrompt=null;
  let installBtn=document.getElementById('installWeddingApp');
  const ensureInstallButton=()=>{
    if(installBtn)return installBtn;
    const actions=document.querySelector('#closing .closing-actions')||document.querySelector('#closing .close-wrap');if(!actions)return null;
    installBtn=document.createElement('button');installBtn.id='installWeddingApp';installBtn.type='button';installBtn.className='install-wedding-app';installBtn.textContent='Pasang di HP';installBtn.hidden=true;actions.appendChild(installBtn);
    installBtn.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();try{await installPrompt.userChoice}catch(e){}installPrompt=null;installBtn.hidden=true});return installBtn;
  };
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;const b=ensureInstallButton();if(b)b.hidden=false});
  addEventListener('appinstalled',()=>{installPrompt=null;if(installBtn)installBtn.hidden=true});
})();
