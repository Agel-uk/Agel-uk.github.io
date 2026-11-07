import {readFileSync,existsSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const guides=['wireless-headphones','smart-watches','running-shoes','power-banks','robot-vacuums','air-fryers','laptops','mesh-wifi','portable-ssds','office-chairs','monitors','tablets','coffee-makers','coffee-machines','carry-on-luggage','cordless-drills'];
test('all buying guides exist and load the shared shopping script',()=>{
 for(const slug of guides){const file='guide-'+slug+'.html';assert.ok(existsSync(new URL('../'+file,import.meta.url)),file+' missing');assert.match(read(file),/src=["']app\.js["']/i,file+' missing app.js');}
});
test('every guide has a Decision Lab category mapping',()=>{
 const js=read('app.js');
 for(const slug of guides)assert.ok(js.includes("'guide-"+slug+".html':"),slug+' category missing');
 assert.match(js,/decision-lab\.html\?category=/);
});
test('Decision Lab categories are present in its selector and scoring rubric',()=>{
 const html=read('decision-lab.html'),js=read('decision-lab.js');
 for(const category of ['headphones','powerbanks','laptops','vacuums','chairs','mesh','monitors','shoes','tablets','ssds','airfryers','coffee','luggage','drills','watches']){
  assert.ok(html.includes('value="'+category+'"'),category+' missing from selector');
  assert.ok(js.includes(category+':['),category+' missing rubric');
 }
});
test('US affiliate tracking and privacy disclosure remain in place',()=>{
 assert.match(read('affiliate-config.js'),/US:\s*['"]deallensai-20['"]/);
 assert.match(read('analytics.js'),/deallens_analytics_consent_v1/);
 assert.match(read('app.js'),/Paid affiliate link/);
});
test('required buyer journey pages exist',()=>{
 for(const file of ['index.html','amazon.html','decision-lab.html','us-shopping.html','privacy.html','editorial-policy.html'])assert.ok(existsSync(new URL('../'+file,import.meta.url)),file+' missing');
});

test('sitemap points only to existing local HTML pages with matching canonical URLs',()=>{
 const sitemap=read('sitemap.xml');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.ok(urls.length>=guides.length+1,'sitemap missing expected pages');
 assert.equal(new Set(urls).size,urls.length,'duplicate sitemap URL');
 for(const url of urls){
  const parsed=new URL(url);
  assert.equal(parsed.origin,'https://agel-uk.github.io','external sitemap URL');
  const path=decodeURIComponent(parsed.pathname.slice(1))||'index.html';
  assert.ok(!path.includes('..'),'unsafe sitemap path');
  assert.ok(existsSync(new URL('../'+path,import.meta.url)),path+' missing');
  const html=read(path);
  const canonical=html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i)
   ||html.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["']/i);
  assert.ok(canonical,path+' missing canonical');
  assert.equal(canonical[1],url,path+' canonical mismatch');
 }
});
test('priority US guides keep decision support and honest evidence notes',()=>{
 for(const [path,section] of [['guide-mesh-wifi.html','mesh-decision-table'],['guide-laptops.html','laptop-scenario-matrix']]){
  const html=read(path);
  assert.ok(html.includes('id="'+section+'"'),path+' decision matrix missing');
  assert.match(html,/Evidence note:/,path+' evidence disclosure missing');
 }
});
