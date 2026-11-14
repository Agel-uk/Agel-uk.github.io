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

test('US drill buyer journey has working local steps and disclosed tracked retailer link',()=>{
 const home=read('index.html');
 const drill=read('guide-cordless-drills.html');
 assert.match(home,/id="drill-us-buyers"/);
 assert.match(drill,/id="household-drill-checklist"/);
 assert.match(drill,/id="drill-real-questions"/);
 assert.match(home,/href="guide-cordless-drills\.html#household-drill-checklist"/);
 assert.match(home,/href="guide-cordless-drills\.html#us-drill-scenarios"/);
 assert.match(drill,/id="us-drill-scenarios"/);
 assert.match(home,/www\.amazon\.com\/s\?k=cordless%20drill%20driver%20kit&amp;tag=deallensai-20/);
 assert.match(home,/rel="sponsored nofollow noopener"/);
 assert.match(home,/Affiliate link:/);
 const analytics=read('analytics.js');
 assert.match(analytics,/retailer_outbound_click/);
 assert.match(analytics,/affiliate_tag_present/);
});

test('buyer cost calculators exist and validate prices before comparing',()=>{
 for(const [path,prefix] of [['guide-cordless-drills.html','drill'],['guide-laptops.html','laptop']]){
  const html=read(path);
  assert.match(html,new RegExp('id="'+(prefix==='drill'?'drill-kit-cost-calculator':'laptop-ownership-calculator')+'"'));
  assert.match(html,/Number\.isFinite/);
  assert.match(html,/addEventListener\('input',calculate\)/);
  assert.match(html,/hypothetical/i);
 }
});

test('mesh rental comparison and homepage calculator links exist',()=>{
 const mesh=read('guide-mesh-wifi.html'),home=read('index.html');
 assert.match(mesh,/id="mesh-rent-buy-calculator"/);
 assert.match(mesh,/Number\.isFinite/);
 assert.match(mesh,/Number\.isInteger/);
 assert.match(mesh,/addEventListener\('input',calculate\)/);
 for(const anchor of ['drill-kit-cost-calculator','laptop-ownership-calculator','mesh-rent-buy-calculator'])assert.ok(home.includes('#'+anchor),'missing calculator link: '+anchor);
});

test('calculator scripts compute correct totals and reject invalid input',async()=>{
 const {runInNewContext}=await import('node:vm');
 const cases=[
  {file:'guide-cordless-drills.html',result:'drill-cost-result',inputs:{'drill-a-tool':'75','drill-a-power':'0','drill-a-extras':'15','drill-b-tool':'60','drill-b-power':'55','drill-b-extras':'15','drill-tax':'0'},expected:['Option A: $90.00','Option B: $130.00'],invalid:'drill-tax'},
  {file:'guide-laptops.html',result:'laptop-ownership-result',inputs:{'laptop-a-price':'650','laptop-a-upgrade':'120','laptop-a-extra':'70','laptop-b-price':'790','laptop-b-upgrade':'0','laptop-b-extra':'0','laptop-sales-tax':'0'},expected:['Laptop A: $840.00','Laptop B: $790.00'],invalid:'laptop-sales-tax'},
  {file:'guide-mesh-wifi.html',result:'mesh-rent-buy-result',inputs:{'mesh-monthly-rent':'12','mesh-isp-setup':'0','mesh-purchase':'240','mesh-install':'0','mesh-months':'24'},expected:['Rent: $288.00','Own: $240.00'],invalid:'mesh-months'}
 ];
 for(const c of cases){
  const html=read(c.file);
  const start=html.indexOf('<script>(function(){');
  const end=html.indexOf('</script>',start);
  const script=start>=0&&end>start?html.slice(start+8,end):null;
  assert.ok(script,c.file+' calculator script missing');
  const elements=Object.fromEntries(Object.entries(c.inputs).map(([id,value])=>[id,{value,handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}}]));
  elements[c.result]={textContent:''};
  runInNewContext(script,{document:{getElementById(id){assert.ok(elements[id],id);return elements[id];}},Number,Math});
  for(const expected of c.expected)assert.ok(elements[c.result].textContent.includes(expected),c.file+' expected '+expected+' but got '+elements[c.result].textContent);
  elements[c.invalid].value=c.invalid==='mesh-months'?'0':'31';
  elements[c.invalid].handlers.input();
  assert.match(elements[c.result].textContent,/Enter/);
 }
});

test('priority US guides link to identifiable independent evidence sources',()=>{
 const laptop=read('guide-laptops.html'),drill=read('guide-cordless-drills.html');
 assert.match(laptop,/id="laptop-independent-references"/);
 assert.ok(laptop.includes('energystar.gov/productfinder'));
 assert.match(drill,/id="drill-independent-references"/);
 assert.ok(drill.includes('osha.gov/hand-power-tools'));
});

test('power bank Wh worksheet calculates energy and rejects invalid inputs',async()=>{
 const {runInNewContext}=await import('node:vm');
 const html=read('guide-power-banks.html');
 assert.match(html,/id="power-bank-wh-worksheet"/);
 assert.ok(html.includes('faa.gov/hazmat/packsafe/lithium-batteries'));
 const start=html.indexOf('<script>(function(){',html.indexOf('id="power-bank-wh-worksheet"'));
 const end=html.indexOf('</script>',start);
 assert.ok(start>=0&&end>start,'inline calculator script missing');
 const elements={
  'powerbank-mah':{value:'20000',handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}},
  'powerbank-voltage':{value:'3.7',handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}},
  'powerbank-wh-result':{textContent:''}
 };
 runInNewContext(html.slice(start+8,end),{document:{getElementById(id){assert.ok(elements[id],id);return elements[id];}},Number});
 assert.ok(elements['powerbank-wh-result'].textContent.includes('74.00 Wh'));
 elements['powerbank-mah'].value='0';
 elements['powerbank-mah'].handlers.input();
 assert.match(elements['powerbank-wh-result'].textContent,/Enter a positive/);
});

test('air fryer guide includes specific use-case matrix and transparent research limits',()=>{
 const html=read('guide-air-fryers.html');
 assert.match(html,/id="airfryer-us-decision-matrix"/);
 assert.match(html,/Research transparency:/);
 assert.match(html,/Dual-zone capacity per compartment/);
 assert.ok(!html.includes('There is no single best air fryers for everyone.'));
});

test('coffee ownership tool calculates multi-year costs and rejects invalid input',async()=>{
 const {runInNewContext}=await import('node:vm');
 const html=read('guide-coffee-machines.html');
 assert.match(html,/id="coffee-ownership-calculator"/);
 const start=html.indexOf('<script>(function(){',html.indexOf('id="coffee-ownership-calculator"'));
 const end=html.indexOf('</script>',start);
 assert.ok(start>=0&&end>start);
 const defaults={'coffee-pod-machine':'120','coffee-pod-drink':'0.85','coffee-pod-maintenance':'20','coffee-ground-machine':'250','coffee-ground-drink':'0.35','coffee-ground-maintenance':'35','coffee-drinks-day':'2','coffee-years':'3'};
 const elements=Object.fromEntries(Object.entries(defaults).map(([id,value])=>[id,{value,handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}}]));
 elements['coffee-cost-result']={textContent:''};
 runInNewContext(html.slice(start+8,end),{document:{getElementById(id){assert.ok(elements[id],id);return elements[id];}},Number,Math});
 assert.ok(elements['coffee-cost-result'].textContent.includes('Capsule machine: $2041.50'));
 assert.ok(elements['coffee-cost-result'].textContent.includes('Ground-coffee machine: $1121.50'));
 elements['coffee-years'].value='0';elements['coffee-years'].handlers.input();
 assert.match(elements['coffee-cost-result'].textContent,/Enter non-negative/);
});

test('drip coffee filter worksheet computes real totals and validates inputs',async()=>{
 const {runInNewContext}=await import('node:vm');
 const html=read('guide-coffee-makers.html');
 assert.match(html,/id="drip-filter-cost-worksheet"/);
 const start=html.indexOf('<script>(function(){',html.indexOf('id="drip-filter-cost-worksheet"')),end=html.indexOf('</script>',start);
 assert.ok(start>=0&&end>start);
 const defaults={'drip-brews-week':'7','drip-years':'2','drip-paper-unit':'0.05','drip-reusable-price':'15','drip-reusable-upkeep':'3'};
 const elements=Object.fromEntries(Object.entries(defaults).map(([id,value])=>[id,{value,handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}}]));
 elements['drip-filter-result']={textContent:''};
 runInNewContext(html.slice(start+8,end),{document:{getElementById(id){assert.ok(elements[id],id);return elements[id];}},Number,Math});
 assert.ok(elements['drip-filter-result'].textContent.includes('Paper filters: $36.40'));
 assert.ok(elements['drip-filter-result'].textContent.includes('Reusable filter: $21.00'));
 elements['drip-years'].value='0';elements['drip-years'].handlers.input();
 assert.match(elements['drip-filter-result'].textContent,/Enter non-negative/);
});
