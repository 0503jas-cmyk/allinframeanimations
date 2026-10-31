import sys
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]; cols=3; w,h=640,360
rows=(len(files)+cols-1)//cols; sheet=Image.new('RGB',(cols*w,rows*h))
for i,f in enumerate(files):
    im=Image.open(f).resize((w,h)); sheet.paste(im,((i%cols)*w,(i//cols)*h))
sheet.save(out,quality=88)
