import {STAR_TIERS,STAR_CAP} from './star-data.js';
export function starDisplay(value){
 const star=Math.max(0,Math.min(STAR_CAP,Math.floor(Number(value)||0)));
 const tier=STAR_TIERS[star?Math.min(6,Math.ceil(star/5)):0];
 const count=star?(star%5||5):1;
 return {...tier,star,count,label:star?`${tier.label} ${count} 星 · 总星级 ${star}`:'未升星'};
}
export function stars(value){const d=starDisplay(value);return `<span class="star-line" role="img" aria-label="${d.label}" title="${d.label}">${Array.from({length:d.count},()=>`<img class="star-icon" src="assets/${d.icon}.png" alt="">`).join('')}</span>`;}
