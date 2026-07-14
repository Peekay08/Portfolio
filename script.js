/* ==========================================================================
   PROMISE KOLADE — PORTFOLIO v3.0 — CORE INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 0. BOOT SEQUENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const bootScreen    = document.getElementById("boot-screen");
  const bootLogo      = document.getElementById("boot-logo");
  const bootProgress  = document.getElementById("boot-progress-fill");
  const bootLineEls   = [0,1,2,3,4,5].map(i => document.getElementById(`bl-${i}`));

  // Timings (ms): logo → lines staggered → exit
  const bootTimings = [0, 280, 520, 760, 1000, 1220];
  const bootDone = 1500;

  // Show logo first
  setTimeout(() => bootLogo && bootLogo.classList.add("visible"), 80);

  bootLineEls.forEach((el, i) => {
    if (!el) return;
    setTimeout(() => {
      el.classList.add("visible");
      if (bootProgress) bootProgress.style.width = `${((i + 1) / bootLineEls.length) * 100}%`;
      // Mark previous as done
      if (i > 0 && bootLineEls[i - 1]) bootLineEls[i - 1].classList.add("done");
    }, bootTimings[i] + 100);
  });

  setTimeout(() => {
    if (bootScreen) {
      bootScreen.classList.add("boot-exit");
      setTimeout(() => {
        bootScreen.style.display = "none";
        document.body.dispatchEvent(new CustomEvent("boot-complete"));
      }, 500);
    }
  }, bootDone);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. DOM REFERENCES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const portraitContainer = document.getElementById("portrait-container");
  const portraitColor     = document.querySelector(".portrait-color");
  const hudSvg            = document.getElementById("hud-svg");
  const sfxToggle         = document.getElementById("sfx-toggle");
  const sfxBtnText        = sfxToggle.querySelector(".hud-btn-text");
  const soundOnIcon       = sfxToggle.querySelector(".sound-on");
  const soundOffIcon      = sfxToggle.querySelector(".sound-off");
  const navItems          = document.querySelectorAll(".nav-item");
  const sections          = document.querySelectorAll("[data-section-id]");
  const hudCards          = document.querySelectorAll(".hud-info-card[data-hotspot]");
  const contactForm       = document.getElementById("contact-form");
  const formStatus        = document.getElementById("form-status");

  // Portrait hotspot coordinates (% of portrait container)
  const hotspots = {
    about:    { x: 48, y: 55 },
    skills:   { x: 50, y: 22 },
    projects: { x: 52, y: 68 },
    contact:  { x: 46, y: 82 },
    education:{ x: 55, y: 35 },
  };

  // Nav item → portrait hotspot mapping
  const navHotspots = {
    "nav-about":    { x: 48, y: 35 },
    "nav-projects": { x: 50, y: 58 },
    "nav-stack":    { x: 52, y: 45 },
    "nav-journey":  { x: 50, y: 30 },
    "nav-contact":  { x: 46, y: 72 },
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GITHUB STATS FETCHER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  (function fetchGitHubStats() {
    const username    = "Peekay08";
    const HIDDEN_REPOS = ["Cherish"];
    const HOSTED_LINKS = {
      "Vantage":       "https://github.com/Peekay08/Vantage/tree/main/Vantage",
      "Portfolio":     "https://peekay08.github.io/Portfolio/",
      "Chuk-s-Kitchen":"https://peekay08.github.io/Chuk-s-Kitchen/",
      "Persol":        "https://peekay08.github.io/Persol/",
      "Challenge":     "https://github.com/Peekay08/Challenge/tree/main/src"
    };

    fetch(`https://api.github.com/users/${username}`)
      .then(r => r.json())
      .then(data => {
        const reposEl     = document.getElementById("gh-repos");
        const followersEl = document.getElementById("gh-followers");
        if (reposEl)     reposEl.textContent    = data.public_repos ?? "—";
        if (followersEl) followersEl.textContent = data.followers    ?? "—";
      })
      .catch(() => {});

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`)
      .then(r => r.json())
      .then(allRepos => {
        const container = document.getElementById("gh-repo-items");
        if (!container) return;

        const repos = Array.isArray(allRepos)
          ? allRepos.filter(r => !HIDDEN_REPOS.includes(r.name)).slice(0, 5)
          : [];

        if (repos.length === 0) {
          container.innerHTML = `<span class="gh-error">// No public repositories found</span>`;
          return;
        }

        // Render as SYSTEM STATUS rows
        container.innerHTML = repos.map(repo => {
          const updated   = new Date(repo.updated_at);
          const label     = updated.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
          const hostedUrl = HOSTED_LINKS[repo.name] || repo.html_url;
          return `
            <a href="${hostedUrl}" target="_blank" rel="noopener" class="gh-sys-repo-row" aria-label="View ${repo.name}">
              <span class="gh-sys-prompt">›</span>
              <span class="gh-sys-repo-name">${repo.name}</span>
              ${repo.language ? `<span class="gh-sys-repo-lang">[${repo.language}]</span>` : ""}
              <span class="gh-sys-repo-date">${label}</span>
            </a>`;
        }).join("");
      })
      .catch(() => {
        const container = document.getElementById("gh-repo-items");
        if (container) container.innerHTML = `<span style="font-family:var(--font-mono);font-size:9px;color:var(--color-text-dim)">// Could not load repositories</span>`;
      });
  })();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. CUSTOM CURSOR ENGINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const cursorRing = document.getElementById("cursor-ring");
  const cursorDot  = document.getElementById("cursor-dot");

  // Only run on pointer:fine devices
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
      // Dot follows exactly
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top  = `${mouseY}px`;
    });

    // Ring lerps behind
    (function animateCursor() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top  = `${ringY}px`;
      requestAnimationFrame(animateCursor);
    })();

    // Expand on interactive elements
    const hoverTargets = "a, button, [tabindex], [data-hotspot], .skill-category, .figma-card, .project-card, .honest-stat, .ach-item, .contact-link-row, .nav-item";
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

    // Click spring
    document.addEventListener("mousedown", () => {
      cursorRing.classList.add("cursor-click");
    });
    document.addEventListener("mouseup", () => {
      cursorRing.classList.remove("cursor-click");
    });

    document.addEventListener("mouseleave", () => {
      cursorRing.classList.remove("cursor-active");
      cursorDot.classList.remove("cursor-active");
      cursorVisible = false;
    });
    document.addEventListener("mouseenter", () => {
      cursorRing.classList.add("cursor-active");
      cursorDot.classList.add("cursor-active");
      cursorVisible = true;
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. AUDIO ENGINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let audioCtx        = null;
  let isSoundEnabled  = localStorage.getItem("sfx_enabled") === "true";
  updateAudioButtonUI();

  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function playSound(type) {
    if (!isSoundEnabled) return;
    initAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;

    switch (type) {
      case "tick": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(4500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.012);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
        osc.start(now); osc.stop(now + 0.015);
        break;
      }
      case "hover": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.035);
        gain.gain.setValueAtTime(0.008, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
        osc.start(now); osc.stop(now + 0.04);
        break;
      }
      case "lock": {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
        osc1.type = "sine"; osc2.type = "sine";
        osc1.frequency.setValueAtTime(1200, now); osc1.frequency.setValueAtTime(1600, now + 0.04);
        osc2.frequency.setValueAtTime(1800, now); osc2.frequency.setValueAtTime(2400, now + 0.04);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.setValueAtTime(0.006, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc1.start(now); osc2.start(now);
        osc1.stop(now + 0.12); osc2.stop(now + 0.12);
        break;
      }
      case "unlock": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
        gain.gain.setValueAtTime(0.006, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now); osc.stop(now + 0.07);
        break;
      }
      case "swoosh": {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.005, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now); osc.stop(now + 0.22);
        break;
      }
    }
  }

  sfxToggle.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem("sfx_enabled", isSoundEnabled);
    updateAudioButtonUI();
    if (isSoundEnabled) { initAudio(); playSound("lock"); }
  });

  function updateAudioButtonUI() {
    if (isSoundEnabled) {
      soundOnIcon.style.display  = "block";
      soundOffIcon.style.display = "none";
      sfxBtnText.textContent = "AUDIO: ON";
      sfxToggle.style.borderColor = "var(--color-accent)";
      sfxToggle.style.color       = "var(--color-accent)";
    } else {
      soundOnIcon.style.display  = "none";
      soundOffIcon.style.display = "block";
      sfxBtnText.textContent = "AUDIO: OFF";
      sfxToggle.style.borderColor = "rgba(255,255,255,0.1)";
      sfxToggle.style.color       = "var(--color-text-muted)";
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. SPOTLIGHT PHYSICS (hero portrait)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let currentSpot = { x: 50, y: 50, radius: 0 };
  let targetSpot  = { x: 50, y: 50, radius: 0 };
  let isHoveringCard     = false;
  let isHoveringPortrait = false;
  let activeHotspotKey   = null;

  function isHeroVisible() {
    const hero = document.getElementById("hero");
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight * 0.6;
  }

  if (portraitContainer) {
    portraitContainer.addEventListener("mouseenter", () => {
      if (isHoveringCard || !isHeroVisible()) return;
      isHoveringPortrait = true;
      targetSpot.radius = 120;
    });
    portraitContainer.addEventListener("mousemove", (e) => {
      if (isHoveringCard || !isHeroVisible()) return;
      const rect = portraitContainer.getBoundingClientRect();
      targetSpot.x = ((e.clientX - rect.left) / rect.width)  * 100;
      targetSpot.y = ((e.clientY - rect.top)  / rect.height) * 100;
      targetSpot.radius = 120;
    });
    portraitContainer.addEventListener("mouseleave", () => {
      isHoveringPortrait = false;
      if (!isHoveringCard) targetSpot.radius = 0;
    });
  }

  function updateSpotlight() {
    const snap = 0.24;
    currentSpot.x      += (targetSpot.x      - currentSpot.x)      * snap;
    currentSpot.y      += (targetSpot.y      - currentSpot.y)      * snap;
    currentSpot.radius += (targetSpot.radius  - currentSpot.radius) * 0.26;

    if (portraitColor) {
      portraitColor.style.setProperty("--spotlight-x",      `${currentSpot.x}%`);
      portraitColor.style.setProperty("--spotlight-y",      `${currentSpot.y}%`);
      portraitColor.style.setProperty("--spotlight-radius", `${currentSpot.radius}px`);
    }
    requestAnimationFrame(updateSpotlight);
  }
  requestAnimationFrame(updateSpotlight);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. NAV → PORTRAIT HOTSPOT EXPANSION (REMOVED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Feature disabled to keep the portrait clean when navigating the rail.

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. HUD CARD INTERACTIONS (hero only)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hudCards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      if (!isHeroVisible()) return;
      isHoveringCard = true;
      playSound("hover");

      const key = card.getAttribute("data-hotspot");
      if (key && hotspots[key]) {
        activeHotspotKey = key;
        const spot = hotspots[key];
        drawHudConnection(card, spot);
        playSound("lock");
      }
    });

    card.addEventListener("mousemove", (e) => {
      if (!isHeroVisible()) return;
      const rect = card.getBoundingClientRect();
      const rx = -((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      const ry =  ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      card.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease";
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;

      const key = card.getAttribute("data-hotspot");
      if (key && hotspots[key]) drawHudConnection(card, hotspots[key]);
    });

    card.addEventListener("mouseleave", () => {
      isHoveringCard  = false;
      activeHotspotKey = null;
      clearHudConnection();
      playSound("unlock");
      // Settle card rotation
      settleCard(card, card._velX || 0, card._velY || 0);
    });

    card.addEventListener("click", () => playSound("tick"));
    card.addEventListener("focusin", () => playSound("hover"));
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. CARD INERTIA PHYSICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Replace the simple tilt with velocity-damped inertia
  const inertiaCards = document.querySelectorAll(".project-card, .figma-card, .honest-stat, .ach-item");

  inertiaCards.forEach(el => {
    let rotX = 0, rotY = 0;
    let velX = 0, velY = 0;
    let lastRx = 0, lastRy = 0;
    let isHovering = false;
    let rafId = null;

    el.addEventListener("mouseenter", () => {
      isHovering = true;
      playSound("hover");
      velX = 0; velY = 0;
      if (rafId) cancelAnimationFrame(rafId);
    });

    el.addEventListener("mousemove", e => {
      if (!isHovering) return;
      const rect = el.getBoundingClientRect();
      const rx = -((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      const ry =  ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      // Track velocity
      velX = rx - lastRx;
      velY = ry - lastRy;
      lastRx = rx; lastRy = ry;
      rotX = rx; rotY = ry;
      el.style.transition = "transform 0.05s linear, box-shadow 0.3s ease";
      el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    el.addEventListener("mouseleave", () => {
      isHovering = false;
      // Continue with velocity, then settle
      let curRotX = rotX, curRotY = rotY;
      let curVelX = velX * 3, curVelY = velY * 3;
      el.style.transition = "none";

      function settle() {
        curVelX *= 0.82;
        curVelY *= 0.82;
        curRotX += curVelX;
        curRotY += curVelY;
        // Dampen toward zero
        curRotX *= 0.88;
        curRotY *= 0.88;
        el.style.transform = `perspective(900px) rotateX(${curRotX}deg) rotateY(${curRotY}deg) translateY(0)`;
        if (Math.abs(curRotX) > 0.05 || Math.abs(curRotY) > 0.05) {
          rafId = requestAnimationFrame(settle);
        } else {
          el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
        }
      }
      rafId = requestAnimationFrame(settle);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. HUD SVG CONNECTION SYSTEM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function drawHudConnection(element, hotspot) {
    if (!hudSvg || !portraitContainer || !isHeroVisible()) return;
    hudSvg.innerHTML = "";

    const elRect  = element.getBoundingClientRect();
    const pRect   = portraitContainer.getBoundingClientRect();

    const targetX = pRect.left + (hotspot.x / 100) * pRect.width;
    const targetY = pRect.top  + (hotspot.y / 100) * pRect.height;

    let startX, startY;
    if (elRect.right < targetX) {
      startX = elRect.right - 8;
      startY = elRect.top + elRect.height / 2;
    } else if (elRect.left > targetX) {
      startX = elRect.left + 8;
      startY = elRect.top + elRect.height / 2;
    } else {
      startX = elRect.left + elRect.width / 2;
      startY = elRect.bottom < targetY ? elRect.bottom - 8 : elRect.top + 8;
    }

    const midX = startX + (targetX - startX) * 0.45;
    const path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${targetY} L ${targetX} ${targetY}`;

    const glow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glow.setAttribute("d", path);
    glow.setAttribute("class", "hud-line-glow");
    glow.setAttribute("fill", "none");

    const core = document.createElementNS("http://www.w3.org/2000/svg", "path");
    core.setAttribute("d", path);
    core.setAttribute("class", "hud-line");
    core.setAttribute("fill", "none");
    core.style.strokeDasharray = "8 6";
    core.style.strokeDashoffset = "0";

    let offset = 0;
    (function animateDash() {
      if (!isHoveringCard || !activeHotspotKey) return;
      offset -= 0.75;
      core.style.strokeDashoffset = `${offset}px`;
      requestAnimationFrame(animateDash);
    })();

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const targetCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    targetCircle.setAttribute("cx", targetX);
    targetCircle.setAttribute("cy", targetY);
    targetCircle.setAttribute("class", "hud-target");
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("cx", targetX);
    node.setAttribute("cy", targetY);
    node.setAttribute("class", "hud-node");
    g.appendChild(targetCircle);
    g.appendChild(node);

    hudSvg.appendChild(glow);
    hudSvg.appendChild(core);
    hudSvg.appendChild(g);
  }

  function clearHudConnection() {
    if (!hudSvg) return;
    hudSvg.querySelectorAll(".hud-line, .hud-line-glow, .hud-target, .hud-node").forEach(el => {
      el.style.opacity = "0";
    });
    setTimeout(() => { if (!isHoveringCard) hudSvg.innerHTML = ""; }, 400);
  }

  window.addEventListener("resize", () => {
    if (isHoveringCard && activeHotspotKey) {
      const active = document.querySelector(`.hud-info-card[data-hotspot="${activeHotspotKey}"]:hover`);
      if (active) drawHudConnection(active, hotspots[activeHotspotKey]);
    }
  });

  window.addEventListener("scroll", () => {
    if (!isHeroVisible() && hudSvg.innerHTML) {
      hudSvg.innerHTML = "";
      if (!isHoveringCard) targetSpot.radius = 0;
    }
  }, { passive: true });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. NEXUS SVG PIPELINE — draw on hover
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const nexusCard    = document.getElementById("project-nexus");
  const pipelineConnectors = document.querySelectorAll(".pipeline-connector");
  const pipelineArrows     = document.querySelectorAll(".pipeline-arrow-head");

  if (nexusCard && pipelineConnectors.length) {
    let pipelineRaf = null;
    let pipelineDrawn = false;

    function drawPipeline() {
      pipelineConnectors.forEach((connector, i) => {
        setTimeout(() => {
          connector.classList.add("drawn");
          // Make IR connector brighter
          if (i >= 2) connector.classList.add("active");
          setTimeout(() => {
            if (pipelineArrows[i]) {
              pipelineArrows[i].classList.add("visible");
              if (i >= 2) pipelineArrows[i].classList.add("active");
            }
          }, 120);
        }, i * 100);
      });
      pipelineDrawn = true;
    }

    function resetPipeline() {
      pipelineConnectors.forEach(c => c.classList.remove("drawn", "active"));
      pipelineArrows.forEach(a => a.classList.remove("visible", "active"));
      pipelineDrawn = false;
    }

    nexusCard.addEventListener("mouseenter", () => {
      if (!pipelineDrawn) drawPipeline();
    });
    nexusCard.addEventListener("mouseleave", () => {
      setTimeout(resetPipeline, 600);
    });

    // Also draw when card scrolls into view
    const pipelineObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !pipelineDrawn) {
        setTimeout(drawPipeline, 400);
      }
    }, { threshold: 0.5 });
    pipelineObserver.observe(nexusCard);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. SMOOTH SCROLL (nav + CTA links)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      playSound("swoosh");
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 48;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 11. NAV RAIL — ACTIVE STATE ON SCROLL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const sectionMap = new Map();
  sections.forEach(sec => sectionMap.set(sec.getAttribute("data-section-id"), sec));

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("data-section-id");
        navItems.forEach(item => {
          item.classList.toggle("active", item.getAttribute("data-section") === id);
        });
      }
    });
  }, {
    rootMargin: `-${Math.round(window.innerHeight * 0.4)}px 0px -${Math.round(window.innerHeight * 0.4)}px 0px`,
    threshold: 0
  });

  sections.forEach(sec => navObserver.observe(sec));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12. SCROLL ANIMATIONS (Intersection Observer)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Stagger children of grid/list containers
  const staggerParents = document.querySelectorAll(
    ".projects-grid, .about-grid, .skill-categories, .achievements-list, " +
    ".edu-timeline, .contact-layout, .figma-grid, .hero-hud-cluster, .contact-links-list"
  );
  staggerParents.forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      if (!child.hasAttribute("data-animate")) child.setAttribute("data-animate", "");
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  document.querySelectorAll("[data-animate]").forEach(el => animateObserver.observe(el));

  // Skill categories — assemble observer
  const assembleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        assembleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll("[data-assemble]").forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.12}s`;
    assembleObserver.observe(el);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 13. CV OVERLAY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const cvOverlay   = document.getElementById("cv-overlay");
  const cvBackdrop  = document.getElementById("cv-backdrop");
  const cvCloseBtn  = document.getElementById("cv-close-btn");
  const cvCloseBtn2 = document.getElementById("cv-close-btn-2");
  const cvSections  = document.querySelectorAll(".cv-section");

  // All buttons that open the CV
  const cvOpenBtns = [
    document.getElementById("hero-view-cv-btn"),
    document.getElementById("contact-view-cv-btn"),
    document.getElementById("header-view-cv-btn"),
  ].filter(Boolean);

  function openCV() {
    if (!cvOverlay) return;
    cvOverlay.classList.add("cv-open");
    cvOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    playSound("lock");
    // Stagger sections in
    cvSections.forEach((sec, i) => {
      sec.style.transitionDelay = `${i * 0.07 + 0.2}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => sec.classList.add("cv-visible"));
      });
    });
  }

  function closeCV() {
    if (!cvOverlay) return;
    cvOverlay.classList.remove("cv-open");
    cvOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    playSound("unlock");
    cvSections.forEach(sec => sec.classList.remove("cv-visible"));
  }

  cvOpenBtns.forEach(btn => btn.addEventListener("click", openCV));
  if (cvCloseBtn)  cvCloseBtn.addEventListener("click",  closeCV);
  if (cvCloseBtn2) cvCloseBtn2.addEventListener("click", closeCV);
  if (cvBackdrop)  cvBackdrop.addEventListener("click",  closeCV);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && cvOverlay?.classList.contains("cv-open")) closeCV();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 14. BUTTON RIPPLE EFFECT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rippleTargets = document.querySelectorAll(
    ".cta-primary, .cta-secondary, .form-submit, .download-cv-btn, .cv-dl-btn, .hud-btn"
  );
  rippleTargets.forEach(btn => {
    btn.addEventListener("click", e => {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top  = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
      playSound("tick");
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 15. CONTACT FORM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name    = document.getElementById("form-name").value.trim();
      const email   = document.getElementById("form-email").value.trim();
      const message = document.getElementById("form-message").value.trim();

      if (!name || !email || !message) {
        formStatus.textContent  = "// ALL FIELDS REQUIRED";
        formStatus.className    = "form-status error";
        playSound("tick");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formStatus.textContent  = "// INVALID EMAIL FORMAT";
        formStatus.className    = "form-status error";
        playSound("tick");
        return;
      }

      const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
      const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:04ukiyo14@gmail.com?subject=${subject}&body=${body}`;

      formStatus.textContent = "// TRANSMISSION OPENED IN MAIL CLIENT";
      formStatus.className   = "form-status success";
      playSound("lock");

      setTimeout(() => {
        contactForm.reset();
        formStatus.textContent = "";
        formStatus.className   = "form-status";
      }, 4000);
    });

    contactForm.querySelectorAll(".form-input").forEach(input => {
      input.addEventListener("focus", () => playSound("hover"));
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 16. SKILL CATEGORY HOVER — dim siblings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const skillCats = document.querySelectorAll(".skill-category");
  skillCats.forEach(cat => {
    cat.addEventListener("mouseenter", () => {
      skillCats.forEach(c => {
        if (c !== cat) { c.style.opacity = "0.35"; c.style.filter = "blur(0.3px)"; }
      });
      playSound("hover");
    });
    cat.addEventListener("mouseleave", () => {
      skillCats.forEach(c => { c.style.opacity = ""; c.style.filter = ""; });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 17. ACHIEVEMENT ITEMS — staggered highlight
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const achList = document.querySelector(".achievements-list");
  if (achList) {
    const achItems = achList.querySelectorAll(".ach-item");
    achItems.forEach(item => {
      item.addEventListener("mouseenter", () => {
        achItems.forEach(a => {
          if (a !== item) { a.style.opacity = "0.3"; a.style.filter = "blur(0.4px)"; }
        });
        playSound("hover");
      });
      item.addEventListener("mouseleave", () => {
        achItems.forEach(a => { a.style.opacity = ""; a.style.filter = ""; });
      });
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 18. KEYBOARD ACCESSIBILITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hudCards.forEach(card => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        setTimeout(() => card.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true })), 2000);
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 19. PROJECT CARD — sound on hover
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("mouseenter", () => playSound("hover"));
  });

});