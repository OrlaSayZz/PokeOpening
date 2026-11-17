"""Construit data/index.html de l'application à partir de la page (src/page.html) et des données (src/pokedata.json)."""
import json,os,sys
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
s=open(os.path.join(R,'src','page.html'),encoding='utf-8').read()
D=json.load(open(os.path.join(R,'src','pokedata.json'),encoding='utf-8'))
s=s.split('/*DATA*/')[0]+'/*DATA*/'+json.dumps(D,ensure_ascii=False,separators=(',',':'))+'/*END*/'+s.split('/*END*/',1)[1]
old='if(c.pk){c.th=c.img=BLANK+"#"+c.key}'
assert old in s
s=s.replace(old,'if(c.pk){const g=c.g||"g1";c.th=`slice/${g}-thumbs${c.t[2]}.pack/${c.t[0]}/${c.t[1]}`;c.img=`slice/${g}-full${c.f[2]}.pack/${c.f[0]}/${c.f[1]}`;c.full=1}',1)
s=s.replace('function loadThumbs(){','function loadThumbs(){return Promise.resolve()}\nfunction loadThumbs_web(){',1)
a=s.index("const FULLB=");b=s.index(";\n",a);s=s[:a]+"const fullUrl=(pid,pt)=>''"+s[b:]
open(os.path.join(R,'data','index.html'),'w',encoding='utf-8').write(s)
print('index.html', len(s)//1024, 'Ko')
