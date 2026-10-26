export {STAR_COSTS,STAR_CAP} from './star-data.js';
import {ADDED_HEROES,SOURCE_BOSSES} from './content-data.js';
export const HEROES = [
  {id:'guojia',name:'郭嘉',faction:'wei',job:'法师',tag:'冰霜控场',color:'#69b5cf',attack:26,interval:1.35,crit:.08,targets:2,desc:'普攻减速 28%；每第 5 次攻击释放冰霜技能，额外攻击 1 个目标并冰冻 1.2 秒。法术忽略一半护甲。',trait:'slow',skillName:'冰霜封阵'},
  {id:'zhouyu',name:'周瑜',faction:'wu',job:'法师',tag:'烈焰清场',color:'#df784a',attack:37,interval:1.45,crit:.12,targets:2,desc:'普攻同时攻击 2 人；每第 5 次攻击释放火焰技能，造成 220% 伤害并附加持续灼烧。',trait:'fire',skillName:'烈焰破军'},
  {id:'simayi',name:'司马懿',faction:'wei',job:'法师',tag:'叠毒消耗',color:'#9982b1',attack:32,interval:1.25,crit:.12,targets:1,desc:'命中附加 4 秒毒伤；每第 5 次攻击释放幽冥技能，造成 220% 伤害，技能毒伤翻倍。',trait:'poison',skillName:'幽冥追魂'},
  {id:'ganning',name:'甘宁',faction:'wu',job:'射手',tag:'抛射击退',color:'#96a1b6',attack:41,interval:1.55,crit:.1,targets:1,desc:'普攻使用抛物弹道；每第 5 次攻击释放破浪技能，震退目标 70 距离，对 Boss 效果减半。',trait:'knock',skillName:'破浪强袭'},
  {id:'lusu',name:'鲁肃',faction:'wu',job:'辅助',tag:'守线续航',color:'#83a960',attack:23,interval:1.5,crit:.05,targets:1,desc:'每 9 秒修复营地 4 点耐久；每第 5 次攻击释放济世技能，造成 220% 伤害并额外修复 6 点。',trait:'heal',skillName:'济世护阵'},
  {id:'pangtong',name:'庞统',faction:'shu',job:'法师',tag:'连环多敌',color:'#b09a67',attack:31,interval:1.35,crit:.1,targets:2,desc:'同时攻击 2 人并穿透 15% 护甲；每第 5 次攻击释放连环技能，额外攻击 1 个目标。',trait:'cleave',skillName:'凤雏连环'},
  {id:'gongsunzan',name:'公孙瓒',faction:'qun',job:'射手',tag:'暴击收割',color:'#a7b7ce',attack:45,interval:1.05,crit:.22,targets:1,desc:'对生命低于 35% 的敌人伤害提高 35%；每第 5 次攻击释放白马技能，造成 220% 伤害。',trait:'execute',skillName:'白马贯阵'},
  {id:'zhangjiao',name:'张角',faction:'qun',job:'法师',tag:'破甲雷法',color:'#b5a559',attack:34,interval:1.2,crit:.1,targets:1,desc:'命中削减 5% 护甲，最多 25%；每第 5 次攻击释放黄天技能，额外攻击 1 人并造成 220% 伤害。',trait:'break',skillName:'黄天雷法'},
  {id:'zhugeliang',name:'诸葛亮',faction:'shu',job:'法师',tag:'雷阵控场',color:'#94b6d1',attack:30,interval:1.4,crit:.08,targets:2,desc:'普攻附带 15% 范围余波；技能在目标处降下原版雷阵，造成 220% 伤害并定身 1.5 秒。',trait:'storm',skillName:'八卦雷阵'},
  {id:'zhenji',name:'甄姬',faction:'wei',job:'辅助',tag:'洛水续航',color:'#9ccecb',attack:24,interval:1.4,crit:.06,targets:1,desc:'每 7 秒修复营地 3 点耐久；每第 5 次攻击释放洛水技能，额外修复 10 点营地耐久。',trait:'heal',supportPeriod:7,repair:3,skillRepair:10,skillName:'洛水清波'},
  {id:'huangyueying',name:'黄月英',faction:'shu',job:'射手',tag:'机关破甲',color:'#bda96b',attack:32,interval:1.15,crit:.1,targets:2,desc:'对有护甲的敌人伤害提高 25%；技能额外削减 10% 护甲，累计最多削减 25%。',trait:'siege',skillName:'机关齐射'},
  {id:'xiahouyuan',name:'夏侯渊',faction:'wei',job:'射手',tag:'首领猎手',color:'#a2bdc2',attack:42,interval:1.3,crit:.16,targets:1,desc:'优先攻击射程内的 Boss，对 Boss 伤害提高 35%；普攻和技能均使用原版抛射弹道。',trait:'hunter',skillName:'疾矢穿心'},
  {id:'huangzhong',name:'黄忠',faction:'shu',job:'射手',tag:'远距狙击',color:'#c5ab73',attack:48,interval:1.65,crit:.18,targets:1,desc:'优先狙击远处目标，对横坐标超过 800 的敌人伤害提高 35%；技能在目标处释放箭阵。',trait:'sniper',skillName:'百步穿杨'},
  {id:'zhangzhao',name:'张昭',faction:'wu',job:'法师',tag:'破绽增伤',color:'#c7b87a',attack:27,interval:1.25,crit:.08,targets:2,desc:'攻击施加 5% 易伤，最多叠加 15%；后续所有武将的攻击均可享受易伤增益。',trait:'mark',skillName:'谋定破阵'},
  {id:'luji',name:'陆绩',faction:'wu',job:'法师',tag:'迟滞毒阵',color:'#8daf71',attack:28,interval:1.2,crit:.08,targets:1,desc:'攻击附带 20% 减速与 4 秒毒伤；技能使用原版直线特效，持续伤害翻倍。',trait:'sap',skillName:'橘影缚阵'},
  {id:'zhurongfuren',name:'祝融夫人',faction:'shu',job:'射手',tag:'持续灼烧',color:'#db884e',attack:34,interval:1.05,crit:.12,targets:1,desc:'每次命中附带 4 秒灼烧；技能造成 220% 伤害且灼烧翻倍，适合清理持续兵潮。',trait:'burn',skillName:'烈焰飞刃'},
];
HEROES.push(...ADDED_HEROES);
export const HERO_MAP = Object.fromEntries(HEROES.map(h=>[h.id,h]));
export const FACTIONS = {qun:'群',shu:'蜀',wu:'吴',wei:'魏'};
export const SLOTS = [{x:178,y:147,lane:0},{x:281,y:222,lane:0},{x:172,y:302,lane:1},{x:281,y:384,lane:2},{x:178,y:457,lane:2}];
export const CHAPTERS = [
  {id:0,name:'青石古道',subtitle:'第一章 · 守住初阵',from:1,to:10,map:'forest',tone:'#4c7467',recommend:1,desc:'刀兵与游弓来袭，学会控场与多目标攻击。'},
  {id:1,name:'赤沙古道',subtitle:'第二章 · 铁甲压境',from:11,to:20,map:'desert',tone:'#927152',recommend:8,desc:'铁甲、刺客混编，破甲与击退决定防线。'},
  {id:2,name:'幽城夜袭',subtitle:'第三章 · 暗夜防线',from:21,to:30,map:'temple',tone:'#566c86',recommend:16,desc:'精英洪流与双重威胁，考验阵容成长和玩具时机。'},
  {id:3,name:'寒江险渡',subtitle:'第四章 · 狂潮突围',from:31,to:40,map:'river',tone:'#53667e',recommend:26,desc:'狂战兵负伤后加速冲锋，首领也会发动急袭。用控场截住前锋。'},
  {id:4,name:'古垒围城',subtitle:'第五章 · 巫医援军',from:41,to:50,map:'fortress',tone:'#64735f',recommend:36,desc:'巫医为附近敌人回血，巨盾阻挡火力。远程狙击与破甲能拆散敌阵。'},
  {id:5,name:'赤霄终战',subtitle:'第六章 · 十二首领',from:51,to:60,map:'palace',tone:'#805c69',recommend:46,desc:'三种精锐全面混编，终局首领同时召唤援军与冲击营地。'},
];
export const ENEMIES = {
  soldier:{name:'咸鱼刀兵',image:'xiaobing_daobing',hp:77,speed:26,armor:0,damage:6,scale:1},
  archer:{name:'游弓斥候',image:'xiaobing_gongbing',hp:57,speed:35,armor:0,damage:7,scale:.95},
  shield:{name:'铁甲卫',image:'xiaobing_dunbing',hp:127,speed:19,armor:.32,damage:11,scale:1.1},
  skeleton:{name:'骷髅潮',image:'xiaobing_kulou',hp:45,speed:31,armor:.05,damage:4,scale:.84},
  assassin:{name:'飞刀刺客',image:'xiaobing4_feidao',hp:71,speed:46,armor:.1,damage:9,scale:.9},
  shaman:{name:'咒术师',image:'xiaobing2_fazhang',hp:98,speed:23,armor:.12,damage:12,scale:1.04},
  berserker:{name:'冲阵狂战',image:'xiaobing4_luo',hp:100,speed:29,armor:.08,damage:12,scale:1.05},
  medic:{name:'毒沼巫医',image:'xiaobing5_zhentong',hp:82,speed:22,armor:.08,damage:10,scale:1},
  brute:{name:'玄铁巨盾',image:'xiaobing5_dunbing',hp:175,speed:16,armor:.44,damage:18,scale:1.2},
};
export const BOSSES = [
 {name:'点点蛙',image:'boss_diandianwa',trait:'鼓噪',desc:'每 10 秒蓄力冲击营地；冰冻可以推迟蓄力。',hp:1150,speed:11,armor:.1,damage:38},
 {name:'宝包蛇',image:'boss_baobaoshe',trait:'蛇群',desc:'每 9 秒召唤两只骷髅，优先清理援军。',hp:1850,speed:10,armor:.12,damage:45},
 {name:'铁甲罐头',image:'bosstower_boss1',trait:'重甲',desc:'45% 护甲，法师和破甲武将更有效。',hp:2800,speed:10,armor:.45,damage:48},
 {name:'威威鱼',image:'boss_weiweiyu',trait:'鼓噪',desc:'每 10 秒蓄力冲击；低血量时移动加速。',hp:3700,speed:12,armor:.2,damage:55},
 {name:'赤金将军',image:'bosstower_boss4',trait:'蛇群',desc:'每 9 秒召唤两只骷髅，伤害与兵潮并存。',hp:5200,speed:12,armor:.3,damage:65},
 {name:'焰祖',image:'boss_yanzu',trait:'鼓噪',desc:'高耐久、高护甲，低血量时加速冲锋。',hp:7200,speed:12,armor:.28,damage:80},
 {name:'赤焰爆罐',image:'bosstower_boss2',trait:'急袭',desc:'每 9 秒向前突进 55 距离，冰冻可延迟突进。',hp:8100,speed:10,armor:.2,damage:70},
 {name:'寒江灯神',image:'dengshenwei',trait:'鼓噪',desc:'高耐久首领，每 10 秒冲击营地；控场能延后冲击。',hp:9200,speed:10,armor:.26,damage:75},
 {name:'毒沼罐王',image:'bosstower_boss3',trait:'蛇群',desc:'每 9 秒召唤骷髅，配合巫医回血压迫防线。',hp:10400,speed:10,armor:.3,damage:75},
 {name:'柴油兄弟',image:'boss_chaiyouxiongdi',trait:'急袭',desc:'厚甲战车每 9 秒突进 55 距离，建议携带破甲与控场。',hp:11800,speed:10,armor:.38,damage:85},
 {name:'赤霄灯神',image:'dengshenshu',trait:'蛇群',desc:'每 9 秒召唤两名狂战兵，优先清理冲锋援军。',hp:13200,speed:10,armor:.3,damage:85,summon:'berserker'},
 {name:'秦广王',image:'boss_qinguangwang',trait:'号令',desc:'每 10 秒召唤两名狂战兵并冲击营地 12 点；低血量时加速。',hp:15000,speed:10,armor:.34,damage:100},
];
for(const b of BOSSES)b.bossKey=SOURCE_BOSSES.find(s=>s.image===b.image)?.id||b.image;
const bossTraits=[
 ['急袭','每 9 秒向前突进 55 距离，冰冻可延后突进。'],
 ['蛇群','每 9 秒召唤两名狂战兵，及时清理前锋。'],
 ['回春','每 9 秒恢复自身 2% 最大生命，集火与易伤能压制恢复。'],
 ['坚壁','每 12 秒获得持续 3 秒的护甲屏障，护甲额外提高 25%。'],
 ['鼓噪','每 10 秒冲击营地 12 点，冰冻可延后冲击。'],
 ['号令','每 10 秒召唤两名狂战兵并冲击营地 12 点。'],
];
for(const source of SOURCE_BOSSES){if(BOSSES.some(b=>b.bossKey===source.id))continue;const index=BOSSES.length-12,[trait,desc]=bossTraits[index%bossTraits.length];BOSSES.push({...source,bossKey:source.id,trait,desc,hp:Math.round(16000*(1+index*.032)),speed:10,armor:.2+(index%4)*.03,damage:85,summon:'berserker'});}
const regions=['云海灯阵','迷雾古城','幽冥试炼','玄晶秘境','赤炎古域','深渊回廊','万象幻境','盘丝洞府','天宫奇阵','华府风云','星河庆典','极境远征'];
const maps=['river','temple','fortress','palace','desert','forest'];
const chapterCount=Math.ceil(BOSSES.length/2);
for(let i=6;i<chapterCount;i++){const group=i-6;CHAPTERS.push({id:i,name:`${regions[group%regions.length]} · ${Math.floor(group/regions.length)+1}`,subtitle:`远征第 ${i+1} 章`,from:i*10+1,to:i*10+10,map:maps[group%maps.length],tone:['#526c77','#605773','#687258','#795e63'][group%4],recommend:Math.min(150,52+Math.round(group*1.7)),recommendStar:Math.max(0,Math.ceil((i-8)/6)),desc:`精锐混编逐步增强，本章迎战${BOSSES[i*2]?.name}与${BOSSES[i*2+1]?.name||BOSSES.at(-1).name}。根据首领机制搭配控场、破甲与续航。`});}
export const TOTAL_WAVES=CHAPTERS.at(-1).to;
export function waveConfig(n) {
  const boss=n%5===0?BOSSES[n/5-1]||BOSSES.at(-1):null;
  const pool=['soldier','soldier','archer'];
  if(n>=3)pool.push('skeleton','skeleton');
  if(n>=6)pool.push('shield');
  if(n>=11)pool.push('assassin');
  if(n>=16)pool.push('shaman','shield');
  if(n>=21)pool.push('assassin','shaman');
  if(n>=31)pool.push('berserker','berserker');
  if(n>=41)pool.push('medic','brute');
  if(n>=51)pool.push('medic','berserker','brute');
  if(n>60)pool.push(...[['berserker','assassin'],['medic','shield'],['brute','shaman']][Math.floor((n-61)/10)%3]);
  return {n,boss,pool,count:Math.min(78,Math.round(6+Math.min(n,30)*.85+Math.max(0,n-30)*.45))+(n%3===0?4:0),hpScale:Math.pow(1.09,Math.min(n,30)-1)*Math.pow(1.02,Math.min(30,Math.max(0,n-30)))*(1+Math.max(0,n-60)*.006),speedScale:1+(Math.min(n,30)-1)*.009+Math.min(30,Math.max(0,n-30))*.002+Math.min(.13,Math.max(0,n-60)*.0003),spawnGap:Math.max(.42,1.22-n*.022),gold:100+n*20,essence:20+n*4,name:boss?`${boss.name} · 首领关`:n%3===0?'汹涌兵潮':n>60?'远征精锐':n>=51?'终阵精锐':n>=41?'巫医援军':n>=31?'狂战突袭':n>=16?'精锐混编':n>=6?'铁甲来袭':'山道遭遇'};
}
export const TOYS = [
 {id:'ice',name:'冰镇啤酒',image:'bingzhenpijiuping',key:'1',cd:24,desc:'全场冰冻 3 秒，造成全队总攻击 1.2 倍伤害。'},
 {id:'arrow',name:'穿云箭',image:'yizhichuanyunjian',key:'2',cd:20,desc:'对最前方区域造成全队总攻击 3.5 倍伤害（范围 240）。'},
 {id:'heal',name:'祖传大饼',image:'zuchuandabing',key:'3',cd:32,desc:'释放动画生效时修复 28 点营地耐久，全队攻速提高 35%，持续 6 秒。'},
];
export const BUFFS = [
 {id:'multishot',name:'一箭三雕',scope:'hero',type:'武将特质',icon:'⇶',desc:'该武将普攻与技能的攻击目标 +1。',max:3},
 {id:'rapid',name:'连攻不息',scope:'hero',type:'武将特质',icon:'»',desc:'该武将攻击速度 +25%，更快积攒下一次技能。',max:3},
 {id:'frost',name:'寒意入骨',scope:'hero',type:'武将特质',icon:'❄',desc:'该武将攻击附加 15% 减速；郭嘉可叠加自身寒霜。',max:2},
 {id:'splash',name:'余威荡荡',scope:'hero',type:'武将特质',icon:'◎',desc:'该武将攻击对目标周围 90 距离造成 35% 溅射伤害。',max:2},
 {id:'haste',name:'疾风行军',scope:'team',type:'全体属性',icon:'»',desc:'全体武将攻击速度 +8%。',max:5},
 {id:'power',name:'众志成城',scope:'team',type:'全体属性',icon:'⚔',desc:'全体武将攻击力 +10%。',max:5},
 {id:'crit',name:'会心一击',scope:'team',type:'全体属性',icon:'✧',desc:'全体武将暴击率 +3%，暴击伤害 +10%。',max:3},
 {id:'boss',name:'破阵斩将',scope:'team',type:'全体属性',icon:'♜',desc:'全体武将对 Boss 伤害 +12%，攻击额外忽略 3% 护甲。',max:3},
 {id:'toys',name:'玩具大师',scope:'toy',type:'玩具强化',icon:'✦',desc:'玩具冷却缩短 18%，技能伤害与修复提高 20%。',max:3},
 {id:'wall',name:'固若金汤',scope:'camp',type:'营地强化',icon:'▥',desc:'营地最大耐久 +25，并立即修复 35 点。',max:4},
];
// Keep the existing storage key so renaming the game preserves local progress.
export const SAVE_KEY='xy-grand-defense-v1';
export const LEVEL_CAP=150;
export const fmt=n=>Math.floor(n).toLocaleString('zh-CN');
