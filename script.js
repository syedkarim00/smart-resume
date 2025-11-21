const STORAGE_KEY = "smart-resume-data";
const THEME_KEY = "smart-resume-theme";

const defaultSections = () => [
  { id: "summary", type: "summary", title: "Summary" },
  { id: "experience", type: "experience", title: "Experience" },
  { id: "education", type: "education", title: "Education" },
  { id: "skills", type: "skills", title: "Skills" },
];

const sampleData = {
  name: "Alex Taylor",
  headline: "Product Designer",
  email: "alex.taylor@email.com",
  phone: "(555) 555-5555",
  location: "Austin, TX",
  website: "alex.design",
  summary:
    "I craft thoughtful product experiences that balance business goals with human impact.",
  skills: ["Figma", "UX research", "Prototyping", "Design systems", "Storytelling"],
  experience: [
    {
      company: "Orbit Apps",
      role: "Lead Product Designer",
      start: "2021",
      end: "Present",
      highlights: [
        "Led redesign of onboarding, improving conversion by 18%",
        "Partnered with PMs to launch experimentation playbook",
        "Shipped design system used by 4 product squads",
      ],
    },
    {
      company: "Canvas Labs",
      role: "Product Designer",
      start: "2018",
      end: "2021",
      highlights: [
        "Built research repository to share insights across teams",
        "Created UX metrics dashboard adopted by leadership",
      ],
    },
  ],
  education: [
    {
      school: "Parsons School of Design",
      degree: "BFA, Communication Design",
      year: "2018",
      extras: "Graduated with honors, UX track",
    },
  ],
  sections: defaultSections(),
};

const state = loadData();

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  let data = saved ? tryParse(saved) : structuredClone(sampleData);
  return normalizeState(data);
}

function tryParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Invalid saved resume", e);
    return structuredClone(sampleData);
  }
}

function normalizeState(data) {
  const cloned = structuredClone(data);
  cloned.experience = cloned.experience || [];
  cloned.education = cloned.education || [];
  cloned.skills = cloned.skills || [];
  cloned.summary = cloned.summary || "";
  if (!cloned.sections || !Array.isArray(cloned.sections)) {
    cloned.sections = defaultSections();
  }

  const existing = new Set(cloned.sections.map((s) => s.id));
  defaultSections().forEach((section) => {
    if (![...existing].includes(section.id)) {
      cloned.sections.push(section);
    }
  });

  cloned.sections = cloned.sections.map((section) => {
    const uniqueId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const safe = {
      id: section.id || `${section.type || "custom"}-${uniqueId}`,
      type: section.type || "custom",
      title: section.title || formatTitle(section.type),
      items: section.items || [],
    };

    if (safe.type === "custom" && !safe.items.length) {
      safe.items = [createCustomItem()];
    }
    return safe;
  });

  return cloned;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatTitle(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function createCustomSection() {
  return {
    id: `custom-${Date.now()}`,
    type: "custom",
    title: "New Section",
    items: [createCustomItem()],
  };
}

function createCustomItem() {
  return { title: "New item", subtitle: "", details: ["Detail or impact statement"] };
}

function renderExperienceForms() {
  const container = document.getElementById("experienceList");
  container.innerHTML = "";
  state.experience.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="small-inputs">
        <label>Company<input data-idx="${idx}" data-key="company" value="${item.company}" /></label>
        <label>Role<input data-idx="${idx}" data-key="role" value="${item.role}" /></label>
        <label>Start<input data-idx="${idx}" data-key="start" value="${item.start}" /></label>
        <label>End<input data-idx="${idx}" data-key="end" value="${item.end}" /></label>
      </div>
      <label>Highlights<textarea data-idx="${idx}" data-key="highlights" rows="3" placeholder="One bullet per line">${item.highlights.join(
        "\n"
      )}</textarea></label>
      <div class="actions-row">
        <button class="ghost" data-remove="experience" data-idx="${idx}">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderEducationForms() {
  const container = document.getElementById("educationList");
  container.innerHTML = "";
  state.education.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="small-inputs">
        <label>School<input data-idx="${idx}" data-key="school" value="${item.school}" /></label>
        <label>Degree<input data-idx="${idx}" data-key="degree" value="${item.degree}" /></label>
        <label>Year<input data-idx="${idx}" data-key="year" value="${item.year}" /></label>
      </div>
      <label>Details<textarea data-idx="${idx}" data-key="extras" rows="2" placeholder="Awards, focus area, GPA">${
        item.extras || ""
      }</textarea></label>
      <div class="actions-row">
        <button class="ghost" data-remove="education" data-idx="${idx}">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCustomSectionForms() {
  const container = document.getElementById("customSections");
  container.innerHTML = "";
  state.sections
    .filter((section) => section.type === "custom")
    .forEach((section) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.sectionId = section.id;
      card.innerHTML = `
        <div class="section-heading">
          <label class="grow">Section title<input class="custom-section-title" data-section="${section.id}" value="${
        section.title
      }" /></label>
          <button class="ghost" data-remove-section="${section.id}">Remove section</button>
        </div>
        <div class="custom-items" data-items="${section.id}"></div>
        <div class="actions-row">
          <button class="ghost" data-add-item="${section.id}">+ Add item</button>
        </div>
      `;

      const itemsContainer = card.querySelector(".custom-items");
      section.items.forEach((item, idx) => {
        const itemCard = document.createElement("div");
        itemCard.className = "custom-item";
        itemCard.innerHTML = `
          <label>Title<input data-section="${section.id}" data-idx="${idx}" data-field="title" value="${item.title}" /></label>
          <label>Subtitle / dates<input data-section="${section.id}" data-idx="${idx}" data-field="subtitle" value="${
          item.subtitle
        }" /></label>
          <label>Details<textarea rows="2" data-section="${section.id}" data-idx="${idx}" data-field="details" placeholder="One bullet per line">${
          item.details.join("\n")
        }</textarea></label>
          <div class="actions-row">
            <button class="ghost" data-remove-item="${section.id}" data-idx="${idx}">Remove item</button>
          </div>
        `;
        itemsContainer.appendChild(itemCard);
      });

      container.appendChild(card);
    });
}

function renderSectionOrder() {
  const container = document.getElementById("sectionOrder");
  container.innerHTML = "";
  state.sections.forEach((section) => {
    const row = document.createElement("div");
    row.className = "section-row";
    row.draggable = true;
    row.dataset.id = section.id;
    row.innerHTML = `
      <span class="drag-handle" aria-hidden="true">⋮⋮</span>
      <input class="section-name" data-section-title="${section.id}" value="${section.title}" />
      <span class="pill">${formatTitle(section.type)}</span>
      ${section.type === "custom" ? `<button class="ghost" data-remove-section="${section.id}">Remove</button>` : ""}
    `;
    container.appendChild(row);
  });
}

function renderPreview() {
  document.getElementById("previewName").textContent = state.name;
  document.getElementById("previewHeadline").textContent = state.headline;
  document.getElementById("previewEmail").textContent = state.email;
  document.getElementById("previewPhone").textContent = state.phone;
  document.getElementById("previewLocation").textContent = state.location;
  document.getElementById("previewWebsite").textContent = state.website;

  const container = document.getElementById("previewSections");
  container.innerHTML = "";

  state.sections.forEach((section) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "resume-section";
    const titleRow = document.createElement("div");
    titleRow.className = "section-title";
    titleRow.innerHTML = `<span>${section.title}</span>${
      section.type === "experience" ? `<span class="count">${state.experience.length} roles</span>` : ""
    }`;
    sectionEl.appendChild(titleRow);

    if (section.type === "summary") {
      const p = document.createElement("p");
      p.id = "previewSummary";
      p.className = "centered";
      p.textContent = state.summary;
      sectionEl.appendChild(p);
    } else if (section.type === "experience") {
      const expContainer = document.createElement("div");
      expContainer.className = "experience";
      state.experience.forEach((item) => {
        const el = document.createElement("div");
        el.className = "experience-item";
        el.innerHTML = `
          <div class="experience-header">
            <div class="experience-title">${item.company}</div>
            <div class="experience-meta">${item.start} – ${item.end}</div>
          </div>
          <p class="muted">${item.role}</p>
          ${item.highlights?.length ? `<ul class="list">${item.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>` : ""}
        `;
        expContainer.appendChild(el);
      });
      sectionEl.appendChild(expContainer);
    } else if (section.type === "education") {
      const eduContainer = document.createElement("div");
      eduContainer.className = "experience";
      state.education.forEach((item) => {
        const el = document.createElement("div");
        el.className = "experience-item";
        el.innerHTML = `
          <div class="experience-header">
            <div class="experience-title">${item.school}</div>
            <div class="experience-meta">${item.year}</div>
          </div>
          <p class="muted">${item.degree}${item.extras ? ` • ${item.extras}` : ""}</p>
        `;
        eduContainer.appendChild(el);
      });
      sectionEl.appendChild(eduContainer);
    } else if (section.type === "skills") {
      const skills = document.createElement("div");
      skills.className = "skill-line";
      state.skills.forEach((skill, idx) => {
        const span = document.createElement("span");
        span.textContent = skill;
        skills.appendChild(span);
        if (idx < state.skills.length - 1) {
          const separator = document.createElement("span");
          separator.className = "muted";
          separator.textContent = " • ";
          skills.appendChild(separator);
        }
      });
      sectionEl.appendChild(skills);
    } else if (section.type === "custom") {
      const list = document.createElement("div");
      list.className = "experience";
      section.items.forEach((item) => {
        const el = document.createElement("div");
        el.className = "experience-item";
        el.innerHTML = `
          <div class="experience-header">
            <div class="experience-title">${item.title}</div>
            <div class="experience-meta">${item.subtitle}</div>
          </div>
          ${item.details?.length ? `<ul class="list">${item.details.map((d) => `<li>${d}</li>`).join("")}</ul>` : ""}
        `;
        list.appendChild(el);
      });
      sectionEl.appendChild(list);
    }

    container.appendChild(sectionEl);
  });
}

function wirePersonalInputs() {
  const map = [
    ["nameInput", "name"],
    ["headlineInput", "headline"],
    ["emailInput", "email"],
    ["phoneInput", "phone"],
    ["locationInput", "location"],
    ["websiteInput", "website"],
    ["summaryInput", "summary"],
  ];

  map.forEach(([id, key]) => {
    const input = document.getElementById(id);
    input.value = state[key] || "";
    input.addEventListener("input", (e) => {
      state[key] = e.target.value;
      saveData();
      renderPreview();
    });
  });

  const skillsInput = document.getElementById("skillsInput");
  skillsInput.value = state.skills.join(", ");
  skillsInput.addEventListener("input", (e) => {
    state.skills = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    saveData();
    renderPreview();
  });
}

function wireExperienceHandlers() {
  const expList = document.getElementById("experienceList");
  expList.addEventListener("input", (e) => {
    const target = e.target;
    const idx = Number(target.dataset.idx);
    const key = target.dataset.key;
    if (key === "highlights") {
      state.experience[idx][key] = target.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    } else {
      state.experience[idx][key] = target.value;
    }
    saveData();
    renderPreview();
  });

  expList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove='experience']");
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    state.experience.splice(idx, 1);
    saveData();
    renderExperienceForms();
    renderPreview();
  });

  document.getElementById("addExperienceBtn").addEventListener("click", () => {
    state.experience.push({
      company: "New company",
      role: "Role",
      start: "Year",
      end: "Present",
      highlights: ["Describe your impact"],
    });
    saveData();
    renderExperienceForms();
    renderPreview();
  });
}

function wireEducationHandlers() {
  const eduList = document.getElementById("educationList");
  eduList.addEventListener("input", (e) => {
    const target = e.target;
    const idx = Number(target.dataset.idx);
    const key = target.dataset.key;
    state.education[idx][key] = target.value;
    saveData();
    renderPreview();
  });

  eduList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove='education']");
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    state.education.splice(idx, 1);
    saveData();
    renderEducationForms();
    renderPreview();
  });

  document.getElementById("addEducationBtn").addEventListener("click", () => {
    state.education.push({
      school: "New school",
      degree: "Degree",
      year: new Date().getFullYear().toString(),
      extras: "",
    });
    saveData();
    renderEducationForms();
    renderPreview();
  });
}

function wireCustomSectionHandlers() {
  const container = document.getElementById("customSections");

  container.addEventListener("input", (e) => {
    const sectionId = e.target.dataset.section;
    const idx = Number(e.target.dataset.idx);
    const field = e.target.dataset.field;
    const section = state.sections.find((s) => s.id === sectionId);
    if (!section) return;

    if (e.target.classList.contains("custom-section-title")) {
      section.title = e.target.value;
      syncSectionTitles(sectionId, e.target.value);
      saveData();
      renderSectionOrder();
      renderPreview();
      return;
    }

    if (field) {
      if (field === "details") {
        section.items[idx].details = e.target.value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      } else {
        section.items[idx][field] = e.target.value;
      }
      saveData();
      renderPreview();
    }
  });

  container.addEventListener("click", (e) => {
    const addBtn = e.target.closest("button[data-add-item]");
    if (addBtn) {
      const sectionId = addBtn.dataset.addItem;
      const section = state.sections.find((s) => s.id === sectionId);
      if (!section) return;
      section.items.push(createCustomItem());
      saveData();
      renderCustomSectionForms();
      renderPreview();
      return;
    }

    const removeItemBtn = e.target.closest("button[data-remove-item]");
    if (removeItemBtn) {
      const sectionId = removeItemBtn.dataset.removeItem;
      const idx = Number(removeItemBtn.dataset.idx);
      const section = state.sections.find((s) => s.id === sectionId);
      if (!section) return;
      section.items.splice(idx, 1);
      if (!section.items.length) {
        section.items.push(createCustomItem());
      }
      saveData();
      renderCustomSectionForms();
      renderPreview();
      return;
    }

    const removeSectionBtn = e.target.closest("button[data-remove-section]");
    if (removeSectionBtn) {
      const sectionId = removeSectionBtn.dataset.removeSection;
      state.sections = state.sections.filter((s) => s.id !== sectionId);
      saveData();
      renderSectionOrder();
      renderCustomSectionForms();
      renderPreview();
    }
  });
}

function wireSectionOrdering() {
  const container = document.getElementById("sectionOrder");
  let draggingId = null;

  container.addEventListener("dragstart", (e) => {
    const row = e.target.closest(".section-row");
    if (!row) return;
    draggingId = row.dataset.id;
    e.dataTransfer.effectAllowed = "move";
    row.classList.add("dragging");
  });

  container.addEventListener("dragend", () => {
    const row = container.querySelector(".dragging");
    if (row) row.classList.remove("dragging");
    draggingId = null;
    syncOrderFromDom();
  });

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const row = e.target.closest(".section-row");
    if (!row || row.dataset.id === draggingId) return;
    const draggingEl = container.querySelector(`.section-row[data-id='${draggingId}']`);
    const rect = row.getBoundingClientRect();
    const shouldPlaceAfter = e.clientY > rect.top + rect.height / 2;
    container.insertBefore(draggingEl, shouldPlaceAfter ? row.nextSibling : row);
  });

  container.addEventListener("input", (e) => {
    const target = e.target;
    if (!target.dataset.sectionTitle) return;
    const section = state.sections.find((s) => s.id === target.dataset.sectionTitle);
    if (!section) return;
    section.title = target.value;
    saveData();
    renderCustomSectionForms();
    renderPreview();
  });

  container.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("button[data-remove-section]");
    if (!removeBtn) return;
    const sectionId = removeBtn.dataset.removeSection;
    state.sections = state.sections.filter((s) => s.id !== sectionId);
    saveData();
    renderSectionOrder();
    renderCustomSectionForms();
    renderPreview();
  });
}

function syncOrderFromDom() {
  const container = document.getElementById("sectionOrder");
  const orderedIds = Array.from(container.querySelectorAll(".section-row")).map((row) => row.dataset.id);
  state.sections.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
  saveData();
  renderPreview();
}

function syncSectionTitles(sectionId, value) {
  const row = document.querySelector(`[data-section-title='${sectionId}']`);
  if (row) {
    row.value = value;
  }
}

function wireAddCustomSection() {
  document.getElementById("addCustomSectionBtn").addEventListener("click", () => {
    state.sections.push(createCustomSection());
    saveData();
    renderSectionOrder();
    renderCustomSectionForms();
    renderPreview();
  });
}

function wireThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
  toggle.checked = savedTheme === "dark";
  toggle.addEventListener("change", () => {
    applyTheme(toggle.checked ? "dark" : "light");
  });
}

function applyTheme(mode) {
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem(THEME_KEY, mode);
}

function wireDownload() {
  document.getElementById("downloadBtn").addEventListener("click", () => {
    window.print();
  });
}

function wireReset() {
  document.getElementById("resetBtn").addEventListener("click", () => {
    Object.assign(state, structuredClone(sampleData));
    saveData();
    boot();
  });
}

function boot() {
  renderExperienceForms();
  renderEducationForms();
  renderCustomSectionForms();
  renderSectionOrder();
  renderPreview();
  wirePersonalInputs();
  wireExperienceHandlers();
  wireEducationHandlers();
  wireCustomSectionHandlers();
  wireSectionOrdering();
  wireAddCustomSection();
  wireThemeToggle();
  wireDownload();
  wireReset();
}

boot();
