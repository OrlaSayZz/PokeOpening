// PokeOpening - application de bureau (Electron)
const {app,BrowserWindow,protocol,net,Menu,shell}=require('electron');
const path=require('path'),fs=require('fs'),crypto=require('crypto');

const REPO='OrlaSayZz/PokeOpening';
const RAW=`https://raw.githubusercontent.com/${REPO}/main/data/`;
const MANIFEST_URL=RAW+'manifest.json';

protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);

const BUILTIN=path.join(__dirname,'data');   // données livrées avec le .exe (peut être vide)
let UPD;                                      // données téléchargées (AppData\PokeOpening\data)
function resolveFile(rel){
  rel=String(rel).replace(/^\/+/,'');
  if(!rel||rel.includes('..'))return null;
  for(const base of [UPD,BUILTIN]){const p=path.join(base,rel);try{if(fs.statSync(p).isFile())return p}catch(e){}}
  return null;
}
function readJSON(p){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(e){return null}}
function sha256File(p){return new Promise((res,rej)=>{const h=crypto.createHash('sha256');fs.createReadStream(p).on('data',d=>h.update(d)).on('end',()=>res(h.digest('hex'))).on('error',rej)})}
function localManifest(){return readJSON(path.join(UPD,'manifest.json'))||readJSON(path.join(BUILTIN,'manifest.json'))||{version:0,files:{}}}

let win;
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.css':'text/css','.svg':'image/svg+xml'};

function setupPage(msg,pct){
  const bar=pct==null?'':`<div style="width:420px;height:10px;background:#1b2a55;border-radius:6px;overflow:hidden;margin:18px auto 0"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ffcb05,#ffe680)"></div></div>`;
  return `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0b1530;color:#fff;font:600 18px system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div><div style="font-size:34px;font-weight:900;margin-bottom:14px">Poke<span style="color:#ffcb05">Opening</span></div><div id="m">${msg}</div>${bar}</div></body>`;
}
function showSetup(msg,pct){if(win&&!win.isDestroyed())win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(setupPage(msg,pct)))}
function banner(txt){if(win&&!win.isDestroyed())win.webContents.executeJavaScript(`(()=>{let t=${JSON.stringify(txt)};let b=document.getElementById('__upd');if(!t){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='__upd';b.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;background:#1b2a55;color:#fff;font:600 14px system-ui;padding:10px 18px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.5)';document.body.appendChild(b)}b.textContent=t})()`).catch(()=>{})}

async function download(url,dest,sha,onBytes){
  const r=await net.fetch(url);if(!r.ok)throw new Error(r.status+' '+url);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  const tmp=dest+'.part';const out=fs.createWriteStream(tmp);const h=crypto.createHash('sha256');
  const rd=r.body.getReader();
  for(;;){const {done,value}=await rd.read();if(done)break;const b=Buffer.from(value);h.update(b);
    if(!out.write(b))await new Promise(z=>out.once('drain',z));onBytes&&onBytes(b.length)}
  await new Promise(z=>out.end(z));
  if(sha&&h.digest('hex')!==sha){fs.rmSync(tmp,{force:true});throw new Error('fichier corrompu '+url)}
  fs.renameSync(tmp,dest);
}

// Met à jour les données. firstRun = aucune carte installée.
async function update(firstRun){
  let remote;
  try{const r=await net.fetch(MANIFEST_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);remote=await r.json()}
  catch(e){if(firstRun)showSetup("Impossible de télécharger les cartes.<br>Vérifie ta connexion internet puis relance PokeOpening.");return false}
  const local=localManifest();
  if(!firstRun&&remote.version<=local.version)return false;
  const todo=[];
  for(const [rel,f] of Object.entries(remote.files)){
    const p=resolveFile(rel);
    if(p){const known=(local.files[rel]||{}).sha;const sha=known||await sha256File(p);if(sha===f.sha){local.files[rel]={sha};continue}}
    todo.push([rel,f]);
  }
  const total=todo.reduce((a,[,f])=>a+(f.size||0),0)||1;let done=0;
  const label=t=>firstRun?showSetup(`Téléchargement des cartes… ${Math.round(done/1e6)} / ${Math.round(total/1e6)} Mo`,Math.round(done/total*100)):banner(`Mise à jour ${remote.label||''} : ${Math.round(done/total*100)} %`);
  let last=0;
  for(const [rel,f] of todo){
    await download(f.url||RAW+rel,path.join(UPD,rel),f.sha,n=>{done+=n;const now=Date.now();if(now-last>400){last=now;label()}});
  }
  fs.writeFileSync(path.join(UPD,'manifest.json'),JSON.stringify({version:remote.version,label:remote.label,files:Object.fromEntries(Object.entries(remote.files).map(([k,v])=>[k,{sha:v.sha}]))}));
  return true;
}

function createWindow(){
  win=new BrowserWindow({width:1400,height:900,backgroundColor:'#0b1530',title:'PokeOpening',autoHideMenuBar:true,
    icon:path.join(__dirname,'icon.png'),webPreferences:{contextIsolation:true,sandbox:true}});
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return{action:'deny'}});
}

app.whenReady().then(async()=>{
  UPD=path.join(app.getPath('userData'),'data');fs.mkdirSync(UPD,{recursive:true});
  protocol.handle('app',async req=>{
    const u=new URL(req.url);const pn=decodeURIComponent(u.pathname);
    const sl=/^\/slice\/(.+)\/(\d+)\/(\d+)$/.exec(pn);
    if(sl){const f=resolveFile(sl[1]);if(!f)return new Response('not found',{status:404});
      const fd=fs.openSync(f,'r');const buf=Buffer.alloc(+sl[3]);fs.readSync(fd,buf,0,buf.length,+sl[2]+(f.endsWith('.pack')?16:0));fs.closeSync(fd);
      return new Response(buf,{status:200,headers:{'Content-Type':'image/webp','Cache-Control':'max-age=31536000'}});}
    const p=resolveFile(pn);
    if(!p)return new Response('not found',{status:404});
    return new Response(fs.readFileSync(p),{status:200,headers:{'Content-Type':TYPES[path.extname(p).toLowerCase()]||'application/octet-stream'}});
  });
  createWindow();
  if(!resolveFile('index.html')){
    showSetup('Préparation…',0);
    try{await update(true)}catch(e){showSetup('Erreur pendant le téléchargement :<br>'+e.message+'<br><br>Relance PokeOpening pour reprendre.');return}
    if(!resolveFile('index.html'))return;
    win.loadURL('app://local/index.html');return;
  }
  win.loadURL('app://local/index.html');
  win.webContents.once('did-finish-load',()=>setTimeout(async()=>{
    try{if(await update(false)){banner('Mise à jour installée ✓');setTimeout(()=>win.reload(),1500)}}catch(e){console.error(e);banner('')}
  },2000));
});
app.on('window-all-closed',()=>app.quit());
