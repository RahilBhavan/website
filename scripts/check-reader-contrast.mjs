import { firefox } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { readingContrast } from '../tests/e2e/contrast.mjs';
const books=[...JSON.parse(readFileSync('src/data/textbooks.json','utf8')).map(x=>x.slug),'strategy-bitcoin'];
const browser=await firefox.launch(); const results=[];
for(const width of [390,1280]) for(const book of books){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.goto(`http://localhost:4396/textbooks/${book}`);
 results.push({book,width,...await page.evaluate(readingContrast)});await page.close();
}
await browser.close();mkdirSync('.generated',{recursive:true});writeFileSync('.generated/reader-contrast.json',JSON.stringify(results,null,2));
for(const r of results)console.log(`${r.book}@${r.width}: ${r.checked} text elements, ${r.failures.length} contrast failures`);
if(results.some(r=>r.failures.length))process.exitCode=1;
