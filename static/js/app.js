(function() {
  'use strict';

  /* -------------------------------------------------------------
     1. HERO ANIMATIONS: SVG ORGANIC RINGS & MULTILINGUAL SCRIPT
  ------------------------------------------------------------- */
  function initHeroAnimations() {
    function blob(rx, ry, seed, amp) {
      var n = 120, pts = [];
      for (var k = 0; k < n; k++) {
        var t = k / n * Math.PI * 2;
        var d = 1 + amp * (0.55 * Math.sin(2 * t + seed) + 0.3 * Math.sin(3 * t + seed * 1.7) + 0.2 * Math.sin(5 * t + seed * 0.6));
        pts.push([Math.cos(t) * rx * d, Math.sin(t) * ry * d]);
      }
      var s = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
      for (var k = 0; k < n; k++) {
        var p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
        s += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + "," +
             (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + "," +
             p2[0].toFixed(1) + " " + p2[1].toFixed(1);
      }
      return s + "Z";
    }

    var svg = document.getElementById("rings"), NS = "http://www.w3.org/2000/svg";
    if (svg) {
      var N = 12;
      svg.replaceChildren();
      for (var r = 0; r < N; r++) {
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", blob(330 + r * 38 + r * r * 4, 250 + r * 14 + r * r * 0.6, 1.1 + r * 0.28, 0.06 + r * 0.008));
        p.style.setProperty("--i", r);
        p.style.setProperty("--f", (r / (N - 1)).toFixed(3));
        svg.appendChild(p);
      }
    }

    var mark = document.querySelector("[data-ring]");
    if (mark) {
      mark.setAttribute("d", blob(44, 26, 1.1, 0.1));
    }

    var names = [
      ["ɪreːn", "en"],
      ["इरेन", "hi"],
      ["இரேன்", "ta"],
      ["ഇരേൻ", "ml"],
      ["ইরেন", "bn"],
      ["ಇರೇನ್", "kn"],
      ["ఇరేన్", "te"],
      ["ਇਰੇਨ", "pa"],
      ["ꯏꯔꯦꯟ", "mni"],
      ["ইৰেন", "as"],
      ["ଇରେନ୍", "or"],
      ["آئرین", "ur"],
      ["ઇરેન", "gu"]
    ];

    var el = document.getElementById("name");
    if (!el) return;

    var i = 0;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var viramas = "\u094D\u09CD\u0A4D\u0BCD\u0C4D\u0CCD\u0D4D\u0ACD\u0B4D";

    function letters(str) {
      var parts = window.Intl && Intl.Segmenter
        ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str), function(x) { return x.segment; })
        : (str.match(/\P{M}\p{M}*/gu) || [str]);
      var out = [];
      parts.forEach(function(p) {
        var prev = out[out.length - 1];
        if (prev && viramas.indexOf(prev.charAt(prev.length - 1)) > -1) {
          out[out.length - 1] = prev + p;
        } else {
          out.push(p);
        }
      });
      return out;
    }

    function build(str, lang, latin) {
      el.textContent = "";
      el.setAttribute("lang", lang);
      el.classList.toggle("latin", latin);
      return letters(str).map(function(ch) {
        var slot = document.createElement("span");
        slot.className = "ch";
        var inner = document.createElement("i");
        inner.textContent = ch;
        slot.appendChild(inner);
        el.appendChild(slot);
        return inner;
      });
    }

    function rollOut(nodes) {
      return Promise.all(nodes.map(function(n, k) {
        return n.animate([
          { transform: "perspective(500px) translateY(0) rotateX(0)", opacity: 1 },
          { transform: "perspective(500px) translateY(-120%) rotateX(70deg)", opacity: 0 }
        ], { duration: 560, delay: k * 70, easing: "cubic-bezier(.7,0,.84,0)", fill: "forwards" }).finished;
      }));
    }

    function rollIn(nodes) {
      return Promise.all(nodes.map(function(n, k) {
        return n.animate([
          { transform: "perspective(500px) translateY(120%) rotateX(-70deg)", opacity: 0 },
          { transform: "perspective(500px) translateY(-6%) rotateX(6deg)", opacity: 1, offset: 0.7 },
          { transform: "perspective(500px) translateY(0) rotateX(0)", opacity: 1 }
        ], { duration: 900, delay: k * 95, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }).finished;
      }));
    }

    var current = build(names[0][0], names[0][1], true);
    if (!reduce) {
      current.forEach(function(n) { n.style.opacity = 0; });
      rollIn(current).then(function() {
        current.forEach(function(n) { n.style.opacity = ""; });
      });
      var cycle = function() {
        setTimeout(function() {
          rollOut(current).then(function() {
            i = (i + 1) % names.length;
            current = build(names[i][0], names[i][1], i === 0);
            return rollIn(current);
          }).then(cycle);
        }, 3200);
      };
      setTimeout(cycle, 1500);
    }

    // Interactive 3D Spatial Tilt on Hero Section (High-Performance Dampened)
    var heroSection = document.getElementById("hero-section");
    var heroLockup = document.getElementById("hero-lockup");
    if (heroSection && heroLockup && !reduce) {
      var targetTiltX = 0, targetTiltY = 0;
      var currentTiltX = 0, currentTiltY = 0;
      var isHovered = false;
      var rafId = null;

      function updateTilt() {
        currentTiltX += (targetTiltX - currentTiltX) * 0.08;
        currentTiltY += (targetTiltY - currentTiltY) * 0.08;

        heroLockup.style.transform = "perspective(1200px) rotateX(" + currentTiltX.toFixed(2) + "deg) rotateY(" + currentTiltY.toFixed(2) + "deg)";

        var diffX = Math.abs(targetTiltX - currentTiltX);
        var diffY = Math.abs(targetTiltY - currentTiltY);

        // Only continue rAF loop while motion is settling
        if (diffX > 0.02 || diffY > 0.02) {
          rafId = requestAnimationFrame(updateTilt);
        } else {
          currentTiltX = targetTiltX;
          currentTiltY = targetTiltY;
          if (!isHovered && currentTiltX === 0 && currentTiltY === 0) {
            heroLockup.style.transform = "";
          } else {
            heroLockup.style.transform = "perspective(1200px) rotateX(" + currentTiltX.toFixed(2) + "deg) rotateY(" + currentTiltY.toFixed(2) + "deg)";
          }
          rafId = null;
        }
      }

      heroSection.addEventListener("mousemove", function(e) {
        var rect = heroSection.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        targetTiltX = -y * 6;
        targetTiltY = x * 8;
        isHovered = true;
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
      }, { passive: true });

      heroSection.addEventListener("mouseleave", function() {
        targetTiltX = 0;
        targetTiltY = 0;
        isHovered = false;
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
      });
    }
  }

  /* -------------------------------------------------------------
     2. DATA LOADER UTILITIES
  ------------------------------------------------------------- */
  async function fetchJSON(path) {
    try {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${path}`);
      return await resp.json();
    } catch (err) {
      console.error("Error loading JSON:", path, err);
      return null;
    }
  }

  /* -------------------------------------------------------------
     PEOPLE MULTI-LINK & PLATFORM DETECTOR
  ------------------------------------------------------------- */
  const PERSON_PLATFORMS = [
    {
      id: "linkedin",
      name: "LinkedIn",
      match: /linkedin\.com/i,
      color: "#0A66C2",
      icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.38 9.74v-8.37H5.08v8.37h2.76Z"/></svg>`
    },
    {
      id: "github",
      name: "GitHub",
      match: /github\.com/i,
      color: "#24292e",
      icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
    },
    {
      id: "scholar",
      name: "Google Scholar",
      match: /scholar\.google/i,
      color: "#4285F4",
      icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 3 1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z"/></svg>`
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      match: /(x\.com|twitter\.com)/i,
      color: "#000000",
      icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    },
    {
      id: "huggingface",
      name: "Hugging Face",
      match: /huggingface\.co/i,
      color: "#D97706",
      icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm-3.5 6a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 8.5 8zm7 0a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5zm-3.5 9.5c-2.33 0-4.32-1.45-5.12-3.5h10.24c-.8 2.05-2.79 3.5-5.12 3.5z"/></svg>`
    },
    {
      id: "orcid",
      name: "ORCID",
      match: /orcid\.org/i,
      color: "#A6CE39",
      icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.516.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/></svg>`
    },
    {
      id: "researchgate",
      name: "ResearchGate",
      match: /researchgate\.net/i,
      color: "#00CCBB",
      icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19.586 0c-.818 0-1.508.19-2.072.565-.563.377-.97.936-1.213 1.68-.101.313-.175.665-.221 1.054-.047.389-.07.795-.07 1.216v.636h-4.382v-1.74c0-.421-.023-.827-.07-1.216-.046-.389-.12-.741-.221-1.054-.243-.744-.65-1.303-1.213-1.68C9.56 0.19 8.87 0 8.052 0H1v24h6.052c.818 0 1.508-.19 2.072-.565.563-.377.97-.936 1.213-1.68.101-.313.175-.665.221-1.054.047-.389.07-.795.07-1.216v-.636h4.382v1.74c0 .421.023.827.07 1.216.046.389.12.741.221 1.054.243.744.65 1.303 1.213 1.68.564.375 1.254.565 2.072.565H23V0h-3.414z"/></svg>`
    }
  ];

  function parsePersonLinks(urlInput) {
    if (!urlInput) return [];
    let rawLinks = [];
    if (Array.isArray(urlInput)) {
      rawLinks = urlInput;
    } else if (typeof urlInput === "string") {
      rawLinks = urlInput.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean);
    }

    const results = [];
    rawLinks.forEach(raw => {
      let clean = raw.trim();
      if (!clean || clean === "https://example.org" || clean === "http://example.org") return;
      if (!/^https?:\/\//i.test(clean)) {
        clean = "https://" + clean;
      }
      try {
        const u = new URL(clean);
        const host = u.hostname.toLowerCase();
        let matched = PERSON_PLATFORMS.find(p => p.match.test(host));
        if (matched) {
          results.push({
            url: clean,
            label: matched.name,
            platform: matched.id,
            color: matched.color,
            icon: matched.icon
          });
        } else {
          let label = "Website";
          const displayHost = host.replace(/^www\./, "");
          if (displayHost) {
            label = displayHost;
          }
          results.push({
            url: clean,
            label: label,
            platform: "website",
            color: "#2F56C8",
            icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
          });
        }
      } catch (err) {
        results.push({
          url: clean,
          label: "Profile",
          platform: "website",
          color: "#2F56C8",
          icon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`
        });
      }
    });

    return results;
  }

  let activePopoverTrigger = null;
  let popoverTimer = null;
  let lastOpenTime = 0;

  function safeEscapeHTML(str) {
    return String(str || "").replace(/[&<>'"]/g, tag => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    }[tag] || tag));
  }

  function getOrCreatePopover() {
    let backdrop = document.getElementById("popover-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "popover-backdrop";
      backdrop.className = "popover-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }

    let popover = document.getElementById("person-links-popover");
    if (!popover) {
      popover = document.createElement("div");
      popover.id = "person-links-popover";
      popover.className = "person-links-popover";
      popover.setAttribute("role", "dialog");
      popover.setAttribute("aria-hidden", "true");
      document.body.appendChild(popover);
    }

    if (!popover.dataset.initialized) {
      popover.dataset.initialized = "true";

      backdrop.addEventListener("click", () => hidePersonLinksPopover(0));

      popover.addEventListener("mouseenter", () => clearTimeout(popoverTimer));
      popover.addEventListener("mouseleave", () => {
        if (window.innerWidth > 640) hidePersonLinksPopover(220);
      });

      document.addEventListener("click", (e) => {
        if (!popover.classList.contains("is-visible")) return;
        if (
          !popover.contains(e.target) &&
          (!activePopoverTrigger || !activePopoverTrigger.contains(e.target))
        ) {
          hidePersonLinksPopover(0);
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hidePersonLinksPopover(0);
      });

      window.addEventListener("scroll", () => {
        // On mobile bottom sheets, prevent micro-scrolls from dismissing dialog
        if (window.innerWidth > 640) hidePersonLinksPopover(0);
      }, { passive: true });

      // Dismiss floating desktop popover if people horizontal sliders scroll
      window.addEventListener("resize", () => {
        if (popover.classList.contains("is-visible")) {
          hidePersonLinksPopover(0);
        }
      });
    }
    return popover;
  }

  function showPersonLinksPopover(triggerEl, person, links) {
    clearTimeout(popoverTimer);
    lastOpenTime = Date.now();
    const popover = getOrCreatePopover();
    const backdrop = document.getElementById("popover-backdrop");

    if (activePopoverTrigger && activePopoverTrigger !== triggerEl) {
      activePopoverTrigger.classList.remove("is-active");
    }

    activePopoverTrigger = triggerEl;
    triggerEl.classList.add("is-active");

    const isMobile = window.innerWidth <= 640;

    popover.innerHTML = `
      <div class="popover-sheet-handle" aria-hidden="true"></div>
      <div class="popover-sheet-header">
        <div class="popover-sheet-name">${safeEscapeHTML(person.name)}</div>
        ${person.affiliation ? `<div class="popover-sheet-affil">${safeEscapeHTML(person.affiliation)}</div>` : ""}
      </div>
      <div class="popover-list">
        ${links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="popover-item platform-${l.platform}">
            <span class="popover-item-icon" style="color: ${l.color};">${l.icon}</span>
            <div class="popover-item-content">
              <span class="popover-item-label">${l.label}</span>
              <span class="popover-item-sub">Open profile</span>
            </div>
            <svg class="popover-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
          </a>
        `).join("")}
      </div>
      <button type="button" class="popover-sheet-close" id="popover-sheet-close">Cancel</button>
    `;

    const closeBtn = popover.querySelector("#popover-sheet-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => hidePersonLinksPopover(0));
    }

    popover.setAttribute("aria-hidden", "false");
    popover.classList.add("is-visible");

    if (isMobile) {
      if (backdrop) backdrop.classList.add("is-visible");
      document.body.style.overflow = "hidden";
      popover.style.left = "";
      popover.style.top = "";
    } else {
      if (backdrop) backdrop.classList.remove("is-visible");
      document.body.style.overflow = "";

      // Desktop: Position popover relative to trigger element
      const rect = triggerEl.getBoundingClientRect();
      const popoverWidth = 190;
      let left = rect.right - popoverWidth;
      if (left < 12) left = 12;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }

      const estimatedHeight = 16 + links.length * 40;
      let top = rect.bottom + 8;
      if (top + estimatedHeight > window.innerHeight - 12) {
        top = Math.max(12, rect.top - estimatedHeight - 8);
      }

      popover.style.left = `${Math.round(left)}px`;
      popover.style.top = `${Math.round(top)}px`;
    }
  }

  function hidePersonLinksPopover(delay = 200) {
    clearTimeout(popoverTimer);
    const popover = document.getElementById("person-links-popover");
    const backdrop = document.getElementById("popover-backdrop");
    if (!popover) return;

    const doHide = () => {
      popover.classList.remove("is-visible");
      popover.setAttribute("aria-hidden", "true");
      if (backdrop) backdrop.classList.remove("is-visible");
      document.body.style.overflow = "";
      if (activePopoverTrigger) {
        activePopoverTrigger.classList.remove("is-active");
        activePopoverTrigger = null;
      }
    };

    if (delay > 0) {
      popoverTimer = setTimeout(doHide, delay);
    } else {
      doHide();
    }
  }

  function createPersonCard(person) {
    const card = document.createElement("div");
    card.className = "person-card";
    if (person.id) {
      card.id = `person-${person.id}`;
      card.dataset.personId = person.id;
    }

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");

    if (person.photo && person.photo.trim() !== "") {
      const img = document.createElement("img");
      img.src = person.photo;
      img.alt = person.name;
      avatar.appendChild(img);
    } else {
      avatar.textContent = person.initials || person.name.slice(0, 2).toUpperCase();
    }

    const info = document.createElement("div");
    info.className = "person-info";

    const nameEl = document.createElement("strong");
    const affil = document.createElement("span");
    affil.className = "affiliation";
    affil.textContent = person.affiliation;

    info.appendChild(nameEl);
    info.appendChild(affil);

    card.appendChild(avatar);
    card.appendChild(info);

    const links = parsePersonLinks(person.url);

    if (links.length === 1) {
      const link = document.createElement("a");
      link.href = links[0].url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = person.name;
      nameEl.appendChild(link);

      const arrow = document.createElement("a");
      arrow.className = "person-link-icon";
      arrow.href = links[0].url;
      arrow.target = "_blank";
      arrow.rel = "noopener noreferrer";
      arrow.setAttribute("aria-label", `Visit ${person.name}'s ${links[0].label}`);
      arrow.setAttribute("title", `Visit ${links[0].label}`);
      arrow.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
      card.appendChild(arrow);
    } else if (links.length > 1) {
      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "person-name-btn";
      nameBtn.textContent = person.name;
      nameEl.appendChild(nameBtn);

      const arrowBtn = document.createElement("button");
      arrowBtn.type = "button";
      arrowBtn.className = "person-link-icon has-multi-links";
      arrowBtn.setAttribute("aria-label", `Profiles for ${person.name}`);
      arrowBtn.setAttribute("title", `${links.length} profiles available`);
      arrowBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span class="multi-count-dot">${links.length}</span>
      `;
      card.appendChild(arrowBtn);

      const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      const toggleMenu = (e) => {
        if (e) e.stopPropagation();
        const popover = document.getElementById("person-links-popover");
        const isVisible = popover && popover.classList.contains("is-visible");

        // Debounce touch tap against synthetic mouseenter on touch devices
        if (isVisible && activePopoverTrigger === arrowBtn && (Date.now() - lastOpenTime > 300)) {
          hidePersonLinksPopover(0);
        } else if (!isVisible || activePopoverTrigger !== arrowBtn) {
          showPersonLinksPopover(arrowBtn, person, links);
        }
      };

      arrowBtn.addEventListener("click", toggleMenu);
      nameBtn.addEventListener("click", toggleMenu);

      card.addEventListener("click", (e) => {
        if (!e.target.closest("button, a")) {
          toggleMenu(e);
        }
      });

      // Only bind hover preview listeners on desktop devices with precision pointer
      if (hasHover) {
        arrowBtn.addEventListener("mouseenter", () => showPersonLinksPopover(arrowBtn, person, links));
        arrowBtn.addEventListener("mouseleave", () => hidePersonLinksPopover(250));
        nameBtn.addEventListener("mouseenter", () => showPersonLinksPopover(arrowBtn, person, links));
        nameBtn.addEventListener("mouseleave", () => hidePersonLinksPopover(250));
      }
    } else {
      nameEl.textContent = person.name;
    }

    return card;
  }

  function setupSliderControls(track, prevBtn, nextBtn) {
    if (!track || !prevBtn || !nextBtn) return;

    function updateBtnState() {
      prevBtn.disabled = track.scrollLeft <= 5;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    }

    prevBtn.addEventListener("click", () => {
      const scrollAmount = track.clientWidth * 0.75;
      track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      const scrollAmount = track.clientWidth * 0.75;
      track.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    track.addEventListener("scroll", updateBtnState, { passive: true });
    // Initial check
    setTimeout(updateBtnState, 200);
  }

  /* -------------------------------------------------------------
     3. RENDERERS
  ------------------------------------------------------------- */

  // About Section Narrative Hydration
  async function renderAbout() {
    const data = await fetchJSON("data/research.json");
    if (!data) return;

    const aboutLead = document.getElementById("about-lead");
    if (aboutLead && data.about && data.about.lead) {
      aboutLead.innerHTML = data.about.lead;
    }

    const aboutTech = document.getElementById("about-tech");
    if (aboutTech && data.about && data.about.technology) {
      aboutTech.innerHTML = data.about.technology;
    }

    const aboutCoalition = document.getElementById("about-coalition");
    if (aboutCoalition && data.about && data.about.coalition) {
      const textElem = aboutCoalition.querySelector(".coalition-text") || aboutCoalition.querySelector(".coalition-glass-text") || aboutCoalition;
      textElem.innerHTML = `<strong><span class="iren-name">ɪreːn</span></strong> ${data.about.coalition.replace(/^ɪreːn\s*/, "")}`;
    }
  }

  // Aim & Objectives Section Hydration
  async function renderObjectives() {
    let data = await fetchJSON("data/objectives.json");
    if (!data) {
      data = await fetchJSON("data/research.json");
    }
    if (!data) return;

    // Hydrate Aim
    const aimText = document.getElementById("aim-text");
    if (aimText && data.aim) {
      aimText.textContent = data.aim.description || data.aim.statement;
    }

    // Hydrate Objectives Grid
    const objectivesContainer = document.getElementById("objectives-container");
    if (objectivesContainer && data.objectives && Array.isArray(data.objectives)) {
      objectivesContainer.replaceChildren();
      data.objectives.forEach((obj, idx) => {
        const li = document.createElement("li");
        li.className = "objective-card-item";
        const num = String(obj.id || idx + 1).padStart(2, "0");
        li.innerHTML = `
          <div class="obj-num" aria-hidden="true">${num}</div>
          <div class="obj-body">
            <h4 class="obj-title">${obj.title}</h4>
            <p class="obj-text">${obj.description}</p>
          </div>
        `;
        objectivesContainer.appendChild(li);
      });
    }
  }

  // People Section with Apple-First 2-Row Layout & Segmented Control
  async function renderPeople() {
    const people = await fetchJSON("data/people.json");
    const container = document.getElementById("people-container");
    if (!people || !container) return;

    container.replaceChildren();

    // 4 Curated Groups in Apple UI style
    const groups = [
      {
        id: "leadership",
        title: "Leadership & Faculty Advisors",
        members: people.filter(p => p.group === "Lead and Coordinator" || p.group === "Faculty Advisors"),
        rows: 1,
        canScroll: false
      },
      {
        id: "core-team",
        title: "Core Research Team",
        members: people.filter(p => p.group === "Research Team" && p.subgroup === "Core team"),
        rows: 2,
        canScroll: false
      },
      {
        id: "researchers",
        title: "Researchers",
        members: people.filter(p => p.group === "Research Team" && p.subgroup === "Researchers"),
        rows: 2,
        canScroll: true
      },
      {
        id: "past-members",
        title: "Past Members",
        members: people.filter(p => p.group === "Past members" || p.role === "Past member" || p.role === "Alumni"),
        rows: 1,
        canScroll: false
      }
    ];

    // 1. Apple-style Segmented Control Filter at top
    const segControl = document.createElement("div");
    segControl.className = "apple-segmented-control";
    segControl.innerHTML = `
      <button class="seg-btn active" data-target="all">All (${people.length})</button>
      <button class="seg-btn" data-target="leadership">Leadership & Advisors</button>
      <button class="seg-btn" data-target="core-team">Core Team</button>
      <button class="seg-btn" data-target="researchers">Researchers</button>
      <button class="seg-btn" data-target="past-members">Past Members</button>
    `;
    container.appendChild(segControl);

    const groupsWrapper = document.createElement("div");
    groupsWrapper.className = "people-groups-wrapper";
    container.appendChild(groupsWrapper);

    groups.forEach(g => {
      if (g.members.length === 0) return;

      const groupSection = document.createElement("div");
      groupSection.className = "apple-group-section";
      groupSection.id = `group-${g.id}`;
      groupSection.setAttribute("data-group", g.id);

      // Header row
      const header = document.createElement("div");
      header.className = "apple-group-header";

      const titleDiv = document.createElement("div");
      titleDiv.className = "apple-group-title";
      titleDiv.innerHTML = `<h3>${g.title}</h3><span class="apple-count-badge">${g.members.length}</span>`;
      header.appendChild(titleDiv);

      let arrowsDiv = null;
      if (g.canScroll || g.members.length > 6) {
        arrowsDiv = document.createElement("div");
        arrowsDiv.className = "apple-nav-arrows";
        arrowsDiv.innerHTML = `
          <button class="apple-arrow-btn prev" aria-label="Previous">‹</button>
          <button class="apple-arrow-btn next" aria-label="Next">›</button>
        `;
        header.appendChild(arrowsDiv);
      }

      groupSection.appendChild(header);

      // 1-row or 2-row track based on group configuration
      const track = document.createElement("div");
      track.className = g.rows === 1 ? "people-track-1row" : "people-track-2row";

      g.members.forEach(person => {
        track.appendChild(createPersonCard(person));
      });

      groupSection.appendChild(track);
      groupsWrapper.appendChild(groupSection);

      if (arrowsDiv) {
        setupSliderControls(track, arrowsDiv.querySelector(".prev"), arrowsDiv.querySelector(".next"));
      }
    });

    // Segmented control click handlers
    const segBtns = segControl.querySelectorAll(".seg-btn");
    const allGroupSections = groupsWrapper.querySelectorAll(".apple-group-section");

    segBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        segBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-target");

        allGroupSections.forEach(sec => {
          if (target === "all" || sec.getAttribute("data-group") === target) {
            sec.style.display = "block";
          } else {
            sec.style.display = "none";
          }
        });
      });
    });
  }

  // Publications Section with Glassmorphism, Multi-Facet Dynamic Filtering, and Stable Viewport
  async function renderPublications() {
    const pubs = await fetchJSON("data/publications.json");
    const container = document.getElementById("pubs-container");
    const filterContainer = document.getElementById("pub-filter-bar");
    const paginationWrapper = document.getElementById("pub-pagination-wrapper");
    const yearSelect = document.getElementById("facet-year");
    const areaSelect = document.getElementById("facet-area");
    const venueSelect = document.getElementById("facet-venue");
    const applyBtn = document.getElementById("facet-apply-btn");
    const resetBtn = document.getElementById("facet-reset-btn");

    if (!pubs || !container) return;

    let currentKindFilter = "all";
    let selectedYear = "all";
    let selectedArea = "all";
    let selectedVenue = "all";
    let currentPage = 1;
    const ITEMS_PER_PAGE = 3; // Exactly 3 rows max per page

    const KIND_LABELS = {
      paper: "Papers",
      software: "Software & Demos",
      dataset: "Datasets",
      preprint: "Preprints",
      report: "Reports"
    };

    // Calculate dynamic kind counts from actual publications data
    const kindCounts = {};
    pubs.forEach(p => {
      const k = (p.kind || "paper").toLowerCase().trim();
      kindCounts[k] = (kindCounts[k] || 0) + 1;
    });

    // Only include categories that exist in data and have count > 0
    const availableKinds = Object.keys(kindCounts).filter(k => kindCounts[k] > 0);

    // Build filter capsule bar dynamically
    if (filterContainer) {
      const allBtn = `<button type="button" class="pub-filter-btn active" data-filter="all">All (${pubs.length})</button>`;
      const kindBtns = availableKinds.map(k => {
        const label = KIND_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1));
        return `<button type="button" class="pub-filter-btn" data-filter="${k}">${label} (${kindCounts[k]})</button>`;
      }).join("");

      filterContainer.innerHTML = allBtn + kindBtns;

      filterContainer.querySelectorAll(".pub-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          filterContainer.querySelectorAll(".pub-filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentKindFilter = btn.getAttribute("data-filter");
          applyFilterWithStableScroll(btn);
        });
      });
    }

    // Dynamically parse unique Years from data (sorted descending)
    const years = [...new Set(pubs.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
    if (yearSelect) {
      yearSelect.innerHTML = `<option value="all">All Years</option>` +
        years.map(y => `<option value="${y}">${y}</option>`).join("");
    }

    // Dynamically parse unique Research Areas from data (sorted alphabetically)
    const areas = [...new Set(pubs.flatMap(p => {
      if (!p.area) return [];
      return Array.isArray(p.area) ? p.area : [p.area];
    }).filter(Boolean))].sort();
    if (areaSelect) {
      areaSelect.innerHTML = `<option value="all">All Areas</option>` +
        areas.map(a => `<option value="${a}">${a}</option>`).join("");
    }

    // Dynamically parse unique Venues / Conferences from data (sorted alphabetically)
    const venues = [...new Set(pubs.map(p => p.venueShort || p.conference).filter(Boolean))].sort();
    if (venueSelect) {
      venueSelect.innerHTML = `<option value="all">All Venues</option>` +
        venues.map(v => `<option value="${v}">${v}</option>`).join("");
    }

    // Helper: Execute filtering while keeping the clicked control locked exactly under the mouse cursor
    function applyFilterWithStableScroll(anchorEl, resetPage = true) {
      if (resetPage) currentPage = 1;
      const rectBefore = anchorEl ? anchorEl.getBoundingClientRect() : null;
      updateView();
      if (rectBefore) {
        const rectAfter = anchorEl.getBoundingClientRect();
        const drift = rectAfter.top - rectBefore.top;
        if (Math.abs(drift) > 0.5) {
          window.scrollBy({ top: drift, behavior: "instant" });
        }
      }
    }

    // Wire up dynamic dropdown change events
    [yearSelect, areaSelect, venueSelect].forEach(sel => {
      if (!sel) return;
      sel.addEventListener("change", () => {
        selectedYear = yearSelect ? yearSelect.value : "all";
        selectedArea = areaSelect ? areaSelect.value : "all";
        selectedVenue = venueSelect ? venueSelect.value : "all";
        applyFilterWithStableScroll(sel);
      });
    });

    // Wire up Apply button
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        selectedYear = yearSelect ? yearSelect.value : "all";
        selectedArea = areaSelect ? areaSelect.value : "all";
        selectedVenue = venueSelect ? venueSelect.value : "all";
        applyFilterWithStableScroll(applyBtn);
      });
    }

    // Wire up Reset button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        currentKindFilter = "all";
        selectedYear = "all";
        selectedArea = "all";
        selectedVenue = "all";
        if (yearSelect) yearSelect.value = "all";
        if (areaSelect) areaSelect.value = "all";
        if (venueSelect) venueSelect.value = "all";
        if (filterContainer) {
          filterContainer.querySelectorAll(".pub-filter-btn").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-filter") === "all");
          });
        }
        applyFilterWithStableScroll(resetBtn);
      });
    }

    function createPubCard(pub) {
      const card = document.createElement("article");
      card.className = "pub-card";

      // Meta row: Year badge + Kind badge + Research Area badge
      const kindLabel = pub.kind === "software" ? "Software & Demo" : (pub.kind === "dataset" ? "Dataset" : "Paper");
      const kindClass = `pub-kind-${pub.kind || "paper"}`;
      const areaBadge = pub.area ? `<span class="pub-area-badge">${pub.area}</span>` : "";

      const metaRow = document.createElement("div");
      metaRow.className = "pub-meta-row";
      metaRow.innerHTML = `
        <span class="pub-year-badge">${pub.year}</span>
        <span class="pub-kind-badge ${kindClass}">${kindLabel}</span>
        ${areaBadge}
      `;

      // Title
      const title = document.createElement("h3");
      title.className = "pub-title";
      title.textContent = pub.title;

      // Authors
      const authors = document.createElement("div");
      authors.className = "pub-authors";
      authors.textContent = pub.authors;

      // Venue
      const venue = document.createElement("div");
      venue.className = "pub-venue";
      venue.innerHTML = `<em>${pub.venue}</em>`;

      card.appendChild(metaRow);
      card.appendChild(title);
      card.appendChild(authors);
      card.appendChild(venue);

      if (pub.note) {
        const note = document.createElement("div");
        note.className = "pub-note";
        note.textContent = pub.note;
        card.appendChild(note);
      }

      // Link Chips
      if (pub.links && pub.links.length > 0) {
        const linksDiv = document.createElement("div");
        linksDiv.className = "pub-links";
        pub.links.forEach(l => {
          const a = document.createElement("a");
          a.className = "pub-chip";
          a.href = l.url;
          if (l.url !== "#") {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }
          a.innerHTML = `<span>${l.label}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
          linksDiv.appendChild(a);
        });
        card.appendChild(linksDiv);
      }

      return card;
    }

    function renderPagination(totalItems, pageWrapper) {
      if (!pageWrapper) return;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

      if (totalPages <= 1) {
        pageWrapper.innerHTML = `
          <div class="pub-pagination-info">Showing all ${totalItems} publication${totalItems === 1 ? '' : 's'}</div>
        `;
        return;
      }

      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
      const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

      let buttonsHtml = `
        <button class="pub-page-btn pub-page-nav-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">‹ Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="pub-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }

      buttonsHtml += `
        <button class="pub-page-btn pub-page-nav-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">Next ›</button>
      `;

      pageWrapper.innerHTML = `
        <div class="pub-pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} publications</div>
        <div class="pub-pagination-controls">${buttonsHtml}</div>
      `;

      // Event Listeners for Prev, Next and Page Numbers with stable viewport anchoring
      const prevBtn = pageWrapper.querySelector(".prev-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            applyFilterWithStableScroll(prevBtn, false);
          }
        });
      }

      const nextBtn = pageWrapper.querySelector(".next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            applyFilterWithStableScroll(nextBtn, false);
          }
        });
      }

      pageWrapper.querySelectorAll(".pub-page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          applyFilterWithStableScroll(btn, false);
        });
      });
    }

    function updateView() {
      const filtered = pubs.filter(p => {
        // Tier 1: Kind
        if (currentKindFilter !== "all") {
          const k = (p.kind || "paper").toLowerCase().trim();
          if (k !== currentKindFilter.toLowerCase()) return false;
        }
        // Tier 2: Year
        if (selectedYear !== "all" && String(p.year) !== selectedYear) {
          return false;
        }
        // Tier 2: Area
        if (selectedArea !== "all") {
          const pAreas = Array.isArray(p.area) ? p.area : [p.area];
          if (!pAreas.some(a => a && a.toLowerCase() === selectedArea.toLowerCase())) {
            return false;
          }
        }
        // Tier 2: Venue
        if (selectedVenue !== "all") {
          const vShort = (p.venueShort || "").toLowerCase();
          const vFull = (p.venue || "").toLowerCase();
          const target = selectedVenue.toLowerCase();
          if (!vShort.includes(target) && !vFull.includes(target)) {
            return false;
          }
        }
        return true;
      });

      // Update Reset button active state
      const isFiltered = currentKindFilter !== "all" || selectedYear !== "all" || selectedArea !== "all" || selectedVenue !== "all";
      if (resetBtn) {
        resetBtn.classList.toggle("is-active", isFiltered);
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      container.replaceChildren();

      if (pageItems.length === 0) {
        const empty = document.createElement("div");
        empty.className = "pub-empty";
        empty.style.cssText = "padding: 36px 20px; text-align: center; color: var(--ink-soft); font-family: var(--sans);";
        empty.innerHTML = `
          <p style="font-size: 1.05rem; margin-bottom: 8px; color: var(--ink);">No publications match your selected filters.</p>
          <p style="font-size: 0.88rem; margin: 0;">Try resetting the filters or selecting a different year, area, or venue.</p>
        `;
        container.appendChild(empty);
      } else {
        pageItems.forEach(pub => {
          container.appendChild(createPubCard(pub));
        });
      }

      renderPagination(totalItems, paginationWrapper);
    }

    // Initial render
    updateView();
  }

  // Tools Section with Apple Glassmorphic Cards, Category Filtering, and 1-row Pagination
  async function renderTools() {
    const tools = await fetchJSON("data/tools.json");
    const container = document.getElementById("tools-container");
    const filterContainer = document.getElementById("tools-filter-bar");
    const paginationWrapper = document.getElementById("tools-pagination-wrapper");
    if (!tools || !container) return;

    let currentCategory = "all";
    let currentPage = 1;
    const TOOLS_PER_PAGE = 3; // Exactly 1 row (3 columns × 1 row = 3 items per page)

    // SVG icon mapping
    const icons = {
      sliders: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
      translate: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      mic: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
      chart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      code: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      waveform: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"/></svg>`
    };

    // Calculate category counts dynamically from actual tools data
    const categoryCounts = {};
    tools.forEach(t => {
      const cat = (t.category || "Platforms").trim();
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    // Only include categories that exist in data and have count > 0
    const availableCategories = Object.keys(categoryCounts).filter(c => categoryCounts[c] > 0);

    function applyToolsFilterWithStableScroll(anchorEl, resetPage = true) {
      if (resetPage) currentPage = 1;
      const rectBefore = anchorEl ? anchorEl.getBoundingClientRect() : null;
      updateToolsView();
      if (rectBefore) {
        const rectAfter = anchorEl.getBoundingClientRect();
        const drift = rectAfter.top - rectBefore.top;
        if (Math.abs(drift) > 0.5) {
          window.scrollBy({ top: drift, behavior: "instant" });
        }
      }
    }

    // Build filter capsule bar dynamically (only show if multiple categories exist)
    if (filterContainer) {
      if (availableCategories.length <= 1) {
        filterContainer.style.display = "none";
        filterContainer.replaceChildren();
      } else {
        filterContainer.style.display = "inline-flex";
        const allBtn = `<button type="button" class="tool-filter-btn ${currentCategory === "all" ? "active" : ""}" data-category="all">All (${tools.length})</button>`;
        const catBtns = availableCategories.map(cat => {
          const count = categoryCounts[cat];
          const isActive = cat === currentCategory ? "active" : "";
          return `<button type="button" class="tool-filter-btn ${isActive}" data-category="${cat}">${cat} (${count})</button>`;
        }).join("");

        filterContainer.innerHTML = allBtn + catBtns;

        filterContainer.querySelectorAll(".tool-filter-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            filterContainer.querySelectorAll(".tool-filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category");
            applyToolsFilterWithStableScroll(btn);
          });
        });
      }
    }

    function createToolCard(tool) {
      const card = document.createElement("article");
      card.className = "tool-card";

      const iconSvg = icons[tool.icon] || icons.sliders;
      const statusBadge = tool.status ? `<span class="tool-status-badge">${tool.status}</span>` : "";

      const tagsHtml = tool.tags 
        ? `<ul class="tool-tags">${tool.tags.map(t => `<li>${t}</li>`).join("")}</ul>`
        : "";

      const actionsHtml = tool.links ? tool.links.map(l => {
        const isExt = l.url && l.url !== "#";
        const targetAttr = isExt ? `target="_blank" rel="noopener noreferrer"` : "";
        const iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`;
        if (l.primary) {
          return `<a class="tool-btn-primary" href="${l.url}" ${targetAttr}><span>${l.label}</span>${iconSvg}</a>`;
        }
        return `<a class="tool-btn-secondary" href="${l.url}" ${targetAttr}>${l.label}</a>`;
      }).join("") : "";

      card.innerHTML = `
        <div>
          <div class="tool-header-row">
            <div class="tool-icon-badge" aria-hidden="true">${iconSvg}</div>
            ${statusBadge}
          </div>
          <h3 class="tool-title">${tool.name}</h3>
          <div class="tool-tagline">${tool.tagline || ""}</div>
          <p>${tool.description}</p>
          ${tagsHtml}
        </div>
        <div class="tool-actions">${actionsHtml}</div>
      `;

      return card;
    }

    function renderToolsPagination(totalItems, pageWrapper) {
      if (!pageWrapper) return;
      const totalPages = Math.ceil(totalItems / TOOLS_PER_PAGE);

      if (totalPages <= 1) {
        if (totalItems > 1) {
          pageWrapper.innerHTML = `
            <div class="tools-pagination-info">Showing all ${totalItems} tools</div>
          `;
        } else {
          pageWrapper.replaceChildren();
        }
        return;
      }

      const startIdx = (currentPage - 1) * TOOLS_PER_PAGE + 1;
      const endIdx = Math.min(currentPage * TOOLS_PER_PAGE, totalItems);

      let buttonsHtml = `
        <button class="tool-page-btn tool-page-nav-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">‹ Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="tool-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }

      buttonsHtml += `
        <button class="tool-page-btn tool-page-nav-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">Next ›</button>
      `;

      pageWrapper.innerHTML = `
        <div class="tools-pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} tools</div>
        <div class="tools-pagination-controls">${buttonsHtml}</div>
      `;

      const prevBtn = pageWrapper.querySelector(".prev-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            applyToolsFilterWithStableScroll(prevBtn, false);
          }
        });
      }

      const nextBtn = pageWrapper.querySelector(".next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            applyToolsFilterWithStableScroll(nextBtn, false);
          }
        });
      }

      pageWrapper.querySelectorAll(".tool-page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          applyToolsFilterWithStableScroll(btn, false);
        });
      });
    }

    function updateToolsView() {
      const filtered = tools.filter(t => {
        if (currentCategory === "all") return true;
        return (t.category || "Platforms").trim().toLowerCase() === currentCategory.toLowerCase();
      });

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / TOOLS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
      const pageItems = filtered.slice(startIndex, startIndex + TOOLS_PER_PAGE);

      container.replaceChildren();

      if (pageItems.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "padding: 32px; text-align: center; color: var(--ink-soft); grid-column: 1 / -1;";
        empty.textContent = "No tools found in this category.";
        container.appendChild(empty);
      } else {
        pageItems.forEach(tool => {
          container.appendChild(createToolCard(tool));
        });
      }

      renderToolsPagination(totalItems, paginationWrapper);
    }

    // Initial render
    updateToolsView();
  }

  // News Section - 1-Column Feed with Max 5 Rows & Apple Glassmorphism
  async function renderNews() {
    const news = await fetchJSON("data/news.json");
    const container = document.getElementById("news-container");
    const paginationWrapper = document.getElementById("news-pagination-wrapper");
    if (!news || !container) return;

    let currentPage = 1;
    const NEWS_PER_PAGE = 5; // Max 5 rows news per page

    function createNewsRow(item) {
      const row = document.createElement("article");
      row.className = "news-row-card";

      const calIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

      // Determine presenters and links
      const hasPresenters = Array.isArray(item.presenters) && item.presenters.length > 0;
      let links = Array.isArray(item.links) ? item.links : [];
      if (!links.length && item.link && item.link.url) {
        links = [item.link];
      }
      const hasLinks = links.length > 0;

      let actionsHtml = "";
      if (hasPresenters || hasLinks) {
        let presentersHtml = "";
        if (hasPresenters) {
          const pLabel = item.presenters.length > 1 ? "Presenters:" : "Presenter:";
          const personIcon = `<svg class="news-chip-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
          const pChips = item.presenters.map(p => {
            const pId = p.personId || "";
            const href = p.url || (pId ? `#person-${pId}` : "#collaborators");
            return `<a href="${href}" class="news-chip news-chip-person" data-person-id="${pId}">${personIcon}<span>${p.name}</span></a>`;
          }).join("");

          presentersHtml = `
            <div class="news-meta-group">
              <span class="news-meta-label">${pLabel}</span>
              <div class="news-chips-wrap">${pChips}</div>
            </div>
          `;
        }

        let linksHtml = "";
        if (hasLinks) {
          const linkChips = links.map(l => {
            const isExternal = /^https?:\/\//i.test(l.url);
            let iconSvg = "";
            const t = (l.type || "").toLowerCase();
            if (t === "tool") {
              iconSvg = `<svg class="news-chip-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`;
            } else if (t === "paper" || t === "proceedings") {
              iconSvg = `<svg class="news-chip-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
            } else if (t === "code" || t === "github") {
              iconSvg = `<svg class="news-chip-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
            } else {
              iconSvg = `<svg class="news-chip-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
            }
            const arrowSvg = isExternal
              ? `<svg class="news-chip-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>`
              : "";
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${l.url}" class="news-chip news-chip-${t || 'link'}" ${targetAttr}>${iconSvg}<span>${l.label}</span>${arrowSvg}</a>`;
          }).join("");

          linksHtml = `<div class="news-chips-wrap">${linkChips}</div>`;
        }

        actionsHtml = `
          <div class="news-row-actions">
            ${presentersHtml}
            ${linksHtml}
          </div>
        `;
      }

      row.innerHTML = `
        <div class="news-row-date">
          <span class="news-date-pill">${calIcon}<span>${item.dateFormatted || item.date}</span></span>
        </div>
        <div class="news-row-body">
          <h3 class="news-row-title">${item.title}</h3>
          <p class="news-row-summary">${item.summary}</p>
          ${actionsHtml}
        </div>
      `;

      // Attach in-page smooth-scroll and highlight for presenter chips
      row.querySelectorAll(".news-chip-person").forEach(chip => {
        chip.addEventListener("click", (e) => {
          const personId = chip.dataset.personId;
          if (personId) {
            const target = document.getElementById("person-" + personId);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
              target.classList.remove("person-card-highlighted");
              void target.offsetWidth;
              target.classList.add("person-card-highlighted");
              setTimeout(() => target.classList.remove("person-card-highlighted"), 2600);
            }
          }
        });
      });

      return row;
    }

    function applyNewsFilterWithStableScroll(anchorEl, resetPage = true) {
      if (resetPage) currentPage = 1;
      const rectBefore = anchorEl ? anchorEl.getBoundingClientRect() : null;
      updateNewsView();
      if (rectBefore) {
        const rectAfter = anchorEl.getBoundingClientRect();
        const drift = rectAfter.top - rectBefore.top;
        if (Math.abs(drift) > 0.5) {
          window.scrollBy({ top: drift, behavior: "instant" });
        }
      }
    }

    function renderNewsPagination(totalItems, pageWrapper) {
      if (!pageWrapper) return;
      const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);

      if (totalPages <= 1) {
        if (totalItems > 0) {
          pageWrapper.innerHTML = `
            <div class="news-pagination-info">Showing all ${totalItems} updates</div>
          `;
        } else {
          pageWrapper.replaceChildren();
        }
        return;
      }

      const startIdx = (currentPage - 1) * NEWS_PER_PAGE + 1;
      const endIdx = Math.min(currentPage * NEWS_PER_PAGE, totalItems);

      let buttonsHtml = `
        <button class="news-page-btn news-page-nav-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">‹ Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="news-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
        `;
      }

      buttonsHtml += `
        <button class="news-page-btn news-page-nav-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">Next ›</button>
      `;

      pageWrapper.innerHTML = `
        <div class="news-pagination-info">Showing ${startIdx}–${endIdx} of ${totalItems} updates</div>
        <div class="news-pagination-controls">${buttonsHtml}</div>
      `;

      const prevBtn = pageWrapper.querySelector(".prev-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            applyNewsFilterWithStableScroll(prevBtn, false);
          }
        });
      }

      const nextBtn = pageWrapper.querySelector(".next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            applyNewsFilterWithStableScroll(nextBtn, false);
          }
        });
      }

      pageWrapper.querySelectorAll(".news-page-btn[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.getAttribute("data-page"), 10);
          applyNewsFilterWithStableScroll(btn, false);
        });
      });
    }

    function updateNewsView() {
      const totalItems = news.length;
      const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
      const pageItems = news.slice(startIndex, startIndex + NEWS_PER_PAGE);

      container.replaceChildren();

      if (pageItems.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "padding: 32px; text-align: center; color: var(--ink-soft);";
        empty.textContent = "No news updates found.";
        container.appendChild(empty);
      } else {
        pageItems.forEach(item => {
          container.appendChild(createNewsRow(item));
        });
      }

      renderNewsPagination(totalItems, paginationWrapper);
    }

    // Initial render
    updateNewsView();
  }

  // Gallery Section with Apple Vision-OS Carousel & Interactive Lightbox Modal
  async function renderGallery() {
    const gallery = await fetchJSON("data/gallery.json");
    const track = document.getElementById("gallery-track");
    const prevBtn = document.getElementById("gallery-prev");
    const nextBtn = document.getElementById("gallery-next");
    if (!gallery || !track) return;

    track.replaceChildren();

    // Lightbox modal elements
    const lightbox = document.getElementById("gallery-lightbox");
    const backdrop = document.getElementById("lightbox-backdrop");
    const closeBtn = document.getElementById("lightbox-close");
    const prevModalBtn = document.getElementById("lightbox-prev");
    const nextModalBtn = document.getElementById("lightbox-next");
    const imgBgEl = document.getElementById("lightbox-img-bg");
    const imgEl = document.getElementById("lightbox-img");
    const titleEl = document.getElementById("lightbox-title");
    const captionEl = document.getElementById("lightbox-caption");
    const locationEl = document.getElementById("lightbox-location");
    const dateEl = document.getElementById("lightbox-date");
    const counterEl = document.getElementById("lightbox-counter");

    let activeIndex = 0;

    function updateLightboxContent(idx) {
      if (!gallery[idx]) return;
      const item = gallery[idx];

      if (imgBgEl) imgBgEl.style.opacity = "0";
      if (imgEl) imgEl.style.opacity = "0";

      setTimeout(() => {
        if (imgBgEl) {
          imgBgEl.src = item.src;
          imgBgEl.style.opacity = "1";
        }
        if (imgEl) {
          imgEl.src = item.src;
          imgEl.alt = item.alt || item.title || "";
          imgEl.style.opacity = "1";
        }
      }, 100);

      if (titleEl) titleEl.textContent = item.title || item.caption || "Gallery Photo";
      if (captionEl) captionEl.textContent = item.caption || "";
      if (locationEl) locationEl.textContent = item.location ? `📍 ${item.location}` : "📍 ɪreːn Collaboration";
      if (dateEl) dateEl.textContent = item.date || "";
      if (counterEl) counterEl.textContent = `${idx + 1} / ${gallery.length}`;
    }

    function openLightbox(idx) {
      if (!lightbox) return;
      activeIndex = idx;
      updateLightboxContent(activeIndex);
      lightbox.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.setAttribute("hidden", "");
      document.body.style.overflow = "";
    }

    function showPrevPhoto() {
      activeIndex = (activeIndex - 1 + gallery.length) % gallery.length;
      updateLightboxContent(activeIndex);
    }

    function showNextPhoto() {
      activeIndex = (activeIndex + 1) % gallery.length;
      updateLightboxContent(activeIndex);
    }

    // Modal listeners
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (backdrop) backdrop.addEventListener("click", closeLightbox);
    if (prevModalBtn) prevModalBtn.addEventListener("click", showPrevPhoto);
    if (nextModalBtn) nextModalBtn.addEventListener("click", showNextPhoto);

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!lightbox || lightbox.hasAttribute("hidden")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevPhoto();
      if (e.key === "ArrowRight") showNextPhoto();
    });

    // Populate gallery 2-row track: pure photo tiles (no text labels in carousel)
    gallery.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View photo: ${item.title || item.caption}`);

      const zoomIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;

      card.innerHTML = `
        <img class="gallery-img-thumb" src="${item.src}" alt="${item.alt || item.title || ''}" width="${item.width || 800}" height="${item.height || 600}" loading="lazy">
        <div class="gallery-zoom-badge" aria-hidden="true">${zoomIcon}</div>
      `;

      card.addEventListener("click", () => openLightbox(index));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });

      track.appendChild(card);
    });

    setupSliderControls(track, prevBtn, nextBtn);
  }

  // Contact Form (FormSubmit Integration)
  function initContactForm(site) {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    const submitBtn = document.getElementById("contact-submit-btn");
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const categorySelect = document.getElementById("contact-category");
    const messageInput = document.getElementById("contact-message");
    const honeyInput = document.getElementById("contact-honey");

    if (!form || !submitBtn || !status) return;

    // Use recipient configured in site.json or default to coordinator
    const recipientEmail = (site && site.contact && site.contact.email) ? site.contact.email : "huidromrudali@gmail.com";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Anti-spam honeypot check: if filled, abort silently
      if (honeyInput && honeyInput.value.trim() !== "") {
        status.className = "contact-status is-success";
        status.innerHTML = `<span class="status-icon">✓</span> Thank you! Your message has been received.`;
        form.reset();
        return;
      }

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const category = categorySelect ? categorySelect.value : "General Inquiry";
      const message = messageInput ? messageInput.value.trim() : "";

      // Client-side validation
      if (!name || !email || !message) {
        status.className = "contact-status is-error";
        status.innerHTML = `<span class="status-icon">⚠️</span> Please fill in all required fields (Name, Email, and Message).`;
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        status.className = "contact-status is-error";
        status.innerHTML = `<span class="status-icon">⚠️</span> Please enter a valid email address.`;
        return;
      }

      // Enter loading state
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.innerHTML = `<span>Sending...</span><svg class="send-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>`;
      status.className = "contact-status is-loading";
      status.innerHTML = `Sending your message via FormSubmit...`;

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            _subject: `[ɪreːn Website] ${category} from ${name}`,
            category: category,
            message: message,
            _captcha: "false",
            _template: "table"
          })
        });

        const data = await response.json();

        if (response.ok && (data.success === "true" || data.success === true)) {
          status.className = "contact-status is-success";
          status.innerHTML = `
            <div class="status-success-card">
              <span class="status-icon">✓</span>
              <div>
                <strong>Thank you, ${name}!</strong>
                <p>Your message has been delivered to the ɪreːn team. We will respond to ${email} as soon as possible.</p>
              </div>
            </div>
          `;
          form.reset();
        } else {
          throw new Error(data.message || "Submission failed");
        }
      } catch (err) {
        console.error("FormSubmit error:", err);
        status.className = "contact-status is-error";
        status.innerHTML = `<span class="status-icon">⚠️</span> Unable to send right now. Please check your connection or connect via GitHub.`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        submitBtn.innerHTML = `<span>Send message</span><svg class="send-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
      }
    });
  }

  // Site Configuration & Contact Info
  async function renderSiteConfig() {
    const site = await fetchJSON("data/site.json");
    if (!site) return;

    if (site.contact) {
      const githubLink = document.getElementById("contact-github");
      if (githubLink && site.contact.github) {
        githubLink.href = site.contact.github;
      }
    }

    initContactForm(site);
  }

  // Dynamic Navbar Scroll Glassmorphism
  function initNavScroll() {
    var header = document.querySelector("header.site");
    if (!header) return;

    var ticking = false;
    function updateNav() {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      ticking = false;
    }

    window.addEventListener("scroll", function() {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });

    updateNav();
  }

  // Mobile Navigation Pop-up Toggle & Drawer
  function initMobileNav() {
    const toggleBtn = document.getElementById("mobile-nav-toggle");
    const closeBtn = document.getElementById("mobile-nav-close");
    const menu = document.getElementById("mobile-nav-menu");
    const backdrop = document.getElementById("mobile-nav-backdrop");
    if (!toggleBtn || !menu) return;

    function openMenu() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    toggleBtn.addEventListener("click", () => {
      if (menu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (backdrop) backdrop.addEventListener("click", closeMenu);

    // Close when clicking any link inside the mobile menu
    menu.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });

    // Auto-open if URL has ?nav (useful for deep-linking and visual testing)
    if (window.location.search.includes("nav")) {
      setTimeout(openMenu, 300);
    }
  }

  /* -------------------------------------------------------------
     4. INITIALIZATION
  ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initNavScroll();
    initMobileNav();
    initHeroAnimations();
    renderSiteConfig();
    renderAbout();
    renderObjectives();
    renderPeople();
    renderPublications();
    renderTools();
    renderNews();
    renderGallery();
  });

})();
