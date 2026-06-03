/* ==========================================================================
   PROMISE KOLADE — PORTFOLIO v2.0 — CORE INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

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

  // Hotspot coordinates on portrait image (% relative to portrait container)
  const hotspots = {
    about:    { x: 48, y: 55 },
    skills:   { x: 50, y: 22 },
    projects: { x: 52, y: 68 },
    contact:  { x: 46, y: 82 },
    education:{ x: 55, y: 35 },
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GITHUB STATS FETCHER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(function fetchGitHubStats() {
  const username = "Peekay08";
 
  // Repos to hide from the list
  const HIDDEN_REPOS = ["Cherish"];
 
  // Hosted links — add your deployed URLs here when ready
  // key = exact repo name, value = live URL
  const HOSTED_LINKS = {
    "Vantage": "https://github.com/Peekay08/Vantage/tree/main/Vantage",
    "myCV": "https://peekay08.github.io/myCV/",
    "Chuk-s-Kitchen": "https://peekay08.github.io/Chuk-s-Kitchen/",
    "Persol": "https://peekay08.github.io/Persol/",
    "Challenge": "https://github.com/Peekay08/Challenge/tree/main/src"
  };
 
  // User stats
  fetch(`https://api.github.com/users/${username}`)
    .then(r => r.json())
    .then(data => {
      const reposEl     = document.getElementById("gh-repos");
      const followersEl = document.getElementById("gh-followers");
      const followingEl = document.getElementById("gh-following");
      if (reposEl)     reposEl.textContent    = data.public_repos ?? "—";
      if (followersEl) followersEl.textContent = data.followers    ?? "—";
      if (followingEl) followingEl.textContent = data.following    ?? "—";
    })
    .catch(() => {});
 
  // Repos list
  fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`)
    .then(r => r.json())
    .then(allRepos => {
      const container = document.getElementById("gh-repo-items");
      if (!container) return;
 
      // Filter hidden repos, then take top 5
      const repos = Array.isArray(allRepos)
        ? allRepos.filter(r => !HIDDEN_REPOS.includes(r.name)).slice(0, 5)
        : [];
 
      if (repos.length === 0) {
        container.innerHTML = `<span class="gh-error">// No public repositories found</span>`;
        return;
      }
 
      container.innerHTML = repos.map(repo => {
        const updated  = new Date(repo.updated_at);
        const label    = updated.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        const hostedUrl = HOSTED_LINKS[repo.name] || null;
 
        const viewBtn = hostedUrl
          ? `<a href="${hostedUrl}" target="_blank" rel="noopener" class="gh-view-btn" aria-label="View hosted work for ${repo.name}">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                 <circle cx="12" cy="12" r="10"></circle>
                 <line x1="2" y1="12" x2="22" y2="12"></line>
                 <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
               </svg>
               VIEW
             </a>`
          : `<span class="gh-view-btn" style="opacity:0.3;cursor:default;" aria-hidden="true">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                 <circle cx="12" cy="12" r="10"></circle>
                 <line x1="2" y1="12" x2="22" y2="12"></line>
                 <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
               </svg>
               VIEW
             </span>`;
 
        return `
          <div class="gh-repo-row">
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="gh-repo-link-mask" aria-label="View ${repo.name} on GitHub"></a>
            <div class="gh-repo-left">
              <span class="gh-repo-name">${repo.name}</span>
            </div>
            <div class="gh-repo-right">
              ${repo.language ? `<span class="gh-repo-lang">${repo.language}</span>` : ""}
              <span class="gh-repo-updated">${label}</span>
              ${viewBtn}
            </div>
          </div>`;
      }).join("");
    })
    .catch(() => {
      const container = document.getElementById("gh-repo-items");
      if (container) container.innerHTML = `<span class="gh-error">// Could not load repositories</span>`;
    });
})();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. AUDIO ENGINE
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
  // 3. SPOTLIGHT PHYSICS (hero portrait)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let currentSpot = { x: 50, y: 50, radius: 0 };
  let targetSpot  = { x: 50, y: 50, radius: 0 };
  let isHoveringCard     = false;
  let isHoveringPortrait = false;
  let activeHotspotKey   = null;

  // Only allow spotlight/HUD when hero is in view
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
  // 4. HUD CARD INTERACTIONS (hero only)
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
        targetSpot.x = spot.x;
        targetSpot.y = spot.y;
        targetSpot.radius = 170;
        drawHudConnection(card, spot);
        playSound("lock");
      }
    });

    card.addEventListener("mousemove", (e) => {
      if (!isHeroVisible()) return;
      const rect = card.getBoundingClientRect();
      const rx = -((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      const ry =  ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;

      const key = card.getAttribute("data-hotspot");
      if (key && hotspots[key]) drawHudConnection(card, hotspots[key]);
    });

    card.addEventListener("mouseleave", () => {
      isHoveringCard  = false;
      activeHotspotKey = null;
      card.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.4s ease";
      card.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      clearHudConnection();
      playSound("unlock");
      targetSpot.radius = isHoveringPortrait ? 120 : 0;
    });

    card.addEventListener("click", () => playSound("tick"));
    card.addEventListener("focusin", () => playSound("hover"));
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. 3D TILT on project cards (non-hero)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const tiltCards = document.querySelectorAll(".project-card, .figma-card, .honest-stat, .ach-item");
  tiltCards.forEach(el => {
    el.addEventListener("mouseenter", () => playSound("hover"));
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const rx = -((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      const ry =  ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
      el.style.transform  = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. HUD SVG CONNECTION SYSTEM
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

  // Clear HUD connections when scrolling away from hero
  window.addEventListener("scroll", () => {
    if (!isHeroVisible() && hudSvg.innerHTML) {
      hudSvg.innerHTML = "";
      if (!isHoveringCard) targetSpot.radius = 0;
    }
  }, { passive: true });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. SMOOTH SCROLL (nav + CTA links)
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
  // 8. NAV RAIL — ACTIVE STATE ON SCROLL
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
  // 9. SCROLL ANIMATIONS (Intersection Observer)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        animateObserver.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12 });

  // Stagger children of grid/list containers
  const staggerParents = document.querySelectorAll(
    ".projects-grid, .about-grid, .skills-list, .achievements-list, " +
    ".edu-timeline, .contact-layout, .figma-grid, .hero-hud-cluster, .contact-links-list"
  );

  staggerParents.forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      if (!child.hasAttribute("data-animate")) {
        child.setAttribute("data-animate", "");
      }
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  document.querySelectorAll("[data-animate]").forEach(el => animateObserver.observe(el));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. CONTACT FORM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name    = document.getElementById("form-name").value.trim();
      const email   = document.getElementById("form-email").value.trim();
      const message = document.getElementById("form-message").value.trim();

      // Validate
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

      // Open mailto
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

    // Input focus sound
    contactForm.querySelectorAll(".form-input").forEach(input => {
      input.addEventListener("focus", () => playSound("hover"));
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 11. SKILL ROW HOVER — dim siblings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const skillsList = document.querySelector(".skills-list");
  if (skillsList) {
    const rows = skillsList.querySelectorAll(".skill-row");
    rows.forEach(row => {
      row.addEventListener("mouseenter", () => {
        rows.forEach(r => {
          if (r !== row) { r.style.opacity = "0.3"; r.style.filter = "blur(0.4px)"; }
        });
        playSound("hover");
      });
      row.addEventListener("mouseleave", () => {
        rows.forEach(r => { r.style.opacity = ""; r.style.filter = ""; });
      });
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12. PROJECT CARD — play sound on hover
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("mouseenter", () => playSound("hover"));
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 13. ACHIEVEMENT ITEMS — staggered entrance highlight
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
  // 14. KEYBOARD ACCESSIBILITY
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

});