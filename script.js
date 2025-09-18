document.addEventListener("DOMContentLoaded", () => {
  const dateElement = document.querySelector(".date");
  const options = { weekday: "long", month: "long", day: "numeric" };
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-US", options);

  const nameContainer = document.querySelector(".name-container");
  const startScreen = document.getElementById("start-screen");
  const startBtn = startScreen?.querySelector(".start-btn");
  const shuffleBtn = document.querySelector(".name-container .shuffle");
  const mascot = document.querySelector(".corner-image");

  const todayKey = new Date().toISOString().slice(0, 10);
  const STORAGE_KEY_DAY = "repRoulette:startUsedDate";
  const STORAGE_KEY_ORDER = "repRoulette:namesOrder";
  const STORAGE_KEY_MASCOT = "repRoulette:mascotVisible";

  function showMain() {
    if (nameContainer) nameContainer.style.display = "flex";
    if (startScreen) startScreen.style.display = "none";
  }

  function showStart() {
    if (nameContainer) nameContainer.style.display = "none";
    if (startScreen) startScreen.style.display = "flex";
  }

  function getNameNodes() {
    return Array.from(nameContainer.querySelectorAll(".name"));
  }

  function applyOrder(order) {
    const buttonRow = nameContainer.querySelector("div");
    const map = new Map(getNameNodes().map(el => [el.textContent.trim(), el]));
    order.forEach(text => {
      const node = map.get(text);
      if (node) nameContainer.insertBefore(node, buttonRow);
    });
  }

  function saveCurrentOrder() {
    const order = getNameNodes().map(el => el.textContent.trim());
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(order));
  }

  function shuffleNodes(nodes) {
    const arr = Array.from(nodes);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function flipAnimate(elements, mutate) {
    const nodes = Array.from(elements);
    const firstRects = new Map(nodes.map(n => [n, n.getBoundingClientRect()]));

    mutate();

    nodes.forEach(n => {
      const last = n.getBoundingClientRect();
      const first = firstRects.get(n);
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (dx || dy) {
        n.style.transition = 'none';
        n.style.transform = `translate(${dx}px, ${dy}px)`;
        n.style.opacity = '0.9';
        n.getBoundingClientRect(); // force reflow
        requestAnimationFrame(() => {
          n.style.transition = 'transform 300ms ease, opacity 300ms ease';
          n.style.transform = '';
          n.style.opacity = '';
        });
      }
    });
  }


  const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
  if (savedOrder) {
    try {
      applyOrder(JSON.parse(savedOrder));
    } catch {}
  }

  const lastUsed = localStorage.getItem(STORAGE_KEY_DAY);
  if (lastUsed === todayKey) {
    showMain();
  } else {
    if (savedOrder) {
      showMain();
    } else {
      showStart();
    }
  }

  if (localStorage.getItem(STORAGE_KEY_MASCOT) === "true") {
    if (mascot) mascot.style.display = "flex";
  }

  startBtn?.addEventListener("click", () => {
    const buttonRow = nameContainer.querySelector("div");
    const nameEls = getNameNodes();
    flipAnimate(nameEls, () => {
      const shuffled = shuffleNodes(nameEls);
      shuffled.forEach(el => nameContainer.insertBefore(el, buttonRow));
    });
    saveCurrentOrder();
    localStorage.setItem(STORAGE_KEY_DAY, todayKey);
    localStorage.setItem(STORAGE_KEY_MASCOT, "true");
    showMain();
    if (mascot) mascot.style.display = "flex";
  });

  shuffleBtn?.addEventListener("click", () => {
    const nameEls = getNameNodes();
    if (nameEls.length > 1) {
      const last = nameEls[nameEls.length - 1];
      const first = nameEls[0];
      flipAnimate(nameEls, () => {
        nameContainer.insertBefore(last, first);
      });
      saveCurrentOrder();
    }
  });
});