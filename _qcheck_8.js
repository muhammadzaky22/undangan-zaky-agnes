
// Final professional polish: preload next visual assets during idle time and keep personalized share URL intact.
(function(){
 const run=()=>{const imgs=[...document.querySelectorAll('#book .page.right,.profile-photo,.story img,.slide img')];let i=0;const step=()=>{for(let n=0;n<2&&i<imgs.length;n++,i++){const el=imgs[i];if(el.tagName==='IMG'){try{el.decoding='async';if(i<4)el.loading='eager';el.decode?.().catch(()=>{})}catch(e){}}else{const bg=getComputedStyle(el).backgroundImage;const m=bg&&bg.match(/url\(["']?(.*?)["']?\)/);if(m){const im=new Image();im.src=m[1]}}}if(i<imgs.length)(window.requestIdleCallback||((f)=>setTimeout(f,120)))(step)};step()};
 (window.requestIdleCallback||((f)=>setTimeout(f,350)))(run);
 // On a real custom domain this keeps all personalized links relative to that domain automatically.
 if(location.protocol==='https:'||location.protocol==='http:'){let c=document.querySelector('link[rel="canonical"]');if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c)}c.href=location.origin+location.pathname}
})();
