# Épingle les URLs du manifest sur un commit précis (immuable, jamais en cache périmé)
import json,subprocess,sys
sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
m=json.load(open('data/manifest.json'))
for f,v in m['files'].items():v['url']=f'https://raw.githubusercontent.com/OrlaSayZz/PokeOpening/{sha}/data/{f}'
json.dump(m,open('data/manifest.json','w'),ensure_ascii=False,indent=1)
print('épinglé sur',sha[:8])
