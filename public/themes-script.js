document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll(".theme"));
  const icons = Array.from(document.querySelectorAll(".ph-caret-circle-right"));
  const gradients = {
    "theme-one":  "#0099cc",
    "theme-two":  "#f27dd5",
    "theme-three":"#000000",
    "theme-four": "#967df2",
    "theme-five": "#0a6442"
  };

  function applyTheme(btn) {
    buttons.forEach(b => b.classList.remove("active"));
    icons.forEach(i => i.classList.remove("active"));
    btn.classList.add("active");
    const container = btn.closest("div");
    const arrow = container?.querySelector(".ph-caret-circle-right");
    if (arrow) arrow.classList.add("active");
    const matchedKey = [...btn.classList].find(c => gradients[c]);
    const color = gradients[matchedKey] || "#0099cc";
    document.body.style.background = `linear-gradient(to bottom, #ffffff, ${color})`;
    localStorage.setItem("repRoulette:theme", JSON.stringify({ key: matchedKey, color }));
  }

  buttons.forEach(btn => btn.addEventListener("click", () => applyTheme(btn)));

  const saved = localStorage.getItem("repRoulette:theme");
  if (saved) {
    try {
      const { key, color } = JSON.parse(saved);
      const btn = document.querySelector(`.theme.${key}`) || document.querySelector(".theme-one") || buttons[0];
      if (btn) {
        document.body.style.background = `linear-gradient(to bottom, #ffffff, ${color || "#0099cc"})`;
        applyTheme(btn);
        return;
      }
    } catch {}
  }
  const defaultBtn = document.querySelector(".theme-one") || buttons[0];
  if (defaultBtn) applyTheme(defaultBtn);
});