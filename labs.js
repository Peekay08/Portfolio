/* ==========================================================================
   PROMISE KOLADE — FRONTEND ENGINEERING LAB — INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. GLOBAL STATE & THEME SWITCHER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  
  // Theme initialization
  let savedTheme = localStorage.getItem("lab_theme") || "cyberpunk";
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      let currentTheme = body.classList.contains("theme-light") ? "cyberpunk" : "light";
      setTheme(currentTheme);
    });
  }

  function setTheme(theme) {
    if (theme === "light") {
      body.classList.remove("theme-cyberpunk");
      body.classList.add("theme-light");
      if (themeToggle) {
        themeToggle.querySelector(".control-text").textContent = "THEME: LIGHT";
      }
      localStorage.setItem("lab_theme", "light");
    } else {
      body.classList.remove("theme-light");
      body.classList.add("theme-cyberpunk");
      if (themeToggle) {
        themeToggle.querySelector(".control-text").textContent = "THEME: DARK";
      }
      localStorage.setItem("lab_theme", "cyberpunk");
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. VIEW SWITCHING (TAB STATE MANAGER)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const navBtns = document.querySelectorAll(".nav-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const currentCrumb = document.getElementById("current-crumb");
  const workspace = document.getElementById("lab-workspace");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchView(tabId);
    });
  });

  function switchView(tabId) {
    // Deactivate current active nav button and panel
    navBtns.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
        if (currentCrumb) {
          currentCrumb.textContent = btn.querySelector(".nav-btn-label").textContent.toUpperCase();
        }
      } else {
        btn.classList.remove("active");
      }
    });

    tabPanels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    // Reset workspace focus and scroll to top
    if (workspace) {
      workspace.scrollTop = 0;
      workspace.focus();
    }
    
    // Auto-trigger counters if shifting to Animations tab
    if (tabId === "animations") {
      triggerCounterSimulation();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. DATA TABLE BENCHMARKS (SORTING, FILTERING, PAGINATION)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rawTasks = [
    { id: "SYS-001", name: "Unicode Lexer Parser", category: "Systems", performance: "98.7", status: "complete" },
    { id: "SYS-002", name: "Register Allocation Pass", category: "Systems", performance: "92.4", status: "in-progress" },
    { id: "FE-101",  name: "Procedural Audio Nodes", category: "Frontend", performance: "99.2", status: "complete" },
    { id: "FE-102",  name: "Spotlight Mask Interpolator", category: "Frontend", performance: "95.6", status: "complete" },
    { id: "SYS-003", name: "Arena Allocation Memory", category: "Systems", performance: "99.8", status: "complete" },
    { id: "SYS-004", name: "Panic Error Recovery", category: "Systems", performance: "87.1", status: "backlog" },
    { id: "FE-103",  name: "Custom Keyboard Focus Ring", category: "Frontend", performance: "99.9", status: "complete" },
    { id: "FE-104",  name: "WASM Stream Compilation", category: "Frontend", performance: "91.3", status: "in-progress" },
    { id: "SYS-005", name: "LLVM Backend Target Logic", category: "Systems", performance: "89.5", status: "in-progress" },
    { id: "SYS-006", name: "Wasm Closure Codegen", category: "Systems", performance: "76.4", status: "backlog" },
    { id: "FE-105",  name: "Split-Pane Resize Divider", category: "Frontend", performance: "99.1", status: "complete" },
    { id: "FE-106",  name: "Drag-Drop List Nodes", category: "Frontend", performance: "96.4", status: "complete" }
  ];

  let tasks = [...rawTasks];
  let currentPage = 1;
  const rowsPerPage = 5;
  let currentSort = { key: "id", direction: "asc" };

  const tableBody = document.getElementById("table-body-tasks");
  const tableSearch = document.getElementById("table-search-input");
  const tableFilter = document.getElementById("table-filter-select");
  const paginationInfo = document.getElementById("pagination-info-text");
  const paginationBtnsContainer = document.querySelector(".pagination-buttons");
  const headers = document.querySelectorAll(".lab-table th.sortable");

  // Init Data Table
  renderTable();

  // Search & Filter Events
  if (tableSearch) tableSearch.addEventListener("input", filterAndRender);
  if (tableFilter) tableFilter.addEventListener("change", filterAndRender);

  // Sorting Events
  headers.forEach(header => {
    header.addEventListener("click", () => {
      const key = header.getAttribute("data-sort");
      const direction = currentSort.key === key && currentSort.direction === "asc" ? "desc" : "asc";
      currentSort = { key, direction };
      
      // Update header indicators
      headers.forEach(h => {
        const icon = h.querySelector(".sort-icon");
        if (h === header) {
          icon.textContent = direction === "asc" ? "▲" : "▼";
        } else {
          icon.textContent = "↕";
        }
      });

      sortTasks();
      renderTable();
    });
  });

  function sortTasks() {
    tasks.sort((a, b) => {
      let valA = a[currentSort.key];
      let valB = b[currentSort.key];

      // Convert score to float for numerical comparison
      if (currentSort.key === "performance") {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (valA < valB) return currentSort.direction === "asc" ? -1 : 1;
      if (valA > valB) return currentSort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  function filterAndRender() {
    const query = tableSearch ? tableSearch.value.trim().toLowerCase() : "";
    const filter = tableFilter ? tableFilter.value : "all";

    tasks = rawTasks.filter(task => {
      const matchesSearch = task.id.toLowerCase().includes(query) || 
                            task.name.toLowerCase().includes(query) ||
                            task.category.toLowerCase().includes(query);
      const matchesFilter = filter === "all" || task.status === filter;
      return matchesSearch && matchesFilter;
    });

    currentPage = 1;
    sortTasks();
    renderTable();
  }

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, tasks.length);
    const paginatedItems = tasks.slice(startIndex, endIndex);

    if (paginatedItems.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--color-text-dim)">// No matching tasks found</td></tr>`;
      if (paginationInfo) paginationInfo.textContent = "Showing 0 of 0 tasks";
      renderPaginationControls(0);
      return;
    }

    paginatedItems.forEach(task => {
      const tr = document.createElement("tr");
      let statusBadge = "";
      if (task.status === "complete") statusBadge = `<span class="badge badge-success">COMPLETE</span>`;
      else if (task.status === "in-progress") statusBadge = `<span class="badge badge-warning">IN PROGRESS</span>`;
      else statusBadge = `<span class="badge badge-info">BACKLOG</span>`;

      tr.innerHTML = `
        <td>${task.id}</td>
        <td><strong>${task.name}</strong></td>
        <td>${task.category}</td>
        <td>${task.performance}%</td>
        <td>${statusBadge}</td>
      `;
      tableBody.appendChild(tr);
    });

    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${tasks.length} tasks`;
    }
    renderPaginationControls(tasks.length);
  }

  function renderPaginationControls(totalItems) {
    if (!paginationBtnsContainer) return;
    paginationBtnsContainer.innerHTML = "";

    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.id = "pagination-prev-btn";
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    paginationBtnsContainer.appendChild(prevBtn);

    // Numbered buttons
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable();
      });
      paginationBtnsContainer.appendChild(btn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.id = "pagination-next-btn";
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
    paginationBtnsContainer.appendChild(nextBtn);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. UI COMPONENTS LOGIC (MODALS, TOASTS, ACCORDION, TABS, DROPDOWN)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Button Loading State Trigger
  const btnLoading = document.getElementById("btn-demo-loading");
  if (btnLoading) {
    btnLoading.addEventListener("click", () => {
      btnLoading.classList.add("disabled");
      btnLoading.disabled = true;
      btnLoading.innerHTML = `<span class="btn-spinner"></span> COMPILING MODULE...`;
      showToast("info", "Compilation thread spawned in background.");
      
      setTimeout(() => {
        btnLoading.classList.remove("disabled");
        btnLoading.disabled = false;
        btnLoading.innerHTML = `<span class="btn-spinner"></span>LOADING STATE`;
        showToast("success", "Module compiled successfully.");
      }, 2500);
    });
  }

  // Modal Dialog Validation (Keyboard focus trap & Esc dismiss)
  const modal = document.getElementById("accessible-modal-demo");
  const modalTrigger = document.getElementById("trigger-modal-demo");
  const modalClose = document.getElementById("modal-close-trigger-btn");
  const modalConfirm = document.getElementById("modal-confirm-action-btn");
  const modalCancel = document.getElementById("modal-cancel-action-btn");
  let previouslyFocusedEl = null;

  if (modalTrigger) modalTrigger.addEventListener("click", openModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modalConfirm) {
    modalConfirm.addEventListener("click", () => {
      showToast("success", "Bootscreen directive authorized.");
      closeModal();
    });
  }

  function openModal() {
    if (!modal) return;
    previouslyFocusedEl = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", trapFocusAndDismiss);
    
    // Focus first focusable node in dialog
    const focusable = getFocusableElements(modal);
    if (focusable.length > 0) focusable[0].focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", trapFocusAndDismiss);
    if (previouslyFocusedEl) previouslyFocusedEl.focus();
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hasAttribute("disabled") && el.style.display !== "none");
  }

  function trapFocusAndDismiss(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }

    if (e.key === "Tab") {
      const focusable = getFocusableElements(modal);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) { // Back tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Forward tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  }

  // Toast notification pipeline
  window.showToast = function(type, message) {
    const container = document.getElementById("toast-wrapper-panel");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span class="toast-text">// ${type.toUpperCase()}: ${message}</span>
      <button class="toast-close" aria-label="Dismiss toast">✕</button>
    `;

    container.appendChild(toast);

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.remove();
    });

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = "toastSlideIn 0.3s ease reverse";
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  };

  // Bind toast buttons
  const btnToastInfo = document.getElementById("btn-toast-info");
  const btnToastSuccess = document.getElementById("btn-toast-success");
  const btnToastError = document.getElementById("btn-toast-error");

  if (btnToastInfo) btnToastInfo.addEventListener("click", () => showToast("info", "System status is optimal."));
  if (btnToastSuccess) btnToastSuccess.addEventListener("click", () => showToast("success", "NEXUS module successfully loaded!"));
  if (btnToastError) btnToastError.addEventListener("click", () => showToast("error", "Compiler stack overflow at line 23."));

  // Custom accessible Dropdown
  const dropdown = document.getElementById("dropdown-demo");
  const ddTrigger = document.getElementById("dropdown-trigger-btn");
  const ddList = dropdown ? dropdown.querySelector(".dropdown-list") : null;
  const ddOptions = dropdown ? dropdown.querySelectorAll(".dropdown-option") : [];

  if (ddTrigger && ddList) {
    ddTrigger.addEventListener("click", () => {
      const isExpanded = ddTrigger.getAttribute("aria-expanded") === "true";
      ddTrigger.setAttribute("aria-expanded", !isExpanded);
      ddList.classList.toggle("open");
      if (!isExpanded && ddOptions.length > 0) {
        // Focus selected option or first option
        const selected = Array.from(ddOptions).find(opt => opt.getAttribute("aria-selected") === "true");
        if (selected) selected.focus();
        else ddOptions[0].focus();
      }
    });

    ddOptions.forEach((option, idx) => {
      option.addEventListener("click", () => selectOption(option));
      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption(option);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = ddOptions[idx + 1] || ddOptions[0];
          next.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = ddOptions[idx - 1] || ddOptions[ddOptions.length - 1];
          prev.focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          ddList.classList.remove("open");
          ddTrigger.setAttribute("aria-expanded", "false");
          ddTrigger.focus();
        }
      });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        ddList.classList.remove("open");
        ddTrigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  function selectOption(option) {
    ddOptions.forEach(opt => opt.setAttribute("aria-selected", "false"));
    option.setAttribute("aria-selected", "true");
    ddTrigger.querySelector("span").textContent = option.textContent;
    ddList.classList.remove("open");
    ddTrigger.setAttribute("aria-expanded", "false");
    ddTrigger.focus();
    showToast("success", `Target CPU updated: ${option.getAttribute("data-value")}`);
  }

  // Accordion Logic
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const isExpanded = header.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(header.getAttribute("aria-controls"));
      
      // Close other accordions in the same group
      const parentGroup = header.closest(".accordion-group");
      if (parentGroup) {
        parentGroup.querySelectorAll(".accordion-header").forEach(h => {
          if (h !== header) {
            h.setAttribute("aria-expanded", "false");
            const p = document.getElementById(h.getAttribute("aria-controls"));
            if (p) p.style.maxHeight = null;
          }
        });
      }

      header.setAttribute("aria-expanded", !isExpanded);
      if (!isExpanded) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = null;
      }
    });
  });

  // Inner Tabs switcher
  const innerTabBtns = document.querySelectorAll(".inner-tab-btn");
  innerTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const controls = btn.getAttribute("aria-controls");
      const container = btn.closest(".inner-tabs-container");
      
      container.querySelectorAll(".inner-tab-btn").forEach(b => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      container.querySelectorAll(".inner-tab-content-panel").forEach(p => {
        p.classList.toggle("active", p.id === controls);
      });
    });
  });


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. ANIMATIONS GALLERY LOGIC (COUNTERS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let counterSimulating = false;
  const countEl = document.getElementById("stat-counter-cycles");
  const countTrigger = document.getElementById("btn-trigger-counters");

  if (countTrigger) {
    countTrigger.addEventListener("click", () => {
      triggerCounterSimulation();
    });
  }

  function triggerCounterSimulation() {
    if (counterSimulating || !countEl) return;
    counterSimulating = true;
    if (countTrigger) countTrigger.disabled = true;

    let count = 0;
    const target = 489203;
    const duration = 2000; // ms
    const startTime = performance.now();

    function updateCounter(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing curve (ease-out-quad)
      const easeVal = progress * (2 - progress);
      count = Math.floor(easeVal * target);
      
      countEl.textContent = count.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        countEl.textContent = target.toLocaleString();
        counterSimulating = false;
        if (countTrigger) countTrigger.disabled = false;
        showToast("success", "Cycle simulation analysis complete.");
      }
    }
    requestAnimationFrame(updateCounter);
  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. PLAYGROUND SANDBOX (DRAG & DROP, SPLIT PANE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Drag and Drop Kanban Board
  const kanbanItems = document.querySelectorAll(".kanban-item");
  const kanbanColumns = document.querySelectorAll(".kanban-column");

  kanbanItems.forEach(item => {
    item.addEventListener("dragstart", () => {
      item.classList.add("dragging");
      item.setAttribute("aria-grabbed", "true");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      item.setAttribute("aria-grabbed", "false");
      updateKanbanCounts();
    });

    // Keyboard navigation (a11y)
    item.addEventListener("keydown", (e) => {
      const parentColumn = item.closest(".kanban-column");
      const currentList = Array.from(parentColumn.querySelectorAll(".kanban-item"));
      const itemIndex = currentList.indexOf(item);

      if (e.key === " ") {
        e.preventDefault();
        const grabbing = item.getAttribute("aria-grabbed") === "true";
        item.setAttribute("aria-grabbed", grabbing ? "false" : "true");
        item.style.borderColor = grabbing ? "" : "var(--color-accent)";
        showToast("info", grabbing ? "Task released." : "Task grabbed. Use Left/Right Arrow to move, Space to commit.");
      } 
      
      else if (e.key === "ArrowDown" && itemIndex < currentList.length - 1) {
        e.preventDefault();
        currentList[itemIndex + 1].focus();
      } 
      
      else if (e.key === "ArrowUp" && itemIndex > 0) {
        e.preventDefault();
        currentList[itemIndex - 1].focus();
      } 
      
      else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && item.getAttribute("aria-grabbed") === "true") {
        e.preventDefault();
        const cols = Array.from(kanbanColumns);
        const colIndex = cols.indexOf(parentColumn);
        let nextIndex = e.key === "ArrowRight" ? colIndex + 1 : colIndex - 1;

        if (nextIndex >= 0 && nextIndex < cols.length) {
          const targetCol = cols[nextIndex];
          targetCol.querySelector(".column-cards").appendChild(item);
          item.focus();
          updateKanbanCounts();
          showToast("info", `Moved task to ${targetCol.querySelector(".column-header").textContent.split('[')[0].trim()}`);
        }
      }
    });
  });

  kanbanColumns.forEach(column => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("dragover");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("dragover");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("dragover");
      const draggingItem = document.querySelector(".kanban-item.dragging");
      if (draggingItem) {
        column.querySelector(".column-cards").appendChild(draggingItem);
        showToast("success", `Task dropped in ${column.querySelector(".column-header").textContent.split('[')[0].trim()}`);
      }
    });
  });

  function updateKanbanCounts() {
    kanbanColumns.forEach(col => {
      const count = col.querySelectorAll(".kanban-item").length;
      const header = col.querySelector(".column-header");
      const title = header.textContent.split('[')[0].trim();
      header.textContent = `${title} [${count}]`;
    });
  }

  // Resizable Split Pane Logic
  const splitContainer = document.getElementById("split-pane-demo");
  const paneLeft = document.getElementById("pane-left");
  const paneRight = document.getElementById("pane-right");
  const divider = document.getElementById("pane-divider");

  if (splitContainer && divider && paneLeft) {
    let isDragging = false;

    divider.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    // A11y keyboard resizing
    divider.addEventListener("keydown", (e) => {
      let widthPct = parseFloat(paneLeft.style.width || "50");
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        widthPct = Math.max(10, widthPct - 2);
        updateSplitWidths(widthPct);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        widthPct = Math.min(90, widthPct + 2);
        updateSplitWidths(widthPct);
      }
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const containerRect = splitContainer.getBoundingClientRect();
      const offset = e.clientX - containerRect.left;
      let pct = (offset / containerRect.width) * 100;
      
      // Boundary limits
      pct = Math.max(10, Math.min(90, pct));
      updateSplitWidths(pct);
    }

    function updateSplitWidths(pct) {
      paneLeft.style.width = `${pct}%`;
      divider.setAttribute("aria-valuenow", Math.round(pct));
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. ASYNCHRONOUS API INTEGRATION (Open Library API)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const apiInput = document.getElementById("book-search-input");
  const apiBtn = document.getElementById("btn-search-books");
  const apiStatus = document.getElementById("api-status-feedback");
  const booksGrid = document.getElementById("books-grid-output");

  let debounceTimer = null;

  // Search Button click
  if (apiBtn) {
    apiBtn.addEventListener("click", () => {
      if (apiInput) queryBooksAPI(apiInput.value.trim());
    });
  }

  // Input Debounce Search (400ms delay)
  if (apiInput) {
    apiInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        queryBooksAPI(apiInput.value.trim());
      }, 500);
    });
  }

  function queryBooksAPI(query) {
    if (!query) {
      if (booksGrid) booksGrid.innerHTML = "";
      if (apiStatus) apiStatus.innerHTML = `<span class="pulse-dot"></span> Input compiler or assembly query parameters.`;
      return;
    }

    if (apiStatus) {
      apiStatus.innerHTML = `<span class="pulse-dot"></span> Querying Open Library database for: "${query}"...`;
    }

    // Render Skeletons during fetch
    if (booksGrid) {
      booksGrid.innerHTML = Array(3).fill(0).map(() => `
        <div class="skeleton-book-card">
          <div class="skeleton skeleton-cover"></div>
          <div class="skeleton-meta">
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-line long"></div>
          </div>
        </div>
      `).join("");
    }

    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`)
      .then(res => {
        if (!res.ok) throw new Error("Network latency threshold breached.");
        return res.json();
      })
      .then(data => {
        if (!booksGrid) return;
        booksGrid.innerHTML = "";

        const docs = data.docs || [];
        if (docs.length === 0) {
          if (apiStatus) apiStatus.innerHTML = `// ERR: No listings matching criteria.`;
          booksGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--color-text-dim)">// No records returned.</div>`;
          return;
        }

        if (apiStatus) {
          apiStatus.innerHTML = `<span class="pulse-dot"></span> Query resolved. Loaded ${docs.length} books.`;
        }

        docs.forEach(doc => {
          const card = document.createElement("div");
          card.className = "book-card";

          // Cover image layout
          const coverId = doc.cover_i;
          const coverUrl = coverId 
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "data:image/svg+xml,%3Csvg viewBox='0 0 100 140' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%2311121d'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%234c4e5c' font-family='monospace' font-size='10'%3ENO COVER%3C/text%3E%3C/svg%3E";

          card.innerHTML = `
            <div class="book-cover-wrap">
              <img class="book-cover" src="${coverUrl}" alt="Cover of ${doc.title}" loading="lazy" />
            </div>
            <div class="book-meta">
              <span class="book-title" title="${doc.title}">${doc.title.length > 40 ? doc.title.substring(0, 37) + "..." : doc.title}</span>
              <span class="book-author">${doc.author_name ? doc.author_name[0] : "Unknown Author"}</span>
              <span class="book-year">Published: ${doc.first_publish_year || "N/A"}</span>
            </div>
          `;
          booksGrid.appendChild(card);
        });
      })
      .catch(err => {
        if (apiStatus) apiStatus.innerHTML = `// ERR: ${err.message}`;
        if (booksGrid) booksGrid.innerHTML = "";
      });
  }

  // Run initial search
  queryBooksAPI("compiler");

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. FORM WIZARD FLOW & VALDIATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const form = document.getElementById("wizard-form-demo");
  const stepIndicators = document.querySelectorAll(".step-indicator");
  const stepLines = document.querySelectorAll(".step-line");
  const wizardSteps = document.querySelectorAll(".wizard-step");

  // Step Nav triggers
  const btnNext1 = document.getElementById("btn-next-step-1");
  const btnNext2 = document.getElementById("btn-next-step-2");
  const btnPrev2 = document.getElementById("btn-prev-step-2");
  const btnPrev3 = document.getElementById("btn-prev-step-3");

  // Form Fields
  const inputEmail = document.getElementById("wiz-email");
  const inputPwd = document.getElementById("wiz-pwd");
  const inputUser = document.getElementById("wiz-username");
  const fileInput = document.getElementById("wiz-file-input");

  // Step 1 Validation & Flow
  if (btnNext1) {
    btnNext1.addEventListener("click", () => {
      let valid = true;

      // Email Validation
      if (!validateEmail(inputEmail.value)) {
        inputEmail.classList.add("error");
        document.getElementById("wiz-email-error").textContent = "// INVALID ACCOUNT EMAIL SYNTAX";
        valid = false;
      } else {
        inputEmail.classList.remove("error");
        document.getElementById("wiz-email-error").textContent = "";
      }

      // Password Validation (must be medium/strong strength)
      const pwdStrength = checkPasswordStrength(inputPwd.value);
      if (pwdStrength < 2) {
        inputPwd.classList.add("error");
        document.getElementById("wiz-pwd-error").textContent = "// PASSWORD SECURITY THRESHOLD NOT REACHED";
        valid = false;
      } else {
        inputPwd.classList.remove("error");
        document.getElementById("wiz-pwd-error").textContent = "";
      }

      if (valid) {
        goToStep(2);
      }
    });
  }

  // Password Input Listener (Strength Meter)
  if (inputPwd) {
    inputPwd.addEventListener("input", () => {
      const pwd = inputPwd.value;
      const meter = document.getElementById("pwd-strength-meter");
      const label = document.getElementById("pwd-strength-label");
      
      const score = checkPasswordStrength(pwd);

      // Criteria indicators
      toggleCriterion("crit-length", pwd.length >= 8);
      toggleCriterion("crit-num", /\d/.test(pwd));
      toggleCriterion("crit-spec", /[^A-Za-z0-9]/.test(pwd));

      // Color and Width mapping
      if (pwd.length === 0) {
        meter.style.width = "0%";
        label.textContent = "Strength: Empty";
      } else if (score === 0 || score === 1) {
        meter.style.width = "30%";
        meter.style.backgroundColor = "red";
        label.textContent = "Strength: Weak";
      } else if (score === 2) {
        meter.style.width = "65%";
        meter.style.backgroundColor = "orange";
        label.textContent = "Strength: Medium";
      } else {
        meter.style.width = "100%";
        meter.style.backgroundColor = "var(--color-accent)";
        label.textContent = "Strength: High Security";
      }
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function checkPasswordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  function toggleCriterion(id, isValid) {
    const el = document.getElementById(id);
    if (el) {
      el.className = isValid ? "valid" : "invalid";
    }
  }

  // Step 2 Autocomplete & Files drag/drop
  const suggestionsList = document.getElementById("username-suggestions");
  const usernamesRepo = ["peekay08", "compiler_dev", "sysadmin", "rustacean", "llvm_core", "assembly_wizard", "nexus_prime"];

  if (inputUser && suggestionsList) {
    inputUser.addEventListener("input", () => {
      const val = inputUser.value.trim().toLowerCase();
      suggestionsList.innerHTML = "";

      if (!val) {
        suggestionsList.classList.remove("open");
        return;
      }

      const matches = usernamesRepo.filter(u => u.includes(val));
      if (matches.length === 0) {
        suggestionsList.classList.remove("open");
        return;
      }

      suggestionsList.classList.add("open");
      matches.forEach(match => {
        const li = document.createElement("li");
        li.className = "autocomplete-suggestion";
        li.textContent = match;
        li.addEventListener("click", () => {
          inputUser.value = match;
          suggestionsList.classList.remove("open");
        });
        suggestionsList.appendChild(li);
      });
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
      if (!inputUser.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.remove("open");
      }
    });
  }

  // Drag and Drop Upload file Mock progress
  const dragZone = document.getElementById("drag-upload-zone");
  const pickerTrigger = document.getElementById("file-picker-trigger");
  const uploadProgress = document.getElementById("upload-progress-container");
  const progressFill = document.getElementById("upload-progress-fill");
  const progressText = document.getElementById("upload-percent-text");
  const filenameText = document.getElementById("upload-filename-text");

  let uploadedFile = null;

  if (dragZone && fileInput) {
    pickerTrigger.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    dragZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dragZone.classList.add("dragover");
    });

    dragZone.addEventListener("dragleave", () => {
      dragZone.classList.remove("dragover");
    });

    dragZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dragZone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    uploadedFile = file;
    if (filenameText) filenameText.textContent = file.name;
    if (uploadProgress) uploadProgress.style.display = "flex";
    
    // Simulate upload progress interval
    let progress = 0;
    progressFill.style.width = "0%";
    progressText.textContent = "0%";
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        showToast("success", `${file.name} successfully buffered.`);
      }
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }, 120);
  }

  // Step 2 to Step 3 flow
  if (btnNext2) {
    btnNext2.addEventListener("click", () => {
      // Map values to review screen
      document.getElementById("review-email-val").textContent = inputEmail.value;
      document.getElementById("review-user-val").textContent = inputUser.value || "Anonymous Guest";
      document.getElementById("review-doc-val").textContent = uploadedFile ? uploadedFile.name : "No file uploaded";

      goToStep(3);
    });
  }

  // Previous Navigation Triggers
  if (btnPrev2) btnPrev2.addEventListener("click", () => goToStep(1));
  if (btnPrev3) btnPrev3.addEventListener("click", () => goToStep(2));

  function goToStep(stepNum) {
    wizardSteps.forEach((step, idx) => {
      step.classList.toggle("active", idx + 1 === stepNum);
    });

    stepIndicators.forEach((ind, idx) => {
      const stepVal = idx + 1;
      ind.classList.toggle("active", stepVal === stepNum);
      ind.classList.toggle("done", stepVal < stepNum);
    });

    stepLines.forEach((line, idx) => {
      const lineVal = idx + 1;
      line.classList.toggle("active", lineVal < stepNum);
    });
  }

  // Final Form Submit trigger
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("success", "Transmission complete. Account record created.");
      
      // Reset form
      setTimeout(() => {
        form.reset();
        uploadedFile = null;
        if (uploadProgress) uploadProgress.style.display = "none";
        goToStep(1);
      }, 1500);
    });
  }


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. RESPONSIVE SIMULATOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const presetBtns = document.querySelectorAll(".preset-btn");
  const morphSandbox = document.getElementById("morph-sandbox-node");
  const currentWidthLabel = document.getElementById("current-morph-width");

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const width = btn.getAttribute("data-width");
      if (morphSandbox) {
        morphSandbox.style.width = width;
        currentWidthLabel.textContent = width === "100%" ? "DESKTOP (100%)" : width;
        
        // Remove simulated breakpoint classes
        morphSandbox.classList.remove("tablet", "mobile");
        
        if (width === "768px") {
          morphSandbox.classList.add("tablet");
        } else if (width === "375px") {
          morphSandbox.classList.add("mobile");
        }
      }
    });
  });


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. COMMAND PALETTE (Ctrl+K)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const palette = document.getElementById("command-palette");
  const searchInput = document.getElementById("palette-search-input");
  const resultsList = document.getElementById("palette-results");
  const closeBtn = document.getElementById("btn-close-palette");
  const searchTrigger = document.getElementById("search-trigger");

  const viewsData = [
    { title: "Dashboard Home", desc: "Return to dashboard summary & compiler health stats", action: () => switchView("overview") },
    { title: "UI Components", desc: "Interact with buttons, dropdowns, accordions, modals", action: () => switchView("components") },
    { title: "Animation Gallery", desc: "View keyframes, skeletons, circuit draw, counters", action: () => switchView("animations") },
    { title: "Experiments Playground", desc: "Kanban board & split panels resizers", action: () => switchView("playground") },
    { title: "API Integration client", desc: "Query book details asynchronously from Open Library", action: () => switchView("apis") },
    { title: "Forms Validator Flow", desc: "Test live email, strength indicators, file zone uploads", action: () => switchView("forms") },
    { title: "Responsive Morph Simulator", desc: "Simulate mobile and tablet breakpoints", action: () => switchView("responsive") },
    { title: "Design System Specification", desc: "Observe HEX codes, spacing matrices, font sizes", action: () => switchView("design-system") },
  ];

  let selectedIndex = 0;
  let filteredViews = [...viewsData];

  // Hotkey trigger
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openPalette();
    }
  });

  if (searchTrigger) searchTrigger.addEventListener("click", openPalette);
  if (closeBtn) closeBtn.addEventListener("click", closePalette);
  
  if (palette) {
    palette.addEventListener("click", (e) => {
      if (e.target === palette) closePalette();
    });
  }

  function openPalette() {
    if (!palette) return;
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    renderPaletteResults();
    
    // palette listeners
    document.addEventListener("keydown", handlePaletteKeys);
  }

  function closePalette() {
    if (!palette) return;
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handlePaletteKeys);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const val = searchInput.value.trim().toLowerCase();
      filteredViews = viewsData.filter(v => 
        v.title.toLowerCase().includes(val) || 
        v.desc.toLowerCase().includes(val)
      );
      selectedIndex = 0;
      renderPaletteResults();
    });
  }

  function renderPaletteResults() {
    if (!resultsList) return;
    resultsList.innerHTML = "";

    if (filteredViews.length === 0) {
      resultsList.innerHTML = `<li style="padding:10px 18px;color:var(--color-text-dim)">// No commands match your search</li>`;
      return;
    }

    filteredViews.forEach((view, idx) => {
      const li = document.createElement("li");
      li.className = `palette-result-item ${idx === selectedIndex ? 'selected' : ''}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", idx === selectedIndex ? "true" : "false");
      li.innerHTML = `
        <span class="palette-result-title">${view.title}</span>
        <span class="palette-result-desc">${view.desc}</span>
      `;
      li.addEventListener("click", () => {
        view.action();
        closePalette();
      });
      resultsList.appendChild(li);
    });
  }

  function handlePaletteKeys(e) {
    if (e.key === "Escape") {
      closePalette();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % filteredViews.length;
      renderPaletteResults();
      scrollToSelectedOption();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredViews.length) % filteredViews.length;
      renderPaletteResults();
      scrollToSelectedOption();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredViews[selectedIndex]) {
        filteredViews[selectedIndex].action();
        closePalette();
      }
    }
  }

  function scrollToSelectedOption() {
    if (!resultsList) return;
    const items = resultsList.querySelectorAll(".palette-result-item");
    const active = items[selectedIndex];
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 11. CUSTOM CURSOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const cursorRing = document.getElementById("cursor-ring");
  const cursorDot  = document.getElementById("cursor-dot");

  const isPointerFine = window.matchMedia("(pointer: fine)").matches;
  if (isPointerFine && cursorRing && cursorDot) {
    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    let cursorVisible = false;

    document.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursorRing.classList.add("cursor-active");
        cursorDot.classList.add("cursor-active");
      }
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top  = `${mouseY}px`;
    });

    (function animateCursor() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top  = `${ringY}px`;
      requestAnimationFrame(animateCursor);
    })();

    const hoverTargets = "a, button, [tabindex], [data-tab], .kanban-item, .swatch-block, .dialog-close-btn";
    document.addEventListener("mouseover", e => {
      if (e.target.closest(hoverTargets)) {
        cursorRing.classList.add("cursor-hover");
      }
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(hoverTargets)) {
        cursorRing.classList.remove("cursor-hover");
      }
    });

    document.addEventListener("mousedown", () => cursorRing.classList.add("cursor-click"));
    document.addEventListener("mouseup", () => cursorRing.classList.remove("cursor-click"));
  }

});
