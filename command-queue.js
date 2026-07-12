(function () {
  "use strict";

  const STORE_KEY = "niftytools:command-queue:v1";
  const LANES = [
    { id: "monitor", name: "Monitor" },
    { id: "prep", name: "Prep" },
    { id: "investigate", name: "Investigate" },
    { id: "resolved", name: "Resolved" }
  ];

  const TEMPLATES = {
    outage: {
      title: "Check local outage",
      lane: "investigate",
      priority: "high",
      source: "Outage Radar",
      sourceType: "context",
      confidence: "medium",
      location: "Local area",
      checklist: ["Check own connection", "Check provider status", "Check alternate network", "Log affected services"],
      notes: "Confirm whether this is a platform issue, carrier issue, or local connection issue.",
      evidence: ""
    },
    water: {
      title: "Prep water and power",
      lane: "prep",
      priority: "medium",
      source: "Prepper Command",
      sourceType: "local",
      confidence: "high",
      location: "Home",
      checklist: ["Top up drinking water", "Charge battery packs", "Check flashlight batteries", "Review freezer plan"],
      notes: "Practical readiness step for the next 24 hours.",
      evidence: ""
    },
    air: {
      title: "Monitor weather and air",
      lane: "monitor",
      priority: "medium",
      source: "Personal Risk Briefing",
      sourceType: "live",
      confidence: "medium",
      location: "Selected place",
      checklist: ["Check AQI", "Check wind direction", "Set HVAC or purifier plan", "Avoid unnecessary outdoor exposure"],
      notes: "Track smoke, air quality, storm risk, and local conditions.",
      evidence: ""
    },
    cyber: {
      title: "Investigate cyber signal",
      lane: "investigate",
      priority: "medium",
      source: "Cyber Threat Radar",
      sourceType: "context",
      confidence: "low",
      location: "Public internet",
      checklist: ["Review affected services", "Check official status pages", "Avoid unsupported attribution", "Document source quality"],
      notes: "Treat public cyber signals as awareness context unless official sources confirm impact.",
      evidence: ""
    },
    food: {
      title: "Review food recall",
      lane: "prep",
      priority: "medium",
      source: "Food Watch",
      sourceType: "delayed",
      confidence: "medium",
      location: "Pantry",
      checklist: ["Check recall item", "Compare lot/date codes", "Remove suspect item", "Record replacement need"],
      notes: "Use official recall details before discarding or sharing conclusions.",
      evidence: ""
    },
    market: {
      title: "Market stress watch",
      lane: "monitor",
      priority: "low",
      source: "Market Tools",
      sourceType: "delayed",
      confidence: "medium",
      location: "Watchlist",
      checklist: ["Check volume leaders", "Check positioning crowding", "Check crypto network pulse", "Write neutral summary"],
      notes: "Context only. This is not financial advice.",
      evidence: ""
    }
  };

  const DEFAULT_TASKS = [
    taskFromTemplate("outage", {
      title: "Starter: check outage triage",
      priority: "medium",
      sourceType: "context",
      notes: "Starter action. Replace this with a real signal when needed."
    }),
    taskFromTemplate("water", {
      title: "Starter: 24-hour readiness sweep",
      sourceType: "local",
      notes: "Starter action. Use this to test the workflow and then edit or delete it."
    }),
    taskFromTemplate("air", {
      title: "Starter: local weather/air watch",
      priority: "low",
      sourceType: "context",
      notes: "Starter action. Add your selected place when a local signal matters."
    })
  ];

  let state = loadState();
  let selectedId = state.selectedId || (state.tasks[0] && state.tasks[0].id) || "";

  const el = {
    board: byId("board"),
    openCount: byId("openCount"),
    highestPriority: byId("highestPriority"),
    sourceCount: byId("sourceCount"),
    updatedAt: byId("updatedAt"),
    auditLog: byId("auditLog"),
    reportText: byId("reportText"),
    form: byId("actionForm"),
    taskId: byId("taskId"),
    title: byId("title"),
    lane: byId("lane"),
    priority: byId("priority"),
    source: byId("source"),
    sourceType: byId("sourceType"),
    location: byId("location"),
    confidence: byId("confidence"),
    checklist: byId("checklist"),
    notes: byId("notes"),
    evidence: byId("evidence"),
    createActionBtn: byId("createActionBtn"),
    copyReportBtn: byId("copyReportBtn"),
    exportJsonBtn: byId("exportJsonBtn"),
    resetDemoBtn: byId("resetDemoBtn"),
    newBlankBtn: byId("newBlankBtn"),
    deleteBtn: byId("deleteBtn"),
    toast: byId("toast")
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "cq-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function fmtDate(value) {
    if (!value) return "--";
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch];
    });
  }

  function toLines(value) {
    return String(value || "").split("\n").map(function (line) {
      return line.trim();
    }).filter(Boolean);
  }

  function checklistFromLines(lines) {
    const list = Array.isArray(lines) ? lines : toLines(lines);
    return list.map(function (line) {
      return typeof line === "string" ? { text: line, done: false } : line;
    }).filter(function (item) {
      return item && item.text;
    });
  }

  function taskFromTemplate(templateId, overrides) {
    const base = TEMPLATES[templateId] || {};
    const createdAt = nowIso();
    return Object.assign({
      id: uid(),
      title: "New action",
      lane: "monitor",
      priority: "medium",
      source: "Manual",
      sourceType: "context",
      location: "Local",
      confidence: "medium",
      checklist: [],
      notes: "",
      evidence: "",
      createdAt,
      updatedAt: createdAt
    }, base, overrides || {}, {
      id: (overrides && overrides.id) || uid(),
      checklist: checklistFromLines((overrides && overrides.checklist) || base.checklist || [])
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tasks)) {
          return {
            tasks: parsed.tasks,
            audit: Array.isArray(parsed.audit) ? parsed.audit : [],
            selectedId: parsed.selectedId || ""
          };
        }
      }
    } catch (error) {
      console.warn("Command Queue storage read failed", error);
    }
    const starter = DEFAULT_TASKS.map(function (task) {
      return Object.assign({}, task, { id: uid() });
    });
    return {
      tasks: starter,
      selectedId: starter[0] ? starter[0].id : "",
      audit: [{
        id: uid(),
        at: nowIso(),
        action: "Demo loaded",
        detail: "Starter actions created locally. Edit or delete them."
      }]
    };
  }

  function saveState() {
    state.selectedId = selectedId;
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function track(name, props) {
    if (window.ntTrack) {
      window.ntTrack(name, Object.assign({ tool: "Command Queue" }, props || {}));
    }
  }

  function toast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      el.toast.classList.remove("show");
    }, 2200);
  }

  function addAudit(action, detail) {
    state.audit.unshift({
      id: uid(),
      at: nowIso(),
      action,
      detail
    });
    state.audit = state.audit.slice(0, 60);
  }

  function selectedTask() {
    return state.tasks.find(function (task) {
      return task.id === selectedId;
    }) || state.tasks[0] || null;
  }

  function priorityRank(priority) {
    return { high: 3, medium: 2, low: 1 }[priority] || 0;
  }

  function render() {
    renderBoard();
    renderSummary();
    renderEditor();
    renderAudit();
    renderReport();
    saveState();
  }

  function renderBoard() {
    if (!el.board) return;
    el.board.innerHTML = LANES.map(function (lane) {
      const tasks = state.tasks.filter(function (task) {
        return task.lane === lane.id;
      });
      return `
        <section class="lane" aria-labelledby="lane-${esc(lane.id)}">
          <div class="lane-head"><h2 id="lane-${esc(lane.id)}">${esc(lane.name)}</h2><span>${tasks.length}</span></div>
          <div class="lane-body">
            ${tasks.length ? tasks.map(renderCard).join("") : '<div class="empty">No actions here. Use a template or create a manual action.</div>'}
          </div>
        </section>
      `;
    }).join("");
  }

  function renderCard(task) {
    const done = task.checklist.filter(function (item) { return item.done; }).length;
    const total = task.checklist.length;
    const active = task.id === selectedId ? " active" : "";
    const prioClass = task.priority === "high" ? " high" : task.priority === "low" ? " low" : "";
    return `
      <button class="card${active}" type="button" data-card="${esc(task.id)}">
        <div class="card-top">
          <div class="card-title">${esc(task.title)}</div>
          <span class="prio${prioClass}">${esc(task.priority)}</span>
        </div>
        <div class="meta">
          <div><strong>${esc(task.source || "Manual")}</strong> / ${esc(task.location || "Local")}</div>
          <div>${esc(task.confidence || "medium")} confidence / updated ${esc(fmtDate(task.updatedAt))}</div>
          <div>${done}/${total || 0} checklist items done</div>
        </div>
        <div class="source-row">
          <span class="source-chip ${esc(task.sourceType || "context")}">${esc(sourceLabel(task.sourceType))}</span>
          <span class="source-chip ${task.lane === "resolved" ? "local" : ""}">${esc(laneName(task.lane))}</span>
        </div>
        <div class="card-actions" aria-hidden="true">
          <span class="mini-btn">Open</span>
          <span class="mini-btn">Move</span>
        </div>
      </button>
    `;
  }

  function renderSummary() {
    const open = state.tasks.filter(function (task) { return task.lane !== "resolved"; });
    const highest = open.reduce(function (best, task) {
      return priorityRank(task.priority) > priorityRank(best) ? task.priority : best;
    }, "");
    const sources = new Set(state.tasks.map(function (task) { return task.source; }).filter(Boolean));
    const updated = state.tasks.reduce(function (best, task) {
      return !best || task.updatedAt > best ? task.updatedAt : best;
    }, "");
    el.openCount.textContent = String(open.length);
    el.highestPriority.textContent = highest ? highest.toUpperCase() : "--";
    el.sourceCount.textContent = String(sources.size);
    el.updatedAt.textContent = updated ? fmtDate(updated) : "--";
  }

  function renderEditor() {
    const task = selectedTask();
    if (!task) {
      clearForm();
      return;
    }
    el.taskId.value = task.id;
    el.title.value = task.title || "";
    el.lane.value = task.lane || "monitor";
    el.priority.value = task.priority || "medium";
    el.source.value = task.source || "";
    el.sourceType.value = task.sourceType || "context";
    el.location.value = task.location || "";
    el.confidence.value = task.confidence || "medium";
    el.checklist.value = task.checklist.map(function (item) { return item.text; }).join("\n");
    el.notes.value = task.notes || "";
    el.evidence.value = task.evidence || "";
  }

  function renderAudit() {
    if (!el.auditLog) return;
    el.auditLog.innerHTML = state.audit.length ? state.audit.map(function (item) {
      return `<div class="log-item"><b>${esc(item.action)}</b><br>${esc(item.detail || "")}<br>${esc(fmtDate(item.at))}</div>`;
    }).join("") : '<div class="empty">No timeline events yet.</div>';
  }

  function renderReport() {
    if (!el.reportText) return;
    el.reportText.textContent = buildReport();
  }

  function clearForm() {
    el.taskId.value = "";
    el.title.value = "";
    el.lane.value = "monitor";
    el.priority.value = "medium";
    el.source.value = "Manual";
    el.sourceType.value = "context";
    el.location.value = "Local";
    el.confidence.value = "medium";
    el.checklist.value = "";
    el.notes.value = "";
    el.evidence.value = "";
  }

  function sourceLabel(value) {
    return {
      live: "Live",
      mixed: "Mixed",
      delayed: "Delayed",
      backup: "Backup",
      context: "Context",
      local: "Local"
    }[value] || "Context";
  }

  function laneName(value) {
    const lane = LANES.find(function (item) { return item.id === value; });
    return lane ? lane.name : "Monitor";
  }

  function formTask() {
    const existing = state.tasks.find(function (task) {
      return task.id === el.taskId.value;
    });
    const at = nowIso();
    return Object.assign({}, existing || {}, {
      id: el.taskId.value || uid(),
      title: el.title.value.trim() || "Untitled action",
      lane: el.lane.value,
      priority: el.priority.value,
      source: el.source.value.trim() || "Manual",
      sourceType: el.sourceType.value,
      location: el.location.value.trim() || "Local",
      confidence: el.confidence.value,
      checklist: checklistFromLines(toLines(el.checklist.value)).map(function (item, index) {
        const old = existing && existing.checklist[index];
        return { text: item.text, done: old && old.text === item.text ? !!old.done : false };
      }),
      notes: el.notes.value.trim(),
      evidence: el.evidence.value.trim(),
      createdAt: existing && existing.createdAt ? existing.createdAt : at,
      updatedAt: at
    });
  }

  function saveFromForm(event) {
    event.preventDefault();
    const task = formTask();
    const index = state.tasks.findIndex(function (item) { return item.id === task.id; });
    if (index >= 0) {
      const previousLane = state.tasks[index].lane;
      state.tasks[index] = task;
      addAudit("Action updated", task.title + (previousLane !== task.lane ? " moved to " + laneName(task.lane) : ""));
      track("command_queue_move", { status: task.lane, title: task.title });
    } else {
      state.tasks.unshift(task);
      addAudit("Action created", task.title);
      track("command_queue_create", { source: task.source, status: task.lane });
    }
    selectedId = task.id;
    toast("Action saved");
    render();
  }

  function createFromTemplate(templateId, overrides) {
    const task = taskFromTemplate(templateId, overrides);
    task.updatedAt = nowIso();
    state.tasks.unshift(task);
    selectedId = task.id;
    addAudit("Action created", task.title + " from " + (templateId || "manual") + " template");
    track("command_queue_create", { template: templateId || "manual", source: task.source });
    toast("Action created");
    render();
    return task;
  }

  function createBlank() {
    const task = taskFromTemplate("market", {
      title: "Manual action",
      lane: "monitor",
      priority: "medium",
      source: "Manual",
      sourceType: "context",
      location: "Local",
      checklist: ["Define next step", "Record source", "Set status"],
      notes: "",
      evidence: ""
    });
    state.tasks.unshift(task);
    selectedId = task.id;
    addAudit("Action created", "Manual action");
    track("command_queue_create", { template: "manual" });
    render();
    toast("Blank action created");
  }

  function deleteSelected() {
    const task = selectedTask();
    if (!task) return;
    state.tasks = state.tasks.filter(function (item) {
      return item.id !== task.id;
    });
    addAudit("Action deleted", task.title);
    selectedId = state.tasks[0] ? state.tasks[0].id : "";
    track("tool_action", { action: "delete", target: task.title });
    render();
    toast("Action deleted");
  }

  function moveTask(id, direction) {
    const task = state.tasks.find(function (item) { return item.id === id; });
    if (!task) return;
    const index = LANES.findIndex(function (lane) { return lane.id === task.lane; });
    const nextIndex = Math.max(0, Math.min(LANES.length - 1, index + direction));
    const nextLane = LANES[nextIndex].id;
    if (task.lane === nextLane) return;
    task.lane = nextLane;
    task.updatedAt = nowIso();
    selectedId = task.id;
    addAudit("Action moved", task.title + " to " + laneName(nextLane));
    track("command_queue_move", { status: nextLane, title: task.title });
    render();
  }

  function buildReport() {
    const open = state.tasks.filter(function (task) { return task.lane !== "resolved"; });
    const lines = [
      "Command Queue report",
      "Updated: " + new Date().toLocaleString(),
      "Open actions: " + open.length,
      ""
    ];
    LANES.forEach(function (lane) {
      const tasks = state.tasks.filter(function (task) { return task.lane === lane.id; });
      lines.push(lane.name.toUpperCase() + " (" + tasks.length + ")");
      if (!tasks.length) lines.push("- none");
      tasks.forEach(function (task) {
        const done = task.checklist.filter(function (item) { return item.done; }).length;
        lines.push("- [" + task.priority.toUpperCase() + "] " + task.title + " / " + task.source + " / " + sourceLabel(task.sourceType) + " / " + task.location + " / " + done + "/" + task.checklist.length + " done");
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  function copyReport() {
    const text = buildReport();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        toast("Report copied");
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
    track("command_queue_export", { format: "text" });
  }

  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast("Report copied");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nifty-command-queue.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addAudit("Report exported", "JSON export downloaded");
    track("command_queue_export", { format: "json" });
    render();
    toast("JSON exported");
  }

  function resetDemo() {
    const starter = DEFAULT_TASKS.map(function (task) {
      return Object.assign({}, task, { id: uid(), createdAt: nowIso(), updatedAt: nowIso() });
    });
    state = {
      tasks: starter,
      selectedId: starter[0] ? starter[0].id : "",
      audit: [{ id: uid(), at: nowIso(), action: "Demo reset", detail: "Starter actions restored locally." }]
    };
    selectedId = state.selectedId;
    track("tool_action", { action: "reset_demo" });
    render();
    toast("Demo reset");
  }

  function hydrateFromUrl() {
    const params = new URLSearchParams(location.search);
    if (![...params.keys()].length) return;
    const key = "nifty-command-queue:url:" + location.search;
    if (sessionStorage.getItem(key)) return;
    const templateId = params.get("template") || "outage";
    const overrides = {};
    ["title", "source", "sourceType", "location", "confidence", "priority", "lane", "notes", "evidence"].forEach(function (field) {
      if (params.get(field)) overrides[field] = params.get(field);
    });
    createFromTemplate(templateId, overrides);
    sessionStorage.setItem(key, "1");
  }

  function bindEvents() {
    el.form.addEventListener("submit", saveFromForm);
    el.createActionBtn.addEventListener("click", function () {
      createBlank();
      el.title.focus();
    });
    el.newBlankBtn.addEventListener("click", createBlank);
    el.deleteBtn.addEventListener("click", deleteSelected);
    el.copyReportBtn.addEventListener("click", copyReport);
    el.exportJsonBtn.addEventListener("click", exportJson);
    el.resetDemoBtn.addEventListener("click", resetDemo);

    document.querySelectorAll("[data-template]").forEach(function (button) {
      button.addEventListener("click", function () {
        createFromTemplate(button.dataset.template);
      });
    });

    el.board.addEventListener("click", function (event) {
      const card = event.target.closest("[data-card]");
      if (!card) return;
      selectedId = card.dataset.card;
      render();
      track("tool_action", { action: "select", target: selectedId });
    });

    el.board.addEventListener("keydown", function (event) {
      const card = event.target.closest("[data-card]");
      if (!card) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTask(card.dataset.card, 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTask(card.dataset.card, -1);
      }
    });
  }

  window.NiftyCommandQueue = {
    addAction: function (payload) {
      return createFromTemplate(payload && payload.template || "outage", payload || {});
    },
    buildUrl: function (payload) {
      const params = new URLSearchParams(payload || {});
      return "/command-queue.html?" + params.toString();
    }
  };

  bindEvents();
  hydrateFromUrl();
  render();
  track("tool_open", { tool: "Command Queue" });
})();
