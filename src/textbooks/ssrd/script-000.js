(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const pct = (x, d = 0) => `${(x * 100).toFixed(d)}%`;

  // One chapter at a time, with native hash links and browser history.
  const chapters = [...document.querySelectorAll("section.chapter")];
  const links = [...document.querySelectorAll(".toc a")];
  const select = $("chapter-select");
  const prev = $("previous-chapter"), next = $("next-chapter");
  const title = (chapter) => links.find((a) => a.hash === `#${chapter.id}`)?.textContent || chapter.querySelector("h2").textContent;
  chapters.forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter.id; option.textContent = title(chapter);
    select.append(option);
  });
  const showChapter = (id, navigate = false) => {
    const target = $(id);
    const chapter = target?.closest("section.chapter") || chapters.find((c) => c.id === id);
    if (!chapter) return;
    const index = chapters.indexOf(chapter);
    chapters.forEach((c) => { c.hidden = c !== chapter; });
    links.forEach((a) => {
      if (a.hash === `#${chapter.id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    select.value = chapter.id;
    for (const [anchor, sibling, prefix] of [[prev, chapters[index - 1], "← "], [next, chapters[index + 1], "Next: "]]) {
      anchor.hidden = !sibling;
      if (sibling) { anchor.href = `#${sibling.id}`; anchor.textContent = prefix + title(sibling); }
    }
    if (navigate) requestAnimationFrame(() => target?.scrollIntoView({ block: "start" }));
  };
  select.addEventListener("change", () => { location.hash = select.value; });
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href^='#']");
    if (!anchor) return;
    const id = anchor.getAttribute("href").slice(1);
    if (id) showChapter(id);
  });
  window.addEventListener("hashchange", () => showChapter(decodeURIComponent(location.hash.slice(1)), true));
  showChapter("plan");
  if (location.hash) showChapter(decodeURIComponent(location.hash.slice(1)));

  // Fig 5.2: shingles and Jaccard.
  const jA = $("jA"), jB = $("jB"), jK = $("jK");
  if (jA && jB && jK) {
    const shingles = (text, k) => {
      const t = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const out = new Set();
      for (let i = 0; i + k <= t.length; i++) out.add(t.slice(i, i + k).join(" "));
      return out;
    };
    const run = () => {
      const k = Number(jK.value);
      $("jKo").textContent = String(k);
      const A = shingles(jA.value, k), B = shingles(jB.value, k);
      const inter = [...A].filter((s) => B.has(s)).length;
      const uni = new Set([...A, ...B]).size;
      const j = uni ? inter / uni : 0;
      $("jOut").textContent = `Shared ${inter} · distinct ${uni} · Jaccard ${j.toFixed(2)} · ${j >= 0.8 ? "passes" : "below"} the 0.80 placeholder`;
      const box = $("jChips");
      box.replaceChildren();
      for (const s of A) {
        const c = document.createElement("span");
        c.className = "chip-s" + (B.has(s) ? " shared" : "");
        c.textContent = s;
        box.append(c);
      }
    };
    [jA, jB, jK].forEach((el) => el.addEventListener("input", run));
    run();
  }

  // Fig 6.1: the alert rule, as coded (score.decide) and as specified (SPEC R6).
  const picker = $("picker");
  if (picker) {
    const boxes = [...picker.querySelectorAll("input[type=checkbox]")];
    const run = () => {
      const on = boxes.filter((b) => b.checked).map((b) => ({ f: b.dataset.f, s: Number(b.dataset.s), name: b.parentElement.firstChild.nextSibling.textContent.trim() }));
      const strongFams = new Set(on.filter((x) => x.s === 3 && "ABC".includes(x.f)).map((x) => x.f));
      const other = on.filter((x) => !(x.s === 3 && "ABC".includes(x.f))).length;
      const code = strongFams.size >= 2 || (strongFams.size === 1 && other >= 2);
      const spec = strongFams.size >= 2;
      const score = on.reduce((t, x) => t + x.s, 0);
      const out = $("pickOut");
      out.replaceChildren();
      const v = (label, yes) => {
        const s = document.createElement("span");
        s.className = "verdict " + (yes ? "yes" : "no");
        s.textContent = `${label}: ${yes ? "alert" : "no alert"}`;
        return s;
      };
      out.append(v("Code (score.decide)", code), document.createTextNode("  "), v("SPEC rule", spec));
      const line = document.createElement("span");
      line.style.display = "block";
      line.style.marginTop = "8px";
      line.textContent = on.length
        ? `Strong families: ${[...strongFams].join(", ") || "none"} · other signals: ${other} · score ${score}${code !== spec ? " · the two rules disagree here" : ""}`
        : "No signals selected.";
      out.append(line);
    };
    const presets = { ab: ["tlsh", "favicon_mmh3"], aa: ["tlsh", "tag_jaccard"], add: ["tlsh", "asn", "ns"], clear: [] };
    document.querySelectorAll("[data-preset]").forEach((btn) => btn.addEventListener("click", () => {
      const want = presets[btn.dataset.preset];
      boxes.forEach((b) => { b.checked = want.includes(b.parentElement.firstChild.nextSibling.textContent.trim()); });
      run();
    }));
    boxes.forEach((b) => b.addEventListener("change", run));
    run();
  }

  // Fig 8.1: base rate → precision.
  const bR = $("bR");
  if (bR) {
    const N = 10000, X0 = 20, W = 860;
    const run = () => {
      const b = Number(bR.value) / 1000, r = Number($("bT").value) / 100, f = Number($("bF").value) / 1000;
      $("bRo").textContent = pct(b, 1); $("bTo").textContent = pct(r); $("bFo").textContent = pct(f, 1);
      const tp = N * b * r, fp = N * (1 - b) * f, all = tp + fp;
      const prec = all ? tp / all : 0;
      const wtp = all ? W * tp / all : 0;
      $("bTP").setAttribute("width", wtp.toFixed(1));
      $("bFP").setAttribute("x", (X0 + wtp).toFixed(1));
      $("bFP").setAttribute("width", (W - wtp).toFixed(1));
      $("bTPl").textContent = `true ${Math.round(tp)}`;
      $("bFPl").textContent = `false ${Math.round(fp)}`;
      $("baseTitle").textContent = all
        ? `${Math.round(all)} alerts from 10,000 fetched pages, and ${pct(prec)} of them are real`
        : "No alerts at these settings";
      $("baseRead").textContent = `${Math.round(N * b)} kit pages × ${pct(r)} recall = ${Math.round(tp)} true alerts. ${Math.round(N * (1 - b))} other pages × ${pct(f, 1)} = ${Math.round(fp)} false alerts. Precision ${pct(prec)}.`;
    };
    ["bR", "bT", "bF"].forEach((id) => $(id).addEventListener("input", run));
    run();
  }

  // Fig 8.2: Wald vs Wilson (same formula as evaluate.wilson).
  const wK = $("wK");
  if (wK) {
    const z = 1.96, X = (v) => 120 + Math.max(0, Math.min(1, v)) * 720;
    const run = () => {
      let n = Math.max(1, Math.floor(Number($("wN").value) || 1));
      let k = Math.max(0, Math.min(n, Math.floor(Number(wK.value) || 0)));
      const p = k / n;
      const wh = z * Math.sqrt(p * (1 - p) / n);
      const d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d;
      const h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
      const lo = Math.max(0, c - h), hi = Math.min(1, c + h);
      $("wWald").setAttribute("d", `M${X(p - wh)} 40H${X(p + wh)}`);
      $("wWil").setAttribute("d", `M${X(lo)} 90H${X(hi)}`);
      $("wP1").setAttribute("cx", X(p)); $("wP2").setAttribute("cx", X(p));
      const raw = `${pct(p - wh)} to ${pct(p + wh)}`;
      $("wRead").textContent = `${k}/${n} = ${pct(p, 1)} · Wald ${raw}${p - wh < 0 || p + wh > 1 ? " (runs outside 0–100%)" : ""} · Wilson ${pct(lo)} to ${pct(hi)}`;
    };
    [wK, $("wN")].forEach((el) => el.addEventListener("input", run));
    run();
  }
})();
