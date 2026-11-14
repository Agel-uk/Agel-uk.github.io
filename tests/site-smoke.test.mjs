import {readFileSync,existsSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const exists = path => existsSync(new URL('../'+path,import.meta.url));
const slugs = ['wireless-headphones','smart-watches','running-shoes','power-banks','robot-vacuums','air-fryers','laptops','mesh-wifi','portable-ssds','office-chairs','monitors','tablets','coffee-makers','coffee-machines','carry-on-luggage','cordless-drills'];
const categories = ['headphones','watches','shoes','powerbanks','vacuums','airfryers','laptops','mesh','ssds','chairs','monitors','tablets','coffeemakers','espresso','luggage','drills'];

test('all sixteen distinct guides are present, canonical and useful',()=>{
  const titles = new Set();
  for (const slug of slugs) {
    const path = 'guide-'+slug+'.html';
    assert.ok(exists(path),path+' missing');
    const html = read(path);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    assert.ok(title && title.length>15,path+' missing title');
    assert.ok(!titles.has(title),path+' duplicate title');
    titles.add(title);
    assert.equal((html.match(/<h1\b/gi)||[]).length,1,path+' needs one H1');
    assert.ok(html.includes('https://agel-uk.github.io/'+path),path+' missing site URL');
    assert.match(html,/affiliate/i,path+' missing affiliate disclosure');
    assert.match(html,/decision-lab\.html\?category=/i,path+' missing decision worksheet');
    assert.match(html,/aria-label="Independent buying decision example"/,path+' missing original buyer scenario');
    assert.match(html,/hypothetical|illustrative/i,path+' must distinguish examples from tested products');
    assert.match(html,/<\/main>/i,path+' missing main closing tag');
    assert.equal((html.match(/<script\b/gi)||[]).length,(html.match(/<\/script>/gi)||[]).length,path+' unbalanced script tags');
  }
});

test('homepage exposes all sixteen guides and relevant comparison categories',()=>{
  const home = read('index.html');
  for (let i=0;i<slugs.length;i++){
    assert.ok(home.includes('href="guide-'+slugs[i]+'.html"'),slugs[i]+' missing from homepage');
    assert.ok(home.includes('decision-lab.html?category='+categories[i]),categories[i]+' comparison missing');
  }
  for (const path of ['total-cost-calculator.html','us-shopping-checklist.html','editorial-policy.html','privacy.html','contact.html']){
    assert.ok(exists(path),path+' missing');
    assert.ok(home.includes(path),path+' not linked from homepage');
  }
  assert.match(home,/affiliate disclosure/i);
});

test('decision worksheet includes all homepage categories and a valid JavaScript file',()=>{
  const html=read('decision-lab.html'),script=read('decision-lab.js');
  assert.ok(html.includes('src="decision-lab.js"'));
  for(const category of categories){
    assert.ok(html.includes('value="'+category+'"'),category+' missing from selector');
    assert.ok(script.includes(category+':['),category+' missing scoring criteria');
  }
  assert.match(script,/function compare\(/);
  assert.match(script,/function exportCsv\(/);
});

test('sitemap only lists existing canonical pages on the reviewed root domain',()=>{
  const urls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.ok(urls.length>=slugs.length+1);
  assert.equal(new Set(urls).size,urls.length);
  for(const url of urls){
    const parsed=new URL(url);
    assert.equal(parsed.origin,'https://agel-uk.github.io');
    const path=decodeURIComponent(parsed.pathname.slice(1))||'index.html';
    assert.ok(!path.includes('..'));
    assert.ok(exists(path),path+' missing');
    const html=read(path);
    const canonical=html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)||html.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["']/i);
    assert.ok(canonical,path+' missing canonical');
    assert.equal(canonical[1],url,path+' canonical mismatch');
  }
  for(const slug of slugs)assert.ok(urls.includes('https://agel-uk.github.io/guide-'+slug+'.html'));
});

test('shared assets, disclosure and AdSense ownership files remain available',()=>{
  for(const path of ['styles.css','app.js','analytics.js','affiliate-config.js','decision-lab.js','global-market.js','ads.txt','robots.txt'])assert.ok(exists(path),path+' missing');
  assert.match(read('ads.txt'),/google\.com, pub-\d+, DIRECT/);
  assert.match(read('robots.txt'),/Sitemap: https:\/\/agel-uk\.github\.io\/sitemap\.xml/);
  assert.match(read('affiliate-config.js'),/deallensai-20/);
  assert.match(read('analytics.js'),/deallens_analytics_consent_v1/);
});

test('total cost calculator performs real calculations',()=>{
  const html=read('total-cost-calculator.html');
  const blocks=[...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.includes('out-monthly'));
  assert.equal(blocks.length,1,'expected calculator script');
  const ids=['price','tax','shipping','extras','monthly','years','total','out-price','out-tax','out-extras','out-recurring','out-monthly'];
  const el=Object.fromEntries(ids.map(id=>[id,{value:'0',textContent:'',listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}}]));
  runInNewContext(blocks[0],{document:{getElementById(id){assert.ok(el[id],id);return el[id];}},Intl,Number,Math,Object});
  Object.assign(el.price,{value:'120'});el.tax.value='8';el.shipping.value='10';el.extras.value='20';el.monthly.value='5';el.years.value='2';
  el.price.listeners.input();
  assert.equal(el.total.textContent,'$279.60');
  assert.equal(el['out-recurring'].textContent,'$120.00');
});
