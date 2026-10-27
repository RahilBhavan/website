import { firefox } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out=process.env.PROJECT_REVIEW_DIR ?? '/home/rahil/.t3/projects/main/exports/project-design-20261026';
await mkdir(out,{recursive:true});
const browser=await firefox.launch({headless:true});
const slugs=['strategy-preferred-coverage-model-dividend-runway','dat-accretion-monitor','mara-credit-case','spine-coinbase-loan-book-risk-model','presto-royalty-recovery-engine','mev-sandwich-study-two-phase-clearing-on-uniswap'];
const results=[];
for (const width of [1280,390,320]) {
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 for(const slug of slugs){
  page.removeAllListeners('pageerror');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4337/projects/'+slug);await page.evaluate(()=>document.fonts.ready);
  const facts=await page.evaluate(()=>({
   design: (()=>{const main=getComputedStyle(document.querySelector('main')), h=getComputedStyle(document.querySelector('h1')); return {canvas:getComputedStyle(document.body).backgroundColor,ink:main.color,bodySize:main.fontSize,bodyLine:main.lineHeight,display:h.fontFamily,titleSize:h.fontSize,titleLine:h.lineHeight,titleTracking:h.letterSpacing,accent:main.getPropertyValue('--accent').trim()};})(),
   overflow:document.documentElement.scrollWidth-innerWidth,title:document.querySelector('h1').innerText,sections:document.querySelectorAll('.study-index li').length,fonts:document.fonts.check('16px Anton')&&document.fonts.check('16px "IBM Plex Sans"'),brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
  const evidence=await page.locator('.project-evidence').evaluate(el=>({
    heading:getComputedStyle(el.querySelector('h2')).fontSize,
    labels:[...el.querySelectorAll('p,a,dt,dd,span')].map(node=>Number.parseFloat(getComputedStyle(node).fontSize)),
    values:[...el.querySelectorAll('dd')].map(node=>node.textContent.trim()),
    background:getComputedStyle(el).backgroundColor,
    font:getComputedStyle(el.querySelector('dt')).fontFamily,
  }));
  await page.keyboard.press('Tab');
  await page.locator('.project-evidence a').first().focus();
  const focus=await page.locator('.project-evidence a').first().evaluate(el=>({visible:el.matches(':focus-visible'),outline:getComputedStyle(el).outlineStyle,minHeight:getComputedStyle(el).minHeight}));
  const artifact=page.locator('.source-artifact a');
  const artifactStatus=await artifact.count() ? (await page.request.get(new URL(await artifact.getAttribute('href'), page.url()).href)).status() : null;
  const nav=page.locator('.study-index li a').first();await nav.click();
  const anchor=await page.evaluate(()=>location.hash);await page.goto('http://localhost:4337/projects/'+slug);
  await page.screenshot({path:`${out}/${slug}-${width}.png`,fullPage:true});
  results.push({slug,width,...facts,evidence,focus,artifactStatus,anchor,errors});
 }
 await page.close();
}
await browser.close();await writeFile(out+'/checks.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
if(results.some(r=>r.evidence.heading!=='40px'||r.evidence.labels.some(size=>size<18)||r.evidence.background!=='rgb(245, 245, 239)'||!r.focus.visible||r.focus.outline==='none'||(r.artifactStatus!==null&&r.artifactStatus!==200)||r.overflow>0||r.brokenImages||!r.fonts||!r.sections||r.errors.length||r.design.bodySize!=='18px'||r.design.canvas!=='rgb(17, 18, 20)'||r.design.ink!=='rgb(245, 245, 239)'||r.design.accent.toLowerCase()!=='#ffe500'||!r.design.display.includes('Anton')||!['0px','normal'].includes(r.design.titleTracking)))process.exitCode=1;
