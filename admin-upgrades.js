/* Zaky & Agnes — Admin Upgrades 2026-08-21
   Features: full backup/restore, companion names, WhatsApp templates,
   guest funnel, smart reminder filters, and idle session lock. */
(function(){
'use strict';
const q=s=>document.querySelector(s);
const qa=s=>[...document.querySelectorAll(s)];
const esc2=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let SMART_GUEST_FILTER='all';
let WA_TEMPLATES=[];
const DEFAULT_WA_TEMPLATES=[
 {id:'general',name:'Umum',category:'',body:"Assalamu'alaikum {nama} 🤍\n\nDengan hormat, kami mengundang {nama} untuk hadir di pernikahan Zaky & Agnes pada {tanggal} di {lokasi}.\n\nUndangan pribadi:\n{link}\n\nKuota undangan: {kuota} orang. Mohon konfirmasi melalui RSVP. Terima kasih atas doa dan kehadirannya. 🤍"},
 {id:'keluarga',name:'Keluarga',category:'Keluarga',body:"Assalamu'alaikum {nama} 🤍\n\nDengan penuh rasa syukur, kami mengundang keluarga tercinta untuk hadir dan memberikan doa restu pada pernikahan Zaky & Agnes, {tanggal}, di {lokasi}.\n\nUndangan pribadi:\n{link}\n\nKami sangat menantikan kebersamaan keluarga di hari bahagia kami. 🤍"},
 {id:'teman',name:'Teman',category:'Teman',body:"Halo {nama} 🤍\n\nKami mau berbagi kabar bahagia! Zaky & Agnes akan menikah pada {tanggal} di {lokasi}. Kami senang banget kalau kamu bisa hadir.\n\nUndanganmu:\n{link}\n\nJangan lupa isi RSVP yaa 🤍"},
 {id:'kantor',name:'Kantor',category:'Kantor',body:"Yth. {nama},\n\nDengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan Zaky & Agnes pada {tanggal} di {lokasi}.\n\nDetail undangan:\n{link}\n\nTerima kasih atas perhatian dan doa restunya."},
 {id:'vip',name:'VIP',category:'VIP',body:"Yth. {nama},\n\nMerupakan kehormatan bagi kami apabila Bapak/Ibu berkenan hadir pada pernikahan Zaky & Agnes, {tanggal}, bertempat di {lokasi}.\n\nUndangan personal:\n{link}\n\nDengan hormat dan penuh rasa syukur, kami menantikan kehadiran Bapak/Ibu."},
 {id:'reminder',name:'Reminder RSVP',category:'',body:"Halo {nama} 🤍\n\nKami mengingatkan kembali undangan pernikahan Zaky & Agnes pada {tanggal} di {lokasi}. Jika berkenan, mohon konfirmasi kehadiran melalui RSVP pada link pribadi berikut:\n{link}\n\nTerima kasih 🤍"}
];
function uid(){return 'tpl-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function validTemplates(v){return Array.isArray(v)&&v.length?v.filter(x=>x&&x.id&&x.name&&x.body):DEFAULT_WA_TEMPLATES.map(x=>({...x}))}
function eventBits(){
 const c=typeof currentContent==='function'?currentContent():{};const ev=c.event||{};
 let tanggal='7 Februari 2027';try{if(ev.date)tanggal=new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Makassar'}).format(new Date(ev.date+'T12:00:00+08:00'))}catch(e){}
 const lokasi=[ev.venue_name,ev.venue_area].filter(Boolean).join(', ')||'Gas Alam Badak 1, Muara Badak';
 return {tanggal,lokasi};
}
function templateForGuest(g,selectedId){
 if(selectedId){const t=WA_TEMPLATES.find(x=>x.id===selectedId);if(t)return t}
 const cat=String(g?.category||'').toLowerCase();
 const matched=WA_TEMPLATES.find(t=>t.category&&cat.includes(String(t.category).toLowerCase()));
 return matched||WA_TEMPLATES[0]||DEFAULT_WA_TEMPLATES[0];
}
function applyTemplate(g,t){
 const {tanggal,lokasi}=eventBits();const map={
  '{nama}':typeof guestDisplayName==='function'?guestDisplayName(g):(g?.name||'Tamu'),
  '{tanggal}':tanggal,'{lokasi}':lokasi,
  '{link}':typeof guestPersonalUrl==='function'?guestPersonalUrl(g):'https://zakyagnes.my.id/',
  '{kuota}':String(g?.max_guests||1)
 };
 let out=String(t?.body||'');Object.entries(map).forEach(([k,v])=>out=out.split(k).join(v));return out;
}
function loadWaFromSettings(){
 WA_TEMPLATES=validTemplates(SITE_SETTINGS?.wa_templates);
 renderTemplateControls();
}
function renderTemplateControls(){
 const sel=q('#reminderTemplate');if(!sel)return;
 const old=sel.value;sel.innerHTML=WA_TEMPLATES.map(t=>`<option value="${esc2(t.id)}">${esc2(t.name)}</option>`).join('');
 if(WA_TEMPLATES.some(t=>t.id===old))sel.value=old;else if(WA_TEMPLATES.length)sel.value=WA_TEMPLATES[0].id;
 fillTemplateEditor();renderRemindersEnhanced();
}
function fillTemplateEditor(){
 const sel=q('#reminderTemplate'),t=WA_TEMPLATES.find(x=>x.id===sel?.value)||WA_TEMPLATES[0];if(!t)return;
 q('#waTemplateName')&&(q('#waTemplateName').value=t.name||'');q('#waTemplateCategory')&&(q('#waTemplateCategory').value=t.category||'');q('#waTemplateBody')&&(q('#waTemplateBody').value=t.body||'');
 renderTemplatePreview();
}
function renderTemplatePreview(){
 const host=q('#waTemplatePreview'),sel=q('#reminderTemplate');if(!host)return;const t=WA_TEMPLATES.find(x=>x.id===sel?.value)||WA_TEMPLATES[0];
 const demo={name:'Andi & Keluarga',salutation:'Bapak',max_guests:4,token:'contoh',category:'Keluarga'};host.textContent=t?applyTemplate(demo,t):'Belum ada template.';
}
async function persistTemplates(){
 if(!navigator.onLine)throw new Error('Perlu internet.');if(!(await checkAdmin()))throw new Error('Sesi admin tidak valid.');
 const {error}=await db.from('wedding_site_settings').upsert([{key:'wa_templates',value:WA_TEMPLATES,updated_at:new Date().toISOString()}],{onConflict:'key'});if(error)throw error;SITE_SETTINGS.wa_templates=WA_TEMPLATES;
}
async function saveTemplate(){
 const st=q('#waTemplateStatus'),sel=q('#reminderTemplate');try{st.textContent='Menyimpan template…';const name=q('#waTemplateName').value.trim(),body=q('#waTemplateBody').value.trim();if(!name||!body)throw new Error('Nama dan isi template wajib diisi.');
  const id=sel.value||uid();let t=WA_TEMPLATES.find(x=>x.id===id);if(t){t.name=name;t.category=q('#waTemplateCategory').value.trim();t.body=body}else WA_TEMPLATES.push({id,name,category:q('#waTemplateCategory').value.trim(),body});
  await persistTemplates();renderTemplateControls();sel.value=id;fillTemplateEditor();st.textContent='✓ Template WhatsApp tersimpan.';
 }catch(e){st.textContent='Gagal: '+(e?.message||e)}
}
async function deleteTemplate(){
 const st=q('#waTemplateStatus'),sel=q('#reminderTemplate');if(WA_TEMPLATES.length<=1){st.textContent='Minimal satu template harus tersedia.';return}if(!confirm('Hapus template ini?'))return;
 try{WA_TEMPLATES=WA_TEMPLATES.filter(x=>x.id!==sel.value);await persistTemplates();renderTemplateControls();st.textContent='✓ Template dihapus.'}catch(e){st.textContent='Gagal: '+(e?.message||e)}
}
function guestMatchesSmart(g,filter){
 const state=guestState(g),r=guestLatestRsvp(g),att=String(r?.attendance||'').toLowerCase();
 if(filter==='all')return true;if(filter==='not_sent')return state==='not_sent';if(filter==='not_opened')return !(g.first_opened_at||Number(g.open_count)>0);
 if(filter==='not_rsvp')return !r;if(filter==='rsvp')return !!r;if(filter==='attending')return !!r&&att.includes('hadir')&&!att.includes('tidak');return true;
}
function renderFunnel(){
 const host=q('#guestFunnel');if(!host||typeof GUESTS==='undefined')return;const total=GUESTS.length,sent=GUESTS.filter(g=>g.sent_at||g.status==='sent').length,opened=GUESTS.filter(g=>g.first_opened_at||Number(g.open_count)>0).length,rsvp=GUESTS.filter(g=>!!guestLatestRsvp(g)).length,att=GUESTS.filter(g=>{const r=guestLatestRsvp(g),a=String(r?.attendance||'').toLowerCase();return r&&a.includes('hadir')&&!a.includes('tidak')}).length;
 const arr=[['Terdaftar',total],['Dikirim',sent],['Dibuka',opened],['RSVP',rsvp],['Akan Hadir',att]];host.innerHTML=arr.map((x,i)=>`<div class="funnel-step"><b>${x[1]}</b><span>${x[0]}</span>${i<arr.length-1?`<div class="funnel-arrow">${total?Math.round((arr[i+1][1]/Math.max(1,x[1]))*100):0}% →</div>`:''}</div>`).join('');
 const people=GUESTS.map(guestLatestRsvp).filter(Boolean).filter(r=>{const a=String(r.attendance||'').toLowerCase();return a.includes('hadir')&&!a.includes('tidak')}).reduce((n,r)=>n+(Number(r.guests)||1),0);q('#guestFunnelNote')&&(q('#guestFunnelNote').textContent=`${att} undangan mengonfirmasi hadir · sekitar ${people} orang akan hadir berdasarkan RSVP.`);
}
function renderGuestsEnhanced(){
 renderGuestFilters();const text=String(q('#guestSearch')?.value||'').toLowerCase(),cat=q('#guestFilterCategory')?.value||'',sf=q('#guestFilterStatus')?.value||'';
 const rows=GUESTS.filter(g=>{const hay=[g.name,g.salutation,g.phone,g.category,g.notes,...(g.companion_names||[])].join(' ').toLowerCase(),state=guestState(g);return(!text||hay.includes(text))&&(!cat||g.category===cat)&&(!sf||state===sf)&&guestMatchesSmart(g,SMART_GUEST_FILTER)});
 const sent=GUESTS.filter(g=>g.sent_at||g.status==='sent').length,opened=GUESTS.filter(g=>g.first_opened_at||Number(g.open_count)>0).length,rsvp=GUESTS.filter(g=>!!guestLatestRsvp(g)).length;q('#guestCount')&&(q('#guestCount').textContent=GUESTS.length+' tamu');const gs=q('#guestStats');if(gs)gs.innerHTML=[['Total',GUESTS.length],['Dikirim',sent],['Dibuka',opened],['RSVP',rsvp]].map(x=>`<div class="guest-mini-stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');
 const body=q('#guestRows');if(body)body.innerHTML=rows.map(g=>{const state=guestState(g),r=guestLatestRsvp(g),display=guestDisplayName(g),members=(g.companion_names||[]);return `<tr><td><b>${esc2(display)}</b><br><small>${esc2(g.phone||'-')}</small><br><span class="guest-link-code">${esc2(g.token||'')}</span></td><td>${esc2(g.category||'-')}</td><td>${esc2(g.max_guests||1)} orang${members.length?`<div class="companion-mini">${members.map(esc2).join(' · ')}</div>`:''}</td><td><span class="guest-status ${state}">${guestStateLabel(state)}</span></td><td>${g.last_opened_at?fmt(g.last_opened_at):'-'}${Number(g.open_count)>1?`<br><small>${Number(g.open_count)}× dibuka</small>`:''}</td><td class="guest-rsvp-cell">${r?`${esc2(r.attendance||'-')}<small>${esc2(r.guests||1)} orang · ${fmt(r.updated_at||r.created_at)}</small>${(r.companion_names||[]).length?`<small>${(r.companion_names||[]).map(esc2).join(' · ')}</small>`:''}`:'Belum'}</td><td><div class="guest-actions"><button data-guest-action="copy" data-id="${esc2(g.id)}">Copy Link</button><button class="primary-mini" data-guest-action="wa" data-id="${esc2(g.id)}">WhatsApp</button><button data-guest-action="qr" data-id="${esc2(g.id)}">QR</button><button data-guest-action="edit" data-id="${esc2(g.id)}">Edit</button><button class="danger-mini" data-guest-action="delete" data-id="${esc2(g.id)}">Hapus</button></div></td></tr>`}).join('')||'<tr><td colspan="7" class="muted">Belum ada tamu yang cocok dengan filter.</td></tr>';
 renderFunnel();
}
function renderRemindersEnhanced(){
 const body=q('#reminderRows');if(!body||typeof GUESTS==='undefined')return;const search=String(q('#reminderSearch')?.value||'').toLowerCase(),filter=q('#reminderSmartFilter')?.value||'not_rsvp',tid=q('#reminderTemplate')?.value||'';
 const rows=GUESTS.filter(g=>g.phone&&guestMatchesSmart(g,filter)&&(!search||[g.name,g.phone,g.category].join(' ').toLowerCase().includes(search)));
 body.innerHTML=rows.map(g=>{const r=guestLatestRsvp(g),st=guestStateLabel(guestState(g));return `<tr><td>${esc2(guestDisplayName(g))}</td><td>${esc2(g.phone)}</td><td>${esc2(st)}</td><td>${r?esc2(r.attendance||'-'):'Belum'}</td><td><button class="primary-mini" data-reminder-wa="${esc2(g.id)}" data-template="${esc2(tid)}">Buka WhatsApp</button></td></tr>`}).join('')||'<tr><td colspan="5" class="muted">Tidak ada tamu dengan nomor WhatsApp pada filter ini.</td></tr>';
 renderTemplatePreview();
}
// Rebind functions used by later dynamic calls.
try{renderGuests=renderGuestsEnhanced}catch(e){}
try{renderReminders=renderRemindersEnhanced}catch(e){}
try{guestWaText=(g)=>applyTemplate(g,templateForGuest(g))}catch(e){}
try{
 const oldHandle=handleGuestAction;
 handleGuestAction=async function(action,id){
  if(action!=='wa')return oldHandle(action,id);const g=GUESTS.find(x=>String(x.id)===String(id));if(!g)return;if(!g.phone){fillGuestForm(g);q('#guestFormStatus').textContent='Isi nomor WhatsApp tamu ini terlebih dahulu.';return}
  const t=templateForGuest(g),url='https://wa.me/'+normPhone(g.phone)+'?text='+encodeURIComponent(applyTemplate(g,t));window.open(url,'_blank','noopener');await markGuestSent(g);
 }
}catch(e){}
// Ensure templates load after settings load.
try{const oldLoadSettings=loadSiteSettings;loadSiteSettings=async function(){const r=await oldLoadSettings();loadWaFromSettings();return r}}catch(e){}
try{const oldLoadGuests=loadGuests;loadGuests=async function(){const r=await oldLoadGuests();renderGuestsEnhanced();renderRemindersEnhanced();return r}}catch(e){}

async function buildFullBackup(){
 if(!navigator.onLine)throw new Error('Backup penuh memerlukan internet.');if(!(await checkAdmin()))throw new Error('Sesi admin tidak valid.');
 const {data:settings,error}=await db.from('wedding_site_settings').select('key,value,updated_at').order('key');if(error)throw error;
 return {format:'zaky-agnes-admin-backup',version:3,exported_at:new Date().toISOString(),domain:'zakyagnes.my.id',settings:settings||[],guests:GUESTS||[],rsvps:DATA.rsvps||[],wishes:DATA.wishes||[],guest_photos:DATA.photos||[],analytics:DATA.events||[],notes:'Restore bawaan mengembalikan konfigurasi dan daftar tamu. Data RSVP/ucapan/analytics disertakan sebagai arsip agar tidak terduplikasi saat restore.'};
}
async function doFullBackup(){const st=q('#backupRestoreStatus');try{st.textContent='Menyiapkan backup lengkap…';const b=await buildFullBackup();download('zaky-agnes-backup-lengkap-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(b,null,2),'application/json');st.textContent='✓ Backup lengkap berhasil dibuat.'}catch(e){st.textContent='Backup gagal: '+(e?.message||e)}}
async function doRestore(){
 const st=q('#backupRestoreStatus'),f=q('#restoreFullFile')?.files?.[0];if(!f){st.textContent='Pilih file backup JSON terlebih dahulu.';return}
 try{const obj=JSON.parse(await f.text());if(obj.format!=='zaky-agnes-admin-backup'||!Array.isArray(obj.settings)||!Array.isArray(obj.guests))throw new Error('Format backup tidak dikenali.');if(!confirm('Restore akan menimpa konfigurasi website yang aktif dan memperbarui daftar tamu. Lanjutkan?'))return;if(!(await checkAdmin()))throw new Error('Sesi admin tidak valid.');st.textContent='Memulihkan konfigurasi…';
  const now=new Date().toISOString(),settings=obj.settings.map(x=>({key:x.key,value:x.value,updated_at:now}));for(let i=0;i<settings.length;i+=100){const {error}=await db.from('wedding_site_settings').upsert(settings.slice(i,i+100),{onConflict:'key'});if(error)throw error}
  for(let i=0;i<obj.guests.length;i+=100){const chunk=obj.guests.slice(i,i+100).map(g=>({...g,updated_at:now}));const {error}=await db.from('wedding_guests').upsert(chunk,{onConflict:'id'});if(error)throw error}
  await loadSiteSettings();await loadGuests();st.textContent='✓ Restore konfigurasi + daftar tamu selesai. RSVP/ucapan lama tidak diduplikasi.';
 }catch(e){st.textContent='Restore gagal: '+(e?.message||e)}
}

// Idle-session security: 30 minutes while online. Offline check-in remains usable.
const IDLE_MS=30*60*1000;let lastActive=Date.now(),idleTimer=null;
function touch(){lastActive=Date.now();try{sessionStorage.setItem('za-admin-last-active',String(lastActive))}catch(e){}}
async function lockAdmin(reason){
 if(!navigator.onLine)return;try{await db.auth.signOut()}catch(e){};try{sessionStorage.removeItem('za-admin-last-active')}catch(e){};const st=q('#loginStatus');if(st)st.textContent=reason||'Sesi admin dikunci.';location.reload();
}
function startIdleGuard(){
 ['pointerdown','keydown','touchstart','scroll'].forEach(ev=>addEventListener(ev,touch,{passive:true}));touch();clearInterval(idleTimer);idleTimer=setInterval(()=>{if(navigator.onLine&&!q('#app')?.hidden&&Date.now()-lastActive>IDLE_MS)lockAdmin('Sesi berakhir karena tidak ada aktivitas selama 30 menit.')},60000);
 try{db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'&&!q('#app')?.hidden)location.reload();if(session)touch()})}catch(e){}
}
function clearLocalAdmin(){if(!confirm('Hapus snapshot, roster offline, dan antrean check-in yang tersimpan di HP ini?'))return;[AUTOBACK,ROSTER,CHECKIN_Q,OFFLINE_OK].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});q('#securityStatus').textContent='✓ Data admin lokal di HP ini telah dihapus.';try{updateOfflineStatus()}catch(e){}}

function bind(){
 q('#backupFull')?.addEventListener('click',doFullBackup);q('#restoreFull')?.addEventListener('click',doRestore);
 q('#smartGuestFilters')?.addEventListener('click',e=>{const b=e.target.closest('[data-smart]');if(!b)return;SMART_GUEST_FILTER=b.dataset.smart||'all';qa('#smartGuestFilters [data-smart]').forEach(x=>x.classList.toggle('on',x===b));renderGuestsEnhanced()});
 q('#guestSearch')?.addEventListener('input',renderGuestsEnhanced);q('#guestFilterCategory')?.addEventListener('change',renderGuestsEnhanced);q('#guestFilterStatus')?.addEventListener('change',renderGuestsEnhanced);
 q('#reminderTemplate')?.addEventListener('change',()=>{fillTemplateEditor();renderRemindersEnhanced()});q('#reminderSmartFilter')?.addEventListener('change',renderRemindersEnhanced);q('#reminderSearch')?.addEventListener('input',renderRemindersEnhanced);
 q('#saveWaTemplate')?.addEventListener('click',saveTemplate);q('#newWaTemplate')?.addEventListener('click',()=>{const t={id:uid(),name:'Template Baru',category:'',body:DEFAULT_WA_TEMPLATES[0].body};WA_TEMPLATES.push(t);renderTemplateControls();q('#reminderTemplate').value=t.id;fillTemplateEditor();q('#waTemplateStatus').textContent='Edit template lalu tekan Simpan Template.'});q('#deleteWaTemplate')?.addEventListener('click',deleteTemplate);
 q('#reminderRows')?.addEventListener('click',async e=>{const b=e.target.closest('[data-reminder-wa]');if(!b)return;const g=GUESTS.find(x=>String(x.id)===String(b.dataset.reminderWa));if(!g||!g.phone)return;const t=templateForGuest(g,b.dataset.template);window.open('https://wa.me/'+normPhone(g.phone)+'?text='+encodeURIComponent(applyTemplate(g,t)),'_blank','noopener');if(!g.sent_at)await markGuestSent(g)});
 q('#lockAdminNow')?.addEventListener('click',()=>lockAdmin('Admin dikunci manual.'));q('#clearAdminLocal')?.addEventListener('click',clearLocalAdmin);
 loadWaFromSettings();renderFunnel();renderRemindersEnhanced();startIdleGuard();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
