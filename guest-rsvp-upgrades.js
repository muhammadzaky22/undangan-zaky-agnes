/* Zaky & Agnes — RSVP companion-name upgrade */
(function(){
'use strict';
const URL='https://ridrrcprspixtrbwygeo.supabase.co',KEY='sb_publishable_qPkd-UXm7X2KRA-E5a00jA_O8Ya4iSr';
const q=s=>document.querySelector(s);
let db=null,presetNames=[];
const params=new URLSearchParams(location.search),inviteToken=(params.get('guest')||'').trim(),legacyGuest=(params.get('to')||'').replace(/\+/g,' ').trim();
const tokenKey='za-rsvp-edit-token-v1-'+(inviteToken||legacyGuest||'device').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,70);
const OUTBOX='za-rsvp-companion-outbox-v1-'+(inviteToken||legacyGuest||'device').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60);
function getEditToken(){try{return localStorage.getItem(tokenKey)||''}catch(e){return''}}
function currentNames(){return [...document.querySelectorAll('#rsvpCompanionFields input')].map(x=>x.value.trim()).filter(Boolean)}
function wantedCount(){return Math.max(0,(Number(q('#rsvpForm [name=guests]')?.value)||1)-1)}
function renderNames(source){
 const host=q('#rsvpCompanionFields');if(!host)return;const count=wantedCount();const keep=Array.isArray(source)?source:currentNames();host.innerHTML='';host.hidden=count<1;if(count<1)return;
 const title=document.createElement('div');title.className='rsvp-companion-title';title.innerHTML='<b>Nama anggota yang ikut</b><span>Opsional · membantu penerimaan tamu</span>';host.appendChild(title);
 for(let i=0;i<count;i++){const wrap=document.createElement('label');wrap.className='rsvp-companion-item';wrap.innerHTML=`<span>Anggota ${i+1}</span><input type="text" maxlength="80" autocomplete="name" placeholder="Nama anggota rombongan">`;wrap.querySelector('input').value=keep[i]||presetNames[i]||'';host.appendChild(wrap)}
}
async function resolvePreset(){if(!inviteToken||!db)return;try{const {data,error}=await db.rpc('get_guest_invitation',{p_token:inviteToken});if(error)throw error;const g=Array.isArray(data)?data[0]:data;presetNames=Array.isArray(g?.companion_names)?g.companion_names.filter(Boolean):[];renderNames(presetNames)}catch(e){}}
function queueNames(names){try{localStorage.setItem(OUTBOX,JSON.stringify({names:(names||[]).slice(0,49),at:Date.now()}))}catch(e){}}
async function flush(){
 if(!navigator.onLine||!db)return;let item=null;try{item=JSON.parse(localStorage.getItem(OUTBOX)||'null')}catch(e){}if(!item)return;const edit=getEditToken();if(!edit)return;
 try{const {data,error}=await db.rpc('save_rsvp_companions',{p_edit_token:edit,p_companion_names:item.names||[]});if(error)throw error;if(data===true)try{localStorage.removeItem(OUTBOX)}catch(e){}}catch(e){}
}
async function loadSaved(){const edit=getEditToken();if(!edit||!db)return;try{const {data,error}=await db.rpc('get_rsvp_companions',{p_edit_token:edit});if(error)throw error;const names=Array.isArray(data)?data:[];renderNames(names)}catch(e){renderNames()}}
function install(){
 const form=q('#rsvpForm'),guestInput=q('#rsvpForm [name=guests]');if(!form||!guestInput)return;
 if(!q('#rsvpCompanionFields')){const host=document.createElement('div');host.id='rsvpCompanionFields';host.className='rsvp-companion-fields';host.hidden=true;guestInput.closest('.field')?.insertAdjacentElement('afterend',host)}
 if(!q('#rsvp-companion-style')){const st=document.createElement('style');st.id='rsvp-companion-style';st.textContent='.rsvp-companion-fields{display:grid;gap:8px;margin:4px 0 12px;padding:12px;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:rgba(255,255,255,.06)}.rsvp-companion-fields[hidden]{display:none}.rsvp-companion-title{display:flex;justify-content:space-between;gap:8px;align-items:end}.rsvp-companion-title b{font-size:12px}.rsvp-companion-title span{font-size:8px;opacity:.65;text-align:right}.rsvp-companion-item{display:grid;grid-template-columns:70px 1fr;align-items:center;gap:8px}.rsvp-companion-item span{font-size:9px;opacity:.72}.rsvp-companion-item input{width:100%;border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:10px 11px;background:rgba(255,255,255,.08);color:inherit;font:inherit}@media(max-width:480px){.rsvp-companion-title{display:block}.rsvp-companion-title span{display:block;text-align:left;margin-top:3px}.rsvp-companion-item{grid-template-columns:1fr}.rsvp-companion-item span{margin-bottom:-4px}}';document.head.appendChild(st)}
 if(window.supabase)db=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 guestInput.addEventListener('input',()=>renderNames());guestInput.addEventListener('change',()=>renderNames());
 form.addEventListener('submit',()=>{queueNames(currentNames());setTimeout(flush,500);setTimeout(flush,1600);setTimeout(flush,3500)},true);
 q('#editRsvpLast')?.addEventListener('click',()=>setTimeout(loadSaved,650));addEventListener('online',()=>setTimeout(flush,1000));
 resolvePreset();renderNames();setTimeout(flush,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
