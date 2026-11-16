import { firefox } from 'playwright';
import { mkdirSync } from 'node:fs';
const out='.generated/final-reader-review';mkdirSync(out,{recursive:true});
const browser=await firefox.launch();const page=await browser.newPage({viewport:{width:390,height:844}});
for(const [book,selector] of [['rwa-regression','.callout.good'],['cuda','.code-block'],['tokenization','.hero'],['strategy','.warn'],['ssrd','.start-reading']]){
 await page.goto(`http://localhost:4396/textbooks/${book}`);await page.locator(selector).first().scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${out}/${book}.png`});
}
await browser.close();
