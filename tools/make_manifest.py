"""Met à jour data/manifest.json après avoir ajouté/modifié des fichiers dans data/.
Usage : python tools/make_manifest.py VERSION "Libellé"
Les applications installées téléchargent au démarrage les fichiers nouveaux ou modifiés.
Règle : ne jamais modifier un .pack existant, en ajouter de nouveaux (< 95 Mo chacun, limite GitHub 100 Mo)."""
import json,hashlib,os,sys
ver,label=int(sys.argv[1]),sys.argv[2]
d=os.path.join(os.path.dirname(__file__),'..','data');files={}
for f in sorted(os.listdir(d)):
  if f=='manifest.json':continue
  p=os.path.join(d,f);h=hashlib.sha256()
  with open(p,'rb') as fh:
    for b in iter(lambda:fh.read(1<<20),b''):h.update(b)
  files[f]={'sha':h.hexdigest(),'size':os.path.getsize(p)}
json.dump({'version':ver,'label':label,'files':files},open(os.path.join(d,'manifest.json'),'w'),indent=1)
print(len(files),'fichiers, version',ver)
