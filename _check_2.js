
(()=>{
 const opening=document.getElementById('opening'), openBtn=document.getElementById('openInvitation'), music=document.getElementById('music'), musicBtn=document.getElementById('musicBtn'); let opened=false;
 const params=new URLSearchParams(location.search); const guest=(params.get('to')||'').replace(/\+/g,' ').trim(); document.getElementById('guestName').textContent=guest||'Tamu Undangan';
 let fadeToken=0;
 const fadeVolume=(to,dur=700)=>{const token=++fadeToken;const from=Number.isFinite(music.volume)?music.volume:0;const t0=performance.now();return new Promise(resolve=>{const step=t=>{if(token!==fadeToken)return resolve();const p=Math.min(1,(t-t0)/dur);music.volume=Math.max(0,Math.min(1,from+(to-from)*p));if(p<1)requestAnimationFrame(step);else resolve()};requestAnimationFrame(step)})};
 const play=async()=>{try{music.volume=0;await music.play();musicBtn.classList.add('playing');await fadeVolume(.58,900)}catch(e){musicBtn.classList.remove('playing')}};
 const pauseMusic=async()=>{try{await fadeVolume(0,520)}catch(e){}music.pause();musicBtn.classList.remove('playing')};
 const open=()=>{if(opened)return;opened=true;opening.classList.add('hide');document.body.classList.remove('locked');musicBtn.classList.add('show');document.getElementById('miniNav')?.classList.add('show');document.getElementById('swipePremium')?.classList.add('show');play();setTimeout(()=>{if(opening&&opening.parentNode)opening.remove()},850);window.scrollTo(0,0)};
 ['click','touchend','pointerup'].forEach(evt=>openBtn.addEventListener(evt,e=>{e.preventDefault();open()},{passive:false}));
 musicBtn.addEventListener('click',async()=>{if(music.paused)await play();else await pauseMusic()});
 music.addEventListener('error',()=>{musicBtn.classList.remove('show','playing');musicBtn.setAttribute('aria-hidden','true')},{once:true});
 
 if(params.get('open')==='1')setTimeout(open,250);

 // Premium swipe-up helper: tap to move to the next invitation scene.
 const swipePremium=document.getElementById('swipePremium');
 const swipeScenes=[...document.querySelectorAll('.site > .scene')];
 let swipeIdleTimer=0;
 function currentSceneIndex(){
   const probe=innerHeight*.46; let best=0,bestDist=Infinity;
   swipeScenes.forEach((s,i)=>{const r=s.getBoundingClientRect();const inside=r.top<=probe&&r.bottom>=probe;if(inside){best=i;bestDist=0}else if(bestDist){const d=Math.min(Math.abs(r.top-probe),Math.abs(r.bottom-probe));if(d<bestDist){bestDist=d;best=i}}});
   return best;
 }
 function refreshSwipe(){
   if(!swipePremium||document.body.classList.contains('locked'))return;
   const i=currentSceneIndex();
   const atLast=i>=swipeScenes.length-1 || (scrollY+innerHeight>=document.documentElement.scrollHeight-120);
   swipePremium.classList.toggle('show',!atLast&&!document.body.classList.contains('lb-open'));
 }
 swipePremium?.addEventListener('click',()=>{
   const i=currentSceneIndex(); const next=swipeScenes[Math.min(i+1,swipeScenes.length-1)];
   if(next){swipePremium.classList.remove('idle');next.scrollIntoView({behavior:'smooth',block:'start'})}
 });
 addEventListener('scroll',()=>{
   swipePremium?.classList.remove('idle');refreshSwipe();clearTimeout(swipeIdleTimer);swipeIdleTimer=setTimeout(()=>swipePremium?.classList.add('idle'),1700);
 },{passive:true});
 addEventListener('resize',refreshSwipe,{passive:true});
 setTimeout(refreshSwipe,350);


 // stars
 const canvas=document.getElementById('stars'),ctx=canvas.getContext('2d'); let stars=[];
 function resize(){const d=Math.min(devicePixelRatio||1,1.6);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0);const cap=innerWidth<600?72:110;stars=Array.from({length:Math.min(cap,Math.floor(innerWidth*innerHeight/7000))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.25+.2,a:.35+Math.random()*.5,s:Math.random()*.008+.003}))}
 function draw(){if(document.hidden){requestAnimationFrame(draw);return}ctx.clearRect(0,0,innerWidth,innerHeight);ctx.shadowBlur=5;ctx.shadowColor='#8d79ff';for(const s of stars){s.a+=s.s;if(s.a>.88||s.a<.28)s.s*=-1;ctx.beginPath();ctx.fillStyle=`rgba(255,255,255,${s.a})`;ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}ctx.shadowBlur=0;requestAnimationFrame(draw)} resize();draw();addEventListener('resize',resize);

 // reveal
 const els=[...document.querySelectorAll('.reveal')]; if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add('on')}),{threshold:.12});els.forEach(e=>io.observe(e));setTimeout(()=>els.forEach(e=>e.classList.add('on')),1800)}else els.forEach(e=>e.classList.add('on'));
 // depth interaction
 const depthEls=[...document.querySelectorAll('.depth')]; let motionFrame=0,motionX=0,motionY=0;
 const setMotion=(x,y)=>{motionX=x;motionY=y;if(motionFrame)return;motionFrame=requestAnimationFrame(()=>{motionFrame=0;document.documentElement.style.setProperty('--mx',motionX);document.documentElement.style.setProperty('--my',motionY);depthEls.forEach((el,i)=>{const k=(i%3+1)*.7;el.style.transform=`perspective(1200px) rotateX(${-motionY*2.2*k}deg) rotateY(${motionX*2.8*k}deg) translate3d(${motionX*3*k}px,${motionY*2*k}px,0)`})})};
 addEventListener('pointermove',e=>{setMotion((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2)},{passive:true});
 if(window.DeviceOrientationEvent)addEventListener('deviceorientation',e=>{if(e.gamma!=null&&e.beta!=null)setMotion(Math.max(-1,Math.min(1,e.gamma/30)),Math.max(-1,Math.min(1,(e.beta-35)/45)))},{passive:true});

 // decorations
 document.querySelectorAll('.scene').forEach((s,si)=>{for(let i=0;i<7;i++){let sp=document.createElement('i');sp.className='spark';sp.style.left=(8+Math.random()*84)+'%';sp.style.top=(8+Math.random()*82)+'%';sp.style.animationDelay=(-Math.random()*3)+'s';s.appendChild(sp)}for(let i=0;i<3;i++){let p=document.createElement('i');p.className='petal';p.style.left=(Math.random()*94)+'%';p.style.top=(-20-Math.random()*60)+'px';p.style.animationDelay=(-Math.random()*8)+'s';p.style.animationDuration=(7+Math.random()*5)+'s';s.appendChild(p)}});

 // countdown
 let target=new Date('2027-02-07T08:00:00+08:00').getTime();window.ZASetCountdownTarget=v=>{const n=Date.parse(v);if(Number.isFinite(n)){target=n;tick()}};const pad=n=>String(Math.max(0,n)).padStart(2,'0'); function tick(){let d=Math.max(0,target-Date.now());days.textContent=pad(Math.floor(d/86400000));hours.textContent=pad(Math.floor((d%86400000)/3600000));minutes.textContent=pad(Math.floor((d%3600000)/60000));seconds.textContent=pad(Math.floor((d%60000)/1000))}tick();setInterval(tick,1000);
 // carousel + fullscreen gallery
 const slides=[...document.querySelectorAll('.slide')], dots=document.getElementById('carDots');let cur=0;slides.forEach((_,i)=>{const d=document.createElement('i');dots.appendChild(d)});const dotEls=[...dots.children];
 const lightbox=document.getElementById('galleryLightbox'),lbImg=document.getElementById('lbImage'),lbCaption=document.getElementById('lbCaption'),lbClose=document.getElementById('lbClose'),lbPrev=document.getElementById('lbPrev'),lbNext=document.getElementById('lbNext'),lbStage=document.getElementById('lbStage');
 const galleryImgs=slides.map(s=>s.querySelector('img')).filter(Boolean); let lbIndex=0,lbOpen=false,startX=0,deltaX=0;
 function renderCar(){slides.forEach((s,i)=>{let d=i-cur;if(d>2)d-=slides.length;if(d<-2)d+=slides.length;s.dataset.pos=d});dotEls.forEach((d,i)=>d.classList.toggle('on',i===cur))}
 function goCar(step){cur=(cur+step+slides.length)%slides.length;renderCar()}
 prev.onclick=()=>goCar(-1); next.onclick=()=>goCar(1); renderCar();
 const carTimer=setInterval(()=>{if(document.visibilityState==='visible'&&!lbOpen){goCar(1)}},5000);
 function updateLightbox(){const img=galleryImgs[lbIndex]; if(!img)return; lbImg.src=img.currentSrc||img.src; lbImg.alt=img.alt||('Galeri '+(lbIndex+1)); lbCaption.textContent=(lbIndex+1)+' / '+galleryImgs.length}
 function openLightbox(index){lbIndex=index;lbOpen=true;updateLightbox();lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lb-open');swipePremium?.classList.remove('show')}
 function closeLightbox(){lbOpen=false;lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('lb-open');setTimeout(refreshSwipe,80)}
 function navLightbox(step){lbIndex=(lbIndex+step+galleryImgs.length)%galleryImgs.length;updateLightbox()}
 slides.forEach((slide,i)=>{slide.addEventListener('click',e=>{if(!e.target.closest('button'))openLightbox(i)})})
 lbClose?.addEventListener('click',closeLightbox); lbPrev?.addEventListener('click',()=>navLightbox(-1)); lbNext?.addEventListener('click',()=>navLightbox(1));
 lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
 document.addEventListener('keydown',e=>{if(!lbOpen)return; if(e.key==='Escape')closeLightbox(); if(e.key==='ArrowLeft')navLightbox(-1); if(e.key==='ArrowRight')navLightbox(1)});
 lbStage?.addEventListener('touchstart',e=>{const t=e.changedTouches[0];startX=t.clientX;deltaX=0},{passive:true});
 lbStage?.addEventListener('touchmove',e=>{const t=e.changedTouches[0];deltaX=t.clientX-startX},{passive:true});
 lbStage?.addEventListener('touchend',()=>{if(Math.abs(deltaX)>42){navLightbox(deltaX<0?1:-1)}deltaX=0},{passive:true});
 // Pinch zoom in fullscreen gallery.
 let pinchDistance=0,pinchBase=1,pinchScale=1;
 const dist2=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 lbStage?.addEventListener('touchstart',e=>{if(e.touches.length===2){pinchDistance=dist2(e.touches);pinchBase=pinchScale;e.preventDefault()}},{passive:false});
 lbStage?.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinchDistance){pinchScale=Math.max(1,Math.min(3,pinchBase*(dist2(e.touches)/pinchDistance)));lbImg.style.animation='none';lbImg.style.transform='scale('+pinchScale+')';lightbox.classList.toggle('zoomed',pinchScale>1.03);e.preventDefault()}},{passive:false});
 lbStage?.addEventListener('dblclick',()=>{pinchScale=1;lbImg.style.transform='scale(1)';lbImg.style.animation='';lightbox.classList.remove('zoomed')});
 const oldUpdateLightbox=updateLightbox;updateLightbox=function(){pinchScale=1;if(lbImg){lbImg.style.transform='scale(1)';lbImg.style.animation=''}lightbox?.classList.remove('zoomed');oldUpdateLightbox()};

 // tabs
 document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));document.querySelectorAll('.panel').forEach(x=>x.classList.remove('on'));t.classList.add('on');document.getElementById(t.dataset.tab).classList.add('on')});
 // copy
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{let old=b.textContent;try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='✓ Tersalin';setTimeout(()=>b.textContent=old,1300)}catch(e){prompt('Salin nomor rekening:',b.dataset.copy)}});

 // 10. Route from guest's current location; Google Maps provides live travel time/estimate.
 const routeBtn=document.getElementById('routeFromMe'),routeStatus=document.getElementById('routeStatus');
 if(routeBtn)routeBtn.addEventListener('click',()=>{
   const dest=window.ZA_MAP_DEST||'Gas Alam Badak 1, Muara Badak, Kalimantan Timur';
   if(!navigator.geolocation){window.open('https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(dest)+'&travelmode=driving','_blank');return}
   routeStatus.textContent='Membaca lokasi Anda…'; routeBtn.disabled=true;
   navigator.geolocation.getCurrentPosition(pos=>{const origin=pos.coords.latitude+','+pos.coords.longitude;routeStatus.textContent='Membuka estimasi perjalanan di Google Maps…';routeBtn.disabled=false;window.open('https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(dest)+'&travelmode=driving','_blank')},()=>{routeStatus.textContent='Lokasi tidak diizinkan. Membuka tujuan saja.';routeBtn.disabled=false;window.open('https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(dest)+'&travelmode=driving','_blank')},{enableHighAccuracy:false,timeout:7000,maximumAge:300000});
 });

 // 11. Closing action.
 document.getElementById('backTop')?.addEventListener('click',e=>{e.preventDefault();document.getElementById('verse')?.scrollIntoView({behavior:'smooth',block:'start'})});


 // Luxury suite: personal ID, monograms, cinematic scene transitions, share, sound design.
 const tinyHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase().slice(0,6)};
 const personalGuest=guest||'Tamu Undangan';
 const pid='ZA-'+tinyHash(personalGuest+'|'+(window.ZA_EVENT_DATE||'2027-02-07'));
 const pidEl=document.getElementById('guestPersonalId');if(pidEl)pidEl.textContent='UNDANGAN PERSONAL · '+pid;
 function addMono(target,cls=''){const el=document.querySelector(target);if(!el||el.querySelector(':scope > .za-monogram'))return;const m=document.createElement('div');m.className='za-monogram '+cls;m.innerHTML='Z<span>•</span>A';el.appendChild(m)}
 addMono('#count .calendar-4d');addMono('#gift');addMono('#rsvp');addMono('#closing');
 ['#dresscode','#cinematic'].forEach(s=>addMono(s,'section-mark'));
 const scenesLux=[...document.querySelectorAll('.site>.scene')];scenesLux.forEach(s=>s.classList.add('lux-cinematic'));
 if('IntersectionObserver'in window){const lio=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting)en.target.classList.add('lux-in')}),{rootMargin:'10% 0px -10% 0px',threshold:.10});scenesLux.forEach(s=>lio.observe(s));setTimeout(()=>scenesLux.forEach(s=>s.classList.add('lux-in')),2200)}else scenesLux.forEach(s=>s.classList.add('lux-in'));
 // Closing personalized share button.
 const closeWrap=document.querySelector('#closing .close-wrap');if(closeWrap&&!document.getElementById('shareInvite')){const acts=document.createElement('div');acts.className='closing-actions';acts.innerHTML='<button class="share-invite" id="shareInvite" type="button">Bagikan Undangan Personal</button>';closeWrap.appendChild(acts)}
 async function sharePersonal(){const u=new URL(location.href);u.hash='';if(guest)u.searchParams.set('to',guest);const data={title:'Undangan Pernikahan Zaky & Agnes',text:'Undangan pernikahan '+(window.ZA_COUPLE_SHORT||'Zaky & Agnes')+' · '+(window.ZA_EVENT_DATE_SHORT||'7 Februari 2027'),url:u.href};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(u.href);alert('Link undangan personal sudah disalin 🤍')}else prompt('Salin link undangan:',u.href)}catch(e){}}
 document.addEventListener('click',e=>{if(e.target.closest('#shareInvite'))sharePersonal()});
 window.ZASharePersonal=sharePersonal;
 // Very soft interaction chime (runs only after a user gesture).
 let audioCtx=null;function chime(kind='soft'){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const now=audioCtx.currentTime;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(kind==='open'?523.25:659.25,now);o.frequency.exponentialRampToValueAtTime(kind==='open'?659.25:783.99,now+.12);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.025,now+.018);g.gain.exponentialRampToValueAtTime(.0001,now+.28);o.connect(g).connect(audioCtx.destination);o.start(now);o.stop(now+.30)}catch(e){}}
 document.addEventListener('click',e=>{if(e.target.closest('#openInvitation'))chime('open');else if(e.target.closest('.swipe-premium,.car-controls button,.receipt-pass-btn,.pass-share,.share-invite'))chime('soft')},{passive:true});

 // 12. Professional performance fallbacks.
 const lowPower=matchMedia('(prefers-reduced-motion: reduce)').matches || ((navigator.hardwareConcurrency||8)<=4);
 if(lowPower)document.documentElement.classList.add('lite-motion');
 document.querySelectorAll('.story img,.slide img').forEach((img,i)=>{if(i>0)img.loading='lazy';img.decoding='async'});
})();
