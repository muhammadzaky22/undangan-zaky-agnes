
/* Professional Suite V2 runtime */
(()=>{
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];

  // Decorative section dividers with consistent Z·A identity.
  const dividerTargets=['count','zaky','agnes','events','rundown','dresscode','story','cinematic','gallery','gift','rsvp','closing'];
  dividerTargets.forEach(id=>{
    const scene=document.getElementById(id);
    if(!scene || scene.querySelector(':scope > .pro-section-divider')) return;
    const d=document.createElement('div'); d.className='pro-section-divider'; d.setAttribute('aria-hidden','true');
    d.innerHTML='<span>Z·A</span>'; scene.prepend(d);
  });

  // Smart dock: labels expand briefly on interaction, while active item remains labeled.
  let dockTimer=0;
  const wakeDock=()=>{
    document.body.classList.add('dock-awake');
    clearTimeout(dockTimer);
    if(!document.body.classList.contains('locked')) dockTimer=setTimeout(()=>document.body.classList.remove('dock-awake'),2200);
  };
  ['pointerdown','touchstart','keydown'].forEach(ev=>addEventListener(ev,wakeDock,{passive:true}));
  q('#miniNav')?.addEventListener('click',wakeDock);
  q('#openInvitation')?.addEventListener('click',()=>setTimeout(wakeDock,650));

  // Download a real calendar file (WITA / Asia-Makassar) and keep Google Calendar as a secondary option.
  q('#downloadCalendar')?.addEventListener('click',()=>{
    const ics=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Zaky Agnes Wedding//ID','CALSCALE:GREGORIAN','METHOD:PUBLISH',
      'BEGIN:VEVENT','UID:zaky-agnes-20270207@zakyagnes.my.id','DTSTAMP:20260820T000000Z',
      'DTSTART;TZID=Asia/Makassar:20270207T080000','DTEND;TZID=Asia/Makassar:20270207T235900',
      'SUMMARY:The Wedding of Zaky & Agnes','LOCATION:Gas Alam Badak 1\\, Muara Badak\\, Kalimantan Timur',
      'DESCRIPTION:Akad dan resepsi pernikahan Muhammad Zaky Khairy & Agnes Viannisa.',
      'URL:https://zakyagnes.my.id/','END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Zaky-Agnes-7-Februari-2027.ics';
    document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
  });

  async function proShare(){
    const u=new URL(location.href);u.hash='';
    const name=(new URLSearchParams(location.search).get('to')||'').replace(/\+/g,' ').trim();
    if(name)u.searchParams.set('to',name);
    const data={title:'The Wedding of Zaky & Agnes',text:'Undangan pernikahan '+(window.ZA_COUPLE_SHORT||'Zaky & Agnes')+' · '+(window.ZA_EVENT_DATE_SHORT||'7 Februari 2027')+' · '+(window.ZA_VENUE_AREA||'Muara Badak'),url:u.href};
    try{
      if(navigator.share)await navigator.share(data);
      else if(navigator.clipboard){await navigator.clipboard.writeText(u.href);alert('Link undangan sudah disalin 🤍')}
      else prompt('Salin link undangan:',u.href);
    }catch(e){}
  }
  q('#proShareTop')?.addEventListener('click',proShare);

  // Opening depth on pointer devices only — subtle, no extra motion on phones.
  const phone=q('#opening .phone');
  if(phone && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches){
    q('#opening')?.addEventListener('pointermove',e=>{
      const r=phone.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width/2)));
      const y=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height/2)));
      phone.style.transform=`perspective(1300px) rotateX(${(-y*1.4).toFixed(2)}deg) rotateY(${(x*1.8).toFixed(2)}deg) translateZ(0)`;
    },{passive:true});
    q('#opening')?.addEventListener('pointerleave',()=>phone.style.transform='',{passive:true});
  }

  // Decode visual assets during idle time to reduce jank on section entry.
  const warm=()=>{
    qa('#story img,#gallery img,.pass-qr-wrap img').forEach((img,i)=>{
      try{img.decoding='async';img.loading='lazy';if(i>2)img.fetchPriority='low';img.decode?.().catch(()=>{})}catch(e){}
    });
  };
  (window.requestIdleCallback||((fn)=>setTimeout(fn,250)))(warm);
})();
