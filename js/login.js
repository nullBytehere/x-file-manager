// js/login.js — splash screen, sign-in, sessions and access rules. Users come from js/auth.js.
// This is the last file loaded: boot() at the bottom starts the whole app.

/* ---------- auth: splash, login, access control ---------- */
const A=typeof AUTH!=='undefined'?AUTH:{users:[]};
const splash={hide(){$('#splash').classList.add('out')},show(m){$('#spmsg').textContent=m||'Loading…';$('#splash').classList.remove('out')}};
const SKEY='fm-session',te=new TextEncoder(),IT=()=>A.iterations||600000;
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const fromHex=h=>Uint8Array.from(h.match(/../g)||[],x=>parseInt(x,16));
const b64=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
const tob64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const same=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0};
const sha=async(tag,k)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array([...te.encode(tag),...k])));
async function stretch(pw,salt){
  const key=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:te.encode(salt),iterations:IT(),hash:'SHA-256'},key,256));
}
/* K is the secret key made from the password. js/auth.js only holds sha256("verify|"+K), so a session
   (which stores K) can't be forged from the public file, and the vault key is derived from K too. */
async function unlock(u,K){
  if(!same(hex(await sha('verify|',K)),u.verify))return null;
  let token='';
  if(u.vault){
    try{
      const key=await crypto.subtle.importKey('raw',await sha('vault|',K),'AES-GCM',false,['decrypt']);
      token=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(u.iv)},key,b64(u.vault)));
    }catch{return null}
  }
  return{user:u,token,K};
}
async function tryLogin(name,pw){
  const u=(A.users||[]).find(x=>x.username.toLowerCase()===name.toLowerCase());
  if(!u){await stretch(pw,'dummy-salt');return null}
  return unlock(u,await stretch(pw,u.salt));
}
window.makeUser=async(name,pw,opt={})=>{
  const salt=hex(crypto.getRandomValues(new Uint8Array(16))),K=await stretch(pw,salt);
  const u={username:name,salt,verify:hex(await sha('verify|',K))};
  if(opt.token){
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await crypto.subtle.importKey('raw',await sha('vault|',K),'AES-GCM',false,['encrypt']);
    u.iv=tob64(iv);u.vault=tob64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(opt.token)));
  }
  u.folders=opt.folders||{allow:'*',deny:[]};u.files=opt.files||{allow:'*',deny:[]};
  const out=JSON.stringify(u,null,4);console.log(out);return out;
};
function saveSession(r,remember){
  const d=JSON.stringify({u:r.user.username,k:hex(r.K),m:remember?1:0,e:Date.now()+(A.sessionDays||7)*864e5});
  try{(remember?localStorage:sessionStorage).setItem(SKEY,d);(remember?sessionStorage:localStorage).removeItem(SKEY)}catch{}
}
async function restoreSession(){
  for(const S of[sessionStorage,localStorage]){
    try{
      const d=JSON.parse(S.getItem(SKEY)||'null');if(!d)continue;
      const u=(A.users||[]).find(x=>x.username===d.u);
      const r=u&&d.e>Date.now()&&/^[0-9a-f]{64}$/.test(d.k||'')?await unlock(u,fromHex(d.k)):null;
      if(r){st.token=r.token;st.remember=!!d.m;return u}
      S.removeItem(SKEY);
    }catch{}
  }
  return null;
}
function watchIdle(){
  const m=A.idleMinutes||0;if(!m||st.remember)return;
  let t;const bump=()=>{clearTimeout(t);t=setTimeout(logout,m*6e4)};
  ['pointerdown','keydown','scroll','touchstart'].forEach(ev=>addEventListener(ev,bump,{passive:true}));bump();
}
function logout(){try{sessionStorage.removeItem(SKEY);localStorage.removeItem(SKEY)}catch{}location.hash='';location.reload()}
const lockInfo=()=>{try{return JSON.parse(localStorage.getItem('fm-lock')||'{}')}catch{return{}}};
const lockLeft=()=>Math.max(0,Math.ceil(((lockInfo().until||0)-Date.now())/1000));
function failed(){try{const d=lockInfo();d.n=(d.n||0)+1;if(d.n>=5)d.until=Date.now()+Math.min(300,30*(d.n-4))*1000;localStorage.setItem('fm-lock',JSON.stringify(d))}catch{}}
function loginScreen(){
  return new Promise(res=>{
    const box=$('#login'),err=$('#lerr'),go=$('#lgo'),pw=$('#lp'),eye=$('#lpe');
    const paintEye=()=>{eye.innerHTML=I(pw.type==='password'?'eye':'eyeoff')};
    paintEye();eye.onclick=()=>{pw.type=pw.type==='password'?'text':'password';paintEye()};
    box.hidden=false;
    if(!(window.crypto&&crypto.subtle))err.textContent='Secure sign-in needs HTTPS (GitHub Pages) or localhost.';
    else if(!(A.users||[]).length)err.textContent='No users found. Add users in js/auth.js.';
    $('#lform').onsubmit=async e=>{
      e.preventDefault();
      if(!(window.crypto&&crypto.subtle))return;
      const w=lockLeft();
      if(w>0){err.textContent=`Too many attempts. Try again in ${w}s.`;return}
      go.disabled=true;go.textContent='Checking…';err.textContent='';
      const r=await tryLogin($('#lu').value.trim(),pw.value);
      go.disabled=false;go.textContent='Sign in';
      if(!r){failed();const l=lockLeft();err.textContent=l>0?`Too many attempts. Try again in ${l}s.`:'Wrong username or password.';pw.value='';pw.focus();return}
      try{localStorage.removeItem('fm-lock')}catch{}
      st.token=r.token;st.remember=$('#lr').checked;saveSession(r,st.remember);
      box.hidden=true;pw.value='';res(r.user);
    };
    $('#lu').focus();
  });
}
/* access rules */
const glob=(p,x)=>new RegExp('^'+String(p).replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$','i').test(x);
const trimS=r=>String(r).replace(/^\/+|\/+$/g,'');
function hit(rule,path){
  rule=trimS(rule);const segs=path.split('/');
  return rule.includes('/')?glob(rule,segs.slice(0,rule.split('/').length).join('/')):segs.some(x=>glob(rule,x));
}
const anc=(path,r)=>trimS(r).toLowerCase().startsWith(path.toLowerCase()+'/');
function access(path){ // 0 = hidden, 1 = pass-through only, 2 = full
  const u=st.user;if(!u)return 0;
  const F=u.folders||{};
  if((F.deny||[]).some(r=>hit(r,path)))return 0;
  if(!F.allow||F.allow==='*'||F.allow.some(r=>hit(r,path)))return 2;
  return F.allow.some(r=>anc(path,r))?1:0;
}
function fileOK(it){
  const R=st.user.files||{};
  const m=p=>p==='@images'?kind(it.name)==='image':p==='@videos'?kind(it.name)==='video':glob(p,String(p).includes('/')?it.path:it.name);
  if((R.deny||[]).some(m))return false;
  return !R.allow||R.allow==='*'||R.allow.some(m);
}
const roots=()=>(C.customFolders||[]).filter(f=>access(f)>0);
async function startApp(u){
  st.user=u;buildNav();watchIdle();
  const F=u.folders||{},R=u.files||{};
  const limited=(F.allow&&F.allow!=='*')||(F.deny||[]).length||(R.allow&&R.allow!=='*')||(R.deny||[]).length;
  $('#who').textContent=u.username;$('#av').textContent=u.username[0].toUpperCase();
  $('#role').textContent=limited?'Limited access':'Full access';
  $('#out').innerHTML=I('logout');$('#out').onclick=logout;$('#sbf').hidden=false;
  await render();
}
const loaded=new Promise(r=>{
  if(document.readyState==='complete')r();
  else{addEventListener('load',()=>r(),{once:true});setTimeout(r,12000)} // watchdog only for a stalled request
});
async function boot(){
  addEventListener('storage',e=>{if(e.key===SKEY&&!e.newValue&&st.user)location.reload()});
  try{
    await loaded;
    let u=await restoreSession();
    if(!u){const p=loginScreen();splash.hide();u=await p;splash.show('Opening your files…')}
    await startApp(u);
  }catch(e){console.error(e)}
  splash.hide();
}

boot();
