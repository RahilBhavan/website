(()=>{

document.getElementById("searchBox").addEventListener("input", function(e) {
  const q = e.target.value.toLowerCase().trim();
  document.querySelectorAll("dl.gloss").forEach(dl => {
    const items = dl.querySelectorAll("dt");
    items.forEach(dt => {
      const dd = dt.nextElementSibling;
      const text = (dt.textContent + " " + dd.textContent).toLowerCase();
      const match = !q || text.includes(q);
      dt.style.display = match ? "" : "none";
      dd.style.display = match ? "" : "none";
    });
  });
});

})();