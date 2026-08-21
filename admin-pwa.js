(() => {
  const installBtn = document.getElementById('installAdminApp');
  const installNote = document.getElementById('pwaInstallNote');
  let deferredPrompt = null;

  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isHttp = () => location.protocol === 'https:' || ['localhost','127.0.0.1'].includes(location.hostname);

  function markInstalled(){
    if(installBtn) installBtn.hidden = true;
    if(installNote){
      installNote.innerHTML = '<b>Aplikasi Admin terpasang.</b> Buka dari ikon ZA Admin di layar utama untuk pengalaman tanpa address bar.';
    }
    const brandP = document.querySelector('.brand p');
    if(brandP && !document.querySelector('.pwa-installed-badge')){
      brandP.insertAdjacentHTML('afterend','<span class="pwa-installed-badge">● APP MODE</span>');
    }
  }

  if('serviceWorker' in navigator && isHttp()){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', {scope:'./'}).then(reg => reg.update().catch(()=>{})).catch(()=>{});
    });
  }

  if(isStandalone()) markInstalled();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if(installBtn && !isStandalone()) installBtn.hidden = false;
    if(installNote) installNote.innerHTML = '<b>Siap dipasang:</b> tekan tombol “Install Aplikasi Admin” untuk menambahkan ZA Admin ke layar utama HP.';
  });

  installBtn?.addEventListener('click', async () => {
    if(isStandalone()) return markInstalled();
    if(deferredPrompt){
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(()=>null);
      deferredPrompt = null;
      if(choice?.outcome === 'accepted') markInstalled();
      else installBtn.hidden = true;
      return;
    }
    if(location.protocol === 'content:' || location.protocol === 'file:'){
      alert('Install aplikasi hanya aktif setelah file di-upload ke https://zakyagnes.my.id. Preview content:// atau file lokal tidak dapat dipasang sebagai PWA.');
      return;
    }
    if(isIOS()){
      alert('Di iPhone/iPad: buka menu Share di Safari, lalu pilih “Add to Home Screen / Tambahkan ke Layar Utama”.');
      return;
    }
    alert('Jika tombol install belum tersedia, buka admin melalui Chrome di https://zakyagnes.my.id/admin.html lalu tunggu beberapa detik. Anda juga bisa pilih menu Chrome → Install app / Tambahkan ke layar utama.');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    markInstalled();
  });

  // If the browser has no beforeinstallprompt (iOS / local preview), show a useful action.
  window.setTimeout(() => {
    if(!installBtn || isStandalone() || !installBtn.hidden) return;
    if(isIOS() || location.protocol === 'content:' || location.protocol === 'file:') installBtn.hidden = false;
  }, 1200);

  // App shortcuts: open requested admin tab once page listeners are ready.
  const tab = new URLSearchParams(location.search).get('tab');
  if(tab){
    let tries = 0;
    const openTab = () => {
      const button = document.querySelector(`#tabs button[data-tab="${CSS.escape(tab)}"]`);
      if(button){ button.click(); return; }
      if(++tries < 20) setTimeout(openTab, 300);
    };
    setTimeout(openTab, 500);
  }
})();
