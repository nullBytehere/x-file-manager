// js/ui.js — everything you see and touch: helpers, icons, theme, sidebar, thumbnails,
// sort/filter, file grid, lightbox, image zoom and the video player. Loaded first.

const $=s=>document.querySelector(s);
const P={
  folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  video:'<path d="M23 7l-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  play:'<path d="M7 4v16l13-8z"/>',
  home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  left:'<path d="M15 18l-6-6 6-6"/>',
  right:'<path d="M9 18l6-6-6-6"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  full:'<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  crop:'<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  pause:'<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
  vol:'<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  mute:'<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M23 9l-6 6M17 9l6 6"/>',
  ccw:'<path d="M1 4v6h6"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>',
  cw:'<path d="M23 4v6h-6"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/>',
  pip:'<path d="M21 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><rect x="12" y="12" width="10" height="8" rx="1"/>',
  layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22"/>'
};
const I=n=>`<svg viewBox="0 0 24 24">${P[n]}</svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
const ext=n=>n.includes('.')?n.split('.').pop().toLowerCase():'';
const IMG=new Set(['jpg','jpeg','jfif','png','gif','webp','avif','svg','bmp','ico']);
const VID=new Set(['mp4','webm','mov','m4v','ogv']);
const kind=n=>IMG.has(ext(n))?'image':VID.has(ext(n))?'video':'file';
const size=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';
const url=it=>it.download_url||enc(it.path);
const alt=it=>enc(it.path);
/* small, fast WebP thumbnails through a free resize CDN (public repos only; originals stay for the lightbox) */
function thumb(it,w,h,fit='inside',a='center'){
  const u=url(it);
  if(C.optimizeThumbnails===false||st.token||kind(it.name)!=='image'||ext(it.name)==='svg'||!/^https:\/\/raw\.githubusercontent\.com\//.test(u))return u;
  return`https://wsrv.nl/?url=${encodeURIComponent(u)}&w=${w}&h=${h}&fit=${fit}${fit==='cover'?'&a='+a:''}&we=1&output=webp&q=72`;
}

const view=$('#view'),st={items:[],media:[],lb:-1,req:0,path:''};

/* static chrome */
document.title='File Manager & Gallery';
$('#site').textContent='File Manager';
$('#tg').innerHTML=I('left');
$('#homeBtn').innerHTML=I('home')+'<span>Home</span>';
$('.search').insertAdjacentHTML('beforeend',I('search'));
$('#lbx').innerHTML=I('x');$('#pv').innerHTML=I('left');$('#nx').innerHTML=I('right');
function buildNav(){
  $('#nav').innerHTML=`<a href="#/" data-r="">${I('home')}<span>Home</span></a>`+
    roots().map(f=>`<a href="#/${enc(f)}" data-r="${esc(f)}">${I('folder')}<span>${esc(f)}</span></a>`).join('');
}
const store={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
const root=document.documentElement,mob=()=>innerWidth<=900;
function setTheme(t){root.dataset.theme=t;$('#theme').innerHTML=I(t==='dark'?'sun':'moon');$('#theme').title=t==='dark'?'Switch to light mode':'Switch to dark mode'}
setTheme(root.dataset.theme||'light');
$('#theme').onclick=()=>{const t=root.dataset.theme==='dark'?'light':'dark';setTheme(t);store.set('fm-theme',t)};
if(!mob()&&store.get('fm-sidebar')==='closed')document.body.classList.add('col');
$('#tg').onclick=()=>{const b=document.body.classList;if(mob())b.toggle('open');else{b.toggle('col');store.set('fm-sidebar',b.contains('col')?'closed':'open')}};
const closeNav=()=>document.body.classList.remove('open');
$('#scrim').onclick=closeNav;
$('#sbx').innerHTML=I('x');$('#sbx').onclick=closeNav;
$('#nav').addEventListener('click',e=>{if(e.target.closest('a'))closeNav()});
function setFit(f){document.body.classList.toggle('fill',f==='fill');$('#fit').innerHTML=I(f==='fill'?'full':'crop');$('#fit').title=f==='fill'?'Show full images':'Fill thumbnails (top part)'}
setFit(store.get('fm-fit')||'full');
$('#fit').onclick=()=>{const f=document.body.classList.contains('fill')?'full':'fill';setFit(f);store.set('fm-fit',f)};
let folderThumbs=store.get('fm-fthumb')==='on';
function setFth(){
  $('#fth').innerHTML=I(folderThumbs?'folder':'layout');
  $('#fth').title=folderThumbs?'Show folder icons':'Show folder thumbnails from their contents';
  $('#fth').setAttribute('aria-pressed',folderThumbs);
}
setFth();
$('#fth').onclick=()=>{folderThumbs=!folderThumbs;store.set('fm-fthumb',folderThumbs?'on':'off');setFth();if(view.querySelector('.grid'))draw()};
st.filter='all';st.sort=store.get('fm-sort')||'name-asc';
let hoverOn=store.get('fm-hover')!=='off';
const canHover=matchMedia('(hover:hover)').matches;
$('#sort').value=st.sort;
if($('#sort').value!==st.sort){st.sort='name-asc';$('#sort').value=st.sort}
$('#sort').onchange=e=>{st.sort=e.target.value;store.set('fm-sort',st.sort);draw()};
$('#hov').checked=hoverOn;
$('#hov').onchange=e=>{hoverOn=e.target.checked;store.set('fm-hover',hoverOn?'on':'off');if(!hoverOn)view.querySelectorAll('.card.hv').forEach(c=>stopPrev(c))};
$('#chips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;st.filter=b.dataset.f;chips();draw()});
addEventListener('resize',()=>{if(!mob())document.body.classList.remove('open')});

/* rendering */
function card(it){
  let th,meta,ico,attrs;
  if(it.type==='dir'){
    th=`<div class="th dir" data-fp="${esc(it.path)}">${I('folder')}</div>`;meta='Folder';ico='folder';attrs=`href="#/${enc(it.path)}"`;
  }else{
    const k=kind(it.name),u=esc(url(it)),a=esc(alt(it));ico=k;
    const tn=k==='image'?thumb(it,600,600):'',fb=esc(tn&&tn!==url(it)?url(it):alt(it));
    th=k==='image'?`<div class="th">${tn!==url(it)?`<img class="bl" loading="lazy" aria-hidden="true" alt="" src="${esc(thumb(it,40,40))}">`:''}<img loading="lazy" decoding="async" data-alt="${fb}" src="${esc(tn)}" alt="${esc(it.name)}"></div>`
      :k==='video'?`<div class="th"><video preload="none" muted playsinline data-alt="${a}" data-lazy="${u}#t=0.1"></video><span class="play">${I('play')}</span></div>`
      :`<div class="th file"><b>${esc(ext(it.name).toUpperCase()||'FILE')}</b></div>`;
    meta=`${k==='image'?'Image':k==='video'?'Video':'File'} · ${size(it.size)}`;
    attrs=k==='file'?`href="${u}" target="_blank" rel="noopener"`:`href="${u}" data-m="${st.media.indexOf(it)}"`;
  }
  return `<a class="card" ${attrs}>${th}<div class="meta">${meta}</div><div class="nm"><i class="ic">${I(ico)}</i><span title="${esc(it.name)}">${esc(it.name)}</span></div></a>`;
}
const fcache=new Map();let fio;
const MAX_TILES=25; // max images/videos shown in one folder thumbnail
async function folderMedia(path,depth=0){
  const items=await fetchDir(path);
  let m=items.filter(i=>i.type==='file'&&kind(i.name)!=='file');
  if(m.length<4&&depth<1){
    for(const d of items.filter(i=>i.type==='dir').slice(0,2)){
      if(m.length>=4)break;
      try{m=m.concat(await folderMedia(d.path,depth+1))}catch{}
    }
  }
  const n=Math.min(MAX_TILES,m.length);
  return Array.from({length:n},(_,i)=>m[Math.floor(i*m.length/n)]);
}
function collage(m){
  const n=m.length,big=n>3;
  let c=2,best=99;
  if(big)for(let k=2;k<=8;k++){const r=Math.ceil(n/k),sc=Math.abs(k/r-1.44)+(k*r-n)*.3;if(sc<best){best=sc;c=k}}
  const span=big&&n%c?c-n%c+1:1;
  const t=m.map((it,i)=>{
    const u=esc(url(it)),sz=n<=2?600:n===3?400:220;
    return`<span class="ct"${i===n-1&&span>1?` style="grid-column:span ${span}"`:''}>${kind(it.name)==='video'?`<video muted playsinline preload="none" data-lazy="${u}#t=0.1"></video>`:`<img loading="lazy" decoding="async" alt="" data-alt="${u}" src="${esc(thumb(it,sz,sz,'cover','top'))}">`}</span>`;
  }).join('');
  const g=big?` style="grid-template-columns:repeat(${c},1fr);grid-template-rows:repeat(${Math.ceil(n/c)},1fr)"`:'';
  return`<div class="mos${big?'':' m'+n}"${g}>${t}</div><i class="fbadge">${I('folder')}</i>`;
}
async function fillFolder(el){
  const path=el.dataset.fp;
  try{
    let m=fcache.get(path);
    if(!m){m=await folderMedia(path);fcache.set(path,m)}
    if(!m.length||!el.isConnected||!folderThumbs)return;
    el.innerHTML=collage(m);el.classList.add('has');lazyVideos(el);
  }catch{}
}
let vio;
function lazyVideos(root){
  const vs=[...(root||view).querySelectorAll('video[data-lazy]')];if(!vs.length)return;
  const load=v=>{v.src=v.dataset.lazy;v.preload='metadata';v.removeAttribute('data-lazy')};
  if(!('IntersectionObserver' in window)){vs.forEach(load);return}
  vio=vio||new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){vio.unobserve(e.target);load(e.target)}}),{rootMargin:'300px'});
  vs.forEach(v=>vio.observe(v));
}
function hydrate(){
  if(vio)vio.disconnect();
  if(fio)fio.disconnect();
  if(!folderThumbs||!('IntersectionObserver' in window))return;
  const els=[...view.querySelectorAll('.th.dir[data-fp]')];
  if(!els.length)return;
  fio=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){fio.unobserve(en.target);fillFolder(en.target)}}),{rootMargin:'250px'});
  els.forEach(el=>fcache.has(el.dataset.fp)?fillFolder(el):fio.observe(el));
}
const KIND_LABEL={all:'All',dir:'Folders',image:'Images',video:'Videos',file:'Other'};
const kindOf=i=>i.type==='dir'?'dir':kind(i.name);
const cmp=(a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});
function chips(){
  const n={all:st.items.length};
  st.items.forEach(i=>{const k=kindOf(i);n[k]=(n[k]||0)+1});
  if(st.filter!=='all'&&!n[st.filter])st.filter='all';
  $('#chips').innerHTML=Object.keys(KIND_LABEL).filter(k=>k==='all'||n[k]).map(k=>`<button class="chip${k===st.filter?' on':''}" data-f="${k}" aria-pressed="${k===st.filter}">${KIND_LABEL[k]}<small>${n[k]||0}</small></button>`).join('');
}
function sorted(list){
  if(!st.path)return list;
  const[key,dir]=st.sort.split('-'),sgn=dir==='desc'?-1:1;
  const byName=(a,b)=>cmp(a.name,b.name)*(key==='name'?sgn:1);
  const fn=key==='size'?(a,b)=>((a.size||0)-(b.size||0))*sgn||cmp(a.name,b.name)
    :key==='type'?(a,b)=>cmp(ext(a.name),ext(b.name))||cmp(a.name,b.name):byName;
  return list.sort((a,b)=>(a.type===b.type?0:a.type==='dir'?-1:1)||(a.type==='dir'?byName(a,b):fn(a,b)));
}
function startPrev(c){
  if(!hoverOn||!canHover||c.classList.contains('hv'))return;
  const v=c.querySelector('.th video');if(!v)return;
  if(!v.getAttribute('src')&&v.dataset.lazy){v.src=v.dataset.lazy;v.removeAttribute('data-lazy')}
  c.classList.add('hv');v.preload='auto';v.loop=true;v.muted=true;v.play().catch(()=>{});
}
function stopPrev(c){
  c.classList.remove('hv');
  const v=c.querySelector('.th video');if(v){v.pause();v.currentTime=0.1}
}
view.addEventListener('mouseover',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))startPrev(c)});
view.addEventListener('mouseout',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))stopPrev(c)});
const sec=(t,a)=>`<h2>${t}</h2><div class="grid">${a.map(card).join('')}</div>`;
function msg(text,retry){
  view.innerHTML=`<div class="state ${retry?'err':''}"><p>${esc(text)}</p>${retry?'<button class="btn" id="retry">Try again</button>':''}</div>`;
  if(retry)$('#retry').onclick=()=>{cache.delete(st.path);render()};
}
function draw(){
  const q=$('#q').value.trim().toLowerCase();
  const list=sorted(st.items.filter(i=>i.name.toLowerCase().includes(q)&&(st.filter==='all'||kindOf(i)===st.filter)));
  st.media=list.filter(i=>i.type==='file'&&kind(i.name)!=='file');
  if(!list.length)return msg(q||st.filter!=='all'?'Nothing matches your search or filter.':'This folder is empty. Add files to it in your repository.');
  const d=list.filter(i=>i.type==='dir'),f=list.filter(i=>i.type==='file');
  view.innerHTML=(d.length?sec('Folders',d):'')+(f.length?sec('Files',f):'');
  hydrate();lazyVideos();
}
function drawChrome(parts){
  let acc='',h='<a href="#/">Home</a>';
  parts.forEach((p,i)=>{
    acc+=(i?'/':'')+p;
    h+='<span>/</span>'+(i===parts.length-1?`<b>${esc(p)}</b>`:`<a href="#/${enc(acc)}">${esc(p)}</a>`);
  });
  $('#crumbs').innerHTML=h;
  const parent=parts.slice(0,-1).join('/');
  $('#bar').innerHTML=(parts.length?`<a class="back" href="#/${enc(parent)}">${I('back')}Go Back</a>`:'')+
    `<h1>${esc(parts.length?parts[parts.length-1]:'Home')}</h1><small id="cnt"></small>`;
  document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.r===(parts[0]||'')));
}
async function render(){
  if(!st.user)return;
  let path='';
  try{path=decodeURIComponent(location.hash.slice(2)).replace(/^\/+|\/+$/g,'')}catch{}
  const parts=path?path.split('/'):[];
  if(parts.length&&(!roots().includes(parts[0])||!access(path))){location.hash='#/';return}
  closeLB();document.body.classList.remove('open');
  $('#q').value='';st.filter='all';st.path=path;$('#tools').hidden=true;scrollTo(0,0);drawChrome(parts);
  const my=++st.req;
  if(!path){
    st.items=roots().map(n=>({type:'dir',name:n,path:n}));
    if(!st.items.length)return msg('No folders found. Check that js/config.js loads and customFolders has folder names.',true);
    return finish();
  }
  view.innerHTML='<div class="state"><div class="spin"></div><p>Loading from GitHub…</p></div>';
  try{
    const items=await fetchDir(path);
    if(my!==st.req)return;
    st.items=items;finish();
  }catch(e){if(my===st.req)msg(e.message,true)}
}
function finish(){
  const n=st.items.length;
  $('#cnt').textContent=n+(n===1?' item':' items');
  $('#tools').hidden=!st.path||!n;chips();
  draw();
}
addEventListener('hashchange',render);
$('#q').addEventListener('input',draw);
view.addEventListener('error',e=>{
  const t=e.target;if(t.tagName!=='IMG'&&t.tagName!=='VIDEO')return;
  if(t.dataset.alt&&!t.dataset.tried){t.dataset.tried=1;t.src=t.dataset.alt+(t.tagName==='VIDEO'?'#t=0.1':'')}
  else t.style.visibility='hidden';
},true);

/* lightbox */
const lb=$('#lb'),stage=$('#stage');
function showLB(){
  const it=st.media[st.lb],u=url(it),vid=kind(it.name)==='video';let tried=0,el;
  const retry=()=>{if(tried)return false;tried=1;el.src=alt(it);return true};
  stage.innerHTML='';stage.classList.remove('ld');
  if(vid){const w=player();el=w.v;el.onerror=retry;el.src=u;stage.append(w);el.play().catch(()=>{})}
  else{
    el=new Image();el.alt=it.name;el.draggable=false;stage.classList.add('ld');
    el.onload=()=>stage.classList.remove('ld');
    el.onerror=()=>{if(!retry())stage.classList.remove('ld')};
    el.src=u;stage.append(el);
  }
  Z.s=1;Z.x=Z.y=0;applyZ();$('#zbar').hidden=vid;
  $('#cap').textContent=`${it.name}  ·  ${st.lb+1} / ${st.media.length}`;
  $('#pv').hidden=$('#nx').hidden=st.media.length<2;
}
/* video player */
const fmt=t=>{if(!isFinite(t))return'0:00';const h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=String(Math.floor(t%60)).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${x}`:`${m}:${x}`};
const SPD=[.5,.75,1,1.25,1.5,2];
function player(){
  const w=document.createElement('div');w.className='vp';
  w.innerHTML=`<video playsinline preload="metadata"></video><button class="vbig" aria-label="Play">${I('play')}</button><div class="vc"><input class="r vs" type="range" min="0" max="1000" value="0" aria-label="Seek"><div class="vrow"><button data-a="play" aria-label="Play or pause"></button><button data-a="back" title="Back 10 seconds">${I('ccw')}</button><button data-a="fwd" title="Forward 10 seconds">${I('cw')}</button><button data-a="mute" aria-label="Mute"></button><input class="r vvol" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume"><span class="vt">0:00 / 0:00</span><span class="sp"></span><button data-a="speed" class="vsp" title="Playback speed">1×</button>${document.pictureInPictureEnabled?`<button data-a="pip" title="Picture in picture">${I('pip')}</button>`:''}<button data-a="fs" title="Fullscreen">${I('full')}</button></div></div>`;
  const v=w.querySelector('video'),q=x=>w.querySelector(x),seek=q('.vs'),vol=q('.vvol'),tm=q('.vt'),pb=q('[data-a=play]'),mb=q('[data-a=mute]');
  let idleT,drag=false;
  const paint=()=>{pb.innerHTML=I(v.paused?'play':'pause');w.classList.toggle('playing',!v.paused)};
  const mpaint=()=>{mb.innerHTML=I(v.muted||!v.volume?'mute':'vol');vol.value=v.muted?0:v.volume;vol.style.setProperty('--p',vol.value*100+'%')};
  const tick=()=>{const d=v.duration||0;if(!drag){seek.value=d?v.currentTime/d*1000:0;seek.style.setProperty('--p',seek.value/10+'%')}tm.textContent=fmt(v.currentTime)+' / '+fmt(d)};
  const wake=()=>{w.classList.remove('idle');clearTimeout(idleT);if(!v.paused)idleT=setTimeout(()=>w.classList.add('idle'),2500)};
  const toggle=()=>{v.paused?v.play().catch(()=>{}):v.pause()};
  const skip=d=>{v.currentTime=Math.max(0,Math.min(v.duration||0,v.currentTime+d))};
  const fs=()=>{
    if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);
    else if(w.requestFullscreen)w.requestFullscreen();
    else if(w.webkitRequestFullscreen)w.webkitRequestFullscreen();
    else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();
  };
  v.autoplay=true;
  ['play','pause','ended'].forEach(n=>v.addEventListener(n,()=>{paint();wake()}));
  v.addEventListener('timeupdate',tick);v.addEventListener('loadedmetadata',tick);v.addEventListener('volumechange',mpaint);
  seek.oninput=()=>{drag=true;v.currentTime=seek.value/1000*(v.duration||0);seek.style.setProperty('--p',seek.value/10+'%');tick()};
  seek.onchange=()=>{drag=false};
  vol.oninput=()=>{v.muted=false;v.volume=+vol.value};
  v.onclick=toggle;q('.vbig').onclick=toggle;
  w.addEventListener('pointermove',wake);w.addEventListener('pointerdown',wake);
  q('.vrow').onclick=e=>{
    const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='play')toggle();else if(a==='back')skip(-10);else if(a==='fwd')skip(10);
    else if(a==='mute')v.muted=!v.muted;
    else if(a==='speed'){const i=(SPD.indexOf(v.playbackRate)+1)%SPD.length;v.playbackRate=SPD[i];b.textContent=SPD[i]+'×'}
    else if(a==='pip')(document.pictureInPictureElement?document.exitPictureInPicture():v.requestPictureInPicture()).catch(()=>{});
    else if(a==='fs')fs();
  };
  w.api={toggle,skip,fs,mute:()=>{v.muted=!v.muted}};w.v=v;paint();mpaint();
  return w;
}
function openLB(i){
  if(i<0)return;
  st.lb=i;showLB();
  lb.classList.add('show');document.body.classList.add('lock');
  $('#lbx').focus();
}
function closeLB(){
  if(st.lb<0)return;
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  lb.classList.remove('show');stage.innerHTML='';st.lb=-1;
  document.body.classList.remove('lock');
}
const step=d=>{const n=st.media.length;st.lb=(st.lb+d+n)%n;showLB()};
view.addEventListener('click',e=>{
  const a=e.target.closest('[data-m]');
  if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;
  e.preventDefault();openLB(+a.dataset.m);
});
$('#lbx').onclick=closeLB;
$('#pv').onclick=()=>step(-1);
$('#nx').onclick=()=>step(1);
$('#zi').innerHTML=I('plus');$('#zo').innerHTML=I('minus');
const Z={s:1,x:0,y:0},curImg=()=>stage.querySelector('img');
function applyZ(){
  const im=curImg();
  if(im)im.style.transform=Z.s===1?'':`translate(${Z.x}px,${Z.y}px) scale(${Z.s})`;
  stage.classList.toggle('zoomed',Z.s>1);$('#zl').textContent=Math.round(Z.s*100)+'%';
}
function zoomTo(s,cx,cy){
  s=Math.min(8,Math.max(1,s));const k=s/Z.s;
  Z.x=cx-(cx-Z.x)*k;Z.y=cy-(cy-Z.y)*k;Z.s=s;
  if(s===1)Z.x=Z.y=0;
  applyZ();
}
$('#zi').onclick=()=>zoomTo(Z.s*1.4,0,0);
$('#zo').onclick=()=>zoomTo(Z.s/1.4,0,0);
$('#zl').onclick=()=>zoomTo(1,0,0);
const pts=new Map();let p0=null,lastTap=0;
const rel=(x,y)=>{const r=stage.getBoundingClientRect();return[x-r.left-r.width/2,y-r.top-r.height/2]};
const two=()=>{const[a,b]=[...pts.values()];return{d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,c:rel((a[0]+b[0])/2,(a[1]+b[1])/2)}};
stage.addEventListener('wheel',e=>{
  if(!curImg())return;e.preventDefault();
  const[cx,cy]=rel(e.clientX,e.clientY);
  zoomTo(Z.s*(e.deltaY<0?1.15:1/1.15),cx,cy);
},{passive:false});
stage.addEventListener('pointerdown',e=>{
  const im=curImg();if(!im||e.target!==im)return;
  im.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
  p0={x:e.clientX,y:e.clientY,zx:Z.x,zy:Z.y,s:Z.s,d:pts.size===2?two().d:0,mv:pts.size===2};
});
stage.addEventListener('pointermove',e=>{
  if(!pts.has(e.pointerId)||!p0)return;
  pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pts.size===2){const t=two();zoomTo(p0.s*t.d/p0.d,t.c[0],t.c[1]);return}
  const dx=e.clientX-p0.x,dy=e.clientY-p0.y;
  if(Math.abs(dx)+Math.abs(dy)>8)p0.mv=true;
  if(Z.s>1){Z.x=p0.zx+dx;Z.y=p0.zy+dy;applyZ()}
});
const up=e=>{
  if(!pts.delete(e.pointerId)||!p0)return;
  if(pts.size){const[x,y]=[...pts.values()][0];p0={x,y,zx:Z.x,zy:Z.y,s:Z.s,d:0,mv:true};return}
  const dx=e.clientX-p0.x;
  if(!p0.mv){
    const n=Date.now();
    if(n-lastTap<300){const[cx,cy]=rel(e.clientX,e.clientY);zoomTo(Z.s>1?1:2.5,cx,cy);lastTap=0}else lastTap=n;
  }else if(Z.s===1&&e.pointerType!=='mouse'&&Math.abs(dx)>60&&st.media.length>1)step(dx<0?1:-1);
  p0=null;
};
stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
lb.addEventListener('click',e=>{if(e.target===lb||e.target===stage)closeLB()});
addEventListener('keydown',e=>{
  const k=e.key,b=document.body.classList;
  if(k==='Escape'&&b.contains('open')){b.remove('open');return}
  if(st.lb<0)return;
  if(k==='Escape'){closeLB();return}
  if(e.target.tagName==='INPUT')return;
  const api=stage.firstChild&&stage.firstChild.api;
  if(api){
    if((k===' '||k==='k')&&e.target.tagName!=='BUTTON'){e.preventDefault();api.toggle()}
    else if(k==='ArrowLeft'){e.preventDefault();api.skip(-5)}
    else if(k==='ArrowRight'){e.preventDefault();api.skip(5)}
    else if(k==='m')api.mute();
    else if(k==='f')api.fs();
    else if(k==='PageUp')step(-1);
    else if(k==='PageDown')step(1);
  }
  else if(k==='ArrowLeft')step(-1);
  else if(k==='ArrowRight')step(1);
  else if(k==='+'||k==='=')zoomTo(Z.s*1.4,0,0);
  else if(k==='-')zoomTo(Z.s/1.4,0,0);
  else if(k==='0')zoomTo(1,0,0);
});