(function(){
  "use strict";
  if(window.__niftyGlobalNav)return;
  window.__niftyGlobalNav=true;
  const NAV=[
    ["command","Command Centre","/signal-suite.html"],
    ["prepper","Prepper","/prepper-command.html"],
    ["markets","Market Tools","/library.html?filter=market"],
    ["work","Work Tools","/library.html?filter=work"],
    ["fun","Fun Lab","/library.html?filter=fun"],
    ["library","Library","/library.html"]
  ];
  const PAGE={
    "/":"command","/index.html":"command","/signal-suite.html":"command","/signal-watch.html":"command","/personal-risk.html":"command","/command-queue.html":"command","/outage-radar.html":"command","/cyber-threat.html":"command","/food-watch.html":"command","/meme-watch.html":"command","/aurora-watch.html":"command","/signal-suite-pro.html":"command",
    "/prepper-command.html":"prepper","/prepper-tools.html":"prepper","/prepper-risk.html":"prepper",
    "/crypto-pulse.html":"markets","/market-volume-pulse.html":"markets","/positioning-radar.html":"markets",
    "/salary-tools.html":"work","/image-tools.html":"work","/pdf-tools.html":"work","/receipt-tools.html":"work","/qr-tools.html":"work","/dev-tools.html":"work","/text-tools.html":"work",
    "/tarot-tools.html":"fun","/astrology-tools.html":"fun","/shuman-tool.html":"fun","/library.html":"library"
  };
  const FALLBACK=[
    ["signal-suite","Signal Suite Hub","/signal-suite.html","command","All flagship radar tools in one public signal shelf."],
    ["personal-risk","Personal Risk Briefing","/personal-risk.html","command","Local risk across weather, air, outages, food, markets and cyber."],
    ["signal-watch","Early Warning Radar","/signal-watch.html","command","Space weather, quakes, outages, conflict, news and market activity."],
    ["outage-radar","Outage Radar","/outage-radar.html","command","App, cloud, carrier and internet-core status signals."],
    ["cyber-threat","Cyber Threat Radar","/cyber-threat.html","command","Public cyber signals and threat map."],
    ["aurora-watch","Aurora Watch","/aurora-watch.html","command","Northern lights visibility context."],
    ["prepper-command","Prepper Command Centre","/prepper-command.html","prepper","Water, food, power, go-bag and family readiness."],
    ["prepper-tools","Prepper Toolkit Pro","/prepper-tools.html","prepper","Checklists and readiness helpers."],
    ["crypto-pulse","Crypto Pulse","/crypto-pulse.html","markets","BTC and ETH activity, fees and market context."],
    ["market-volume-pulse","Stock Volume Pulse","/market-volume-pulse.html","markets","Stocks, ETFs, most-traded names and volume leaders."],
    ["positioning-radar","Shorts vs Longs Radar","/positioning-radar.html","markets","Long/short crowding across SPY, QQQ, BTC, ETH, gold, oil and coffee."],
    ["image-tools","Image Toolkit","/image-tools.html","work","Compress, resize and convert images."],
    ["pdf-tools","PDF Toolkit","/pdf-tools.html","work","Merge, extract and optimize PDFs."],
    ["qr-tools","QR Code Toolkit Pro","/qr-tools.html","work","Build QR codes for links, Wi-Fi and more."],
    ["tarot-tools","Tarot Reader","/tarot-tools.html","fun","Card spreads and playful interpretations."],
    ["astrology-tools","Birth Chart / Zodiac Toolkit","/astrology-tools.html","fun","Zodiac, numerology and compatibility."],
    ["library","Full Tool Library","/library.html","library","Browse every tool by category."]
  ].map(([slug,name,url,hub,description])=>({slug,name,url,hub,hubs:[hub],category:hub,description,tags:[]}));
  const HUB={signals:"Command Centre",command:"Command Centre",prepper:"Preparedness",markets:"Market Tools",work:"Work Tools",utilities:"Everyday Utilities",fun:"Fun Lab",indie:"Indie Developers",library:"Library"};
  let selected=0,lastFocus=null;
  const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  function active(){
    const path=location.pathname.endsWith("/")&&location.pathname!=="/"?location.pathname.slice(0,-1):location.pathname;
    const filter=(new URLSearchParams(location.search).get("filter")||"").toLowerCase();
    if(path==="/library.html"){
      if(["market","markets","crypto","finance"].includes(filter))return"markets";
      if(["fun","play","zodiac","tarot"].includes(filter))return"fun";
      if(["work","developer","image","pdf","text","file","receipt","qr"].includes(filter))return"work";
      if(["utility","utilities","convert","time","screen","calculator","device"].includes(filter))return"library";
      if(["indie","founder","startup","launch"].includes(filter))return"library";
      return"library";
    }
    return PAGE[path]||"library";
  }
  function tools(){
    const r=window.NIFTY_TOOLS_REGISTRY;
    if(r&&typeof r.all==="function")return r.all().map(t=>({slug:t.slug,name:t.name,url:t.url,hub:t.hub,hubs:Array.isArray(t.hubs)&&t.hubs.length?t.hubs:[t.hub],category:t.category,description:t.description,tags:t.tags||[]}));
    return FALLBACK;
  }
  function score(t,q){
    const hubNames=(Array.isArray(t.hubs)&&t.hubs.length?t.hubs:[t.hub]).map(h=>HUB[h]||h).join(" ");
    const hay=[t.name,t.category,HUB[t.hub]||t.hub,hubNames,t.description,(t.tags||[]).join(" ")].join(" ").toLowerCase();
    q=(q||"").toLowerCase().trim();
    if(!q)return 10;
    if((t.name||"").toLowerCase()===q)return 100;
    if((t.name||"").toLowerCase().startsWith(q))return 80;
    if(hay.includes(q))return 50;
    return q.split(/\s+/).filter(p=>hay.includes(p)).length*14;
  }
  function list(q,hub){
    return tools().map(t=>({t,s:score(t,q)})).filter(x=>x.s>0).filter(x=>{
      if(!hub)return true;
      const hubs=(Array.isArray(x.t.hubs)&&x.t.hubs.length?x.t.hubs:[x.t.hub]).map(h=>h==="signals"?"command":h);
      return hubs.includes(hub);
    }).sort((a,b)=>b.s-a.s||a.t.name.localeCompare(b.t.name)).slice(0,9).map(x=>x.t);
  }
  function render(){
    const input=document.querySelector("[data-nt-command-input]"),box=document.querySelector("[data-nt-command-results]");
    if(!input||!box)return;
    const rows=list(input.value,input.dataset.hub||"");
    selected=Math.min(selected,Math.max(rows.length-1,0));
    if(!rows.length){box.innerHTML='<div class="nt-command-empty">No matching tools yet. Try "radar", "pdf", "market" or "prepper".</div>';return;}
    box.innerHTML=rows.map((t,i)=>`<button class="nt-command-result${i===selected?" is-selected":""}" type="button" data-nt-command-result="${esc(t.url)}"><span><span class="nt-command-title">${esc(t.name)}</span><span class="nt-command-desc">${esc(t.description||t.category||"Open tool")}</span></span><span class="nt-command-meta">${esc(HUB[t.hub]||t.category||"Tool")}</span></button>`).join("");
  }
  function openUrl(url){
    const t=tools().find(x=>x.url===url);
    if(window.ntTrack)window.ntTrack("tool_open",{tool:t?t.slug:url,surface:"command_palette"});
    location.href=url;
  }
  function closePalette(){
    document.body.classList.remove("nt-command-open");
    const overlay=document.querySelector("[data-nt-command-overlay]");
    if(overlay)overlay.setAttribute("aria-hidden","true");
    if(lastFocus&&typeof lastFocus.focus==="function")lastFocus.focus();
  }
  function openPalette(){
    lastFocus=document.activeElement;
    document.body.classList.add("nt-command-open");
    const overlay=document.querySelector("[data-nt-command-overlay]"),input=document.querySelector("[data-nt-command-input]");
    if(overlay)overlay.setAttribute("aria-hidden","false");
    if(input){input.value="";input.dataset.hub="";selected=0;render();requestAnimationFrame(()=>input.focus());}
    if(window.ntTrack)window.ntTrack("command_palette_open",{page:location.pathname});
  }
  function header(){
    const h=document.querySelector("header")||document.body.insertBefore(document.createElement("header"),document.body.firstChild);
    const act=active();
    h.className=(h.className+" nt-global-header").trim();
    h.innerHTML=`<div class="nt-global-shell"><a class="nt-brand" href="/" aria-label="NiftyTools Hub home"><span class="nt-mark">NT</span><span>niftytoolshub</span></a><nav class="nt-links" aria-label="Primary tools navigation">${NAV.map(([id,label,url])=>`<a href="${esc(url)}" class="${id===act?"is-active":""}">${esc(label)}</a>`).join("")}<button class="nt-command-btn" type="button" data-nt-command-open aria-label="Search tools"><span class="nt-keycap">⌘K</span><span class="nt-command-label">Search tools</span></button></nav></div>`;
  }
  function overlay(){
    if(document.querySelector("[data-nt-command-overlay]"))return;
    const o=document.createElement("div");
    o.className="nt-command-overlay";
    o.setAttribute("data-nt-command-overlay","");
    o.setAttribute("aria-hidden","true");
    o.innerHTML=`<div class="nt-command-panel" role="dialog" aria-modal="true" aria-labelledby="nt-command-title"><div class="nt-command-top"><span id="nt-command-title">Search NiftyTools</span><button class="nt-command-close" type="button" data-nt-command-close aria-label="Close search">Esc</button></div><div class="nt-command-search"><input data-nt-command-input type="search" placeholder="Search tools, signals, markets, prepper..." aria-label="Search tools"><div class="nt-command-chips" aria-label="Quick filters">${NAV.slice(0,5).map(([id,label])=>`<button class="nt-command-chip" type="button" data-nt-command-hub="${esc(id)}">${esc(label)}</button>`).join("")}</div></div><div class="nt-command-results" data-nt-command-results></div></div>`;
    document.body.appendChild(o);
  }
  function bind(){
    document.addEventListener("click",e=>{
      const open=e.target.closest("[data-nt-command-open]"),close=e.target.closest("[data-nt-command-close]"),result=e.target.closest("[data-nt-command-result]"),chip=e.target.closest("[data-nt-command-hub]"),back=e.target.matches("[data-nt-command-overlay]");
      if(open){e.preventDefault();openPalette();}
      else if(close||back){e.preventDefault();closePalette();}
      else if(result){e.preventDefault();openUrl(result.dataset.ntCommandResult);}
      else if(chip){e.preventDefault();const input=document.querySelector("[data-nt-command-input]");if(input){input.dataset.hub=chip.dataset.ntCommandHub||"";input.focus();selected=0;render();}}
    });
    document.addEventListener("input",e=>{if(e.target.matches("[data-nt-command-input]")){selected=0;render();}});
    document.addEventListener("keydown",e=>{
      const isOpen=document.body.classList.contains("nt-command-open"),isCmd=(e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k";
      if(isCmd){e.preventDefault();openPalette();return;}
      if(!isOpen)return;
      if(e.key==="Escape"){e.preventDefault();closePalette();return;}
      if(e.key==="ArrowDown"||e.key==="ArrowUp"){const count=document.querySelectorAll("[data-nt-command-result]").length;if(!count)return;e.preventDefault();selected=e.key==="ArrowDown"?(selected+1)%count:(selected-1+count)%count;render();return;}
      if(e.key==="Enter"&&document.activeElement&&document.activeElement.matches("[data-nt-command-input]")){const row=document.querySelectorAll("[data-nt-command-result]")[selected];if(row){e.preventDefault();openUrl(row.dataset.ntCommandResult);}}
    });
  }
  function init(){header();overlay();bind();render();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
