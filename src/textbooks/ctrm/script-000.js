(function(){
  var K=220462n; // 22.0462 scaled by 1e4; hundredths of a cent-per-lb times K gives micro-dollars per tonne
  var ids=["c-dir","c-q","c-fa","c-ba","c-fm","c-bm"], el={};
  ids.forEach(function(i){el[i]=document.getElementById(i);});
  if(!el["c-q"]) return;
  function hundredths(s){
    s=String(s).trim();
    if(!/^-?\d+(\.\d{1,2})?$/.test(s)) return null;
    var neg=s[0]==="-"; if(neg) s=s.slice(1);
    var p=s.split("."), whole=BigInt(p[0]), frac=BigInt(((p[1]||"")+"00").slice(0,2));
    var v=whole*100n+frac; return neg?-v:v;
  }
  function money(micro){
    var neg=micro<0n, a=neg?-micro:micro, cents=(a+5000n)/10000n;
    var d=(cents/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,","), c=(cents%100n).toString().padStart(2,"0");
    return (neg?"−":"+")+d+"."+c;
  }
  function run(){
    var err=document.getElementById("c-err"); err.textContent="";
    var qs=el["c-q"].value.trim();
    var f=hundredths(el["c-fa"].value), b=hundredths(el["c-ba"].value), fm=hundredths(el["c-fm"].value), bm=hundredths(el["c-bm"].value);
    if(!/^\d+$/.test(qs)||[f,b,fm,bm].some(function(x){return x===null;})){
      err.textContent="Enter whole tonnes and prices with up to two decimals, for example 67.50.";
      ["o-f","o-b","o-t"].forEach(function(i){document.getElementById(i).textContent="—";}); return;
    }
    var s=BigInt(el["c-dir"].value), q=BigInt(qs);
    var MF=s*q*(fm-f)*K, MB=s*q*(bm-b)*K;
    document.getElementById("o-f").textContent=money(MF);
    document.getElementById("o-b").textContent=money(MB);
    document.getElementById("o-t").textContent=money(MF+MB);
  }
  ids.forEach(function(i){el[i].addEventListener("input",run);el[i].addEventListener("change",run);});
  run();
  if(window.innerWidth<900){var d=document.querySelector(".toc details"); if(d) d.removeAttribute("open");}
  function openAll(){document.querySelectorAll("details").forEach(function(d){d.setAttribute("open","");});}
  window.addEventListener("beforeprint",openAll);
  if(/[?&]print=1/.test(location.search)) openAll();
})();
