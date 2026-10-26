"""Freeze all compatible characters and appearances from the audited source list."""
import json,re
from audit_content import ROOT,words,word
audit=json.loads((ROOT/'docs/content-audit.json').read_text(encoding='utf8'))
roster=json.loads((ROOT/'tools/asset-roster.json').read_text(encoding='utf8'))
aliases={'lusu2':'lusu','zhangjiao2_1':'zhangjiao'}
old=['guojia','zhouyu','simayi','ganning','lusu','pangtong','gongsunzan','zhangjiao','zhugeliang','zhenji','huangyueying','xiahouyuan','huangzhong','zhangzhao','luji','zhurongfuren']
groups={}
for h in audit['heroes']:
 key=aliases.get(h['id'],h['id']);groups.setdefault(key,[]).extend(h['variants'])
appearance={}
for key,rows in groups.items():
 rows.sort(key=lambda r:(r['path']!=key,r['avatarId']))
 appearance[key]=[dict(id=str(r['avatarId']),name=r['name'],heroId=key,avatarId=r['avatarId'],body=r['body'],bundle=r['path'],skin=r['skin'],head='appearances/'+str(r['avatarId'])+'-head',portrait='appearances/'+str(r['avatarId'])+'-body',sourceHead=r['head'],sourcePortrait=r['portrait']) for r in rows]
names={aliases.get(h['id'],h['id']):h['name'] for h in audit['heroes']}
specs={
 'guanyu':('shu','射手','贯阵斩将','cleave',46,1.55,.16,2,'龙威贯阵','同时攻击 2 人并穿透 15% 护甲，技能额外攻击 1 人。'),
 'taishici':('wu','射手','连射助攻','mark',28,1.05,.14,2,'神弓连射','攻击给目标叠加 5% 易伤，最多 15%，全队后续攻击享受增伤。'),
 'lvbu':('qun','射手','乱世收割','execute',49,1.28,.2,1,'无双破军','对生命低于 35% 的敌人伤害提高 35%，技能造成 220% 伤害。'),
 'huatuo':('qun','辅助','青囊济世','heal',22,1.45,.05,1,'青囊济世','每 9 秒修复营地 4 点；技能额外修复 6 点耐久。'),
 'sunce':('wu','射手','霸王击退','knock',41,1.35,.12,1,'霸王破浪','技能击退普通敌人 70 距离，对首领效果减半。'),
 'jiaxu':('qun','法师','蚀骨毒计','poison',30,1.3,.12,2,'蚀骨毒计','普攻附加 4 秒毒伤，技能毒伤翻倍，同时攻击 2 人。'),
 'caoren':('wei','辅助','玄武守阵','heal',26,1.55,.05,2,'玄武守阵','每 9 秒修复营地 4 点，技能额外修复 6 点，同时攻击 2 人。'),
 'jiangwei':('shu','射手','破甲连锋','siege',39,1.15,.15,1,'麒麟破甲','攻击有护甲目标时伤害提高 25%，技能削减 10% 护甲。'),
 'sunjian':('wu','射手','斩将破盾','hunter',44,1.5,.14,1,'猛虎斩将','优先攻击首领，对首领额外造成 35% 伤害。'),
 'daqiao':('wu','法师','潮汐缓行','slow',27,1.3,.08,2,'潮汐封阵','普攻减速 28%，技能冰冻 1.2 秒，同时攻击 2 人。'),
 'xiaoqiao':('wu','法师','花阵破绽','mark',29,1.15,.1,1,'落花破阵','每次命中叠加 5% 易伤，最多 15%，协助全队持续输出。'),
}
added=[]
for key in groups:
 if key in old:continue
 f,j,tag,trait,atk,interval,crit,targets,skill,desc=specs[key]
 added.append(dict(id=key,name=names[key],faction=f,job=j,tag=tag,trait=trait,attack=atk,interval=interval,crit=crit,targets=targets,skillName=skill,desc=desc+'每第 5 次攻击释放技能。',color={'wei':'#8da9c0','shu':'#9cb77a','wu':'#cb9a68','qun':'#b795c6'}[f]))
bosses=[];seen=set();used_names={};family_names={'zytp':'迷阵守将','qiuyuanboss':'绿茵守门人','sdsl':'试炼魔将','xjzw':'秘境妖王','cjqh':'古域霸主','ss':'深渊魔王','wbhj':'幻境守卫','znq2024':'庆典霸主','sdjs':'极境守将'}
for b in audit['bosses']:
 if 'reason' in b or b['id'] in seen:continue
 seen.add(b['id']);name=b['name'];family=b['id'].split('_')[0]
 if not name or name.startswith('avatarConf_'):
  suffix=b['id'].split('_')[-1].replace('boss','').upper()
  name=family_names.get(family,'秘境首领')+(' '+suffix if suffix and not suffix.isalpha() else '')
 if b['id']=='yzxt_dengshen':name='云中灯神'
 used_names[name]=used_names.get(name,0)+1
 if used_names[name]>1:name+=' · '+str(used_names[name])
 bosses.append(dict(id=b['id'],name=name,image=b['portrait'].split('/')[-1],avatarId=b['avatarId'],body=b['id']+'/'+b['body'],skin=b['skin'],family=family))
roster['heroes']=old+[h['id'] for h in added]
roster['bosses']=bosses;roster['appearances']=appearance
roster['monsters']=list(dict.fromkeys(roster['monsters']+[b['image'] for b in bosses]))
(ROOT/'tools/asset-roster.json').write_text(json.dumps(roster,ensure_ascii=False,indent=2),encoding='utf8')
out='// Generated from formal HeroConf.skinList, SkinConf and AvatarConf; see content-audit.json.\n'
for name,data in [('APPEARANCES',appearance),('ADDED_HEROES',added),('SOURCE_BOSSES',bosses)]:out+='export const '+name+'='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'
(ROOT/'src/content-data.js').write_text(out,encoding='utf8')
print('Roster:',len(roster['heroes']),'heroes,',sum(map(len,appearance.values())),'appearances,',len(bosses),'unique source bosses')
