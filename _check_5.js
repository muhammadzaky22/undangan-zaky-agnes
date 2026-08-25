
(function(){
  let chapterPhotoReady=false;
  function extractUrl(v){
    if(!v) return '';
    const m=v.match(/url\((?:"|')?(.*?)(?:"|')?\)\s*$/s);
    return m ? m[1] : '';
  }
  function warmChapterPhoto(){
    if(chapterPhotoReady) return;
    chapterPhotoReady=true;
    try{
      const value=getComputedStyle(document.documentElement).getPropertyValue('--p0').trim();
      const src=extractUrl(value);
      if(!src) return;
      const img=new Image();
      img.decoding='async';
      img.fetchPriority='high';
      img.src=src;
      if(img.decode) img.decode().catch(()=>{});
      window.__chapterPhotoPreload=img;
    }catch(e){}
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      if('requestIdleCallback' in window) requestIdleCallback(warmChapterPhoto,{timeout:700});
      else setTimeout(warmChapterPhoto,120);
    },{once:true});
  }else{
    if('requestIdleCallback' in window) requestIdleCallback(warmChapterPhoto,{timeout:700});
    else setTimeout(warmChapterPhoto,120);
  }
  window.addEventListener('load',warmChapterPhoto,{once:true});
  document.addEventListener('touchstart',warmChapterPhoto,{once:true,passive:true});
  document.addEventListener('pointerdown',warmChapterPhoto,{once:true,passive:true});
})();
