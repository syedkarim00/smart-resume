const STORAGE_KEY = "smart-resume-data";

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
};

const state = loadData();

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Invalid saved resume", e);
    }
  }
  return structuredClone(sampleData);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

function renderPreview() {
  document.getElementById("previewName").textContent = state.name;
  document.getElementById("previewHeadline").textContent = state.headline;
  document.getElementById("previewEmail").textContent = state.email;
  document.getElementById("previewPhone").textContent = state.phone;
  document.getElementById("previewLocation").textContent = state.location;
  document.getElementById("previewWebsite").textContent = state.website;
  document.getElementById("previewSummary").textContent = state.summary;

  const expContainer = document.getElementById("previewExperience");
  expContainer.innerHTML = "";
  state.experience.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";
    el.innerHTML = `
      <h3>${item.role} @ ${item.company}</h3>
      <div class="meta">
        <span class="badge">${item.start} – ${item.end}</span>
      </div>
      <ul class="list">
        ${item.highlights.map((h) => `<li>${h}</li>`).join("")}
      </ul>
    `;
    expContainer.appendChild(el);
  });
  document.getElementById("previewExperienceCount").textContent = `${state.experience.length} ${
    state.experience.length === 1 ? "role" : "roles"
  }`;

  const eduContainer = document.getElementById("previewEducation");
  eduContainer.innerHTML = "";
  state.education.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";
    el.innerHTML = `
      <h3>${item.school}</h3>
      <div class="meta">${item.degree} • ${item.year}</div>
      <p class="muted">${item.extras || ""}</p>
    `;
    eduContainer.appendChild(el);
  });

  const skills = document.getElementById("previewSkills");
  skills.innerHTML = "";
  state.skills.forEach((skill) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = skill;
    skills.appendChild(pill);
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

function wireThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  toggle.checked = document.documentElement.classList.contains("dark");
  toggle.addEventListener("change", () => {
    document.documentElement.classList.toggle("dark");
    document.getElementById("resumePreview").querySelector(".resume").classList.toggle("dark");
  });
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
  renderPreview();
  wirePersonalInputs();
  wireExperienceHandlers();
  wireEducationHandlers();
  wireThemeToggle();
  wireDownload();
  wireReset();
}

boot();
