'use strict';
/* 삼국지 군웅전기 시제품 v1: 원작 v20.1은 수정하지 않고 새 엔진으로 구현. */
const SAVE_KEY='tk-warlord-newgame-prototype-v1';
const SHU=['유비','관우','장비','조운','제갈량','마초','황충'];
const WEI=['조조','하후돈','장료','전위','허저','사마의','순욱'];
const WU=['손권','손책','주유','감녕','태사자','황개','육손'];
const NAMES=[...SHU,...WEI,...WU];
const FAC={shu:'촉',wei:'위',wu:'오'};
const HANJA={'유비':'劉','관우':'關','장비':'張','조운':'趙','제갈량':'諸','마초':'馬','황충':'黃','조조':'曹','하후돈':'夏','장료':'張','전위':'典','허저':'許','사마의':'司','순욱':'荀','손권':'孫','손책':'策','주유':'周','감녕':'甘','태사자':'太','황개':'黃','육손':'陸'};
const COST=[2,4,8];
const VAL=(arr,level)=>arr[Math.max(0,Math.min(3,Number(level)||0))];
const s=(id,name,role,desc,vals,cd,extra={})=>({id,name,role,desc,vals,cd,...extra});
// 수치 순서: Lv.0 / Lv.1 / Lv.2 / Lv.3. 스킬 효과/초기 쿨타임은 1차 밸런스 초안.
const SHU_SKILLS={
 '유비':[
 s('liu_bond','도원결의','지휘','아군 전체 피해 증가 5초. 관우·장비가 출전 중이면 해당 장수 피해 감소 4%.',[5,7,9,12],8),
 s('liu_care','인덕애민','방어','아군 전체 보호막과 3초 지속 회복.',[3,4,5,6],9,{regen:[1,1,1.3,1.5]}),
 s('liu_visit','삼고초려','전략','지력 최고 아군의 다음 기술 발동을 앞당김.',[.5,.7,.9,1.2],8),
 s('liu_last','칠전팔기','역전','아군 전체 피해 감소 5초. 생존 아군 2명 이하면 2배.',[5,7,9,12],9)
 ],
 '관우':[
 s('guan_strike','백마참장','공격','적 1명 강타. 첫 발동은 최종 피해 20% 증가.',[150,170,190,215],6),
 s('guan_guard','충의의 수호','방어','자신과 체력 최저 아군에게 5초 보호막.',[8,11,14,18],8),
 s('guan_flood','수엄칠군','전략','적 전열 전체 공격, 4초 공격 속도 감소.',[65,75,85,100],9,{slow:[7,9,11,14]}),
 s('guan_chain','청룡연격','대기만성','단일 피해. 사용할수록 자신의 해당 기술 피해 증가, 최대 3중첩.',[80,95,110,125],6.5,{stack:[5,6,7,9]})
 ],
 '장비':[
 s('zhang_aoe','만인지적','광역 공격','적 전체에게 물리 피해.',[60,70,80,95],8),
 s('zhang_roar','장판대갈','교란','적 전체 공격 속도 감소, 4초.',[8,11,14,18],8),
 s('zhang_yan','의석엄안','전략','적 1명 강타 후 피해량 감소, 4초.',[115,130,145,165],7.5,{weaken:[7,9,11,14]}),
 s('zhang_rage','노기충천','역전','5초간 자신의 피해 증가. 체력 50% 이하라면 두 배.',[6,8,10,13],8)
 ],
 '조운':[
 s('zhao_save','단기구주','구출','체력이 가장 낮은 아군 1명에게 5초 보호막.',[12,15,18,22],8),
 s('zhao_dodge','칠진칠출','회피 공격','적 1명 공격 후 자신의 회피율 상승, 4초.',[95,110,125,145],6,{dodge:[10,14,18,23]}),
 s('zhao_feint','한수공성','전략','적 전체 공격 명중률 감소, 4초.',[6,8,10,12],8),
 s('zhao_guard','일신시담','호위','체력이 가장 낮은 아군의 피해를 5초간 대신 받음. 자신 피해 감소 8%.',[10,13,16,20],8)
 ],
 '제갈량':[
 s('zhuge_array','팔진도','방어','전열 아군 피해 감소, 후열 아군 공격 속도 증가, 5초.',[6,8,10,12],9,{rearSpeed:[3,4,5,7]}),
 s('zhuge_plan','융중대책','전략','4초간 적 전체가 받는 피해 증가.',[5,7,9,12],9),
 s('zhuge_bolts','제갈연노','책략 공격','적 1명에게 책략 피해 3회.',[35,40,46,54],6.5),
 s('zhuge_supply','목우유마','지원','체력 비율이 낮은 아군 2명, 4초 동안 지속 회복.',[1.5,2,2.5,3],8)
 ],
 '마초':[
 s('ma_charge','서량금마','돌격','적 1명 강타. 첫 발동 피해량 추가 증가.',[145,165,185,205],6.5,{first:[10,12,14,16]}),
 s('ma_assault','관중맹습','공격 강화','자신의 공격 피해 증가 5초. 받는 피해도 5% 증가.',[10,14,18,23],8),
 s('ma_cavalry','서량철기','지휘','4초간 아군 전체 공격 속도 증가, 전열은 추가 3%p.',[6,8,10,13],8),
 s('ma_recover','패전의 재기','생존','적 1명 공격. 자신의 HP 60% 이하일 때 HP 회복.',[105,120,140,165],7.5,{heal:[5,7,9,12]})
 ],
 '황충':[
 s('huang_finish','정군참수','공격','적 1명 공격. 대상 HP 50% 이하라면 최종 피해 15% 추가.',[135,155,180,205],7),
 s('huang_aim','백보천양','정밀 공격','명중률 상승과 적 방어 일부 무시.',[95,105,115,125],6.5,{hit:[10,12,15,18],pierce:[5,8,11,15]}),
 s('huang_old','노익장','대기만성','적 1명 공격. 전투 10초 이후 피해량 30% 추가.',[90,105,120,140],6.5),
 s('huang_cheer','선봉격려','지원','무력 상위 아군 2명의 피해량 증가 4초.',[6,8,10,13],8)
 ]
};
// 위·오 14명의 4개 기술은 정식 기획 전: 플레이 테스트용 임시 공용 기술이다.
const TEMP_SKILLS=[
 s('tmp_strike','임시 · 공격','임시','자동 선택된 적 1명에게 기본 물리 공격 배율 피해.',[105,120,135,155],7,{temporary:true}),
 s('tmp_defend','임시 · 방어','임시','자신과 체력 비율 최저 아군에게 5초 보호막.',[6,8,10,12],9,{temporary:true}),
 s('tmp_tactic','임시 · 책략','임시','적 전체에 책략 피해.',[35,45,55,65],9,{temporary:true}),
 s('tmp_help','임시 · 지원','임시','체력 비율 최저 아군 한 명을 회복.',[8,10,12,15],9,{temporary:true})
];
function skillList(name){return SHU_SKILLS[name]||TEMP_SKILLS;}
let state=null,focusHeroId=null,focusSlot=null,tab='camp',modalCloseAllowed=true,toastTimer=null,dragHeroId=null,tapDeployHeroId=null;
let fight=null,fightTimer=null,fightSpeed=1,skillSerial=0;
const $=id=>document.getElementById(id);
const rand=n=>Math.floor(Math.random()*n);
const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
function safeNum(v,otherwise=0){const n=Number(v);return Number.isFinite(n)?n:otherwise;}
function clamp(x,min,max){return Math.max(min,Math.min(max,x));}
function heroById(id){return state?.roster.find(h=>h.id===id)||null;}
function skillLevel(hero,i){return (hero.base?.[i]||0)+(hero.paid?.[i]||0);}
function paidCount(hero){return hero.paid.reduce((a,b)=>a+b,0);}
function cap(){return state?.treasures.includes('손자병법')?6:5;}
function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),2100);}
function newGeneral(name){const chosen=shuffle([0,1,2,3]).slice(0,3);const base=[0,0,0,0];for(const i of chosen)base[i]=1;
 return {id:`h${++state.nextId}`,name,base,paid:[0,0,0,0],active:chosen[0],slot:null,hp:HERO_STATS[name].hp};}
function beginRun(faction){if(!FAC[faction])return;if((state||load())&&!confirm('기존 출정 기록이 새 출정으로 교체됩니다. 계속할까요?'))return;
 state={version:1,side:faction,round:1,gold:6,nextId:0,roster:[],treasures:[],recruitPending:false,recruitChoices:[],optionalDone:{},win:false};
 const starters={shu:['유비','관우','장비'],wei:['조조','하후돈','장료'],wu:['손권','손책','주유']}[faction];
 starters.forEach((n,i)=>{const h=newGeneral(n);h.slot=i<2?i:4;state.roster.push(h);});
 focusHeroId=state.roster[0].id;focusSlot=null;save();openGame();switchTab('camp');toast('출정 시작! 장수 3명이 편성되었습니다.');}
function validateLoaded(obj){return obj&&obj.version===1&&FAC[obj.side]&&Number.isInteger(obj.round)&&obj.round>=1&&obj.round<=16&&Array.isArray(obj.roster)&&obj.roster.length<=8&&Array.isArray(obj.treasures)&&obj.roster.every(h=>h&&HERO_STATS[h.name]&&Array.isArray(h.base)&&h.base.length===4&&Array.isArray(h.paid)&&h.paid.length===4&&h.base.filter(x=>x===1).length===3&&h.base.every(x=>x===0||x===1)&&h.paid.every(x=>Number.isInteger(x)&&x>=0)&&h.base.every((b,i)=>b+h.paid[i]<=3)&&paidCount(h)<=4&&Number.isFinite(h.hp)&&[null,0,1,2,3,4,5,6,7].includes(h.slot));}
function load(){try{const x=JSON.parse(localStorage.getItem(SAVE_KEY));if(validateLoaded(x))return x;}catch(e){}return null;}
function save(){if(!state)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){console.warn('로컬 저장 불가',e);}}
function continueRun(){const x=load();if(!x){toast('저장된 출정이 없습니다.');showStartMenu();return;}state=x;focusHeroId=state.roster[0]?.id||null;tapDeployHeroId=null;openGame();switchTab('camp');}
function showStartMenu(){$('start-menu').hidden=false;$('faction-menu').hidden=true;$('continue-button').disabled=!load();}
function showFactionSelection(){$('start-menu').hidden=true;$('faction-menu').hidden=false;}
function openGame(){$('start-screen').hidden=true;$('game-content').hidden=false;renderAll();}
function renderAll(){renderTop();renderCamp();renderMap();}
function renderTop(){if(!state){$('topstats').innerHTML='';return;}$('topstats').innerHTML=`<span>${Math.min(15,state.round)} / 15전</span><span>🪙 ${state.gold}금</span>`;}
function switchTab(name){if(name==='battle'&&!fight)return;tab=name;for(const x of ['camp','map','battle']){const page=$(x+'-page');if(page)page.hidden=x!==name;const b=$('tab-'+x);if(b)b.classList.toggle('active',x===name);}if(name==='camp')renderCamp();if(name==='map')renderMap();}
function isTouchUi(){return window.matchMedia('(pointer: coarse)').matches||window.innerWidth<=830;}
function deployedCount(){return state.roster.filter(x=>x.slot!==null).length;}
function renderCamp(){
 if(!state)return;
 renderTop();
 $('deploy-counter').textContent=`${deployedCount()} / ${cap()}명`;
 $('formation-hint').textContent='';
 for(const row of ['front','rear']){
  const start=row==='front'?0:4;
  $(row+'-slots').innerHTML=Array.from({length:4},(_,i)=>{
   const pos=start+i,h=state.roster.find(x=>x.slot===pos);
   return `<button class="formation-slot ${h?'on':''} ${focusSlot===pos?'focus':''} ${h?'':'empty'}"
     onclick="onSlotAction(${pos})" draggable="${!!h&&!isTouchUi()}"
     ondragstart="${h?`startDragHero(event,'${h.id}')`:''}" ondragend="endDragHero(event)"
     ondragover="allowDropHero(event)" ondragleave="leaveDropHero(event)" ondrop="dropHeroOnSlot(event,${pos})">
      <span class="slot-no">${i+1}</span>
      ${h?`<div class="hero-face" data-faction="${HERO_STATS[h.name].faction}">${HANJA[h.name]}</div><span class="mini-name">${h.name}</span>`:'<strong>+</strong><span>배치</span>'}
     </button>`;
  }).join('');
 }
 const reserve=state.roster.filter(h=>h.slot===null);
 $('roster-counter').textContent=`대기 ${reserve.length}명 · 전체 ${state.roster.length}/8`;
 $('roster-grid').innerHTML=reserve.length?reserve.map(h=>`<div class="hero-card ${tapDeployHeroId===h.id?'tap-selected':''}"
   draggable="${!isTouchUi()}" role="button" tabindex="0"
   aria-label="${h.name} ${isTouchUi()?'선택':'상세 보기'}"
   onclick="selectHero('${h.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectHero('${h.id}')}"
   ondragstart="startDragHero(event,'${h.id}')" ondragend="endDragHero(event)">
     <button class="hero-more" aria-label="${h.name} 스킬 상세" title="상세" onclick="event.stopPropagation();openHeroDetails('${h.id}')">ⓘ</button>
     <div class="hero-face" data-faction="${HERO_STATS[h.name].faction}">${HANJA[h.name]}</div>
     <strong>${h.name}</strong></div>`).join(''):'<div class="empty-roster">대기 장수 없음</div>';
 $('recruit-btn').disabled=!state.recruitPending;
 $('recruit-btn').textContent='재야탐색';
 $('treasure-pills').innerHTML=state.treasures.length?state.treasures.map(t=>`<span class="treasure-pill">${t}</span>`).join(''):'<span class="hint">아직 없음</span>';
}
function placeHeroToSlot(id,slot){const h=heroById(id);if(!h||fight)return false;const other=state.roster.find(x=>x.slot===slot);if(other&&other.id!==h.id)other.slot=null;if(h.slot===null&&deployedCount()>=cap()&&!other){toast(`최대 ${cap()}명까지 출전할 수 있습니다.`);return false;}h.slot=slot;focusHeroId=id;focusSlot=null;tapDeployHeroId=null;save();toast(`${h.name} 배치 완료`);return true;}
function selectSlot(slot){if(fight){toast('전투 중에는 진형을 바꿀 수 없습니다.');return;}focusSlot=slot;renderCamp();}
function onSlotAction(slot){
 if(fight)return;
 if(tapDeployHeroId){const id=tapDeployHeroId;placeHeroToSlot(id,slot);renderCamp();return;}
 const h=state.roster.find(x=>x.slot===slot);
 if(h){openHeroDetails(h.id);return;}
 if(!isTouchUi()&&focusHeroId&&heroById(focusHeroId)?.slot===null){placeHeroToSlot(focusHeroId,slot);renderCamp();return;}
 focusSlot=slot;renderCamp();
}
function selectHero(id){
 if(fight)return;
 const h=heroById(id);if(!h)return;
 focusHeroId=id;
 if(isTouchUi()){focusSlot=null;tapDeployHeroId=id;renderCamp();toast('배치할 칸을 선택하세요.');}
 else openHeroDetails(id);
}
function startDragHero(ev,id){if(isTouchUi()||fight){ev.preventDefault();return;}dragHeroId=id;ev.dataTransfer.setData('text/plain',id);ev.dataTransfer.effectAllowed='move';ev.currentTarget.classList.add('dragging');focusHeroId=id;}
function endDragHero(ev){dragHeroId=null;ev.currentTarget.classList.remove('dragging');document.querySelectorAll('.formation-slot').forEach(el=>el.classList.remove('drop-target'));}
function allowDropHero(ev){if(fight||isTouchUi())return;ev.preventDefault();ev.currentTarget.classList.add('drop-target');}
function leaveDropHero(ev){ev.currentTarget.classList.remove('drop-target');}
function dropHeroOnSlot(ev,slot){ev.preventDefault();ev.currentTarget.classList.remove('drop-target');if(fight)return;const id=ev.dataTransfer.getData('text/plain')||dragHeroId;if(!id)return;placeHeroToSlot(id,slot);renderCamp();}
function choosePositionFromDetails(id){if(fight)return;const h=heroById(id);if(!h)return;focusHeroId=id;tapDeployHeroId=id;closeModal();renderCamp();toast('배치할 칸을 선택하세요.');}
function sendToReserve(id){const h=heroById(id);if(!h||fight)return;h.slot=null;focusSlot=null;if(tapDeployHeroId===id)tapDeployHeroId=null;save();renderCamp();}
function autoPlace(id){const h=heroById(id);if(!h||fight)return;if(h.slot!==null){toast('이미 출전 중입니다.');return;}if(deployedCount()>=cap()){toast('출전 정원이 가득 찼습니다.');return;}const used=new Set(state.roster.map(x=>x.slot));const free=[0,1,2,3,4,5,6,7].find(x=>!used.has(x));if(free!==undefined){h.slot=free;save();renderCamp();}}
function skillDamageText(sk,level){
 const physicalOrMagic=new Set(['guan_strike','guan_flood','guan_chain','zhang_aoe','zhang_yan','zhao_dodge','zhuge_bolts','ma_charge','ma_recover','huang_finish','huang_aim','huang_old','tmp_strike','tmp_tactic']);
 if(!physicalOrMagic.has(sk.id))return '0';
 const v=VAL(sk.vals,level);
 if(sk.id==='zhuge_bolts')return `${v}% × 3회`;
 if(['guan_flood','zhang_aoe','tmp_tactic'].includes(sk.id))return `${v}% / 대상`;
 return `${v}%`;
}
function skillEffectText(sk,level){
 const v=VAL(sk.vals,level),e=(key)=>sk[key]?VAL(sk[key],level):0;
 switch(sk.id){
 case 'liu_bond':return `아군 전체 피해 +${v}%, 5초. 관우·장비는 받는 피해 추가 4% 감소.`;
 case 'liu_care':return `아군 전체 보호막 최대 HP ${v}%, 3초간 매초 최대 HP ${e('regen')}% 회복.`;
 case 'liu_visit':return `지력이 가장 높은 아군의 다음 기술 발동 ${v}초 앞당김.`;
 case 'liu_last':return `전체 받는 피해 ${v}% 감소, 5초. 생존 2명 이하면 ${v*2}% 감소.`;
 case 'guan_strike':return `첫 사용 시 피해량 20% 추가.`;
 case 'guan_guard':return `자신과 체력 비율 최저 아군에게 각각 최대 HP ${v}% 보호막, 5초.`;
 case 'guan_flood':return `적 전열 전체 공격, 공격 속도 ${e('slow')}% 감소, 4초.`;
 case 'guan_chain':return `사용할 때마다 이 기술 피해 +${e('stack')}%, 최대 3중첩.`;
 case 'zhang_aoe':return `적 전체를 공격.`;
 case 'zhang_roar':return `적 전체 공격 속도 ${v}% 감소, 4초.`;
 case 'zhang_yan':return `대상 피해량 ${e('weaken')}% 감소, 4초.`;
 case 'zhang_rage':return `자신의 피해량 +${v}%, 5초. HP 50% 이하라면 +${v*2}%.`;
 case 'zhao_save':return `체력 비율 최저 아군에게 최대 HP ${v}% 보호막, 5초.`;
 case 'zhao_dodge':return `공격 후 자신 회피율 +${e('dodge')}%p, 4초.`;
 case 'zhao_feint':return `적 전체 명중률 ${v}%p 감소, 4초.`;
 case 'zhao_guard':return `체력 최저 아군의 피해 ${v}% 대신 받음. 자신 피해 8% 감소, 5초.`;
 case 'zhuge_array':return `전열 피해 ${v}% 감소, 후열 공격 속도 +${e('rearSpeed')}%, 5초.`;
 case 'zhuge_plan':return `적 전체가 받는 피해 +${v}%, 4초.`;
 case 'zhuge_bolts':return `적 1명에게 책략 피해 3회.`;
 case 'zhuge_supply':return `HP 비율 최저 아군 2명, 4초간 매초 최대 HP ${v}% 회복.`;
 case 'ma_charge':return `첫 발동 피해 +${e('first')}%.`;
 case 'ma_assault':return `자신의 공격 피해 +${v}%, 받는 피해 +5%, 5초.`;
 case 'ma_cavalry':return `전체 공격 속도 +${v}%, 전열은 추가 +3%p, 4초.`;
 case 'ma_recover':return `HP 60% 이하일 때 최대 HP ${e('heal')}% 회복.`;
 case 'huang_finish':return `대상 HP가 50% 이하라면 최종 피해 15% 추가.`;
 case 'huang_aim':return `명중률 +${e('hit')}%p, 대상 방어력 ${e('pierce')}% 무시.`;
 case 'huang_old':return `전투 시작 10초 이후 최종 피해 30% 추가.`;
 case 'huang_cheer':return `무력 상위 아군 2명의 피해 +${v}%, 4초.`;
 case 'tmp_strike':return `적 1명에게 물리 피해. 임시 기술.`;
 case 'tmp_defend':return `자신과 체력 최저 아군에게 각각 최대 HP ${v}% 보호막, 5초. 임시 기술.`;
 case 'tmp_tactic':return `적 전체 책략 피해. 임시 기술.`;
 case 'tmp_help':return `체력 최저 아군 최대 HP ${v}% 회복. 임시 기술.`;
 default:return sk.desc;
 }
}
function skillSnapshot(sk,level){return `<p><strong>데미지</strong> ${skillDamageText(sk,level)}</p><p><strong>효과</strong> ${skillEffectText(sk,level)}</p><p><strong>쿨타임</strong> ${sk.cd}초</p>`;}
function renderHeroDetail(h){
 const d=HERO_STATS[h.name],skills=skillList(h.name);
 const stats=[`체력 ${Math.ceil(h.hp)}/${d.hp}`,`통솔 ${d.cmd}`,`무력 ${d.force}`,`지력 ${d.intel}`,`정치 ${d.pol}`];
 return `<div class="hero-popup-head">
  <div class="hero-face" data-faction="${d.faction}">${HANJA[h.name]}</div>
  <div class="hero-popup-identity"><strong>${h.name}</strong><span>${FAC[d.faction]} · ${h.slot===null?'대기':h.slot<4?'전열':'후열'}</span></div>
  <div class="hero-popup-budget">🪙 ${state.gold}금<br>강화 ${paidCount(h)}/4</div>
 </div><div class="hero-popup-stats">${stats.map(v=>`<span>${v}</span>`).join('')}</div>
 <div class="hero-skills">${skills.map((sk,i)=>{
  const lvl=skillLevel(h,i);
  return `<article class="hero-skill ${h.active===i?'active-skill':''}">
   <div class="hero-skill-top"><span class="hero-skill-name">${sk.name}</span><span class="hero-skill-level">Lv.${lvl}/3</span></div>
   <div class="hero-skill-line"><span>데미지</span><strong>${skillDamageText(sk,lvl)}</strong></div>
   <div class="hero-skill-line"><span>쿨타임</span><strong>${sk.cd}초</strong></div>
   <div class="hero-skill-effect"><span class="hero-effect-label">효과</span>${skillEffectText(sk,lvl)}</div>
   <div class="hero-skill-actions">
    <button class="${h.active===i?'is-active':'ghost'}" onclick="setSkill('${h.id}',${i})">${h.active===i?'✓ 사용 중':'스킬 지정'}</button>
    <button class="accent" ${lvl>=3?'disabled':''} onclick="showUpgradePreview('${h.id}',${i})">${lvl>=3?'최대 강화':'스킬 강화'}</button>
    ${h.paid[i]>0?`<button class="ghost" onclick="refundSkill('${h.id}',${i})">회수 ${COST[lvl-1]/2}금</button>`:''}
   </div>
  </article>`;
 }).join('')}</div>
 <div class="hero-popup-footer"><div class="actions">
  ${h.slot===null?`<button class="ghost" onclick="choosePositionFromDetails('${h.id}')">배치하기</button>`:`<button class="ghost" onclick="choosePositionFromDetails('${h.id}')">위치 변경</button><button class="ghost" onclick="sendToReserve('${h.id}');closeModal()">대기로 이동</button>`}
  <button class="ghost" onclick="askRelease('${h.id}')">장수 방출</button>
 </div><button onclick="closeModal()">닫기</button></div>`;
}
function openHeroDetails(id){
 if(!state||fight)return;
 const h=heroById(id);if(!h)return;
 focusHeroId=id;
 openModal('장수 상세',renderHeroDetail(h));
 $('modal-root').querySelector('.modal-box').classList.add('hero-detail-modal');
}
function showUpgradePreview(id,i){
 const h=heroById(id);if(!h||fight||i<0||i>3)return;
 const sk=skillList(h.name)[i],lev=skillLevel(h,i);
 if(lev>=3){toast('이미 최대 레벨입니다.');return;}
 const cost=COST[lev],canBuy=paidCount(h)<4&&state.gold>=cost;
 const msg=paidCount(h)>=4?'강화 4회를 모두 사용했습니다.':state.gold<cost?'금화가 부족합니다.':'';
 openModal(`${sk.name} · 스킬 강화`,
  `<div class="upgrade-box"><div class="upgrade-side"><h3>현재 Lv.${lev}</h3>${skillSnapshot(sk,lev)}</div>
   <div class="upgrade-arrow">➜</div><div class="upgrade-side new"><h3>강화 후 Lv.${lev+1}</h3>${skillSnapshot(sk,lev+1)}</div></div>
   <div class="upgrade-price">필요 금화 ${cost}금 <small>보유 ${state.gold}금 · 강화 ${paidCount(h)}/4회</small></div>
   ${msg?`<p class="modal-note" style="text-align:center">${msg}</p>`:''}`,
  `<button class="ghost" onclick="openHeroDetails('${id}')">장수 상세로</button><button class="accent" ${canBuy?'':'disabled'} onclick="confirmSkillUpgrade('${id}',${i})">${cost}금 사용 · 강화</button>`);
 $('modal-root').querySelector('.modal-box').classList.add('hero-detail-modal');
}
function confirmSkillUpgrade(id,i){
 const h=heroById(id);if(!h||fight||i<0||i>3)return;
 const lev=skillLevel(h,i),cost=COST[lev];
 if(lev>=3||cost===undefined||paidCount(h)>=4||state.gold<cost){toast('강화 조건을 확인하세요.');return;}
 state.gold-=cost;h.paid[i]++;save();renderCamp();openHeroDetails(id);
}
function setSkill(id,index){const h=heroById(id);if(!h||fight||index<0||index>3)return;h.active=index;save();renderCamp();openHeroDetails(id);}
function upgradeSkill(id,index){const h=heroById(id);if(!h||fight||index<0||index>3)return;const lev=skillLevel(h,index),cost=COST[lev];if(lev>=3||paidCount(h)>=4||cost===undefined||state.gold<cost){toast('강화 조건을 확인하세요.');return;}state.gold-=cost;h.paid[index]++;save();renderCamp();}
function refundSkill(id,index){const h=heroById(id);if(!h||fight||index<0||index>3||h.paid[index]<=0)return;const lev=skillLevel(h,index),cost=COST[lev-1]/2;if(state.gold<cost){toast('회수 비용이 부족합니다.');return;}state.gold-=cost;h.paid[index]--;save();renderCamp();openHeroDetails(id);}
function askRelease(id){const h=heroById(id);if(!h||fight)return;if(state.roster.length<=1){toast('마지막 장수는 방출할 수 없습니다.');return;}openModal('장수 방출',`<p><strong>${h.name}</strong> 장수를 방출할까요?</p><p class="modal-note">이 장수의 초기 스킬 배분, 금화로 투자한 강화 포인트와 육성 기록이 모두 사라지며 복구할 수 없습니다.</p>`,`<button class="ghost" onclick="closeModal()">취소</button><button onclick="confirmRelease('${id}')">방출 확정</button>`);}
function confirmRelease(id){if(!state||state.roster.length<=1)return;state.roster=state.roster.filter(h=>h.id!==id);if(tapDeployHeroId===id)tapDeployHeroId=null;focusHeroId=state.roster[0]?.id||null;focusSlot=null;save();closeModal();renderAll();toast('장수를 방출했습니다.');}
function sampleThree(){const pool=shuffle(NAMES);return pool.slice(0,3);}
function openRecruit(){if(!state?.recruitPending){toast('다음 전투 승리 후 활성화됩니다.');return;}if(!state.recruitChoices.length){state.recruitChoices=sampleThree();save();}const full=state.roster.length>=8;
 openModal('재야탐색 · 3명 중 1명',`<p class="modal-note">승리할 때마다 한 번만 등용할 수 있습니다. 기존에 보유한 장수도 다시 등장할 수 있으며, 처음부터 무작위 3개 기술이 Lv.1입니다.</p><div class="modal-choices">${state.recruitChoices.map((name,i)=>{const d=HERO_STATS[name];return `<div class="recruit-card"><div class="hero-face" data-faction="${d.faction}">${HANJA[name]}</div><strong>${name}</strong><small>${FAC[d.faction]} · ${d.force>=d.intel?'무력':'지력'} ${Math.max(d.force,d.intel)}</small><div class="recruit-details">체력 ${d.hp} · 통솔 ${d.cmd}<br>${SHU_SKILLS[name]?'4개 전용 스킬':'4개 임시 공용 스킬'}</div><button class="accent" ${full?'disabled':''} onclick="chooseRecruit(${i})">등용</button></div>`;}).join('')}</div>${full?'<p class="modal-note">보유 장수가 8명입니다. 등용하려면 먼저 장수를 방출하세요.</p>':''}`,`<button class="ghost" onclick="closeModal()">나중에 선택</button><button class="ghost" onclick="skipRecruit()">이번 등용 포기</button>`);
}
function chooseRecruit(index){if(!state.recruitPending||state.roster.length>=8)return;const name=state.recruitChoices[index];if(!HERO_STATS[name])return;const h=newGeneral(name);state.roster.push(h);state.recruitPending=false;state.recruitChoices=[];focusHeroId=h.id;save();closeModal();switchTab('camp');toast(`${name} 등용 완료!`);}
function skipRecruit(){if(!state.recruitPending)return;if(!confirm('이번 재야탐색 기회를 포기할까요?'))return;state.recruitPending=false;state.recruitChoices=[];save();closeModal();renderCamp();toast('이번 등용을 포기했습니다.');}
function openModal(title,body,foot=''){modalCloseAllowed=true;$('modal-root').querySelector('.modal-box').classList.remove('hero-detail-modal');$('modal-title').textContent=title;$('modal-body').innerHTML=body;$('modal-footer').innerHTML=`<div class="modal-footer-actions">${foot}</div>`;$('modal-root').hidden=false;}
function closeModal(){if(!modalCloseAllowed)return;$('modal-root').hidden=true;$('modal-body').innerHTML='';$('modal-root').querySelector('.modal-box').classList.remove('hero-detail-modal');}
function showRules(){openModal('게임 규칙',`<div class="rules-list">15회 전투 · 기존 분기형 맵과 자동 공격을 유지하는 시제품입니다.<br>장수 등급은 없으며, 원본 기본 능력치를 사용합니다.<br>전투 승리마다 재야탐색 1회, 21명 중 무작위 3명을 제시하고 1명을 등용합니다.<br>보유 정원 8명, 출전 5명(손자병법 보유 시 6명), 전열 4칸·후열 4칸입니다.<br>장수는 4개 기술 중 하나를 지정해 자동 사용합니다.<br>초기 3개 기술에 1레벨씩 무작위 고정되며 회수할 수 없습니다.<br>유료 강화는 장수당 합계 4회, 기술당 Lv.3까지입니다. 비용은 2/4/8금입니다.<br>유료 강화 회수는 해당 단계 구매 가격의 절반을 금화로 지불합니다.<br>동일 이름 장수의 강화와 배치는 개별 저장되며 지원 효과는 서로 중첩됩니다.<br>위·오의 기술 56개는 아직 임시 기능이며, 촉 28개가 상세 설계본입니다.<br>진행 내용은 이 브라우저의 로컬 저장 공간에 자동 저장됩니다.</div>`,`<button class="accent" onclick="closeModal()">확인</button>`);}
function resetRunPrompt(){if(fight){toast('전투 중에는 새 출정을 시작할 수 없습니다.');return;}if(!confirm('현재 출정을 종료하고 시작 화면으로 돌아갈까요? 저장한 출정은 삭제됩니다.'))return;state=null;focusHeroId=null;focusSlot=null;tapDeployHeroId=null;try{localStorage.removeItem(SAVE_KEY);}catch(e){}$('game-content').hidden=true;$('start-screen').hidden=false;showStartMenu();renderTop();}
const EPISODE=(n)=>n<=5?'황건의 난':n<=10?'반동탁 연합':'군웅할거';
const SIDE_NODES=['사건','보물','의원','상점'];
function sideKind(round){return SIDE_NODES[(round-1)%SIDE_NODES.length];}
function sideDone(round){return !!state?.optionalDone?.[round];}
function canVisitSide(round){return !!state&&!state.win&&!state.lost&&state.round===round&&!sideDone(round)&&!fight;}
function renderMap(){if(!state)return;const r=state.round;
 $('map-route').innerHTML=Array.from({length:15},(_,idx)=>{const n=15-idx;const completed=n<r,active=n===r;const kind=sideKind(n);const optionalDone=sideDone(n);const reason=state.recruitPending?'먼저 재야탐색을 완료하거나 포기하세요.':'전투 준비 완료';
 return `<div class="map-row"><button class="map-node optional ${optionalDone?'done':''} ${active&&!optionalDone?'current':''}" ${active&&!optionalDone&&!state.recruitPending&&!fight&&!state.lost?'':'disabled'} onclick="visitSide(${n})"><small>${kind==='사건'?'?':kind==='보물'?'◆':kind==='의원'?'✚':'▣'}</small><strong>${kind}</strong><small>${optionalDone?'방문 완료':active?'선택 경로':'옆길'}</small></button><button class="map-node ${completed?'done':active?'current':'locked'}" ${active&&!state.recruitPending&&!state.win&&!state.lost&&!fight?'':'disabled'} onclick="previewFight(${n})"><small>${n===15?'최종 전투':EPISODE(n)}</small><strong>${n}전 · ⚔ 전투</strong><small>${completed?'격파':active?reason:n>r?'미개방':'완료'}</small></button><div style="display:grid;place-items:center;color:${active?'#f2cd81':'#8694a7'};font-size:13px">${completed?'✓ 완료':active?'현재 위치':''}</div></div>`;}).join('');
}
function visitSide(round){if(!canVisitSide(round)){toast('지금은 방문할 수 없습니다.');return;}if(state.recruitPending){toast('먼저 재야탐색을 완료하세요.');return;}const type=sideKind(round);
 if(type==='의원')openModal('의원',`<p>생존한 보유 장수의 체력을 최대 체력의 20%만큼 회복합니다. 전열과 후열에 배치하지 않은 장수도 대상입니다.</p>`,`<button class="ghost" onclick="closeModal()">돌아가기</button><button class="accent" onclick="applySide('heal')">무료 치료</button>`);
 if(type==='사건')openModal('길 위의 사건',`<p>길을 걷던 중 상인을 도왔습니다. 작은 금낭을 감사의 표시로 받았습니다.</p><p class="modal-note">사건 보상: 금화 2개</p>`,`<button class="ghost" onclick="closeModal()">돌아가기</button><button class="accent" onclick="applySide('event')">보상 받기</button>`);
 if(type==='보물'){const pool=['손자병법','청낭서','학우선','적로'];const available=pool.filter(t=>!state.treasures.includes(t));const choices=shuffle(available).slice(0,3);
 openModal('보물 발견',`<p class="modal-note">세 가지 보물 중 하나를 선택하세요. 손자병법을 얻으면 출전 정원이 5명에서 6명으로 늘어납니다.</p><div class="modal-choices">${choices.map((t,i)=>`<button class="recruit-card" onclick="applySide('treasure','${t}')"><strong>${t}</strong><div class="recruit-details">${treasureDescription(t)}</div><span>획득</span></button>`).join('')}</div>`,`<button class="ghost" onclick="closeModal()">나중에 방문</button>`);}
 if(type==='상점')openModal('행상인',`<p>장수를 판매하지 않는 물품 상점입니다.</p><p class="modal-note">보유 금화: ${state.gold}</p>`,`<button class="ghost" onclick="closeModal()">돌아가기</button><button ${state.gold<4?'disabled':''} onclick="applySide('shopHeal')">부상자 30% 회복 · 4금</button>`);
}
function treasureDescription(t){return ({'손자병법':'출전 장수 최대 6명','청낭서':'전투 후 생존 장수 체력 10% 회복','학우선':'아군 책략 피해 +5%','적로':'아군 회피 +5'})[t]||'보물';}
function applySide(type,arg){if(!state||fight||state.recruitPending||sideDone(state.round))return;const round=state.round;
 if(type==='heal'){state.roster.forEach(h=>{if(h.hp>0)h.hp=clamp(h.hp+HERO_STATS[h.name].hp*.2,0,HERO_STATS[h.name].hp);});toast('부상 장수 체력 회복');}
 else if(type==='event'){state.gold+=2;toast('2금 획득');}
 else if(type==='treasure'){if(!arg||state.treasures.includes(arg))return;state.treasures.push(arg);toast(`${arg} 획득`);}
 else if(type==='shopHeal'){if(state.gold<4)return;state.gold-=4;state.roster.forEach(h=>{if(h.hp>0)h.hp=clamp(h.hp+HERO_STATS[h.name].hp*.3,0,HERO_STATS[h.name].hp);});toast('치료 완료');}
 else return;
 state.optionalDone[round]=true;save();closeModal();renderAll();}
function previewFight(round){if(!state||fight||state.recruitPending||round!==state.round||state.lost||state.win)return;
 const deployed=state.roster.filter(h=>h.slot!==null&&h.hp>0);if(!deployed.length){toast('출전 가능한 생존 장수를 배치하세요.');return;}
 const names=(ENCOUNTERS[round]||[]).map(e=>e.name);openModal(`${round}전 · ${EPISODE(round)}`,`<p>적군 ${names.length}명: <strong>${names.join(', ')}</strong></p><p>출전 아군: ${deployed.length}명 / ${cap()}명</p><p class="modal-note">자동 전투입니다. 전투 중 공격 목표를 직접 지정하거나 장수의 스킬을 변경할 수 없습니다.</p>`,`<button class="ghost" onclick="closeModal()">편성 변경</button><button class="accent" onclick="startFight()">전투 시작</button>`);
}
function makeUnit(h,idx,enemy=false){if(enemy){return {id:`e${idx}`,name:h.name,enemy:true,slot:idx<4?idx:idx+0,role:h.skillName,cmd:h.cmd,force:h.force,intel:h.intel,pol:h.pol,maxHp:h.hp,hp:h.hp,cooldown:h.cooldown||8,skills:[h],active:0,level:0,
   nextAttack:1+idx*.28,nextSkill:2.8+idx*.25,buffs:[],shield:0,stacks:{},castCount:0};}
 const d=HERO_STATS[h.name];return {id:h.id,name:h.name,enemy:false,slot:h.slot,role:skillList(h.name)[h.active].name,cmd:d.cmd,force:d.force,intel:d.intel,pol:d.pol,maxHp:d.hp,hp:h.hp,cooldown:d.cooldown,
  skills:skillList(h.name),active:h.active,level:skillLevel(h,h.active),nextAttack:1+idx*.26,nextSkill:2.0+idx*.22,buffs:[],shield:0,stacks:{},castCount:0};}
function startFight(){if(!state||fight||state.recruitPending)return;const heroes=state.roster.filter(x=>x.slot!==null&&x.hp>0).sort((a,b)=>a.slot-b.slot);if(!heroes.length)return;
 const foes=ENCOUNTERS[state.round];if(!foes||!foes.length){toast('전투 데이터가 없습니다.');return;}
 closeModal();fightSpeed=1;skillSerial=0;fight={round:state.round,time:0,finished:false,result:null,actors:heroes.map((h,i)=>makeUnit(h,i)),foes:foes.map((e,i)=>makeUnit(e,i,true)),logs:[]};
 $('speed-button').textContent='속도 ×1';$('tab-battle').disabled=false;switchTab('battle');$('battle-footer').innerHTML='';$('battle-title').textContent=`${state.round}전 · ${EPISODE(state.round)}`;
 $('battle-status').textContent='자동 전투 진행 중';$('battle-description').textContent='전투 중에는 공격 대상을 지정할 수 없습니다.';
 logBattle(`⚔ ${state.round}전 개전!`,true);drawFight();clearInterval(fightTimer);fightTimer=setInterval(tickFight,120);}
function cycleSpeed(){if(!fight||fight.finished)return;fightSpeed=fightSpeed===1?2:fightSpeed===2?3:1;$('speed-button').textContent=`속도 ×${fightSpeed}`;}
function living(team){return team.filter(u=>u.hp>0);}
function lowHp(team){return living(team).slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||null;}
function activeBuffs(unit,t){return unit.buffs.filter(b=>b.until>t);}
function buffSum(u,key){return activeBuffs(u,fight.time).reduce((v,b)=>v+(b.key===key?b.value:0),0);}
function addBuff(u,key,value,duration,source){if(!u)return;const sk=source+':'+key;u.buffs=u.buffs.filter(b=>b.source!==sk);u.buffs.push({key,value,until:fight.time+duration,source:sk});}
function addShield(u,pct,duration,source){if(!u)return;const value=u.maxHp*pct/100;u.shield+=value;u.buffs.push({key:'shield',value,until:fight.time+duration,source:source+':shield:'+ (++skillSerial)});}
function syncShield(u){const alive=activeBuffs(u,fight.time).filter(b=>b.key==='shield');u.shield=Math.max(0,alive.reduce((a,b)=>a+b.value,0));}
function heal(u,v){if(!u||u.hp<=0||!Number.isFinite(v)||v<=0||fight&&activeBuffs(u,fight.time).some(b=>b.key==='noHeal'))return 0;const before=u.hp;u.hp=clamp(u.hp+v,0,u.maxHp);return u.hp-before;}
function sourceId(actor,sk){return actor.id+':'+sk.id;}
function hitTargets(actor,foes,mode='one'){const alive=living(foes);if(!alive.length)return[];if(mode==='all')return alive;if(mode==='front'){const front=alive.filter(u=>u.slot<4);return front.length?front:alive;}
 const front=alive.filter(u=>u.slot<4),pool=front.length?front:alive;return [pool[rand(pool.length)]];}
function physicalBase(a,d,pierce=0){return Math.max(7,12+a.force*.27-d.cmd*.09*(1-pierce/100));}
function magicBase(a,d){return Math.max(7,12+a.intel*.26-d.pol*.08);}
function attackMod(a,kind){const up=buffSum(a,'damageUp');const phy=(kind==='physical'?1:1);let bonus=up-buffSum(a,'damageDown');if(!a.enemy&&kind==='strategy'&&state.treasures.includes('학우선'))bonus+=5;return Math.max(.15,phy*(1+bonus/100));}
function chanceHit(a,d,bonus=0){return clamp(.96+(a.hit||0)/100-(d.dodge||0)/100 +bonus/100 + buffSum(a,'accuracyUp')/100-buffSum(a,'accuracyDown')/100-buffSum(d,'dodgeUp')/100 - (!d.enemy&&state.treasures.includes('적로')?.05:0),.1,1);}
function damage(a,d,mult=100,kind='physical',mods={}){if(!a||!d||a.hp<=0||d.hp<=0)return 0;if(Math.random()>chanceHit(a,d,mods.hitBonus||0)){if(rand(5)===0)logBattle(`${d.name} 회피`);return 0;}
 let amt=(kind==='strategy'?magicBase(a,d):physicalBase(a,d,mods.pierce||0))*mult/100;
 amt*=attackMod(a,kind)*(1+buffSum(d,'vulnerable')/100)*(1-buffSum(d,'reduce')/100);
 if(!a.enemy&&mods.first)amt*=(1+(mods.first||0)/100);
 if(mods.bonus)amt*=(1+mods.bonus/100);
 if(mods.execute&&d.hp/d.maxHp<=.5)amt*=1.15;
 if(mods.after10&&fight.time>=10)amt*=1.3;
 amt=Math.max(1,Math.round(amt));
 // 조운의 일신시담: 보호자 자신의 피격과 피해 이양을 실제로 처리한다.
 const guards=activeBuffs(d,fight.time).filter(b=>b.key==='guard'&&b.value?.protector!==d.id);
 for(const g of guards){const protector=[...fight.actors,...fight.foes].find(u=>u.id===g.value.protector&&u.hp>0&&u.enemy===d.enemy);if(!protector)continue;let redirected=Math.round(amt*g.value.rate/100);if(redirected<=0)continue;amt-=redirected;rawDamage(protector,redirected,true);}
 return rawDamage(d,amt,false);
}
function rawDamage(d,amount,isGuard){const original=Math.max(0,Math.round(amount));let remain=original;const shields=activeBuffs(d,fight.time).filter(b=>b.key==='shield');for(const b of shields){if(remain<=0)break;const used=Math.min(remain,b.value);b.value-=used;remain-=used;}let effective=Math.max(0,remain);if(isGuard)effective*=Math.max(.1,1-buffSum(d,'reduce')/100);const before=d.hp;d.hp=clamp(d.hp-effective,0,d.maxHp);syncShield(d);return before-d.hp;}
function allAdd(team,key,value,duration,source){living(team).forEach(x=>addBuff(x,key,value,duration,source));}
function skillAction(actor,allies,foes){const skill=actor.skills[actor.active],level=actor.level,v=VAL(skill.vals,level),src=sourceId(actor,skill),name=skill.name;const own=living(allies),others=living(foes);if(!own.length||!others.length)return;
 let targets=[];const single=(kind='physical',mult=v,mods={})=>{targets=hitTargets(actor,foes);if(targets[0])damage(actor,targets[0],mult,kind,mods);};
 switch(skill.id){
 case 'liu_bond':allAdd(allies,'damageUp',v,5,src);for(const x of own)if(x.name==='관우'||x.name==='장비')addBuff(x,'reduce',4,5,src);break;
 case 'liu_care':for(const x of own){addShield(x,v,5,src);addBuff(x,'regen',VAL(skill.regen,level),3,src);}break;
 case 'liu_visit':{const target=own.slice().sort((a,b)=>b.intel-a.intel)[0];if(target)target.nextSkill=Math.max(fight.time+.05,target.nextSkill-v);break;}
 case 'liu_last':allAdd(allies,'reduce',v*(own.length<=2?2:1),5,src);break;
 case 'guan_strike':single('physical',v,{first:actor.castCount===1?20:0});break;
 case 'guan_guard':{const low=lowHp(allies);addShield(actor,v,5,src);if(low&&low!==actor)addShield(low,v,5,src);break;}
 case 'guan_flood':targets=hitTargets(actor,foes,'front');for(const x of targets){damage(actor,x,v);addBuff(x,'speedDown',VAL(skill.slow,level),4,src);}break;
 case 'guan_chain':{const st=actor.stacks[skill.id]||0;single('physical',v,{bonus:st*VAL(skill.stack,level)});actor.stacks[skill.id]=Math.min(3,st+1);break;}
 case 'zhang_aoe':targets=hitTargets(actor,foes,'all');targets.forEach(x=>damage(actor,x,v));break;
 case 'zhang_roar':allAdd(foes,'speedDown',v,4,src);break;
 case 'zhang_yan':targets=hitTargets(actor,foes);if(targets[0]){damage(actor,targets[0],v);addBuff(targets[0],'damageDown',VAL(skill.weaken,level),4,src);}break;
 case 'zhang_rage':addBuff(actor,'damageUp',v*(actor.hp/actor.maxHp<=.5?2:1),5,src);break;
 case 'zhao_save':addShield(lowHp(allies),v,5,src);break;
 case 'zhao_dodge':single('physical',v);addBuff(actor,'dodgeUp',VAL(skill.dodge,level),4,src);break;
 case 'zhao_feint':allAdd(foes,'accuracyDown',v,4,src);break;
 case 'zhao_guard':{const target=own.filter(x=>x!==actor).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(target)addBuff(target,'guard',{protector:actor.id,rate:v},5,src);addBuff(actor,'reduce',8,5,src);break;}
 case 'zhuge_array':for(const x of own){if(x.slot<4)addBuff(x,'reduce',v,5,src);else addBuff(x,'speedUp',VAL(skill.rearSpeed,level),5,src);}break;
 case 'zhuge_plan':allAdd(foes,'vulnerable',v,4,src);break;
 case 'zhuge_bolts':targets=hitTargets(actor,foes);if(targets[0])for(let i=0;i<3;i++)damage(actor,targets[0],v,'strategy');break;
 case 'zhuge_supply':for(const x of own.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp).slice(0,2))addBuff(x,'regen',v,4,src);break;
 case 'ma_charge':single('physical',v,{first:actor.castCount===1?VAL(skill.first,level):0});break;
 case 'ma_assault':addBuff(actor,'damageUp',v,5,src);addBuff(actor,'vulnerable',5,5,src);break;
 case 'ma_cavalry':for(const x of own)addBuff(x,'speedUp',v+(x.slot<4?3:0),4,src);break;
 case 'ma_recover':single('physical',v);if(actor.hp/actor.maxHp<=.6)heal(actor,actor.maxHp*VAL(skill.heal,level)/100);break;
 case 'huang_finish':single('physical',v,{execute:true});break;
 case 'huang_aim':single('physical',v,{hitBonus:VAL(skill.hit,level),pierce:VAL(skill.pierce,level)});break;
 case 'huang_old':single('physical',v,{after10:true});break;
 case 'huang_cheer':for(const x of own.slice().sort((a,b)=>b.force-a.force).slice(0,2))addBuff(x,'damageUp',v,4,src);break;
 case 'tmp_strike':single('physical',v);break;
 case 'tmp_defend':addShield(actor,v,5,src);{const low=lowHp(allies);if(low!==actor)addShield(low,v,5,src);}break;
 case 'tmp_tactic':targets=hitTargets(actor,foes,'all');targets.forEach(x=>damage(actor,x,v,'strategy'));break;
 case 'tmp_help':heal(lowHp(allies),lowHp(allies)?.maxHp*v/100);break;
 default:break;
 }
 logBattle(`${actor.name} [${name} Lv.${level}] 사용`,!actor.enemy);
}
function enemySkill(actor,allies,foes){const s=actor.skills[0];const mode=(s.skillRange||'').toLowerCase();const support=mode.startsWith('ally')||s.skillPower<=0;
 if(support){const target=lowHp(allies);if(target)heal(target,target.maxHp*.10);logBattle(`${actor.name} [${s.skillName}] 지원`,false);return;}
 const targets=hitTargets(actor,foes,mode==='enemy_all'?'all':mode==='front_all'?'front':'one');let total=0;
 for(const target of targets){const hits=clamp(s.skillHits||1,1,3);for(let i=0;i<hits;i++)total+=damage(actor,target,clamp(s.skillPower||30,12,190),s.skillType==='책략'?'strategy':'physical');
 for(const eff of s.effects||[]){if(eff.type==='stat'&&eff.stat==='cmd'&&eff.delta<0)addBuff(target,'vulnerable',5,Math.max(1,eff.duration||4),'enemy:'+actor.id+':'+s.skillName);
 if(eff.type==='no_heal')addBuff(target,'noHeal',1,10,'enemy:'+actor.id+':'+s.skillName);}}
 logBattle(`${actor.name} [${s.skillName}] 피해 ${Math.round(total)}`,false);
}
function makeAction(actor,allies,foes){if(!living(foes).length||actor.hp<=0)return;
 if(fight.time>=actor.nextSkill){actor.castCount++;if(actor.enemy)enemySkill(actor,allies,foes);else skillAction(actor,allies,foes);
 const cd=actor.enemy?Math.max(4.7,actor.cooldown*.86):actor.skills[actor.active].cd;
 actor.nextSkill=fight.time+cd;}
 if(actor.hp<=0||!living(foes).length)return;
 if(fight.time>=actor.nextAttack){const t=hitTargets(actor,foes)[0];if(t){const dmg=damage(actor,t,100,actor.intel>=actor.force+25?'strategy':'physical');if(dmg>0&&rand(12)===0)logBattle(`${actor.name} 일반 공격 ${Math.round(dmg)}`,!actor.enemy);}
 const up=buffSum(actor,'speedUp'),down=buffSum(actor,'speedDown');const interval=Math.max(1.1,actor.cooldown/(1+up/100)*(1+down/100));actor.nextAttack=fight.time+interval;}
}
function tickFight(){if(!fight||fight.finished)return;const dt=.17*fightSpeed;fight.time+=dt;
 for(const u of [...fight.actors,...fight.foes]){if(u.hp<=0)continue;const regen=buffSum(u,'regen');if(regen>0&&!activeBuffs(u,fight.time).some(x=>x.key==='noHeal'))heal(u,u.maxHp*regen*dt/100);u.buffs=u.buffs.filter(b=>b.until>fight.time);syncShield(u);}
 // 동작 순서를 고정하되, 전투가 끝난 뒤 후속 공격을 막는다.
 for(const u of [...fight.actors,...fight.foes]){if(u.hp<=0)continue;const allies=u.enemy?fight.foes:fight.actors,foes=u.enemy?fight.actors:fight.foes;makeAction(u,allies,foes);if(!living(fight.actors).length||!living(fight.foes).length)break;}
 drawFight();if(!living(fight.foes).length)finishFight(true);else if(!living(fight.actors).length||fight.time>=45)finishFight(false);
}
function logBattle(msg,good){if(!fight)return;fight.logs.unshift({msg,good});fight.logs=fight.logs.slice(0,60);$('battle-log').innerHTML=fight.logs.slice(0,30).map(v=>`<div class="log-line ${v.good?'good':'bad'}">${v.msg}</div>`).join('');}
function drawFight(){if(!fight)return;const fmt=u=>`<div class="battle-unit ${u.enemy?'enemy':''} ${u.hp<=0?'dead':''}"><div class="name">${u.name}</div><div class="role">${u.role}</div><div class="bar"><span style="width:${clamp(100*u.hp/u.maxHp,0,100)}%"></span></div><div class="hp">${Math.ceil(u.hp)} / ${u.maxHp}${u.shield>0?` · 보호막 ${Math.round(u.shield)}`:''}</div></div>`;
 $('battle-player').innerHTML=fight.actors.map(fmt).join('');$('battle-enemy').innerHTML=fight.foes.map(fmt).join('');$('battle-clock').textContent=`${String(Math.floor(fight.time/60)).padStart(2,'0')}:${String(Math.floor(fight.time%60)).padStart(2,'0')}`;
 $('ally-count').textContent=`${living(fight.actors).length} / ${fight.actors.length}`;$('enemy-count').textContent=`${living(fight.foes).length} / ${fight.foes.length}`;
}
function finishFight(won){if(!fight||fight.finished)return;fight.finished=true;fight.result=won?'win':'lose';clearInterval(fightTimer);fightTimer=null;
 // 개체별 남은 체력은 전투 종료 후에도 이어진다.
 for(const u of fight.actors){const h=heroById(u.id);if(h)h.hp=clamp(u.hp,0,HERO_STATS[h.name].hp);}
 if(won){let goldGain=5+(fight.round%5===0?2:0);state.gold+=goldGain;state.round++;state.recruitPending=true;state.recruitChoices=sampleThree();if(state.treasures.includes('청낭서'))for(const h of state.roster)if(h.hp>0)h.hp=clamp(h.hp+HERO_STATS[h.name].hp*.1,0,HERO_STATS[h.name].hp);
 if(state.round>15)state.win=true;logBattle(`승리! ${goldGain}금 획득 · 재야탐색 1회 활성화`,true);$('battle-status').textContent='전투 승리';}
 else{state.lost=true;logBattle('패배 · 출정 종료',false);$('battle-status').textContent='출정 실패';}
 save();renderTop();$('battle-footer').innerHTML=`<div><h2>${won?(state.win?'15전 완주!':'승리!'):'패배'}</h2><p>${won?'금화를 획득했습니다. 장수 편성 화면에서 재야탐색 1회를 진행할 수 있습니다.':'다음 출정을 시작해 다른 조합으로 도전할 수 있습니다.'}</p><button class="accent" onclick="returnFromFight()">${won?'장수 편성으로':'결과 확인 및 귀환'}</button></div>`;
}
function returnFromFight(){if(!fight?.finished)return;const lost=state.lost,won=state.win;fight=null;clearInterval(fightTimer);$('tab-battle').disabled=true;switchTab('camp');renderAll();if(lost)openModal('출정 실패',`<p>${Math.min(state.round,15)}전에서 패배했습니다. 장수 배치와 기술을 살펴본 뒤 새 출정을 시작할 수 있습니다.</p>`,`<button class="ghost" onclick="closeModal()">편성 확인</button><button class="accent" onclick="closeModal();resetRunPrompt()">새 출정</button>`);
 else if(won)toast('15라운드 완주! 재야탐색 기회는 남아 있습니다.');else toast('재야탐색 1회가 활성화되었습니다.');}
// 개발 검증용 순수 계산 진입점: 테스트에서는 이 함수를 사용하여 플레이 화면 없이 강화/중첩을 확인한다.
const PrototypeTests={
 baseSlots(){return [0,1,2,3,4,5,6,7];},
 costAt(level){return COST[level]??null;},
 refundAt(level){return COST[level-1]===undefined?null:COST[level-1]/2;},
 stackCheck(){return SHU_SKILLS['유비'][0].id==='liu_bond'&&sourceId({id:'h1'},SHU_SKILLS['유비'][0])!==sourceId({id:'h2'},SHU_SKILLS['유비'][0]);}
};
(function boot(){showStartMenu();window.addEventListener('beforeunload',()=>{if(state&&!fight)save();});})();
