function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hasStartedToday(groupId) {
  const key = `repRoulette:started:${todayKey()}`;
  try { 
    const ids = JSON.parse(localStorage.getItem(key)) || [];
    return ids.includes(groupId);
  } catch { 
    return false; 
  }
}

function markStartedToday(groupId) {
  const key = `repRoulette:started:${todayKey()}`;
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem(key)) || []; } catch {}
  if (!ids.includes(groupId)) ids.push(groupId);
  localStorage.setItem(key, JSON.stringify(ids));
}

function setNamesBlurred(on) {
  document.querySelectorAll(".name").forEach(el => {
    el.classList.toggle("blurred", on);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("repRoulette:theme");
  if (!saved) return;
  try {
    const { color } = JSON.parse(saved);
    if (color) {
      document.body.style.background = `linear-gradient(to bottom, #ffffff, ${color})`;
    }
  } catch {}
});

document.addEventListener("DOMContentLoaded", () => {
  const dateElement = document.querySelector(".date");
  const options = { weekday: "long", month: "long", day: "numeric" };
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-US", options);

  const nameContainer = document.querySelector(".name-container");
  const shuffleBtn = document.querySelector(".name-container .shuffle");

  const STORAGE_KEY_ORDER = "repRoulette:namesOrder";

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
        n.getBoundingClientRect();
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
    try { applyOrder(JSON.parse(savedOrder)); } catch {}
  }

  let lock = false;

  shuffleBtn?.addEventListener("dblclick", (e) => {
    e.preventDefault();
  }, { passive: false });

  shuffleBtn?.addEventListener("click", () => {
    if (lock) return;
    lock = true;
    setTimeout(() => { lock = false; }, 380);

    const btn = document.querySelector(".name-container .shuffle");
    const mode = (btn?.dataset.mode) || "normal";

    if (mode === "prestart") {
      setNamesBlurred(false);
      if (currentGroupId) markStartedToday(currentGroupId);
      if (btn) {
        btn.innerHTML = '<i class="animation"></i>SHUFFLE<i class="animation"></i>';
        btn.dataset.mode = "normal";
      }
      return;
    }

    const nameContainer = document.querySelector(".name-container");
    const buttonRow = nameContainer.querySelector("div");
    const nameEls = Array.from(nameContainer.querySelectorAll(".name"));
    if (nameEls.length <= 1) return;

    const prevFirstText = nameEls[0].textContent.trim();

    let newOrder = shuffleNodes(nameEls);
    if (nameEls.length === 2) {
      if (newOrder[0].textContent.trim() === prevFirstText) newOrder.reverse();
    } else {
      while (newOrder[0].textContent.trim() === prevFirstText) {
        newOrder = shuffleNodes(nameEls);
      }
    }

    flipAnimate(nameEls, () => {
      newOrder.forEach(n => nameContainer.insertBefore(n, buttonRow));
    });
    saveCurrentOrder();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const membersStack = document.getElementById("members");
  const addIcon = document.querySelector(".ph-user-plus");

  function makeMemberRow(value = "") {
    const row = document.createElement("div");
    row.className = "members-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "member-name";
    input.placeholder = "Add a member";
    input.value = value;

    const minus = document.createElement("i");
    minus.className = "ph ph-user-minus";
    minus.setAttribute("role", "button");
    minus.setAttribute("aria-label", "Remove member");

    row.append(input, minus);
    return row;
  }

  function addMemberRow() {
    const row = makeMemberRow();
    membersStack.appendChild(row);
    row.querySelector(".member-name").focus();
  }

  addIcon?.addEventListener("click", addMemberRow);

  membersStack?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("member-name")) {
      e.preventDefault();
      addMemberRow();
    }
  });

  membersStack?.addEventListener("click", (e) => {
    const minus = e.target.closest(".ph-user-minus");
    if (!minus) return;

    const rows = membersStack.querySelectorAll(".members-row");
    const row = minus.closest(".members-row");
    if (rows.length > 1) {
      row.remove();
      membersStack.querySelector(".members-row:last-child .member-name")?.focus();
    } else {
      const input = row.querySelector(".member-name");
      input.value = "";
      input.focus();
    }
  });
});

const STORAGE_KEY_GROUPS = "repRoulette:groups";

function readGroups() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_GROUPS)) || []; } catch { return []; }
}

function writeGroups(groups) {
  localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
}

const savedGroupsContainer = document.querySelector(".saved-groups-container");
const savedGroupsMessage = document.querySelector(".saved-groups-message");
let savedGroupsList = document.querySelector(".saved-groups-list");

function ensureSavedGroupsList() {
  if (!savedGroupsList) {
    savedGroupsList = document.createElement("ul");
    savedGroupsList.className = "saved-groups-list";
    savedGroupsContainer.appendChild(savedGroupsList);
  }
}

function resetCreateForm() {
  const nameInput = document.querySelector(".group-name");
  if (nameInput) nameInput.value = "";

  const membersStack = document.getElementById("members");
  if (membersStack) {
    membersStack.innerHTML = "";
    const row = document.createElement("div");
    row.className = "members-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "member-name";
    input.placeholder = "Add a member";

    const minus = document.createElement("i");
    minus.className = "ph ph-user-minus";
    minus.setAttribute("role", "button");
    minus.setAttribute("aria-label", "Remove member");

    row.append(input, minus);
    membersStack.appendChild(row);
  }
}

function unmarkStartedToday(groupId) {
  const key = `repRoulette:started:${todayKey()}`;
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem(key)) || []; } catch {}
  const next = ids.filter(id => id !== groupId);
  localStorage.setItem(key, JSON.stringify(next));
}

let currentGroupId = null;

savedGroupsList?.addEventListener("click", (e) => {
  const del = e.target.closest(".delete-group");
  if (del) {
    const li = e.target.closest(".saved-group");
    if (!li) return;
    const id = li.dataset.id;

    const next = readGroups().filter(g => g.id !== id);
    writeGroups(next);
    unmarkStartedToday(id);

    if (currentGroupId === id) {
      document.querySelector(".opening-screen").style.display = "block";
      currentGroupId = null;
    }

    li.remove();

    if (!next.length) {
      savedGroupsMessage.hidden = false;
      savedGroupsList.hidden = true;
      savedGroupsMessage.textContent = "Saved groups will appear here";
    }

    return;
  }

  const li = e.target.closest(".saved-group");
  if (!li) return;
  const id = li.dataset.id;
  window.location.href = `roulette.html?group=${encodeURIComponent(id)}`;
});

savedGroupsList?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const li = e.target.closest(".saved-group");
  if (li) li.click();
});

function renderSavedGroups() {
  ensureSavedGroupsList();
  const groups = readGroups();

  if (!groups.length) {
    savedGroupsMessage.hidden = false;
    savedGroupsList.hidden = true;
    savedGroupsList.innerHTML = "";
    return;
  }

  savedGroupsMessage.hidden = true;
  savedGroupsList.hidden = false;
  savedGroupsList.innerHTML = "";

  groups.forEach(g => {
    const li = document.createElement("li");
    li.className = "saved-group";
    li.dataset.id = g.id;

    const name = document.createElement("span");
    name.className = "saved-group-name";
    name.textContent = g.name;

    const del = document.createElement("i");
    del.className = "ph ph-trash-simple delete-group";
    del.title = "Delete group";

    li.append(name, del);
    savedGroupsList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get("group");
  if (!groupId) return;

  const groups = JSON.parse(localStorage.getItem("repRoulette:groups")) || [];
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  setNamesInMain(group.members);
});

document.addEventListener("DOMContentLoaded", renderSavedGroups);

function populateGroupSelect() {
  const select = document.getElementById("group-select");
  if (!select) return;
  const groups = readGroups();
  select.innerHTML = "";
  groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.name;
    select.appendChild(opt);
  });
}

function currentMembersFromUI() {
  return Array.from(document.querySelectorAll("#members .member-name"))
    .map(i => i.value.trim())
    .filter(Boolean);
}

function setNamesInMain(names) {
  const nameContainer = document.querySelector(".name-container");
  const buttonRow = nameContainer.querySelector("div");
  Array.from(nameContainer.querySelectorAll(".name")).forEach(n => n.remove());
  names.forEach(n => {
    const p = document.createElement("p");
    p.className = "name";
    p.textContent = n;
    nameContainer.insertBefore(p, buttonRow);
  });
  localStorage.removeItem("repRoulette:namesOrder");
}

const createGroupBtn = document.querySelector(".create-group");
const createPanel = document.querySelector(".create-panel");

createGroupBtn?.addEventListener("click", () => { 
  resetCreateForm();  
  createPanel.style.display = "flex";
  createPanel.removeAttribute("hidden");
});

const selectGroupBtn = document.querySelector(".select-group");
const selectPanel = document.querySelector(".select-panel");

selectGroupBtn?.addEventListener("click", () => {
  populateGroupSelect();
  selectPanel.style.display = "flex";
  selectPanel.removeAttribute("hidden");
});

const finishBtn = document.querySelector(".finish-creating-group");

finishBtn?.addEventListener("click", () => {
  createPanel.style.display = "none";
  const name = document.querySelector(".group-name").value.trim();
  const members = currentMembersFromUI();
  if (!name || members.length === 0) return;

  const groups = readGroups();
  const idx = groups.findIndex(g => g.name.toLowerCase() === name.toLowerCase());
  const id = idx >= 0 ? groups[idx].id : String(Date.now());
  const group = { id, name, members, createdAt: new Date().toISOString() };
  if (idx >= 0) groups[idx] = group; else groups.push(group);
  writeGroups(groups);

  if (readGroups().length === 1) {
    savedGroupsMessage.textContent = name;
    savedGroupsMessage.hidden = false;
    savedGroupsList.hidden = true;
  } else {
    savedGroupsMessage.hidden = true;
    savedGroupsList.hidden = false;
  }

  resetCreateForm();
  renderSavedGroups();
  populateGroupSelect();

  document.activeElement && document.activeElement.blur();
  Array.from(document.querySelectorAll('input, textarea')).forEach(el => el.blur());
  const vp = document.querySelector('meta[name="viewport"]');
  if (vp) {
    const original = vp.getAttribute('content') || 'width=device-width, initial-scale=1.0';
    vp.setAttribute('content', original.replace(/,\s*maximum-scale=[^,]+/,'') + ', maximum-scale=1');
    setTimeout(() => vp.setAttribute('content', original), 300);
  }
  window.scrollTo({ top: 0, left: 0 });
});

const loadBtn = document.querySelector(".load-group");
loadBtn?.addEventListener("click", () => {
  const select = document.getElementById("group-select");
  if (!select) return;
  const id = select.value;
  const groups = readGroups();
  const g = groups.find(x => x.id === id);
  if (!g) return;
  setNamesInMain(g.members);
  document.querySelector(".opening-screen").style.display = "none";
});


document.querySelector(".close-creating-group")?.addEventListener("click", () => {
  createPanel.style.display = "none";
  resetCreateForm();
});