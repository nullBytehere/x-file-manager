// js/github.js — reads js/config.js and lists folders/files from GitHub.
//
// Rate limit: instead of one API call per folder, the whole repo tree is fetched in ONE request,
// cached in the browser for 5 minutes, and re-checked with a conditional request (a "304 Not
// Modified" answer does not count against GitHub's limit). Logged-in users with a private-repo token
// use the normal contents API (5,000 requests/hour).
//
// Optional setting in js/config.js:  optimizeThumbnails: false   (turns off the thumbnail resizer)
const C=typeof CONFIG!=='undefined'?CONFIG:{};
const cache=new Map();
const API=()=>`https://api.github.com/repos/${C.username}/${C.repo}`;
const ref=()=>C.branch||'main';
const TREE_TTL=5*60*1000;

function apiFail(r,what){
  if(r.status===404)return new Error(what==='tree'
    ?`Repository or branch not found (${C.username}/${C.repo}, "${ref()}"). Check js/config.js.`
    :`"${what}" was not found in ${C.username}/${C.repo} on branch "${ref()}". Check the names in js/config.js (they are case-sensitive).`);
  if(r.status===403||r.status===429){
    const t=r.headers.get('x-ratelimit-reset');
    return new Error('GitHub API rate limit reached.'+(t?` It resets at ${new Date(t*1000).toLocaleTimeString()}.`:'')+' Please try again later.');
  }
  return new Error(`GitHub returned an error (${r.status}). Try again in a moment.`);
}
async function gh(url,extra={}){
  const h={Accept:'application/vnd.github+json',...extra};
  if(st.token)h.Authorization='Bearer '+st.token;
  try{return await fetch(url,{headers:h,referrerPolicy:'no-referrer'})}
  catch{throw new Error('Could not reach GitHub. Check your internet connection and try again.')}
}

/* one request for the whole tree (public repos) */
function indexTree(list){
  const m=new Map(),base=`https://raw.githubusercontent.com/${C.username}/${C.repo}/${enc(ref())}/`;
  for(const f of C.customFolders||[])m.set(f,[]);
  for(const[p,t,s]of list){
    const i=p.lastIndexOf('/'),parent=i<0?'':p.slice(0,i),name=p.slice(i+1);
    if(t==='d'&&!m.has(p))m.set(p,[]);
    if(!m.has(parent))m.set(parent,[]);
    m.get(parent).push(t==='d'?{type:'dir',name,path:p,size:0}:{type:'file',name,path:p,size:s,download_url:base+enc(p)});
  }
  return m;
}
let treeP=null;
const getTree=()=>treeP||(treeP=loadTree().catch(e=>{treeP=null;throw e}));
async function loadTree(){
  const key=`fm-tree:${C.username}/${C.repo}@${ref()}`;
  let c=null;try{c=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  if(c&&c.list&&Date.now()-c.t<TREE_TTL)return indexTree(c.list);
  let r;
  try{r=await gh(`${API()}/git/trees/${encodeURIComponent(ref())}?recursive=1`,c&&c.etag?{'If-None-Match':c.etag}:{})}
  catch(e){if(c&&c.list)return indexTree(c.list);throw e}
  if(r.status===304&&c){c.t=Date.now();try{localStorage.setItem(key,JSON.stringify(c))}catch{}return indexTree(c.list)}
  if(!r.ok){if(c&&c.list&&(r.status===403||r.status===429))return indexTree(c.list);throw apiFail(r,'tree')}
  const d=await r.json();
  if(d.truncated)return null; // repo too big for one request: fall back to per-folder calls
  const roots=C.customFolders||[];
  const list=d.tree.filter(e=>(e.type==='tree'||e.type==='blob')&&roots.some(f=>e.path===f||e.path.startsWith(f+'/')))
    .map(e=>[e.path,e.type==='tree'?'d':'f',e.size||0]);
  try{localStorage.setItem(key,JSON.stringify({t:Date.now(),etag:r.headers.get('etag'),list}))}catch{}
  return indexTree(list);
}

/* per-folder call (private repo with token, or very large repos) */
async function listViaApi(path){
  const r=await gh(`${API()}/contents/${enc(path)}?ref=${encodeURIComponent(ref())}`);
  if(!r.ok)throw apiFail(r,path);
  const d=await r.json();
  if(!Array.isArray(d))throw new Error('This path is a file, not a folder.');
  return d;
}

async function fetchDir(path){
  if(cache.has(path))return cache.get(path);
  if(!access(path))throw new Error('You do not have access to this folder.');
  if(!C.username||!C.repo||/^your-/.test(C.username))throw new Error('Set your GitHub username and repository in js/config.js.');
  let data=null;
  if(!st.token){
    const t=await getTree();
    if(t){if(!t.has(path))throw apiFail({status:404},path);data=t.get(path)}
  }
  if(!data)data=await listViaApi(path);
  const acc=access(path);
  const items=data.filter(i=>(i.type==='dir'||i.type==='file')&&!i.name.startsWith('.')&&(i.type==='dir'?access(i.path)>0:acc===2&&fileOK(i)))
    .sort((a,b)=>(a.type===b.type?0:a.type==='dir'?-1:1)||a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
  cache.set(path,items);
  return items;
}