

(function() {
  var CHAPTERS = [
    { section: "Part I — The Problem",       items: [
      { href: "#home",                       title: "Course overview" },
      { href: "#01-introduction",            title: "The puzzle: idle tokens" },
      { href: "#02-rwa-primer",             title: "The 7-token universe" },
    ]},
    { section: "Part II — Infrastructure",   items: [
      { href: "#03-amm-mechanics",          title: "AMMs for fixed-NAV assets" },
      { href: "#04-onchain-data",           title: "On-chain data foundations" },
      { href: "#05-velocity-construction",  title: "Constructing velocity" },
    ]},
    { section: "Part III — Causal Inference", items: [
      { href: "#06-mafrur-paper",           title: "The Mafrur paper" },
      { href: "#07-causal-inference",       title: "Causal inference primer" },
      { href: "#08-twfe-bacon",             title: "TWFE & Goodman-Bacon" },
      { href: "#09-callaway-santanna",      title: "Callaway-Sant'Anna" },
      { href: "#10-sun-abraham",            title: "Sun-Abraham & friends" },
      { href: "#11-inference",              title: "Inference with N=7" },
      { href: "#12-pretrends",              title: "Pre-trend tests & limits" },
    ]},
    { section: "Part IV — Execution",        items: [
      { href: "#13-methodology",            title: "Methodology end-to-end" },
      { href: "#14-robustness",             title: "Robustness & placebos" },
      { href: "#15-limitations",            title: "Limitations & improvements" },
      { href: "#16-glossary",               title: "Glossary" },
    ]},
  ];

  function renderSidebar(hash) {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    var parts = [];
    parts.push('<a href="#home" style="text-decoration:none;color:inherit;"><h1>RWA Velocity &amp; Causal Inference</h1><div class="subtitle">An interactive textbook</div></a><nav>');
    var counter = 0;
    for (var s = 0; s < CHAPTERS.length; s++) {
      var sec = CHAPTERS[s];
      parts.push('<div class="section-label">' + sec.section + '</div>');
      parts.push('<ol style="counter-reset: chap ' + counter + ';">');
      for (var c = 0; c < sec.items.length; c++) {
        var ch = sec.items[c];
        counter++;
        var active = ch.href === hash ? " active" : "";
        parts.push('<li><a class="' + active + '" href="' + ch.href + '">' + ch.title + '</a></li>');
      }
      parts.push('</ol>');
    }
    parts.push('</nav><div class="footer-note">Companion to the RWA Panel Regression project. All diagrams interactive.</div>');
    sidebar.innerHTML = parts.join("");
  }

  function renderChapterNav(hash) {
    var container = document.querySelector(".chapter-nav");
    if (!container) return;
    var flat = [];
    for (var s = 0; s < CHAPTERS.length; s++) {
      for (var c = 0; c < CHAPTERS[s].items.length; c++) {
        flat.push(CHAPTERS[s].items[c]);
      }
    }
    var idx = -1;
    for (var i = 0; i < flat.length; i++) {
      if (flat[i].href === hash) { idx = i; break; }
    }
    if (idx >= 0) {
      var prev = idx > 0 ? flat[idx - 1] : null;
      var next = idx < flat.length - 1 ? flat[idx + 1] : null;
      var prevHtml = prev ? '<a href="' + prev.href + '" class="prev"><span class="dir">← Previous</span>' + prev.title + '</a>' : '<span></span>';
      var nextHtml = next ? '<a href="' + next.href + '" class="next"><span class="dir">Next →</span>' + next.title + '</a>' : '<span></span>';
      if (container) container.innerHTML = prevHtml + nextHtml;
    }
  }

  function updateActive() {
    var hash = window.location.hash || "#home";
    
    renderChapterNav(hash);
    try {
      var target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch(e) {}
  }

  window.addEventListener("hashchange", updateActive);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateActive);
  } else {
    updateActive();
  }

  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {delimiters: [
      {left: "\\(", right: "\\)", display: false},
      {left: "$$", right: "$$", display: true},
      {left: "$", right: "$", display: false}
    ]});
  }
})();

