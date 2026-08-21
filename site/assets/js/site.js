(function () {
  "use strict";

  // --- Primary nav: mobile hamburger toggle ---
  var header = document.querySelector(".site-header");
  var navToggle = header && header.querySelector(".nav-toggle");
  if (header && navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // --- Dark mode toggle ---
  var themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    var root = document.documentElement;
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    function isDark() {
      var explicit = root.getAttribute("data-theme");
      if (explicit === "dark") return true;
      if (explicit === "light") return false;
      return prefersDark;
    }

    function syncPressedState() {
      themeToggle.setAttribute("aria-pressed", isDark() ? "true" : "false");
    }

    syncPressedState();

    themeToggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* localStorage unavailable — theme choice just won't persist */
      }
      syncPressedState();
    });
  }

  // --- Learn / Teach sidebar: mobile toggle ---
  var tocToggles = document.querySelectorAll(".toc-toggle");
  tocToggles.forEach(function (toggle) {
    var sidebar = toggle.nextElementSibling;
    if (!sidebar) return;
    toggle.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  // --- Teach lesson pages: build the "on this page" list from headings ---
  var onThisPage = document.querySelector(".on-this-page");
  var list = onThisPage && onThisPage.querySelector(".on-this-page-list");
  if (onThisPage && list) {
    var targetId = onThisPage.getAttribute("data-target");
    var content = targetId && document.getElementById(targetId);
    if (content) {
      var headings = content.querySelectorAll("h2, h3");
      var links = [];

      headings.forEach(function (heading, index) {
        if (!heading.id) {
          heading.id = "section-" + index;
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + heading.id;
        a.textContent = heading.textContent;
        if (heading.tagName === "H3") {
          a.className = "is-h3";
        }
        li.appendChild(a);
        list.appendChild(li);
        links.push({ id: heading.id, link: a });
      });

      if (links.length && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              var match = links.filter(function (item) {
                return item.id === entry.target.id;
              })[0];
              if (!match) return;
              if (entry.isIntersecting) {
                links.forEach(function (item) {
                  item.link.classList.remove("is-active");
                });
                match.link.classList.add("is-active");
              }
            });
          },
          { rootMargin: "-15% 0px -70% 0px" }
        );

        headings.forEach(function (heading) {
          observer.observe(heading);
        });
      } else if (links.length) {
        links[0].link.classList.add("is-active");
      }
    } else {
      onThisPage.style.display = "none";
    }
  }
})();
