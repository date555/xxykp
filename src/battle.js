import {CHAPTERS,ENEMIES,SLOTS,TOYS,BUFFS,waveConfig} from './data.js';
import {ANIMATIONS,animationFor,TOY_ANIMATIONS,STATUS_ANIMATIONS} from './animation-data.js';
export function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export class Battle {
 constructor(party,chapter=0,rng=Math.random){
  this.chapter=CHAPTERS[chapter];this.rng=rng;this.state='wave';this.wave=this.chapter.from;this.time=0;this.waveTime=0;this.base=100;this.maxBase=100;this.kills=0;this.damage=0;this.enemies=[];this.effects=[];this.toyCasts=[];this.cleared=[];this.buffs={};this.choices=[];this.earned={gold:0,essence:0,tickets:0};this.cooldowns={ice:0,arrow:0,heal:0};this.hasteTime=0;this.nextId=1;this.party=party.map((h,i)=>h?{...h,...SLOTS[i],upgrades:{},cooldown:i*.13,hits:0,dealt:0,healClock:0,flash:0}:null);this.beginWave();
 }
 beginWave(){this.projectiles=[];this.config=waveConfig(this.wave);this.waveTime=0;this.spawnClock=.45;this.spawned=0;this.bossSpawned=false;this.state='wave';this.notice=this.config.boss?`首领来袭 · ${this.config.boss.name}`:`第 ${this.wave} 关 · ${this.config.name}`;this.noticeTime=2.4;}
 attackOf(h){return h.attack*(1+.1*(this.buffs.power||0));}
 speedOf(h){return 1+.08*(this.buffs.haste||0)+.25*(h.upgrades.rapid||0)+(this.hasteTime>0?.35:0);}
 targetsOf(h,skill=false){return h.targets+(h.upgrades.multishot||0)+(skill?1:0);}
 get totalAttack(){return this.party.reduce((s,h)=>s+(h?this.attackOf(h):0),0);}
 spawn(type,boss=false){const def=boss?this.config.boss:ENEMIES[type];const lane=Math.floor(this.rng()*3);const hp=boss?def.hp:def.hp*this.config.hpScale;this.enemies.push({...def,id:this.nextId++,type:boss?'boss':type,boss,lane,x:1190+this.rng()*35,y:[170,300,433][lane]+(this.rng()-.5)*64,hp,maxHp:hp,scale:boss?1.85:def.scale,freeze:0,slow:0,slowTime:0,poison:0,poisonDps:0,broken:0,special:boss?8:type==='medic'?6:0,flash:0});}
 update(dt){
  if(['won','lost','retreated','choice'].includes(this.state)||this.paused)return;
  this.time+=dt;this.noticeTime=Math.max(0,this.noticeTime-dt);this.effects=this.effects.filter(e=>(e.life-=dt)>0);this.party.forEach(h=>{if(h)h.flash=Math.max(0,h.flash-dt)});
  this.hasteTime=Math.max(0,this.hasteTime-dt);for(const k in this.cooldowns)this.cooldowns[k]=Math.max(0,this.cooldowns[k]-dt);
  for(const cast of this.toyCasts){cast.age+=dt;if(!cast.resolved&&cast.age>=cast.hitTime){cast.resolved=true;this.resolveToy(cast);}}
  this.toyCasts=this.toyCasts.filter(cast=>cast.age<cast.duration);
  if(this.state==='intermission'){this.wait-=dt;if(this.wait<=0){this.wave++;this.beginWave();}return;}
  this.waveTime+=dt;
  this.spawnClock-=dt;if(this.spawnClock<=0&&this.spawned<this.config.count){const pool=this.config.pool;this.spawn(pool[Math.floor(this.rng()*pool.length)]);this.spawned++;this.spawnClock+=this.config.spawnGap;}
  if(this.config.boss&&!this.bossSpawned&&this.waveTime>4){this.spawn(null,true);this.bossSpawned=true;}
  for(const e of [...this.enemies]){
   e.ward=Math.max(0,(e.ward||0)-dt);e.flash=Math.max(0,e.flash-dt);e.freeze=Math.max(0,e.freeze-dt);e.slowTime=Math.max(0,e.slowTime-dt);if(!e.slowTime)e.slow=0;
   if(e.poison>0){const active=Math.min(dt,e.poison);e.poison-=active;this.hit(e,e.poisonDps*active,'poison',null,true);}
   if(e.hp<=0)continue;
   if(e.freeze>0)continue;
   const rage=e.type==='berserker'&&e.hp/e.maxHp<.5?1.4:e.boss&&e.hp/e.maxHp<.4?1.3:1;e.x-=e.speed*this.config.speedScale*(1-e.slow)*rage*dt;
   if(e.type==='medic'){e.special-=dt;if(e.special<=0){e.special=7;for(const ally of this.enemies){if(ally.hp>0&&Math.hypot(ally.x-e.x,ally.y-e.y)<180){const repair=ally.maxHp*.06;ally.hp=Math.min(ally.maxHp,ally.hp+repair);this.effect('heal',ally.x,ally.y-70,'+'+Math.round(repair),'#a6d989',.6);}}}}
   if(e.boss){e.special-=dt;if(e.special<=0){e.special=['蛇群','急袭'].includes(e.trait)?9:10;e.animSerial=(e.animSerial||0)+1;if(e.trait==='回春'){e.special=9;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02);this.effect('heal',e.x,e.y-110,'回春 +2%','#a8d590',1);}else if(e.trait==='坚壁'){e.special=12;e.ward=3;this.effect('heal',e.x,e.y-110,'护甲屏障','#e6d79b',1);}else if(e.trait==='号令'){this.spawn('berserker');this.spawn('berserker');this.base=Math.max(0,this.base-12);this.effect('base',350,300,'号令 −12','#ef7757',1);}else if(e.trait==='急袭'){e.x-=55;this.effect('number',e.x,e.y-100,'急袭','#edb774',.8);}else if(e.trait==='蛇群'){this.spawn(e.summon||'skeleton');this.spawn(e.summon||'skeleton');this.notice='首领召唤了援军！';this.noticeTime=1.7;}else if(e.trait==='鼓噪'){this.base=Math.max(0,this.base-12);this.effect('base',350,300,'−12','#ef7757',1);}}}
   if(e.x<=353){this.base=Math.max(0,this.base-e.damage);e.escaped=true;e.hp=0;this.effect('base',350,e.y,`−${e.damage}`,'#ef7757',1);}
  }
  if(this.base<=0){this.state='lost';return;}
  for(const h of this.party){if(!h)continue;h.cooldown-=dt;
   if(h.trait==='heal'){h.healClock+=dt;if(h.healClock>=(h.supportPeriod||9)){h.healClock-=h.supportPeriod||9;const repair=(h.repair||4)+Math.min(5,h.star);this.base=Math.min(this.maxBase,this.base+repair);this.effect('heal',h.x,h.y,'修复 +'+repair,'#91cb87',1);}}
   if(h.cooldown<=0){const live=this.enemies.filter(e=>e.hp>0&&e.x<=h.x+780).sort((a,b)=>h.trait==='hunter'?Number(b.boss)-Number(a.boss)||a.x-b.x:h.trait==='sniper'?b.x-a.x:(a.x+Math.abs(a.lane-h.lane)*95)-(b.x+Math.abs(b.lane-h.lane)*95));if(live.length){h.hits++;h.flash=.22;const skill=h.hits%5===0;const mode=skill?'skill':'attack',anim=animationFor(h)[mode];h.cooldown=Math.max(h.interval,skill?ANIMATIONS[h.id][mode].castDuration*.8:0)/this.speedOf(h);h.animSerial=(h.animSerial||0)+1;h.animation=mode;h.animSpeed=Math.max(1,anim.castDuration/(h.cooldown*.92));if(skill){this.effect('heal',h.x,h.y-125,h.skillName,h.color,1);if(h.trait==='heal')this.base=Math.min(this.maxBase,this.base+(h.skillRepair||6));}
    const targets=live.slice(0,this.targetsOf(h,skill));for(const e of targets)this.cast(h,e,skill);}else h.cooldown=0;}
  }
  for(const p of this.projectiles){p.age+=dt;if(p.target.hp>0){p.tx=p.target.x;p.ty=p.target.y-44;}if(!p.resolved&&p.age>=p.delay+p.flight){p.resolved=true;if(p.target.hp>0){this.impact(p.hero,p.target,p.skill);if(p.hitAsset)this.effect('spine-hit',p.tx,p.ty,'','',p.hitDuration,{asset:p.hitAsset,speed:p.hitSpeed});}}}
  this.projectiles=this.projectiles.filter(p=>p.age<p.delay+p.duration);
  this.enemies=this.enemies.filter(e=>e.hp>0);if(this.base<=0){this.state='lost';return;}
  if(this.spawned>=this.config.count&&(!this.config.boss||this.bossSpawned)&&!this.enemies.length)this.completeWave();
 }
 effect(type,x,y,text,color,life=.65,extra={}){this.effects.push({type,x,y,text,color,life,maxLife:life,...extra});if(this.effects.length>160)this.effects.shift();}
 hit(e,amount,color,h,ignoreArmor=false){if(e.hp<=0)return 0;let armor=Math.max(0,e.armor-e.broken-(this.buffs.boss||0)*.03-(h?.trait==='cleave'?.15:0));armor=Math.min(.8,armor+(e.ward>0?.25:0));if(h?.job==='法师')armor*=.5;const damage=amount*(ignoreArmor?1:1-armor)*(h?1+(e.vulnerable||0):1);const real=Math.min(e.hp,damage);e.hp-=damage;this.damage+=real;if(h)h.dealt+=real;e.flash=.08;if(amount>5)this.effect('number',e.x,e.y-60,Math.round(damage),color==='crit'?'#ffcc63':color==='poison'?'#b3b58a':'#fff2cf',.7,{numberStyle:color==='crit'?'crit':color==='poison'?(e.dotType==='fire'?'burn':'poison'):'normal'});
  if(e.hp<=0){this.kills++;this.effect('death',e.x,e.y,'','#c6dca6',.45);}return real;}
 cast(h,e,skill){const meta=animationFor(h)[skill?'skill':'attack'];const dist=Math.hypot(e.x-h.x,e.y-h.y);const flight=['Position','Center'].includes(meta.type)?Math.max(.05,meta.effectHitTime/meta.effect.timeScale):meta.type==='Line'?.27:meta.type==='Parabola'?(meta.params[0]||.5):Math.min(1.5,Math.max(.22,dist/((meta.params[0]||1600)*.7)));this.projectiles.push({hero:h,target:e,skill,asset:meta.asset,hitAsset:meta.hitAsset,type:meta.type,age:0,delay:meta.castTime/h.animSpeed,flight,duration:['Line','Position','Center'].includes(meta.type)?Math.max(flight,meta.effectDuration/meta.effect.timeScale):flight+.03,effectSpeed:meta.effect.timeScale,hitSpeed:(meta.hitEffect?.timeScale||1),hitDuration:meta.hitDuration/(meta.hitEffect?.timeScale||1),x:h.x+28,y:h.y-55,tx:e.x,ty:e.y-44,resolved:false});}
 impact(h,e,skill){let amount=this.attackOf(h)*(skill?2.2:1);const crit=this.rng()<Math.min(.8,h.crit+.03*(this.buffs.crit||0));if(crit)amount*=2+.1*(this.buffs.crit||0);if(h.trait==='execute'&&e.hp/e.maxHp<.35)amount*=1.35;if(e.boss)amount*=1+.12*(this.buffs.boss||0);if(h.trait==='hunter'&&e.boss)amount*=1.35;if(h.trait==='sniper'&&e.x>800)amount*=1.35;if(h.trait==='siege'&&e.armor-e.broken>0)amount*=1.25;if(h.trait==='siege'&&skill)e.broken=Math.min(.25,e.broken+.1);if(h.trait==='mark')e.vulnerable=Math.min(.15,(e.vulnerable||0)+.05);if(h.trait==='storm'&&skill)e.freeze=Math.max(e.freeze,1.5);if(h.trait==='break')e.broken=Math.min(.25,e.broken+.05);if(['slow','sap'].includes(h.trait)||h.upgrades.frost){e.slow=Math.max(e.slow,Math.min(.65,(h.trait==='slow'?.28:h.trait==='sap'?.2:0)+.15*(h.upgrades.frost||0)));e.slowTime=1.6;if(skill&&h.trait==='slow')e.freeze=Math.max(e.freeze,1.2);}if(['poison','sap','burn'].includes(h.trait)||(h.trait==='fire'&&skill)){const dps=(h.trait==='sap'?8:h.trait==='burn'?9:12)*(this.attackOf(h)/28)*(skill?2:1);if(e.poison<=0||dps>=e.poisonDps){e.poisonDps=dps;e.dotType=['fire','burn'].includes(h.trait)?'fire':'poison';}e.poison=4;}if(h.trait==='knock'&&skill)e.x+=e.boss?35:70;
  this.hit(e,amount,crit?'crit':'normal',h);
  if(h.upgrades.splash||h.trait==='storm')for(const other of this.enemies){if(other!==e&&other.hp>0&&Math.hypot(other.x-e.x,other.y-e.y)<90)this.hit(other,amount*(.35*(h.upgrades.splash||0)+(h.trait==='storm'?.15:0)),'normal',h);}
 }
 useToy(id){if(this.state!=='wave'||this.paused)return false;const toy=TOYS.find(t=>t.id===id);if(!toy||this.cooldowns[id]>0)return false;const lv=this.buffs.toys||0;this.cooldowns[id]=toy.cd*Math.pow(.82,lv);const meta=TOY_ANIMATIONS[id],target=this.enemies.filter(e=>e.hp>0).sort((a,b)=>a.x-b.x)[0];
  this.toyCasts.push({id,asset:meta.asset,age:0,resolved:false,speed:meta.speed,hitTime:meta.hitTime/meta.speed,duration:meta.duration/meta.speed,power:1+.2*lv,attack:this.totalAttack,x:id==='heal'?215:id==='ice'?780:target?.x||800,y:360});return true;
 }
 resolveToy(cast){const {id,power,attack,x}=cast;
  if(id==='ice'){for(const e of this.enemies){if(e.hp<=0)continue;e.freeze=Math.max(e.freeze,3);this.hit(e,attack*1.2*power,'normal',null,true);}this.effect('toy-wave',780,300,'冰镇全场','#90deef',.8,{toy:id});}
  if(id==='arrow'){for(const e of this.enemies)if(Math.abs(e.x-x)<240)this.hit(e,attack*3.5*power,'crit',null,true);this.effect('toy-wave',x,300,'穿云破阵','#f2c873',.65,{toy:id});}
  if(id==='heal'){const value=Math.round(28*power);this.base=Math.min(this.maxBase,this.base+value);this.hasteTime=6;this.effect('heal',215,230,`营地 +${value}`,'#a1d99b',1.3);for(const h of this.party.filter(Boolean))this.effect('spine-recovery',h.x,h.y,'','',STATUS_ANIMATIONS.recovery.duration,{asset:STATUS_ANIMATIONS.recovery.asset});}
 }
 upgradePool(){return BUFFS.flatMap(b=>b.scope==='hero'?this.party.filter(Boolean).filter(h=>(h.upgrades[b.id]||0)<b.max).map(h=>({...b,id:`${b.id}:${h.id}`,buffId:b.id,heroId:h.id,target:h.name,level:h.upgrades[b.id]||0})):((this.buffs[b.id]||0)<b.max?[{...b,buffId:b.id,target:b.scope==='team'?'全体武将':b.scope==='toy'?'全部玩具':'营地',level:this.buffs[b.id]||0}]:[]));}
 offerChoices(){const pool=this.upgradePool();this.choices=[];const pick=scope=>{const eligible=pool.filter(b=>(!scope||b.scope===scope)&&!this.choices.some(c=>c.buffId===b.buffId));if(!eligible.length)return;this.choices.push(eligible[Math.floor(this.rng()*eligible.length)]);};pick('hero');pick('team');pick();}
 upgradeSummary(){return [...Object.entries(this.buffs).map(([id,n])=>({name:`${BUFFS.find(b=>b.id===id).scope==='team'?'全体 · ':''}${BUFFS.find(b=>b.id===id).name}`,level:n})),...this.party.filter(Boolean).flatMap(h=>Object.entries(h.upgrades).map(([id,n])=>({name:`${h.name} · ${BUFFS.find(b=>b.id===id).name}`,level:n})))];}
 completeWave(){this.cleared.push(this.wave);this.earned.gold+=this.config.gold;this.earned.essence+=this.config.essence;if(this.wave%5===0)this.earned.tickets+=2;if(this.wave>=this.chapter.to){this.state='won';return;}if(this.wave%3===0){this.state='choice';this.offerChoices();}else{this.state='intermission';this.wait=2;this.notice=`第 ${this.wave} 关守住了！`;this.noticeTime=2;}}
 choose(id){if(this.state!=='choice')return false;const choice=this.choices.find(c=>c.id===id);if(!choice)return false;const record=choice.scope==='hero'?this.party.find(h=>h?.id===choice.heroId)?.upgrades:this.buffs;if(!record||(record[choice.buffId]||0)>=choice.max)return false;record[choice.buffId]=(record[choice.buffId]||0)+1;if(choice.buffId==='wall'){this.maxBase+=25;this.base=Math.min(this.maxBase,this.base+35);}this.choices=[];this.state='intermission';this.wait=1;this.notice=`${choice.target} · ${choice.name} 已生效`;this.noticeTime=2;return true;}
 retreat(){if(['won','lost','retreated'].includes(this.state))return;this.state='retreated';}
}
