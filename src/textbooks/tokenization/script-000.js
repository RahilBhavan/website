'use strict';
const $=id=>document.getElementById(id);
const fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=n=>fmt(n*100)+'%';
function results(id,rows){const dl=document.createElement('dl');for(const [label,value] of rows){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;dl.append(dt,dd)}$(id).replaceChildren(dl)}
function compute(){
const issuance=+$('issuance').value,allocation=+$('reward').value/100;
$('issuance-value').textContent=fmt(issuance,0);$('reward-value').textContent=fmt(allocation*100,0);
results('dilution-result',[['Your balance',fmt(100+issuance*allocation)+' tokens'],['Network supply',fmt(1000+issuance,0)+' tokens'],['Your ownership',pct((100+issuance*allocation)/(1000+issuance))],['Initial ownership','10.00%']]);
const cash=+$('swap').value;const output=1000-100000000/(100000+cash);
$('swap-value').textContent=fmt(cash,0);
results('amm-result',[['X received',fmt(output,4)+' X'],['Average execution','$'+fmt(cash/output)+' / X'],['Initial marginal price','$100.00 / X'],['Final marginal price','$'+fmt((100000+cash)**2/100000000)+' / X']]);
const loss=+$('asset-loss').value;const nav=(10.2*(1-loss/100)-.2)/10;const premium=.98/nav-1;
$('asset-loss-value').textContent=fmt(loss,0);
results('nav-result',[['Net asset value','$'+fmt(nav*10,3)+'M'],['NAV per share','$'+fmt(nav,4)],['Market price','$0.9800'],[premium>=0?'Market premium to NAV':'Market discount to NAV',pct(Math.abs(premium))]]);
const recovery=+$('recovery').value,senior=Math.min(recovery,7),junior=Math.min(Math.max(recovery-7,0),3);
$('recovery-value').textContent=fmt(recovery,1);
results('waterfall-result',[['Senior recovery','$'+fmt(senior)+'M'],['Senior principal loss',pct((7-senior)/7)],['Junior recovery','$'+fmt(junior)+'M'],['Junior principal loss',pct((3-junior)/3)]]);
const gain=+$('vault-gain').value,per=(1200+gain)/1000,newshares=120/per;
$('vault-gain-value').textContent=fmt(gain,0);
results('vault-result',[['Assets per existing share',fmt(per,4)],['Shares for 120-asset deposit',fmt(newshares,4)],['Assets after deposit',fmt(1320+gain,2)],['Shares after deposit',fmt(1000+newshares,4)]]);
}
for(const input of document.querySelectorAll('.lab input'))input.addEventListener('input',compute);compute();
$('search').addEventListener('input',()=>{const q=$('search').value.trim().toLowerCase();let count=0;for(const a of document.querySelectorAll('#chapter-list a')){const chapter=document.querySelector(a.getAttribute('href'));const found=chapter.textContent.toLowerCase().includes(q);a.hidden=!found;if(found)count++}$('search-status').textContent=count?count+' matching sections. Open a result to read it.':'No sections match. Try a broader word or clear the search.'});
for(const button of document.querySelectorAll('.check-answer'))button.addEventListener('click',()=>{const box=button.closest('fieldset'),chosen=box.querySelector('input:checked'),feedback=box.querySelector('.feedback');feedback.hidden=false;if(!chosen){feedback.textContent='Choose an answer, then explain why you chose it.';return}feedback.textContent=(chosen.value===box.dataset.correct?'Correct. ':'Revisit this distinction. ')+feedback.dataset.why});
const storageKey='rahil-tokenization-field-guide-v2';let state={notes:'',checks:[],theme:'dark',attempts:{},lastChapter:''};let storageAvailable=true;
try{const raw=localStorage.getItem(storageKey);if(raw){const stored=JSON.parse(raw);if(stored&&typeof stored==='object'){state.notes=typeof stored.notes==='string'?stored.notes:'';state.checks=Array.isArray(stored.checks)?stored.checks.filter(x=>typeof x==='string'):[];state.theme=stored.theme==='light'?'light':'dark';state.lastChapter=/^chapter-([1-9]|1[0-8])$/.test(stored.lastChapter)?stored.lastChapter:'';if(stored.attempts&&typeof stored.attempts==='object'){if(typeof stored.attempts.dossier==='string')state.attempts.dossier=stored.attempts.dossier;for(let n=1;n<=18;n++){const k='chapter-'+n;if(typeof stored.attempts[k]==='string')state.attempts[k]=stored.attempts[k]}}}}}catch(e){storageAvailable=false}
function countChecks(){const n=document.querySelectorAll('[data-check]:checked').length;$('practice-count').textContent=n+' of 18 chapter attempts recorded. Mastery still needs independent checking.'}
function save(){state.notes=$('notes').value;for(const input of document.querySelectorAll('[data-attempt]'))state.attempts[input.dataset.attempt]=input.value;state.checks=[...document.querySelectorAll('[data-check]:checked')].map(x=>x.dataset.check);countChecks();try{localStorage.setItem(storageKey,JSON.stringify(state));for(const label of document.querySelectorAll('.attempt-status'))label.textContent='Attempt saved in this browser. Export your notes for a portable backup.';$('save-status').textContent='Saved in this browser. Export a backup before moving or clearing browser data.'}catch(e){storageAvailable=false;for(const label of document.querySelectorAll('.attempt-status'))label.textContent='Browser storage is unavailable. Download your notes to keep this attempt.';$('save-status').textContent='Browser storage is unavailable. Download your study notes to keep this attempt.'}}
$('notes').value=state.notes;for(const input of document.querySelectorAll('[data-attempt]')){input.value=state.attempts[input.dataset.attempt]||'';input.addEventListener('input',save);const status=document.createElement('p');status.className='meta attempt-status';status.textContent=storageAvailable?'Your writing saves automatically in this browser. Export a backup to keep it.':'Browser storage is unavailable. Download your notes to keep this attempt.';status.setAttribute('aria-live','polite');input.after(status)}for(const input of document.querySelectorAll('[data-check]')){input.checked=state.checks.includes(input.dataset.check);input.addEventListener('change',save)}countChecks();
function theme(){document.documentElement.dataset.theme=state.theme;$('theme').textContent=state.theme==='dark'?'Light mode':'Dark mode'}theme();$('theme').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';theme();save()});$('notes').addEventListener('input',save);
if(!storageAvailable)$('save-status').textContent='Browser storage is unavailable. Download your study notes to keep your work.';
$('export-notes').addEventListener('click',()=>{const body='# My tokenization study notes\n\n'+$('notes').value+'\n\n## Independent attempts\n'+[...document.querySelectorAll('[data-attempt]')].filter(x=>x.value.trim()).map(x=>'\n### '+x.dataset.attempt+'\n'+x.value).join('\n')+'\n\nChapter attempts recorded: '+[...document.querySelectorAll('[data-check]:checked')].map(x=>x.dataset.check).join(', ')+'\n\nThese checks record practice, not certified mastery.\n';const blob=new Blob([body],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-tokenization-study-notes.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
let printOpen=[];window.addEventListener('beforeprint',()=>{printOpen=[...document.querySelectorAll('details')].map(d=>[d,d.open]);for(const [d] of printOpen)d.open=true});window.addEventListener('afterprint',()=>{for(const [d,open] of printOpen)d.open=open});$('print').addEventListener('click',()=>window.print());
console.log('Textbook ready:',document.querySelectorAll('article.chapter').length,'chapters;',document.querySelectorAll('figure').length,'diagrams;',document.querySelectorAll('.lab').length,'interactive labs.');
let readAll=false;
function route(){
 let hash;try{hash=decodeURIComponent(location.hash.slice(1)||'home')}catch(e){hash='home'}
 const target=document.getElementById(hash);
 if(/^chapter-([1-9]|1[0-8])$/.test(hash)){state.lastChapter=hash;save()}
 if(state.lastChapter){$('resume').hidden=false;$('resume').href='#'+state.lastChapter;$('resume').textContent='Continue: chapter '+state.lastChapter.split('-')[1];$('start-loop').classList.remove('primary')}
 if(readAll){for(const section of document.querySelectorAll('main>.reading'))section.hidden=false;$('home').hidden=false;return}
 let selected=target?.closest('main>.reading');
 const home=hash==='home'||hash==='main'||!target;
 for(const section of document.querySelectorAll('main>.reading'))section.hidden=home?section.id!=='contents':section!==selected;
 $('home').hidden=!home;
 if(!home&&target){requestAnimationFrame(()=>{target.scrollIntoView({block:'start'});const heading=target.querySelector('h2,h3')||(selected||target).querySelector('h2,h3');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true})}})}
}
window.addEventListener('hashchange',route);
$('read-all').addEventListener('click',()=>{readAll=!readAll;$('read-all').textContent=readAll?'Return to chapter reading':'Show the entire textbook';route()});
let printHidden=[];
window.addEventListener('beforeprint',()=>{printHidden=[...document.querySelectorAll('main>[hidden]')];for(const el of printHidden)el.hidden=false});
window.addEventListener('afterprint',()=>{for(const el of printHidden)el.hidden=true});
route();
