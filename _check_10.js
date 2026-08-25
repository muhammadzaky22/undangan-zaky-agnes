
/* Professional calm UI: preserve every control/effect, but reduce simultaneous visual competition. */
(()=>{
  let calmTimer=0;
  const body=document.body;
  const calm=()=>{ if(!body.classList.contains('locked')) body.classList.add('pro-idle-ui'); };
  const wake=()=>{
    body.classList.remove('pro-idle-ui');
    clearTimeout(calmTimer);
    if(!body.classList.contains('locked')) calmTimer=setTimeout(calm,2600);
  };
  ['pointerdown','touchstart','keydown'].forEach(ev=>addEventListener(ev,wake,{passive:true}));
  let scrollTimer=0;
  addEventListener('scroll',()=>{
    body.classList.remove('pro-idle-ui');
    clearTimeout(scrollTimer);clearTimeout(calmTimer);
    scrollTimer=setTimeout(()=>{ if(!body.classList.contains('locked')) calmTimer=setTimeout(calm,1000); },220);
  },{passive:true});
  document.getElementById('openInvitation')?.addEventListener('click',()=>{setTimeout(wake,900)},{once:true});
})();
