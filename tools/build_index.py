"""Construit data/index.html de l'app à partir de l'index du site + pokedata.json (offsets dans les .pack).
Usage : python tools/build_index.py site_index.html pokedata.json data/index.html"""
import json,sys
src,pd,dst=sys.argv[1:4]
s=open(src,encoding='utf-8').read();D=json.load(open(pd,encoding='utf-8'))
s=s.split('/*DATA*/')[0]+'/*DATA*/'+json.dumps(D,ensure_ascii=False,separators=(',',':'))+'/*END*/'+s.split('/*END*/',1)[1]
old='if(c.pk){c.th=c.img=BLANK+"#"+c.key}'
assert old in s
s=s.replace(old,'if(c.pk){const g=c.g||"g1";c.th=`slice/${g}-thumbs${c.t[2]}.pack/${c.t[0]}/${c.t[1]}`;c.img=`slice/${g}-full${c.f[2]}.pack/${c.f[0]}/${c.f[1]}`;c.full=1}',1)
s=s.replace('function loadThumbs(){','function loadThumbs(){return Promise.resolve()}\nfunction loadThumbs_web(){',1)
a=s.index("const FULLB=");b=s.index(";\n",a);s=s[:a]+"const fullUrl=(pid,pt)=>''"+s[b:]
open(dst,'w',encoding='utf-8').write(s);print('ok',len(s))
