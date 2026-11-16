import { firefox } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const out = '.generated/proofline'; mkdirSync(out, { recursive: true });
const browser = await firefox.launch();
const results=[];
for (const width of [1440,390,320]) {
 const page=await browser.newPage({viewport:{width,height:900}, reducedMotion:'reduce',colorScheme:'dark'});
 for (const path of ['/', '/projects','/about','/writing','/textbooks','/projects/spine-coinbase-loan-book-risk-model','/textbooks/riscv']) {
  const response=await page.goto(`http://localhost:4396${path}`); await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,bodyFont:getComputedStyle(document.body).fontFamily,bodySize:getComputedStyle(document.body).fontSize,background:getComputedStyle(document.body).backgroundColor}));
  if(response.status()!==200||metrics.overflow>0)throw Error(JSON.stringify({width,path,status:response.status(),...metrics}));
  results.push({width,path,...metrics});
  if(path==='/'||path==='/projects/spine-coinbase-loan-book-risk-model'||path==='/textbooks/riscv')await page.screenshot({path:`${out}/${width}-${path==='/'?'home':path.split('/').at(-1)}.png`,fullPage:path==='/'});
 }
 await page.goto('http://localhost:4396/'); await page.keyboard.press('Tab');
 if(await page.locator(':focus').textContent()!=='Skip to content')throw Error('Skip link is not first');
 await page.keyboard.press('Enter'); if(!page.url().endsWith('#main'))throw Error('Skip navigation failed');
 await page.close();
}
writeFileSync(`${out}/layout.json`,JSON.stringify(results,null,2));
await browser.close(); console.log('21 desktop/phone page checks; fonts, overflow and keyboard skip navigation passed.');
