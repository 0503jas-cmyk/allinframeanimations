# fast re-mix from stems: ducking, per-scene balance, soft limiter -> build/audio/mix_raw.f32
import numpy as np, sys
SR=48000; N=SR*720
def load(n): return np.fromfile(f'build/audio/{n}.f32',np.float32).reshape(-1,2)
m,s,v=[load(x) for x in ('stem_music','stem_sfx','stem_speech')]
sc=[0,55,110,170,230,290,350,410,480,535,595,660,720]
MUS=[.40,.42,.50,.42,.40,.42,.28,.30,.42,.42,.27,.45]     # music gain per scene
SFX=[1.0,1.0,1.0,1.0,1.0,1.0,.62,.62,1.0,1.0,.85,.72]     # sfx gain per scene
def curve(vals):
    xs=[];ys=[]
    for i,(a,b) in enumerate(zip(sc[:-1],sc[1:])): xs+=[a+2.5,b-2.5]; ys+=[vals[i],vals[i]]
    return np.interp(np.arange(N)/SR,[0]+xs+[720],[vals[0]]+ys+[vals[-1]])
mg,sg=curve(MUS),curve(SFX)
mono=(v[:,0]+v[:,1])*.5; k=int(.08*SR); c=np.cumsum(np.concatenate([[0],np.abs(mono)])); e=(c[k:]-c[:-k])/k; e=np.concatenate([e,np.zeros(k-1)])[:N][::480]
duck=np.clip(e/(np.percentile(e[e>1e-4],70)+1e-9),0,1); duck=np.convolve(duck,np.ones(30)/30,'same')
g=np.zeros_like(duck); cur=0.0
for i,d in enumerate(duck): cur=d if d>cur else cur+(d-cur)*.05; g[i]=cur
dg=np.interp(np.arange(N)/SR,np.arange(len(g))*.01,g)
mus_g=mg*(1-.55*dg); sfx_g=sg*(1-.40*dg)
mix=np.stack([m[:,0]*mus_g+s[:,0]*sfx_g+v[:,0]*1.45, m[:,1]*mus_g+s[:,1]*sfx_g+v[:,1]*1.45],1)
pk=np.abs(mix).max(); print('raw peak',round(float(pk),2))
mix=np.tanh(mix/(pk*.9)*1.15)/np.tanh(1.15)*.9
mix[:int(.05*SR)]*=np.linspace(0,1,int(.05*SR))[:,None]; mix[-int(3.0*SR):]*=np.linspace(1,0,int(3.0*SR))[:,None]**1.5
mix.astype(np.float32).tofile('build/audio/mix_raw.f32')
db=lambda x: 20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
for i in range(12):
    a,b=sc[i]*SR,sc[i+1]*SR; sp=v[a:b]; act=np.abs(sp).max(1)>.01
    print(i+1,'speech',round(db(sp[act]*1.45),1) if act.any() else '-','music(duck avg)',round(db(m[a:b]*mus_g[a:b,None]),1),'sfx',round(db(s[a:b]*sfx_g[a:b,None]),1),'mix',round(db(mix[a:b]),1))
