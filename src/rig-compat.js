// The original White Bone Demon skill yields NaN on an active leg bone in Spine 3.8.
// Keep its original idle / attack animations; see docs/rig-diagnostic.json.
const disabledBossActions={'ygbh_boss_bgj/ygbh_boss_bgj':['skill']};
export function bossActions(meta){return meta.animations.filter(name=>!disabledBossActions[meta.body]?.includes(name));}
