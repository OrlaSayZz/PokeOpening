"""Prépare une Release GitHub de données pour PokeOpening.
Usage : python tools/make_release.py DOSSIER_DONNEES VERSION "Libellé" DOSSIER_SORTIE [manifest_precedent.json]
- Les fichiers identiques à la version précédente gardent leur ancien lien (pas re-téléchargés).
- Seuls les fichiers nouveaux/modifiés sont copiés dans DOSSIER_SORTIE, à joindre à la Release vVERSION.
"""
import json,hashlib,os,sys,shutil
REPO='OrlaSayZz/PokeOpening'
data,ver,label,out=sys.argv[1],int(sys.argv[2]),sys.argv[3],sys.argv[4]
prev=json.load(open(sys.argv[5]))['files'] if len(sys.argv)>5 else {}
os.makedirs(out,exist_ok=True);files={}
for root,_,fs in os.walk(data):
  for f in sorted(fs):
    p=os.path.join(root,f);rel=os.path.relpath(p,data).replace('\\','/')
    if rel in('manifest.json','update.json'):continue
    h=hashlib.sha256()
    with open(p,'rb') as fh:
      for b in iter(lambda:fh.read(1<<20),b''):h.update(b)
    sha=h.hexdigest();size=os.path.getsize(p);asset=rel.replace('/','__')
    if rel in prev and prev[rel]['sha']==sha:files[rel]=prev[rel];continue
    files[rel]={'sha':sha,'size':size,'url':f'https://github.com/{REPO}/releases/download/v{ver}/{asset}'}
    shutil.copy(p,os.path.join(out,asset))
json.dump({'version':ver,'label':label,'files':files},open(os.path.join(out,'manifest.json'),'w'),indent=1)
print(len(files),'fichiers dans le manifest ;',len(os.listdir(out))-1,'à envoyer ->',out)
