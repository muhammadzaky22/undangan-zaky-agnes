
(()=>{
 const TRANSPARENT='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
 const cssUrl=v=>{const raw=getComputedStyle(document.documentElement).getPropertyValue(v).trim();const m=raw.match(/^url\(["']?(.*?)["']?\)$/);return m?m[1]:''};
 function fallbackFor(img){const u=cssUrl(img.dataset.defaultVar);if(u)img.src=u}
 function ensureEmbeddedPhotos(){
   document.querySelectorAll('img[data-default-var]').forEach(img=>{
     const attr=img.getAttribute('src')||'';
     if(!attr||attr===TRANSPARENT)fallbackFor(img);
     if(!img.dataset.zaFallbackBound){img.dataset.zaFallbackBound='1';img.addEventListener('error',()=>fallbackFor(img));}
   });
 }
 window.ZAEnsureEmbeddedPhotos=ensureEmbeddedPhotos;
 ensureEmbeddedPhotos();
 document.addEventListener('DOMContentLoaded',ensureEmbeddedPhotos,{once:true});
 window.addEventListener('load',()=>setTimeout(ensureEmbeddedPhotos,80),{once:true});
 setTimeout(ensureEmbeddedPhotos,700);setTimeout(ensureEmbeddedPhotos,2200);
})();
