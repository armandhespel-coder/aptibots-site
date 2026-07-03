(function () {
  var KEY = "aptibots_cookie_consent";

  function loadClarity() {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "xgh7es4men");
  }

  function grant() {
    if (window.gtag) {
      gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted"
      });
    }
    loadClarity();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var banner = document.getElementById("cookie-consent-banner");
    var manageBtn = document.getElementById("manage-cookies");

    if (banner) {
      var stored = localStorage.getItem(KEY);
      if (stored === "granted") {
        grant();
      } else if (stored !== "denied") {
        banner.classList.remove("hidden");
      }

      document.getElementById("cc-accept").addEventListener("click", function () {
        localStorage.setItem(KEY, "granted");
        grant();
        banner.classList.add("hidden");
      });

      document.getElementById("cc-refuse").addEventListener("click", function () {
        localStorage.setItem(KEY, "denied");
        banner.classList.add("hidden");
      });
    }

    if (manageBtn && banner) {
      manageBtn.addEventListener("click", function () {
        banner.classList.remove("hidden");
      });
    }
  });
})();
