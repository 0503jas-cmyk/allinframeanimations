import json,subprocess,sys,os
from PIL import Image
os.chdir('/home/user/allinframeanimations/courier')
jobs=json.load(open('out/jobs.json'))
want=sys.argv[1:]  # scene ids
sel=[j for j in jobs if not want or j[0] in want]
procs=[]
for c,f in sel:
    p=f'out/stills/{c}_{f}.png'
    procs.append(subprocess.Popen(['npx','remotion','still','src/index.ts',c,p,f'--frame={f}','--browser-executable=/opt/pw-browsers/chromium'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL))
    if len(procs)>=4:
        for q in procs: q.wait()
        procs=[]
for q in procs: q.wait()
n=len(sel); cols=3; rows=(n+cols-1)//cols
sw,sh=640,360
sheet=Image.new('RGB',(cols*sw,rows*sh))
for i,(c,f) in enumerate(sel):
    im=Image.open(f'out/stills/{c}_{f}.png').resize((sw,sh)); sheet.paste(im,((i%cols)*sw,(i//cols)*sh))
name='out/sheet_'+('_'.join(want) if want else 'all')+'.png'
sheet.save(name); print(name,n)
