import { firefox } from 'playwright';
import { readdirSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const files=[...readdirSync('public/og').filter(x=>x.endsWith('.png')).map(x=>'public/og/'+x),...readdirSync('public/og/writing').filter(x=>x.endsWith('.png')).map(x=>'public/og/writing/'+x)];
const html=`<!doctype html><style>body{margin:0;display:grid;grid-template-columns:repeat(4,326px);gap:8px;background:#f4f5ef}figure{margin:0}img{width:326px;height:163px}figcaption{font:12px sans-serif;overflow-wrap:anywhere}</style>${files.map(x=>`<figure><img src="file://${resolve(x)}"><figcaption>${x}</figcaption></figure>`).join('')}`;
writeFileSync('.generated/proofline/share-review.html',html);
const b=await firefox.launch();const p=await b.newPage({viewport:{width:1328,height:900}});await p.goto('file://'+resolve('.generated/proofline/share-review.html'));await p.screenshot({path:'.generated/proofline/share-review.png',fullPage:true});await b.close();
