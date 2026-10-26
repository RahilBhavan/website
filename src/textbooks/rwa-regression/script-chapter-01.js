(()=>{

const TOK_T = [
  { name: "BUIDL", launch:  62, listing: null, treated: false, color: "#52545a" },
  { name: "OUSG",  launch:   1, listing:  44, treated: true,  color: "#52545a" },
  { name: "USDY",  launch:  30, listing:  68, treated: true,  color: "#52545a" },
  { name: "BENJI", launch:   0, listing: null, treated: false, color: "#52545a" },
  { name: "USTB",  launch:  40, listing: null, treated: false, color: "#52545a" },
  { name: "USYC",  launch:  22, listing: null, treated: false, color: "#52545a" },
  { name: "STBT",  launch:  10, listing:  92, treated: true,  color: "#111214" },
];
const T_END = 170;

const tlSvg = d3.select("#timeline");
const tlW = 860, tlH = 240;
const tlMargin = { top: 18, right: 24, bottom: 36, left: 78 };
const tlInnerW = tlW - tlMargin.left - tlMargin.right;
const tlInnerH = tlH - tlMargin.top - tlMargin.bottom;
const rowH = tlInnerH / TOK_T.length;

const tlX = d3.scaleLinear().domain([0, T_END]).range([0, tlInnerW]);

const gTL = tlSvg.append("g").attr("transform", `translate(${tlMargin.left},${tlMargin.top})`);

gTL.append("g").attr("class", "axis").attr("transform", `translate(0,${tlInnerH})`)
  .call(d3.axisBottom(tlX).ticks(8).tickFormat(w => {
    const d = new Date("2023-01-08"); d.setDate(d.getDate() + w * 7);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }));

TOK_T.forEach((tok, i) => {
  const y = i * rowH + 6;
  const h = rowH - 12;
  gTL.append("rect")
    .attr("x", 0).attr("y", y).attr("width", tlX(tok.launch)).attr("height", h)
    .attr("fill", "#c6c7bf").attr("opacity", 0.5);
  const treatStart = tok.listing ?? T_END;
  gTL.append("rect")
    .attr("x", tlX(tok.launch)).attr("y", y)
    .attr("width", tlX(treatStart) - tlX(tok.launch)).attr("height", h)
    .attr("fill", tok.color).attr("opacity", tok.treated ? 0.35 : 0.55).attr("rx", 2);
  if (tok.listing) {
    gTL.append("rect")
      .attr("x", tlX(tok.listing)).attr("y", y - 2)
      .attr("width", tlX(T_END) - tlX(tok.listing)).attr("height", h + 4)
      .attr("fill", tok.color).attr("opacity", 0.95).attr("rx", 2);
    gTL.append("line")
      .attr("x1", tlX(tok.listing)).attr("x2", tlX(tok.listing))
      .attr("y1", y - 4).attr("y2", y + h + 4)
      .attr("stroke", "#111214").attr("stroke-width", 1.5);
    gTL.append("text")
      .attr("x", tlX(tok.listing) + 4).attr("y", y + h/2 + 4)
      .attr("class", "label").style("font-weight", 700).style("fill", "#111214")
      .text(`g_i = w${tok.listing}`);
  }
  gTL.append("text")
    .attr("x", -10).attr("y", y + h/2 + 4).attr("text-anchor", "end")
    .attr("class", "label").style("font-weight", 600).style("fill", "#111214")
    .text(tok.name);
});

const tlLeg = tlSvg.append("g").attr("transform", `translate(${tlMargin.left + 12},${tlMargin.top + tlInnerH - 6})`);
tlLeg.append("rect").attr("x", 0).attr("y", -10).attr("width", 14).attr("height", 8).attr("fill", "#52545a").attr("opacity", 0.35);
tlLeg.append("text").attr("x", 20).attr("y", -3).attr("class", "label").text("pre-treatment");
tlLeg.append("rect").attr("x", 130).attr("y", -10).attr("width", 14).attr("height", 8).attr("fill", "#52545a");
tlLeg.append("text").attr("x", 150).attr("y", -3).attr("class", "label").text("post-AMM-listing (treated)");

})();