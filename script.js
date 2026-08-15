const target=new Date("2027-02-07T08:00:00+08:00").getTime();
function tick(){let x=Math.max(0,target-Date.now());document.querySelector("#d").textContent=Math.floor(x/86400000);document.querySelector("#h").textContent=String(Math.floor(x%86400000/3600000)).padStart(2,"0");document.querySelector("#m").textContent=String(Math.floor(x%3600000/60000)).padStart(2,"0");document.querySelector("#s").textContent=String(Math.floor(x%60000/1000)).padStart(2,"0")}tick();setInterval(tick,1000);

const params=new URLSearchParams(location.search), to=params.get("to");
if(to)document.querySelector("#guestName").textContent=decodeURIComponent(to.replace(/\+/g," "));
function bukaUndangan(){const cover=document.getElementById("cover");const site=document.getElementById("site");if(cover)cover.remove();if(site)site.classList.remove("hidden");document.body.style.overflow="auto";window.scrollTo(0,0)}
const song="https://www.youtube.com/watch?v=R1zjcsKfZAg";
document.querySelector("#songBtn").onclick=()=>window.open(song,"_blank");
document.querySelector("#musicBtn").onclick=()=>window.open(song,"_blank");

const wa="6280000000000";
const guest=to?decodeURIComponent(to.replace(/\+/g," ")):"";
document.querySelector("#waBtn").href=`https://wa.me/${wa}?text=${encodeURIComponent("Assalamu'alaikum, saya "+guest+" ingin mengonfirmasi kehadiran di acara pernikahan Zaky & Agnes pada 7 Februari 2027.")}`;
