# Generates baked textures for the story2 kit: grain tile and parchment.
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
# grain: tileable 512 white noise, centered grey with alpha
g = rng.normal(128, 40, (512, 512)).clip(0, 255).astype(np.uint8)
a = np.full((512, 512), 255, np.uint8)
Image.fromarray(g, 'L').save('public/kit/grain.png')
# parchment 1600x900: fibres + stains
W, H = 1600, 900
base = np.zeros((H, W, 3), float)
base[:] = (239, 230, 210)
n = rng.normal(0, 1, (H//4, W//4))
big = np.array(Image.fromarray(((n*30)+128).clip(0,255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(float)-128
fine = rng.normal(0, 1, (H, W))*5
fib = np.zeros((H, W))
for _ in range(1400):
    x, y = rng.integers(0, W), rng.integers(0, H)
    l = rng.integers(20, 90); ang = rng.uniform(0, np.pi)
    for s in range(l):
        xx = int(x+np.cos(ang)*s); yy = int(y+np.sin(ang)*s)
        if 0 <= xx < W and 0 <= yy < H: fib[yy, xx] -= 6
lum = big*0.18 + fine + fib
base += lum[..., None]*np.array([1.0, 1.05, 1.3])
# stains
yy, xx = np.mgrid[0:H, 0:W]
for _ in range(5):
    cx, cy, r = rng.integers(0, W), rng.integers(0, H), rng.integers(80, 260)
    d = np.sqrt((xx-cx)**2+(yy-cy)**2)/r
    ring = np.exp(-((d-1)**2)*18)*2.2 + np.exp(-d*d*2)*0.8
    base[..., 0] -= ring*1.1; base[..., 1] -= ring*1.6; base[..., 2] -= ring*2.6
# edge darkening
ex = np.minimum(xx, W-1-xx)/W; ey = np.minimum(yy, H-1-yy)/H
e = np.exp(-np.minimum(ex, ey*1.6)*14)
base -= e[..., None]*np.array([22, 30, 44])
Image.fromarray(base.clip(0,255).astype(np.uint8)).save('public/kit/paper.jpg', quality=88)
