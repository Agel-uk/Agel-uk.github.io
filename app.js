const MARKETS = [
  ['US','United States','USD','amazon.com'],['AE','United Arab Emirates','AED','amazon.ae'],['SA','Saudi Arabia','SAR','amazon.sa'],['CA','Canada','CAD','amazon.ca'],['MX','Mexico','MXN','amazon.com.mx'],['BR','Brazil','BRL','amazon.com.br'],
  ['UK','United Kingdom','GBP','amazon.co.uk'],['DE','Germany','EUR','amazon.de'],['FR','France','EUR','amazon.fr'],['IT','Italy','EUR','amazon.it'],['ES','Spain','EUR','amazon.es'],
  ['NL','Netherlands','EUR','amazon.nl'],['SE','Sweden','SEK','amazon.se'],['PL','Poland','PLN','amazon.pl'],['IN','India','INR','amazon.in'],['JP','Japan','JPY','amazon.co.jp'],
  ['SG','Singapore','SGD','amazon.sg'],['AU','Australia','AUD','amazon.com.au']
];
const TAGS = window.DEALLENS_AFFILIATE_TAGS || {};
const demo = [
  {name:"Wireless Headphones",query:"wireless headphones",guide:"guide-wireless-headphones.html"},
  {name:"Smart Watches",query:"smart watches",guide:"guide-smart-watches.html"},
  {name:"Running Shoes",query:"running shoes",guide:"guide-running-shoes.html"},
  {name:"Power Banks",query:"usb c power bank",guide:"guide-power-banks.html"},
  {name:"Robot Vacuums",query:"robot vacuum cleaner",guide:"guide-robot-vacuums.html"},
  {name:"Air Fryers",query:"air fryer",guide:"guide-air-fryers.html"},
  {name:"Laptops",query:"laptops",guide:"guide-laptops.html"},
  {name:"Mesh Wi-Fi",query:"mesh wifi system",guide:"guide-mesh-wifi.html"},
  {name:"Portable SSDs",query:"portable ssd",guide:"guide-portable-ssds.html"},
  {name:"Office Chairs",query:"ergonomic office chair",guide:"guide-office-chairs.html"},
  {name:"Monitors",query:"computer monitor",guide:"guide-monitors.html"},
  {name:"Tablets",query:"tablet computer",guide:"guide-tablets.html"},
  {name:"Coffee Makers",query:"coffee maker",guide:"guide-coffee-makers.html"},
  {name:"Coffee Machines",query:"espresso machine",guide:"guide-coffee-machines.html"},
  {name:"Carry-on Luggage",query:"carry on luggage",guide:"guide-carry-on-luggage.html"},
  {name:"Cordless Drills",query:"cordless drill",guide:"guide-cordless-drills.html"}
];
const $ = id => document.getElementById(id);
const marketSelect=$('market'), currency=$('currency'), q=$('q'), results=$('results');
function marketByCode(code){return MARKETS.find(m=>m[0]===code)||MARKETS[0]}
function preferredMarket(){
  const saved=localStorage.getItem('deallens_market'); if(saved&&MARKETS.some(m=>m[0]===saved)) return saved;
  return 'US';
}
function marketOptions(){return MARKETS.map(m=>`<option value="${m[0]}">${m[1]} — ${m[2]}</option>`).join('')}
if(marketSelect){marketSelect.innerHTML=marketOptions();marketSelect.value=preferredMarket();}
function syncCurrency(){if(!marketSelect)return;const m=marketByCode(marketSelect.value);if(currency)currency.value=m[2];localStorage.setItem('deallens_market',m[0]);$('affiliateState')?.replaceChildren(document.createTextNode(TAGS[m[0]]?'Affiliate link active for this market':'Standard retailer link — affiliate not activated for this market'));}
function amazonSearchUrl(query){const m=marketByCode(marketSelect?.value||'US');const url=new URL(`https://www.${m[3]}/s`);url.searchParams.set('k',query);if(TAGS[m[0]])url.searchParams.set('tag',TAGS[m[0]]);return url.toString()}
function trackOutbound(query){try{const k='deallens_outbound_clicks';const data=JSON.parse(localStorage.getItem(k)||'[]');data.push({query,market:marketSelect?.value||'US',affiliate:Boolean(TAGS[marketSelect?.value||'AE']),at:new Date().toISOString()});localStorage.setItem(k,JSON.stringify(data.slice(-500)));}catch{}}
function render(items){if(!results)return;results.innerHTML=items.map(x=>`<article class="card"><div class="score">DEALLENS BUYING GUIDE</div><h3>${x.name}</h3><p>Review the buying criteria, then compare current products, sellers, delivery and prices on the selected marketplace.</p><div class="card-actions"><a class="btn" href="${x.guide}">Read guide</a><a class="btn primary" rel="${TAGS[marketSelect?.value||'AE']?'sponsored ':''}nofollow noopener" target="_blank" href="${amazonSearchUrl(x.query)}" data-query="${x.query}">View current offers</a></div><small>${TAGS[marketSelect?.value||'AE']?'Paid affiliate link. DealLens may earn from qualifying purchases.':'No DealLens affiliate tag is active for this market yet.'}</small></article>`).join('');results.querySelectorAll('[data-query]').forEach(a=>a.addEventListener('click',()=>trackOutbound(a.dataset.query)));}
const SEARCH_ALIASES = {
  'guide-wireless-headphones.html':'earbuds headset noise cancelling anc bluetooth calls',
  'guide-robot-vacuums.html':'robotic vacuum pet hair cleaning mop',
  'guide-mesh-wifi.html':'wireless router internet coverage networking',
  'guide-laptops.html':'notebook computer macbook windows',
  'guide-power-banks.html':'portable charger battery usb c travel',
  'guide-portable-ssds.html':'external hard drive storage backup',
  'guide-smart-watches.html':'smartwatch fitness wearable',
  'guide-air-fryers.html':'air fryer cooking kitchen',
  'guide-running-shoes.html':'sneakers trainers jogging',
  'guide-coffee-makers.html':'drip coffee brewing',
  'guide-coffee-machines.html':'espresso cappuccino coffee',
  'guide-office-chairs.html':'desk chair ergonomic work',
  'guide-monitors.html':'display screen gaming office',
  'guide-tablets.html':'ipad android tablet',
  'guide-carry-on-luggage.html':'suitcase cabin bag travel',
  'guide-cordless-drills.html':'power drill diy tools'
};
function search(){
  const raw=(q?.value||'').trim().toLowerCase();
  const terms=raw.split(/\s+/).filter(Boolean);
  const ranked=demo.map((x,i)=>{
    const name=x.name.toLowerCase(), query=x.query.toLowerCase(), aliases=SEARCH_ALIASES[x.guide]||'';
    const score=terms.reduce((sum,term)=>{
      if(name===term)return sum+12;
      if(name.includes(term))return sum+8;
      if(query.includes(term))return sum+5;
      if(aliases.includes(term))return sum+2;
      return sum-100;
    },0);
    return {x,i,score};
  }).filter(x=>!terms.length||x.score>=0).sort((a,b)=>b.score-a.score||a.i-b.i);
  render(ranked.map(x=>x.x));
  const count=$('resultCount');
  if(count)count.textContent=ranked.length===1?'1 matching buying guide':`${ranked.length} matching buying guides`;
  if(results&&!ranked.length)results.innerHTML='<p role="status">No matching buying guides. Try a shorter term, such as laptop, coffee, or vacuum, or browse all 16 guides.</p>';
}
$('searchBtn')?.addEventListener('click',search);q?.addEventListener('keydown',e=>{if(e.key==='Enter')search()});q?.addEventListener('input',search);document.querySelectorAll('[data-guide-search]').forEach(button=>button.addEventListener('click',()=>{if(!q)return;q.value=button.dataset.guideSearch;search();q.focus();}));marketSelect?.addEventListener('change',()=>{syncCurrency();search();updateOfferLinks()});currency?.addEventListener('change',search);
syncCurrency();search();
const photo=$('photo'),preview=$('preview');photo?.addEventListener('change',()=>{const f=photo.files?.[0];if(f){preview.src=URL.createObjectURL(f);preview.hidden=false;}});
$('listingBtn')?.addEventListener('click',()=>{const n=$('sellName').value.trim()||'Product';const c=$('condition').value;$('listing').textContent=`${n}\nCondition: ${c}\n\nSuggested title: ${n} — ${c}\nDescription: ${n} offered in ${c.toLowerCase()} condition. Confirm specifications, defects, delivery and warranty before publishing.\n\nAI image recognition is not enabled until an approved server-side AI provider is connected.`});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}

// Deep-link search and guide offer buttons.
const params = new URLSearchParams(location.search);
if (q && params.get('search')) { q.value = params.get('search'); search(); }
document.querySelectorAll('.offer-link[data-query]').forEach(a => {
  const query = a.dataset.query;
  a.href = amazonSearchUrl(query);
  a.target = '_blank';
  a.rel = (TAGS[marketSelect?.value||'AE'] ? 'sponsored ' : '') + 'nofollow noopener';
  a.addEventListener('click', () => trackOutbound(query));
});

// Keep editorial guide outbound links aligned with the selected marketplace.
function updateOfferLinks(){document.querySelectorAll('.offer-link[data-query]').forEach(a=>{a.href=amazonSearchUrl(a.dataset.query);a.rel=(TAGS[marketSelect?.value||'AE']?'sponsored ':'')+'nofollow noopener';});}
