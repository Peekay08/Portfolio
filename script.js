/* ==========================================================================
   INTERACTIVE EDITORIAL PORTFOLIO - CORE LOGIC & SNAPPY HUD ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. DOM REFERENCES & CONFIG
  const interactiveElements = document.querySelectorAll(".card, .raw-hud-list");
  const portraitContainer = document.querySelector(".portrait-container");
  const portraitColor = document.querySelector(".portrait-color");
  const hudSvg = document.getElementById("hud-svg");
  const sfxToggle = document.getElementById("sfx-toggle");
  const sfxBtnText = sfxToggle.querySelector(".hud-btn-text");
  const soundOnIcon = sfxToggle.querySelector(".sound-on");
  const soundOffIcon = sfxToggle.querySelector(".sound-off");

  // Relative coordinates (%) of active hotspots on the profile image
  const hotspots = {
    about: { x: 48, y: 55 },      // Core / Torso area (aligned with DNA card)
    education: { x: 55, y: 35 },  // Ears / Intellectual input area
    skills: { x: 50, y: 22 },     // Eyes / Cognitive matrix area
    projects: { x: 52, y: 68 },   // Hands / Compiler output area
    contact: { x: 46, y: 82 }     // Base coordinate
  };

  // Web Audio Synth State
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem("sfx_enabled") === "true";

  // Spotlight Physics Interpolation State (Set to 0px initial radius so it starts completely dark)
  let currentSpotlight = { x: 50, y: 50, radius: 0 };
  let targetSpotlight = { x: 50, y: 50, radius: 0 };
  
  let isHoveringElement = false;
  let isHoveringPortrait = false;
  let activeHotspotKey = null;

  // Initialize Audio Button UI state
  updateAudioButtonUI();

  // 2. WEB AUDIO SYNTHESIZER ENGINE (Pure Web Audio - No external assets!)
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSound(type) {
    if (!isSoundEnabled) return;
    initAudio();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    switch (type) {
      case "tick": {
        // High-pitch mechanical selector tick
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(4500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

        osc.start(now);
        osc.stop(now + 0.015);
        break;
      }
      
      case "hover": {
        // Soft synth sweep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.035);

        gain.gain.setValueAtTime(0.008, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case "lock": {
        // Futuristic target aquisition tone
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.type = "sine";
        osc2.type = "sine";
        
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.setValueAtTime(1600, now + 0.04);
        
        osc2.frequency.setValueAtTime(1800, now);
        osc2.frequency.setValueAtTime(2400, now + 0.04);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.setValueAtTime(0.006, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc1.start(now);
        osc2.start(now);
        
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
        break;
      }

      case "unlock": {
        // Target loss tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);

        gain.gain.setValueAtTime(0.006, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }
    }
  }

  // Audio Toggle Controller
  sfxToggle.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem("sfx_enabled", isSoundEnabled);
    updateAudioButtonUI();
    
    if (isSoundEnabled) {
      initAudio();
      playSound("lock");
    }
  });

  function updateAudioButtonUI() {
    if (isSoundEnabled) {
      soundOnIcon.style.display = "block";
      soundOffIcon.style.display = "none";
      sfxBtnText.textContent = "AUDIO: ON";
      sfxToggle.style.borderColor = "var(--color-accent)";
      sfxToggle.style.color = "var(--color-accent)";
    } else {
      soundOnIcon.style.display = "none";
      soundOffIcon.style.display = "block";
      sfxBtnText.textContent = "AUDIO: OFF";
      sfxToggle.style.borderColor = "rgba(255, 255, 255, 0.1)";
      sfxToggle.style.color = "var(--color-text-muted)";
    }
  }

  // 3. INTENTIONAL PORTRAIT HOVER TRACKING (Only activates when mouse is directly on the portrait!)
  if (portraitContainer) {
    portraitContainer.addEventListener("mouseenter", () => {
      if (isHoveringElement) return; // Hotspots take precedence
      isHoveringPortrait = true;
      targetSpotlight.radius = 120; // Activate cursor spotlight circle (px)
    });

    portraitContainer.addEventListener("mousemove", (e) => {
      if (isHoveringElement) return; // Hotspots take precedence
      
      // Calculate cursor coordinates relative to portrait container bounds
      const rect = portraitContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Convert to relative percentages
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      targetSpotlight.x = xPercent;
      targetSpotlight.y = yPercent;
      targetSpotlight.radius = 120;
    });

    portraitContainer.addEventListener("mouseleave", () => {
      isHoveringPortrait = false;
      if (!isHoveringElement) {
        targetSpotlight.radius = 0; // Turn off spotlight circle when leaving portrait area!
      }
    });
  }

  // 4. SNAPPY LIGHT BEAM INTERPOLATION (Brings snappiness score to 0.24, completely solving visual lag)
  function updateSpotlightPhysics() {
    currentSpotlight.x += (targetSpotlight.x - currentSpotlight.x) * 0.24;
    currentSpotlight.y += (targetSpotlight.y - currentSpotlight.y) * 0.24;
    currentSpotlight.radius += (targetSpotlight.radius - currentSpotlight.radius) * 0.26;

    // Apply values to CSS custom properties
    portraitColor.style.setProperty("--spotlight-x", `${currentSpotlight.x}%`);
    portraitColor.style.setProperty("--spotlight-y", `${currentSpotlight.y}%`);
    portraitColor.style.setProperty("--spotlight-radius", `${currentSpotlight.radius}px`);

    requestAnimationFrame(updateSpotlightPhysics);
  }
  
  requestAnimationFrame(updateSpotlightPhysics);


  // 5. UNIFIED 3D TILT & HOTSPOT HOVER OVERLAY
  interactiveElements.forEach(element => {
    
    // Hover Enter
    element.addEventListener("mouseenter", () => {
      isHoveringElement = true;
      playSound("hover");
      
      const hotspotKey = element.getAttribute("data-hotspot");
      if (hotspotKey && hotspots[hotspotKey]) {
        activeHotspotKey = hotspotKey;
        const spot = hotspots[hotspotKey];
        
        // Spotlight locks onto hotspot coordinates Snappily
        targetSpotlight.x = spot.x;
        targetSpotlight.y = spot.y;
        targetSpotlight.radius = 165; // Focused target lock radius
        
        // Draw HUD vector trace lines
        drawHudConnection(element, spot);
        playSound("lock");
      }
    });

    // 3D Mousemove Tilt Calculation
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      const rotateX = -((y / height) - 0.5) * 10;
      const rotateY = ((x / width) - 0.5) * 10;
      
      element.style.setProperty("--rx", `${rotateX}deg`);
      element.style.setProperty("--ry", `${rotateY}deg`);
      
      if (element.classList.contains("card")) {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      } else {
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      
      // Update HUD line dynamically as elements tilt slightly
      const hotspotKey = element.getAttribute("data-hotspot");
      if (hotspotKey && hotspots[hotspotKey]) {
        drawHudConnection(element, hotspots[hotspotKey]);
      }
    });

    // Hover Exit / Reset
    element.addEventListener("mouseleave", () => {
      isHoveringElement = false;
      activeHotspotKey = null;
      
      // Reset coordinates smoothly
      element.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, opacity 0.4s ease, filter 0.4s ease";
      element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      element.style.setProperty("--rx", `0deg`);
      element.style.setProperty("--ry", `0deg`);
      
      // Clear HUD Connection Line
      clearHudConnection();
      playSound("unlock");
      
      // Revert spotlight radius
      if (isHoveringPortrait) {
        targetSpotlight.radius = 120;
      } else {
        targetSpotlight.radius = 0; // Dissolve spotlight completely on blank grids!
      }
    });

    // Trigger tick sound on focus or click
    element.addEventListener("click", () => {
      playSound("tick");
    });
    
    element.addEventListener("focusin", () => {
      playSound("hover");
    });
  });


  // 6. DYNAMIC HUD SVG CONNECTION LAYER
  function drawHudConnection(element, hotspot) {
    if (!hudSvg || !portraitContainer) return;
    
    // Clear previous vector nodes
    hudSvg.innerHTML = "";

    const elRect = element.getBoundingClientRect();
    const portraitRect = portraitContainer.getBoundingClientRect();

    // 1. Calculate target hotspot coordinates in screen pixels
    const targetX = portraitRect.left + (hotspot.x / 100) * portraitRect.width;
    const targetY = portraitRect.top + (hotspot.y / 100) * portraitRect.height;

    // 2. Find closest attachment point on element border edge
    let startX, startY;
    
    if (elRect.right < targetX) {
      // Element is left of portrait
      startX = elRect.right - 8;
      startY = elRect.top + elRect.height / 2;
    } else if (elRect.left > targetX) {
      // Element is right of portrait
      startX = elRect.left + 8;
      startY = elRect.top + elRect.height / 2;
    } else {
      // Vertical stacking overlap
      startX = elRect.left + elRect.width / 2;
      startY = (elRect.bottom < targetY) ? elRect.bottom - 8 : elRect.top + 8;
    }

    // 3. Generate structured circuit trace coordinate path (with orthogonal angles)
    const midX = startX + (targetX - startX) * 0.45;
    const pathString = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${targetY} L ${targetX} ${targetY}`;

    // 4. Render glows & paths in overlay SVG
    const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glowPath.setAttribute("d", pathString);
    glowPath.setAttribute("class", "hud-line-glow");
    glowPath.setAttribute("fill", "none");
    
    const corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    corePath.setAttribute("d", pathString);
    corePath.setAttribute("class", "hud-line");
    corePath.setAttribute("fill", "none");

    // Dotted dash offset flow animation
    corePath.style.strokeDasharray = "8 6";
    corePath.style.strokeDashoffset = "0";
    
    let offset = 0;
    function animateDash() {
      if (!isHoveringElement || !activeHotspotKey) return;
      offset -= 0.75;
      corePath.style.strokeDashoffset = `${offset}px`;
      requestAnimationFrame(animateDash);
    }
    requestAnimationFrame(animateDash);

    // 5. Draw visual HUD target scanner rings
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const targetCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    targetCircle.setAttribute("cx", targetX);
    targetCircle.setAttribute("cy", targetY);
    targetCircle.setAttribute("class", "hud-target");
    
    const nodeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    nodeCircle.setAttribute("cx", targetX);
    nodeCircle.setAttribute("cy", targetY);
    nodeCircle.setAttribute("class", "hud-node");

    g.appendChild(targetCircle);
    g.appendChild(nodeCircle);
    
    hudSvg.appendChild(glowPath);
    hudSvg.appendChild(corePath);
    hudSvg.appendChild(g);
  }

  function clearHudConnection() {
    if (!hudSvg) return;
    
    const elements = hudSvg.querySelectorAll(".hud-line, .hud-line-glow, .hud-target, .hud-node");
    elements.forEach(el => {
      el.style.opacity = "0";
    });
    
    setTimeout(() => {
      if (!isHoveringElement) {
        hudSvg.innerHTML = "";
      }
    }, 400);
  }

  window.addEventListener("resize", () => {
    if (isHoveringElement && activeHotspotKey) {
      const activeEl = document.querySelector(`[data-hotspot="${activeHotspotKey}"]:hover`);
      if (activeEl) {
        drawHudConnection(activeEl, hotspots[activeHotspotKey]);
      }
    }
  });

});