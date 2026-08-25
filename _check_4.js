
document.addEventListener('DOMContentLoaded',async()=>{
 const URL='https://ridrrcprspixtrbwygeo.supabase.co',KEY='sb_publishable_qPkd-UXm7X2KRA-E5a00jA_O8Ya4iSr';
 const rsvpForm=document.getElementById('rsvpForm'),rsvpStatus=document.getElementById('rsvpStatus'),attendanceTotal=document.getElementById('attendanceTotal'),attendanceConfirmed=document.getElementById('attendanceConfirmed'),attendanceUnable=document.getElementById('attendanceUnable'),attendanceNote=document.getElementById('attendanceNote'),wishBtn=document.getElementById('wishSubmit'),wishStatus=document.getElementById('wishStatus'),wishList=document.getElementById('wishList');
 const giftBtn=document.getElementById('giftConfirmBtn'),giftName=document.getElementById('giftConfirmName'),giftBank=document.getElementById('giftConfirmBank'),giftStatus=document.getElementById('giftConfirmStatus');
 const receipt=document.getElementById('rsvpReceipt'),receiptClose=document.getElementById('receiptClose');
 const receiptPassBtn=document.getElementById('receiptPassBtn'),passOverlay=document.getElementById('weddingPassOverlay'),passClose=document.getElementById('passClose'),passShare=document.getElementById('passShare'),checkinOverlay=document.getElementById('checkinOverlay'),checkinStatus=document.getElementById('checkinStatus'),checkinGuest=document.getElementById('checkinGuest'),checkinName=document.getElementById('checkinName'),checkinMeta=document.getElementById('checkinMeta'),checkinBtn=document.getElementById('checkinBtn'),checkinExit=document.getElementById('checkinExit');
 const inviteToken=(new URLSearchParams(location.search).get('guest')||'').trim();
 let guestFromUrl=(new URLSearchParams(location.search).get('to')||'').replace(/\+/g,' ').trim(),guestQuota=10;
 if(giftName&&guestFromUrl)giftName.value=guestFromUrl;
 if(rsvpForm&&guestFromUrl)rsvpForm.querySelector('[name=name]').value=guestFromUrl;
 if(!window.supabase){if(rsvpStatus)rsvpStatus.textContent='Koneksi RSVP belum dapat dimuat.';return}
 const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},realtime:{params:{eventsPerSecond:4}}});
 async function resolvePersonalGuest(){
  if(!inviteToken)return null;
  try{
   const{data,error}=await db.rpc('get_guest_invitation',{p_token:inviteToken});if(error)throw error;const g=Array.isArray(data)?data[0]:data;if(!g)return null;
   const display=[String(g.salutation||'').trim(),String(g.name||'').trim()].filter(Boolean).join(' ').replace(/\s+/g,' ').trim()||'Tamu Undangan';guestFromUrl=display;guestQuota=Math.max(1,Math.min(50,Number(g.max_guests)||1));window.ZA_PERSONAL_GUEST_NAME=display;window.ZA_PERSONAL_GUEST_TOKEN=inviteToken;window.ZA_PERSONAL_GUEST_QUOTA=guestQuota;
   const gn=document.getElementById('guestName');if(gn)gn.textContent=display;const pid=document.getElementById('guestPersonalId');if(pid)pid.textContent='UNDANGAN PERSONAL · '+inviteToken.slice(0,8).toUpperCase();
   if(giftName)giftName.value=display;if(rsvpForm){const ni=rsvpForm.querySelector('[name=name]'),gi=rsvpForm.querySelector('[name=guests]');if(ni)ni.value=display;if(gi){gi.max=String(guestQuota);if(Number(gi.value)>guestQuota)gi.value=String(guestQuota)}}
   const wn=document.getElementById('wishName'),pn=document.getElementById('guestPhotoName');if(wn&&!wn.value)wn.value=display;if(pn&&!pn.value)pn.value=display;
   const sub=document.querySelector('#opening .guest-sub'),tpl=window.ZA_DYNAMIC_CONTENT?.text?.guest_template||'Dengan hormat, kami mengundang {nama} untuk hadir di hari bahagia kami.';if(sub)sub.textContent=String(tpl).replaceAll('{nama}',display);
   try{await db.rpc('mark_guest_invitation_opened',{p_token:inviteToken})}catch(_e){}return g;
  }catch(e){const pid=document.getElementById('guestPersonalId');if(pid)pid.textContent='UNDANGAN PERSONAL · Z&A';return null}
 }
 await resolvePersonalGuest();
 // Wedding Pass + QR (QuickChart URL; pass remains readable if QR image cannot load).
 let lastPass=null,checkinCodeParam=(new URLSearchParams(location.search).get('checkin')||'').trim();
 try{const saved=JSON.parse(sessionStorage.getItem('zakyAgnesLastRSVP')||'null');if(saved&&saved.name)lastPass=saved}catch(e){}
 const makeCode=()=>('ZA-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)).toUpperCase();
 const defaultPublicBase='https://zakyagnes.my.id/';
 const passQrUrl=payload=>'https://quickchart.io/qr?size=320&margin=2&ecLevel=H&dark=5b403b&light=fffaf6&text='+encodeURIComponent(payload);
 function passPayload(p){if(p.checkinPersisted){let base=(location.protocol==='http:'||location.protocol==='https:')?location.href:defaultPublicBase;const u=new URL('./admin.html',base);u.searchParams.set('pass',p.code);return u.href}return 'ZAKY & AGNES | '+p.name+' | '+p.guests+' tamu | '+(window.ZA_EVENT_DATE_SHORT||'7 Februari 2027')+' | '+p.code}
 function openPass(p){if(!p)return;lastPass=p;document.getElementById('passName').textContent=p.name;document.getElementById('passGuests').textContent=p.guests+' orang';document.getElementById('passAttendance').textContent=p.attendance;document.getElementById('passCode').textContent=p.code;const payload=passPayload(p);document.getElementById('passQr').src=passQrUrl(payload);document.getElementById('passNote').textContent=p.checkinPersisted?'Tunjukkan QR ini kepada panitia saat hadir untuk proses guest check-in.':'Wedding Pass tetap valid. Aktifkan upgrade Supabase di ZIP agar QR dapat dipakai untuk check-in otomatis.';passOverlay.classList.add('open');passOverlay.setAttribute('aria-hidden','false')}
 window.ZAOpenWeddingPass=openPass;
 passClose?.addEventListener('click',()=>{passOverlay.classList.remove('open');passOverlay.setAttribute('aria-hidden','true')});passOverlay?.addEventListener('click',e=>{if(e.target===passOverlay)passClose.click()});
 passShare?.addEventListener('click',async()=>{if(!lastPass)return;const payload=passPayload(lastPass);const data={title:'Wedding Pass Zaky & Agnes',text:'Wedding Pass '+lastPass.name+' · '+lastPass.guests+' orang · '+(window.ZA_EVENT_DATE_SHORT||'7 Februari 2027'),url:lastPass.checkinPersisted?payload:location.href};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(payload);alert('Wedding Pass sudah disalin 🤍')}else prompt('Wedding Pass:',payload)}catch(e){}});
 receiptPassBtn?.addEventListener('click',()=>{receipt?.classList.remove('open');openPass(lastPass)});
 // QR check-in page mode.
 async function loadCheckinMode(){if(!checkinCodeParam)return;checkinOverlay.classList.add('open');checkinOverlay.setAttribute('aria-hidden','false');document.body.classList.remove('locked');document.getElementById('opening')?.classList.add('hide');checkinStatus.textContent='Guest check-in hanya dapat diproses melalui Wedding Admin.';checkinGuest.hidden=true;checkinBtn.disabled=true;checkinBtn.textContent='Admin Only'}
 checkinExit?.addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.delete('checkin');location.href=u.href});
 loadCheckinMode();

 let loadingWishes=false,loadingAttendance=false;
 const isGiftMessage=m=>String(m||'').startsWith('🎁 Konfirmasi hadiah');
 async function loadAttendance(){
  if(loadingAttendance||!attendanceTotal)return; loadingAttendance=true;
  try{
   const{data,error}=await db.rpc('get_rsvp_summary');
   if(error)throw error;
   const row=Array.isArray(data)?data[0]:data;
   const people=Number(row?.attending_guests||0), confirmations=Number(row?.confirmations||0), unable=Number(row?.unable_count||0);
   attendanceTotal.textContent=people+' orang';if(attendanceConfirmed)attendanceConfirmed.textContent=confirmations;if(attendanceUnable)attendanceUnable.textContent=unable;
   attendanceNote.textContent=confirmations?'Terima kasih, konfirmasi kehadiran telah tercatat 🤍':'Belum ada konfirmasi RSVP.';
  }catch(e){attendanceTotal.textContent='—';if(attendanceConfirmed)attendanceConfirmed.textContent='—';if(attendanceUnable)attendanceUnable.textContent='—';attendanceNote.textContent='Ringkasan RSVP belum dapat dimuat.'}
  finally{loadingAttendance=false}
 }
 async function loadWishes(){
  if(loadingWishes||!wishList)return; loadingWishes=true;
  try{
   const{data,error}=await db.from('wishes').select('name,message,created_at').order('created_at',{ascending:false}).limit(30);
   if(error)throw error;
   const rows=(data||[]).filter(r=>!isGiftMessage(r.message)).slice(0,30);
   wishList.innerHTML='';
   if(!rows.length){const c=document.createElement('div');c.className='wish-card';c.innerHTML='<strong>Untuk Zaky & Agnes</strong><p>Semoga langkah baru ini selalu dipenuhi kasih, ketenangan, dan keberkahan. 🤍</p>';wishList.appendChild(c)}
   rows.forEach(r=>{const c=document.createElement('div');c.className='wish-card';const s=document.createElement('strong');s.textContent=r.name||'Tamu';const p=document.createElement('p');p.textContent=r.message||'';c.append(s,p);wishList.appendChild(c)});
  }catch(e){if(wishStatus&&!wishList.children.length)wishStatus.textContent='Ucapan belum dapat dimuat.'}finally{loadingWishes=false}
 }
 await Promise.all([loadWishes(),loadAttendance()]);

 // 9. Realtime guestbook, with timed refresh fallback if realtime is unavailable.
 try{db.channel('wishes-live-'+Math.random().toString(36).slice(2)).on('postgres_changes',{event:'INSERT',schema:'public',table:'wishes'},payload=>{if(!isGiftMessage(payload.new?.message))loadWishes()}).subscribe()}catch(e){}
 // RSVP summary uses a privacy-safe RPC; timed refresh below keeps the counters current.
 setInterval(()=>{if(document.visibilityState==='visible'){loadWishes();loadAttendance()}},45000);

 if(wishBtn)wishBtn.addEventListener('click',async()=>{
  const name=document.getElementById('wishName').value.trim(),message=document.getElementById('wishMessage').value.trim();
  if(!name||!message){wishStatus.textContent='Nama dan ucapan belum diisi 🤍';return}
  const hp=document.getElementById('zaWishWebsite');if(hp&&hp.value)return;
  let sid='';try{sid=localStorage.getItem('za-session-id-v2')||''}catch(e){}if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():'s-'+Date.now()+Math.random());try{localStorage.setItem('za-session-id-v2',sid)}catch(e){}}
  wishBtn.disabled=true;wishStatus.textContent='Mengirim ucapan…';
  try{const{data:allowed,error:rateError}=await db.rpc('allow_wedding_submission',{p_session_id:sid,p_event_kind:'wish',p_limit:4,p_window_seconds:600});if(rateError)throw rateError;if(!allowed)throw new Error('Terlalu banyak ucapan. Coba lagi beberapa menit.');const{error}=await db.from('wishes').insert([{name,message,status:'pending'}]);if(error)throw error;document.getElementById('wishName').value='';document.getElementById('wishMessage').value='';wishStatus.textContent='Terima kasih 🤍 Ucapan masuk ke tahap moderasi sebelum tampil di Guestbook.'}
  catch(e){if(!navigator.onLine){try{const q=JSON.parse(localStorage.getItem('za-ultimate-wish-outbox')||'[]');q.push({name,message,at:Date.now()});localStorage.setItem('za-ultimate-wish-outbox',JSON.stringify(q.slice(-30)));document.getElementById('wishName').value='';document.getElementById('wishMessage').value='';wishStatus.textContent='📶 Ucapan disimpan dan akan dikirim saat internet kembali.'}catch(_e){wishStatus.textContent='Ucapan belum dapat disimpan.'}}else wishStatus.textContent=String(e.message||'Ucapan belum berhasil dikirim.').replace('Error:','')}
  finally{wishBtn.disabled=false}
 });
 // 7. Gift confirmation uses the existing secured wishes insert path, but is hidden from public guestbook.
 if(giftBtn)giftBtn.addEventListener('click',async()=>{
  const name=(giftName.value||'').trim(),bank=giftBank.value;
  if(!name||!bank){giftStatus.textContent='Isi nama dan pilih rekening tujuan terlebih dahulu 🤍';return}
  giftBtn.disabled=true;giftStatus.textContent='Mencatat konfirmasi…';
  try{const message='🎁 Konfirmasi hadiah — '+bank;let sid='';try{sid=localStorage.getItem('za-session-id-v2')||''}catch(_e){}if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():'s-'+Date.now()+Math.random());try{localStorage.setItem('za-session-id-v2',sid)}catch(_e){}}const{data:allowed,error:rateError}=await db.rpc('allow_wedding_submission',{p_session_id:sid,p_event_kind:'gift',p_limit:3,p_window_seconds:600});if(rateError)throw rateError;if(!allowed)throw new Error('Terlalu banyak percobaan. Coba lagi beberapa menit.');const{error}=await db.from('wishes').insert([{name,message,status:'pending'}]);if(error)throw error;giftStatus.textContent='Terima kasih 🤍 Konfirmasi hadiah sudah tercatat.';giftBank.value=''}catch(e){const message='🎁 Konfirmasi hadiah — '+bank;if(!navigator.onLine&&window.ZAQueueSubmission){window.ZAQueueSubmission({type:'wish',payload:{name,message,status:'pending'}});giftStatus.textContent='📶 Konfirmasi disimpan dan akan dikirim saat internet kembali.';giftBank.value=''}else giftStatus.textContent=String(e.message||'Konfirmasi belum berhasil. Silakan coba lagi.')}finally{giftBtn.disabled=false}
 });

 // 8. RSVP + Wedding Pass + QR check-in code.
 if(rsvpForm){
  const editBtn=document.getElementById('editRsvpLast');
  const tokenStoreKey='za-rsvp-edit-token-v1-'+(inviteToken||guestFromUrl||'device').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,70);
  const getEditToken=()=>{try{return localStorage.getItem(tokenStoreKey)||''}catch(e){return''}};
  const setEditToken=t=>{try{if(t)localStorage.setItem(tokenStoreKey,t)}catch(e){}};
  const refreshEditBtn=()=>{if(editBtn)editBtn.hidden=!getEditToken()};refreshEditBtn();
  editBtn?.addEventListener('click',async()=>{const token=getEditToken();if(!token)return;editBtn.disabled=true;rsvpStatus.textContent='Memuat RSVP terakhir…';try{const{data,error}=await db.rpc('get_rsvp_for_edit',{p_edit_token:token});if(error)throw error;const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error('RSVP tidak ditemukan');rsvpForm.querySelector('[name=name]').value=row.name||'';rsvpForm.querySelector('[name=attendance]').value=row.attendance||'';rsvpForm.querySelector('[name=guests]').value=row.guests||1;rsvpForm.querySelector('[name=phone]').value=row.phone||'';rsvpForm.querySelector('button[type=submit]').textContent='Perbarui RSVP';rsvpStatus.textContent='Silakan ubah data lalu tekan Perbarui RSVP.';rsvpForm.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){rsvpStatus.textContent='RSVP lama belum bisa dimuat. Pastikan SQL Ultimate Final sudah dijalankan.'}finally{editBtn.disabled=false}});
  rsvpForm.addEventListener('submit',async e=>{
   e.preventDefault();const fd=new FormData(rsvpForm),name=String(fd.get('name')||'').trim(),attendance=String(fd.get('attendance')||'').trim(),phone=String(fd.get('phone')||'').replace(/[^0-9+]/g,'').trim(),guests=Number(fd.get('guests')||1);
   const siteAllowed=Math.max(1,Math.min(50,Number(window.ZA_DYNAMIC_CONTENT?.event?.max_guests||10)||10)),maxAllowed=inviteToken?Math.min(siteAllowed,Math.max(1,guestQuota)):siteAllowed;if(!name||!attendance||!Number.isInteger(guests)||guests<1||guests>maxAllowed){rsvpStatus.textContent='Mohon lengkapi data RSVP. Maksimal '+maxAllowed+' orang untuk undangan ini 🤍';return}
   const hp=document.getElementById('zaRsvpWebsite');if(hp&&hp.value)return;
   let sid='';try{sid=localStorage.getItem('za-session-id-v2')||''}catch(_e){}if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():'s-'+Date.now()+Math.random());try{localStorage.setItem('za-session-id-v2',sid)}catch(_e){}}
   const btn=rsvpForm.querySelector('button[type=submit]');btn.disabled=true;rsvpStatus.textContent=getEditToken()?'Memperbarui RSVP…':'Menyimpan RSVP…';
   const invited_to=inviteToken||guestFromUrl||null;
   try{
    if(!navigator.onLine)throw new Error('offline');
    const{data:allowed,error:rateError}=await db.rpc('allow_wedding_submission',{p_session_id:sid,p_event_kind:'rsvp',p_limit:6,p_window_seconds:600});if(rateError)throw rateError;if(!allowed)throw new Error('Terlalu banyak percobaan RSVP. Coba lagi beberapa menit.');
    const{data,error}=await db.rpc('submit_or_update_rsvp',{p_name:name,p_attendance:attendance,p_guests:guests,p_phone:phone||null,p_invited_to:invited_to,p_edit_token:getEditToken()||null});if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error('RSVP tidak tersimpan');setEditToken(row.edit_token);refreshEditBtn();
    rsvpStatus.textContent=row.is_update?'✅ RSVP berhasil diperbarui.':'✅ Kehadiran berhasil tercatat.';await loadAttendance();
    document.getElementById('receiptName').textContent=name;document.getElementById('receiptAttendance').textContent=attendance;document.getElementById('receiptGuests').textContent=guests+' orang';
    lastPass={name,attendance,guests,code:row.checkin_code,checkinPersisted:!!row.checkin_code};receipt?.classList.add('open');receipt?.setAttribute('aria-hidden','false');
    try{sessionStorage.setItem('zakyAgnesLastRSVP',JSON.stringify({...lastPass,at:Date.now()}))}catch(_e){}
    btn.textContent='Kirim RSVP';
   }catch(err){
    if(!navigator.onLine||String(err.message||'').toLowerCase().includes('offline')){try{localStorage.setItem('za-ultimate-rsvp-outbox',JSON.stringify({sid,edit_token:getEditToken()||null,name,attendance,guests,phone:phone||null,invited_to,at:Date.now()}));rsvpStatus.textContent='📶 Perubahan RSVP disimpan di perangkat dan akan disinkronkan saat internet kembali.'}catch(_e){rsvpStatus.textContent='RSVP belum dapat disimpan.'}}
    else rsvpStatus.textContent=String(err.message||'RSVP gagal dikirim.').replace('Error:','')
   }finally{btn.disabled=false}
  });
 }
 receiptClose?.addEventListener('click',()=>{receipt.classList.remove('open');receipt.setAttribute('aria-hidden','true')});
 receipt?.addEventListener('click',e=>{if(e.target===receipt){receipt.classList.remove('open');receipt.setAttribute('aria-hidden','true')}});
});
