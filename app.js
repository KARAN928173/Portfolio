 document.addEventListener("DOMContentLoaded", function () {
      const siteHeader = document.querySelector(".site-header");
      const menuToggle = document.getElementById("menuToggle");
      const primaryNav = document.getElementById("primaryNav");
      const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
      const sections = Array.from(document.querySelectorAll("main section[id]"));
      const contactForm = document.getElementById("contactForm");
      const contactStatus = document.getElementById("contactStatus");
      const subjectInput = document.getElementById("subject");
      const messageInput = document.getElementById("message");
      const year = document.getElementById("year");
      const desktopNavQuery = window.matchMedia("(min-width: 860px)");
      let scrollSpyFrame = null;

      function setMenuState(isOpen) {
        if (!primaryNav || !menuToggle) {
          return;
        }

        primaryNav.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      }

      function closeMenu() {
        setMenuState(false);
      }

      function setActiveLink(currentId) {
        if (!currentId || !navLinks.length) {
          return;
        }

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${currentId}`;
          link.classList.toggle("active", isActive);

          if (isActive) {
            link.setAttribute("aria-current", "location");
            return;
          }

          link.removeAttribute("aria-current");
        });
      }

      function getHeaderOffset() {
        if (!siteHeader) {
          return 0;
        }

        const headerRect = siteHeader.getBoundingClientRect();
        const computedTop = window.getComputedStyle(siteHeader).top;
        const stickyTop = Number.parseFloat(computedTop) || 0;

        return headerRect.height + stickyTop;
      }

      function getVisibleSectionId() {
        if (!sections.length) {
          return "";
        }

        const viewportMarker = Math.max(getHeaderOffset() + 24, window.innerHeight * 0.24);
        let currentId = sections[0].id;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();

          if (rect.top <= viewportMarker) {
            currentId = section.id;
          }
        });

        const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

        if (scrolledToBottom) {
          return sections[sections.length - 1].id;
        }

        return currentId;
      }

      function syncActiveLinkFromViewport() {
        const currentId = getVisibleSectionId();

        if (currentId) {
          setActiveLink(currentId);
        }
      }

      function syncActiveLinkFromHash() {
        const currentHash = window.location.hash.replace("#", "");
        const hasMatchingSection = sections.some((section) => section.id === currentHash);

        if (!currentHash || !hasMatchingSection) {
          return false;
        }

        setActiveLink(currentHash);
        return true;
      }

      function queueActiveLinkSync() {
        if (scrollSpyFrame !== null) {
          return;
        }

        scrollSpyFrame = window.requestAnimationFrame(function () {
          scrollSpyFrame = null;
          syncActiveLinkFromViewport();
        });
      }

      if (year) {
        year.textContent = new Date().getFullYear();
      }

      if (menuToggle && primaryNav) {
        menuToggle.addEventListener("click", function () {
          const isOpen = !primaryNav.classList.contains("is-open");
          setMenuState(isOpen);
        });

        const handleDesktopNavChange = function (event) {
          if (event.matches) {
            closeMenu();
          }
        };

        if (typeof desktopNavQuery.addEventListener === "function") {
          desktopNavQuery.addEventListener("change", handleDesktopNavChange);
        } else if (typeof desktopNavQuery.addListener === "function") {
          desktopNavQuery.addListener(handleDesktopNavChange);
        }

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape") {
            closeMenu();
          }
        });

        document.addEventListener("click", function (event) {
          if (!primaryNav.classList.contains("is-open")) {
            return;
          }

          if (primaryNav.contains(event.target) || menuToggle.contains(event.target)) {
            return;
          }

          closeMenu();
        });
      }

      if (sections.length && navLinks.length) {
        window.addEventListener("scroll", queueActiveLinkSync, {passive: true});
        window.addEventListener("resize", queueActiveLinkSync);
        window.addEventListener("load", queueActiveLinkSync);

        if (!syncActiveLinkFromHash()) {
          syncActiveLinkFromViewport();
        }

        window.addEventListener("hashchange", function () {
          if (!syncActiveLinkFromHash()) {
            queueActiveLinkSync();
          }
        });
      }

      navLinks.forEach((link) => {
        link.addEventListener("click", function () {
          const targetId = link.getAttribute("href").replace("#", "");

          if (targetId) {
            setActiveLink(targetId);
          }

          closeMenu();
        });
      });

      if (contactForm && contactStatus && subjectInput && messageInput) {
        contactForm.addEventListener("submit", function (event) {
          event.preventDefault();

          const subject = subjectInput.value.trim();
          const message = messageInput.value.trim();

          if (!subject || !message) {
            contactStatus.textContent = "Please add a subject and message before opening the draft.";
            return;
          }

          const recipient = "chy928173@gmail.com";
          const encodedRecipient = encodeURIComponent(recipient);
          const encodedSubject = encodeURIComponent(subject);
          const encodedBody = encodeURIComponent(`Hello Karan,\n\n${message}`);
          const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedRecipient}&su=${encodedSubject}&body=${encodedBody}`;
          const mailtoLink = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;

          contactStatus.textContent = "Opening your email draft...";

          let gmailWindow = null;

          try {
            gmailWindow = window.open(gmailLink, "_blank");
          } catch (error) {
            gmailWindow = null;
          }

          if (gmailWindow) {
            contactStatus.textContent = "Draft opened in Gmail.";
            contactForm.reset();
            return;
          }

          contactStatus.textContent = "Gmail was blocked, trying your email app...";
          window.location.href = mailtoLink;

          window.setTimeout(function () {
            contactStatus.textContent = `If nothing opened, email me directly at ${recipient}.`;
          }, 1200);
        });
      }
    });

