import {HEROES,HERO_MAP,STAR_COSTS,STAR_CAP,TOTAL_WAVES,LEVEL_CAP} from './data.js';
import {APPEARANCES,appearanceFor} from './appearances.js';
const copy=x=>JSON.parse(JSON.stringify(x));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Math.floor(Number(x)||0)));
export function newSave(){return {version:2,gold:6000,essence:1000,tickets:12,rolls:0,pity:0,bestWave:0,totalKills:0,runs:0,formation:HEROES.slice(0,5).map(h=>h.id),heroes:Object.fromEntries(HEROES.map((h,i)=>[h.id,{owned:i<5,level:1,star:0,shards:0,appearance:APPEARANCES[h.id][0].id}])),claimed:[],settings:{sound:true,speed:1}};}
export function validateSave(input){
 if(!input||![1,2].includes(input.version)||!input.heroes)throw Error('不是有效的向咸鱼开炮存档');
 // Preserve any progress from the first in-session prototype when replacing its roster.
 if(input.version===1&&input.heroes.lvbu&&!input.heroes.guojia&&!input.heroes.ganning){const replacements={lvbu:'gongsunzan',guanyu:'zhouyu',zhugeliang:'guojia',zhangfei:'ganning',huatuo:'lusu',zhaoyun:'pangtong',sunce:'zhangjiao',simayi:'simayi'};input=copy(input);input.heroes=Object.fromEntries(Object.entries(input.heroes).filter(([id])=>replacements[id]).map(([id,value])=>[replacements[id],value]));input.formation=input.formation?.map(id=>replacements[id]||null);}
 const s=newSave();for(const k of ['gold','essence','tickets','rolls','totalKills','runs'])s[k]=clamp(input[k],0,1e9);
 s.pity=clamp(input.pity,0,9);s.bestWave=clamp(input.bestWave,0,TOTAL_WAVES);
 for(const h of HEROES){const v=input.heroes[h.id]||{};s.heroes[h.id]={owned:!!v.owned,level:clamp(v.level,1,LEVEL_CAP),star:clamp(v.star,0,STAR_CAP),shards:clamp(v.shards,0,1e7),appearance:appearanceFor(h.id,v.appearance).id};}
 const ids=Array.isArray(input.formation)?input.formation:[];const seen=new Set();s.formation=Array.from({length:5},(_,i)=>{const id=ids[i];if(HERO_MAP[id]&&s.heroes[id].owned&&!seen.has(id)){seen.add(id);return id;}return null;});
 if(!s.formation.some(Boolean)){const first=HEROES.find(h=>s.heroes[h.id].owned);if(!first)throw Error('存档中没有已招募武将');s.formation[0]=first.id;}
 s.claimed=Array.isArray(input.claimed)?[...new Set(input.claimed.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL_WAVES))]:[];
 s.settings={sound:input.settings?.sound!==false,speed:[1,2].includes(input.settings?.speed)?input.settings.speed:1};return s;
}
export function stats(id,own){const h=HERO_MAP[id],look=appearanceFor(id,own.appearance);return {...h,avatarId:look.avatarId,appearance:look.id,portrait:look.portrait,head:look.head,skinName:look.name,level:own.level,star:own.star,attack:Math.round(h.attack*(1+.085*(own.level-1))*(1+.22*own.star)),interval:h.interval/(1+own.star*.035)};}
export function levelCost(own){return {gold:Math.round(90*Math.pow(1.13,Math.min(49,own.level-1))*(1+Math.max(0,own.level-50)*.035)),essence:15+own.level*5};}
export class Camp {
 constructor(save=newSave(),rng=Math.random){this.save=validateSave(save);this.locked=false;this.rng=rng;this.settled=new WeakSet();}
 guard(){if(this.locked)throw Error('战斗中不能招募或养成，请结算后返回营地');}
 upgrade(id){this.guard();const h=this.save.heroes[id];if(!h?.owned)throw Error('请先招募这位武将');if(h.level>=LEVEL_CAP)throw Error(`已达到 ${LEVEL_CAP} 级上限`);const cost=levelCost(h);if(this.save.gold<cost.gold||this.save.essence<cost.essence)throw Error('金币或精铁不足，出征可获得资源');this.save.gold-=cost.gold;this.save.essence-=cost.essence;h.level++;return h;}
 equipAppearance(id,appearance){this.guard();const h=this.save.heroes[id];if(!h?.owned)throw Error('请先招募这位武将');if(!APPEARANCES[id].some(a=>a.id===String(appearance)))throw Error('这套皮肤不属于该武将或尚未通过适配');h.appearance=String(appearance);return h;}
 starUp(id){this.guard();const h=this.save.heroes[id];if(!h?.owned||h.star>=STAR_CAP)throw Error('当前无法升星');const cost=STAR_COSTS[h.star];if(h.shards<cost)throw Error(`需要 ${cost} 个同名碎片，重复招募可获得`);h.shards-=cost;h.star++;return h;}
 assign(slot,id){this.guard();if(slot<0||slot>4||!Number.isInteger(slot))throw Error('无效阵位');if(id&&!this.save.heroes[id]?.owned)throw Error('这位武将尚未招募');const old=this.save.formation[slot];const other=this.save.formation.indexOf(id);if(id&&other>=0)this.save.formation[other]=old;this.save.formation[slot]=id;if(!this.save.formation.some(Boolean)){this.save.formation[slot]=old;throw Error('至少需要一位武将出战');}}
 recruit(count){this.guard();if(![1,10].includes(count))throw Error('无效招募次数');if(this.save.tickets<count)throw Error('招募令不足，通关与首领结算可获得');this.save.tickets-=count;const results=[];for(let i=0;i<count;i++){this.save.rolls++;this.save.pity++;const missing=HEROES.filter(h=>!this.save.heroes[h.id].owned);const pool=this.save.pity>=10&&missing.length?missing:HEROES;const h=pool[Math.min(pool.length-1,Math.floor(this.rng()*pool.length))];const own=this.save.heroes[h.id];const fresh=!own.owned;if(fresh){own.owned=true;this.save.pity=0;}else own.shards+=8;if(this.save.pity>=10)this.save.pity=0;results.push({id:h.id,fresh,shards:fresh?0:8});}return results;}
 snapshot(){if(!this.save.formation.some(Boolean))throw Error('请先布阵');return this.save.formation.map(id=>id?stats(id,this.save.heroes[id]):null);}
 settle(battle){if(this.settled.has(battle))return null;if(!['won','lost','retreated'].includes(battle.state))throw Error('战斗尚未结束');this.settled.add(battle);this.locked=false;const result={gold:battle.earned.gold,essence:battle.earned.essence,tickets:battle.earned.tickets,first:0};for(const n of battle.cleared){if(!this.save.claimed.includes(n)){this.save.claimed.push(n);result.gold+=120;result.essence+=20;if(n%5===0){result.tickets+=2;result.first++;}}}this.save.gold+=result.gold;this.save.essence+=result.essence;this.save.tickets+=result.tickets;this.save.bestWave=Math.max(this.save.bestWave,...battle.cleared);this.save.totalKills+=battle.kills;this.save.runs++;return result;}
 export(){return copy(this.save);}
}
