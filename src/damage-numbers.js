import {DAMAGE_FONTS} from './damage-font-data.js';

// Original non-TTF fonts include their own outlines and effect badge (the "s" glyph).
// Keep status/skill names on the regular text path; only numeric floats use these fonts.
export function damageNumberLayout(value, style='normal', fontSize=22) {
 const number=String(value).replaceAll('−','-');
 if(!/^[+-]?\d+(?:\.\d+)?$/.test(number))return null;
 const font=DAMAGE_FONTS[style]||DAMAGE_FONTS.normal;
 const content=(font.glyphs.s?'s':'')+number, scale=fontSize/font.fontSize;
 let cursor=0,left=0,right=0,bottom=font.lineHeight,top=0;
 const glyphs=[];
 for(const char of content){
  const glyph=font.glyphs[char];
  const x=cursor+glyph.offsetX,y=glyph.offsetY;
  glyphs.push({...glyph,dx:x,dy:y});
  left=Math.min(left,x);right=Math.max(right,x+glyph.width);
  top=Math.min(top,y);bottom=Math.max(bottom,y+glyph.height);
  cursor+=glyph.advance;
 }
 const center=(left+right)/2;
 return {atlas:font.atlas,width:(right-left)*scale,height:(bottom-top)*scale,
  glyphs:glyphs.map(g=>({...g,dx:(g.dx-center)*scale,dy:(g.dy-bottom)*scale,dw:g.width*scale,dh:g.height*scale}))};
}

export function drawDamageNumber(ctx, image, value, x, y, style='normal') {
 const layout=damageNumberLayout(value,style,style==='crit'?28:22);
 if(!layout)return false;
 const atlas=image(layout.atlas);
 if(!atlas.complete||!atlas.naturalWidth)return false;
 for(const g of layout.glyphs)ctx.drawImage(atlas,g.x,g.y,g.width,g.height,x+g.dx,y+g.dy,g.dw,g.dh);
 return true;
}
