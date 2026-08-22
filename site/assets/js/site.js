(function () {
  "use strict";

  // --- Roadmap page: Board / Screenshots tabs ---
  var tabs = document.querySelectorAll(".roadmap-tab");
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        document.querySelectorAll(".roadmap-tab").forEach(function (t) {
          var isActive = t === tab;
          t.classList.toggle("is-active", isActive);
          t.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        document.querySelectorAll(".roadmap-panel").forEach(function (panel) {
          panel.classList.toggle(
            "is-active",
            panel.getAttribute("data-panel") === target
          );
        });
      });
    });
  }

  // --- Primary nav: mobile hamburger toggle ---
  var header = document.querySelector(".site-header");
  var navToggle = header && header.querySelector(".nav-toggle");
  if (header && navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // --- About modal: "?" button opens a global overlay ---
  var aboutToggle = document.querySelector(".about-toggle");
  var aboutModal = document.getElementById("about-modal");
  if (aboutToggle && aboutModal) {
    var aboutClose = aboutModal.querySelector(".about-modal-close");

    function openAbout() {
      aboutModal.classList.add("is-open");
      if (aboutClose) aboutClose.focus();
    }

    function closeAbout() {
      aboutModal.classList.remove("is-open");
      aboutToggle.focus();
    }

    aboutToggle.addEventListener("click", openAbout);
    if (aboutClose) aboutClose.addEventListener("click", closeAbout);

    aboutModal.addEventListener("click", function (event) {
      if (event.target === aboutModal) closeAbout();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && aboutModal.classList.contains("is-open")) {
        closeAbout();
      }
    });
  }

  // --- Interactive object-schema tables (filter + sort) ---
  document.querySelectorAll(".object-schema").forEach(function (schema) {
    var filterInput = schema.querySelector(".object-schema-filter");
    var table = schema.querySelector(".object-schema-table");
    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    var emptyMessage = schema.querySelector(".object-schema-empty");

    if (filterInput) {
      filterInput.addEventListener("input", function () {
        var query = filterInput.value.trim().toLowerCase();
        var visibleCount = 0;
        rows.forEach(function (row) {
          var match =
            !query || row.getAttribute("data-search").indexOf(query) !== -1;
          row.classList.toggle("is-hidden", !match);
          if (match) visibleCount++;
        });
        if (emptyMessage)
          emptyMessage.classList.toggle("is-hidden", visibleCount > 0);
      });
    }

    table.querySelectorAll("th[data-sort]").forEach(function (th, colIndex) {
      var ascending = true;
      th.addEventListener("click", function () {
        var sorted = rows.slice().sort(function (a, b) {
          var aText = a.children[colIndex].textContent.trim().toLowerCase();
          var bText = b.children[colIndex].textContent.trim().toLowerCase();
          if (aText < bText) return ascending ? -1 : 1;
          if (aText > bText) return ascending ? 1 : -1;
          return 0;
        });
        var tbody = table.querySelector("tbody");
        sorted.forEach(function (row) {
          tbody.appendChild(row);
        });
        rows = sorted;
        table.querySelectorAll("th[data-sort]").forEach(function (otherTh) {
          otherTh.classList.remove("is-sorted-asc", "is-sorted-desc");
        });
        th.classList.add(ascending ? "is-sorted-asc" : "is-sorted-desc");
        ascending = !ascending;
      });
    });
  });

  // --- Site search ---
  var searchWrap = document.querySelector(".site-search");
  if (searchWrap) {
    var searchToggle = searchWrap.querySelector(".search-toggle");
    var searchPanel = searchWrap.querySelector(".search-panel");
    var searchInput = searchWrap.querySelector(".search-input");
    var searchResults = searchWrap.querySelector(".search-results");
    var searchIndex = null;
    var searchIndexPromise = null;

    function loadSearchIndex() {
      if (!searchIndexPromise) {
        var searchUrl =
          searchWrap.getAttribute("data-search-url") || "/search.json";
        searchIndexPromise = fetch(searchUrl)
          .then(function (res) {
            return res.ok ? res.json() : [];
          })
          .then(function (data) {
            searchIndex = data;
            return data;
          })
          .catch(function () {
            searchIndex = [];
            return [];
          });
      }
      return searchIndexPromise;
    }

    function openSearch() {
      searchWrap.classList.add("is-open");
      searchToggle.setAttribute("aria-expanded", "true");
      loadSearchIndex().then(function () {
        searchInput.focus();
      });
    }

    function closeSearch() {
      searchWrap.classList.remove("is-open");
      searchToggle.setAttribute("aria-expanded", "false");
    }

    searchToggle.addEventListener("click", function () {
      if (searchWrap.classList.contains("is-open")) {
        closeSearch();
      } else {
        openSearch();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSearch();
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        openSearch();
      }
    });

    document.addEventListener("click", function (event) {
      if (!searchWrap.contains(event.target)) closeSearch();
    });

    function renderResults(matches, query) {
      searchResults.innerHTML = "";
      if (!query) return;
      if (!matches.length) {
        var empty = document.createElement("li");
        empty.className = "search-empty";
        empty.textContent = "No lessons match “" + query + "”.";
        searchResults.appendChild(empty);
        return;
      }
      matches.slice(0, 8).forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.url;
        a.innerHTML =
          '<span class="search-result-title"></span><span class="search-result-section"></span>';
        a.querySelector(".search-result-title").textContent = item.title;
        a.querySelector(".search-result-section").textContent = item.section;
        li.appendChild(a);
        searchResults.appendChild(li);
      });
    }

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = "";
        return;
      }
      loadSearchIndex().then(function (index) {
        var matches = index.filter(function (item) {
          return (
            item.title.toLowerCase().indexOf(query) !== -1 ||
            item.section.toLowerCase().indexOf(query) !== -1 ||
            item.excerpt.toLowerCase().indexOf(query) !== -1
          );
        });
        renderResults(matches, query);
      });
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
