import fs from 'node:fs';
import {HEROES,BOSSES,CHAPTERS,TOTAL_WAVES} from '../src/data.js';
import {APPEARANCES,APPEARANCE_COUNT} from '../src/appearances.js';
import {APPEARANCE_ANIMATIONS,BOSS_ANIMATIONS} from '../src/animation-data.js';
import {bossActions} from '../src/rig-compat.js';
const audit=JSON.parse(fs.readFileSync(new URL('../docs/content-audit.json',import.meta.url),'utf8'));
const cell=value=>String(value??'').replaceAll('|','／').replaceAll('\n',' ');
const rows=list=>list.map(row=>'| '+row.map(cell).join(' | ')+' |').join('\n');
const text=`# 武将、皮肤与首领适配清单

本文件由 tools/export-content-docs.mjs 根据实际游戏内容与资源审计生成。

## 收录范围

已检查 HeroConf 的 ${audit.sourceHeroCount} 条武将记录及 skinList 的 ${audit.sourceVariants} 个外观条目。当前收录 ${HEROES.length} 位独立武将、${APPEARANCE_COUNT} 套外观（含每将默认外观，即另外 ${APPEARANCE_COUNT-HEROES.length} 套可切换外观）。同名鲁肃、张角的进阶形态归入原武将衣橱。

收录 ${Object.keys(BOSS_ANIMATIONS).length} 套去重后的原版首领骨骼；保留此前两个静态首领，总计 ${BOSSES.length} 个首领、${CHAPTERS.length} 章 ${TOTAL_WAVES} 关。每五关遇到一个首领，各首领在当前路线中出现一次。

## 筛选条件

- 皮肤归属必须来自 HeroConf.skinList，并由 AvatarConf 确定 bundle、asset、skin 和 UI 图片。名称优先读取 SkinConf 与 LanguageConf。
- 武将本体必须包含 idle、attack、skill，头像和立绘必须存在；原版普攻与技能都必须有独立 BulletConf，并能沿 EffectConf 解析实际骨骼、图集和纹理。配置要求的命中特效也必须齐全。
- 当前完整适配 Move、Line、Rush、Parabola、Position、Center 六类弹道。复合移动、穿行等尚未实现的类型不收录，也不借用其他武将特效代替。
- 原皮肤不兼容但同武将另有完整皮肤时，以兼容外观作为该武将默认外观；因此吕布、关羽等可能默认穿皮肤。
- 新增首领必须有原版 idle 骨骼和立绘，按资源包去重。具备 attack / skill 的首领播放对应动作，没有这些动作的首领保留原版待机，不虚构攻击轨道。首领技能机制与数值由本作独立设计。
- 资源优先来自已下载版本 3c7b0bfc39；缺项按已有下载版本补齐。每个实际文件的来源与散列见 assets/spine/manifest.json。本次没有下载网络资源。

## 衣橱规则

招募武将后免费穿戴已适配外观；换装只改变立绘、头像、武将本体与专属普攻 / 技能动画，不增加属性。换装只在局外进行，保存到本地存档。旧存档保留资源、等级、星级、阵容和已通关记录，新增武将仍需招募。

## 武将总览

| 武将 | 外观数 | 默认外观 | 默认 AvatarConf |
| --- | ---: | --- | ---: |
${rows(HEROES.map(h=>[h.name,APPEARANCES[h.id].length,APPEARANCES[h.id][0].name,APPEARANCES[h.id][0].avatarId]))}

## 全部兼容外观

| 武将 | 外观 | AvatarConf | 原版本体 / 内置皮肤 | 普攻 BulletConf / 类型 | 技能 BulletConf / 类型 |
| --- | --- | ---: | --- | --- | --- |
${rows(HEROES.flatMap(h=>APPEARANCES[h.id].map(a=>{const m=APPEARANCE_ANIMATIONS[a.id];return [h.name,a.name,a.avatarId,m.body+(m.skin?' / '+m.skin:''),m.attack.bullet.id+' / '+m.attack.type,m.skill.bullet.id+' / '+m.skill.type]})))}

## 未收录外观及原因

共 ${audit.excluded.length} 条。以下是当前已下载资源和本作弹道适配范围内的结论，不代表原游戏资源本身有问题。

| 武将 | 外观 | AvatarConf | 原因 |
| --- | --- | ---: | --- |
${rows(audit.excluded.map(a=>[a.heroName,a.name,a.avatarId,a.reason]))}

## 首领路线

名称优先使用原配置；部分资源缺少中文语言条目，其“秘境妖王”“极境守将”等名称为本作命名。不同外形共享六类后期机制，未声称复现原游戏对应 Boss 技能。已有两个静态首领明确标注。

| 关卡 | 首领 | 机制 | 原版本体 | 可用动作 |
| ---: | --- | --- | --- | --- |
${rows(BOSSES.map((b,i)=>{const m=BOSS_ANIMATIONS[b.bossKey];return[(i+1)*5,b.name,b.trait,m?.body||'保留原版静态立绘',m?bossActions(m).join(' / '):'静态']}))}

白骨精保留原版待机和普攻，技能动作在 Spine 3.8 下会产生异常活动骨骼坐标，因此演出使用原版普攻；未借用其他首领动画。诊断证据见 rig-diagnostic.json，安全动作选择位于 src/rig-compat.js。

## 未收录首领

| AvatarConf | 名称 / 资源 | 原因 |
| ---: | --- | --- |
${rows(audit.bosses.filter(b=>b.reason).map(b=>[b.avatarId,b.name+' / '+b.id,b.reason]))}

## 验证证据

- docs/browser-animation-audit.json：浏览器逐组解析 556 / 556 个骨骼，0 失败。它证明解析与必需动作 / 内置皮肤存在，不等同于逐一人工看完全部演出。
- docs/rig-validation.json：全部收录外观和首领按 30 帧采样检查实际骨骼姿态与内置皮肤；它是无纹理 CPU 检查，不等同于 GPU 画面验证。
- docs/asset-verification.json：2102 条原文件 / 导出文件记录核验，0 错误。
- tests/game.test.mjs：覆盖每套外观的普攻、技能引用与命中，换装属性不变、战斗锁定、存档兼容、首领路线和新机制。
- docs/balance-samples.json：57 章 × 3 个固定种子共 171 个推荐等级与星级模拟通过。尚未覆盖所有阵容与长期资源循环。
`;
fs.writeFileSync(new URL('../docs/武将皮肤与首领适配.md',import.meta.url),text,'utf8');
console.log('Content documentation generated.');
