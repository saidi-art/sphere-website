/* Sphere "Today" dial: live date, clock and day colour.
   Ported from the design package board 10/11 (TodayDial), 31 Oct 2026.
   Static, no dependencies, no third-party requests. Times come from the
   viewer's own clock and time zone, exactly as on the design canvas. */
(function () {
  "use strict";

  var GA = 137.50776;            /* golden angle, degrees */
  var TEST_START = "2026-10-31"; /* closed-testing start date, kept for when the counter returns */
  var TEST_DAYS = 14;

  var root = document.querySelector(".today");
  if (!root) return;

  var svg = root.querySelector(".t-dial");
  var el = {
    weekday: root.querySelector(".t-weekday"),
    date: root.querySelector(".t-datelong"),
    park: root.querySelector(".t-park-circle"),
    time: root.querySelector(".t-time"),
    tz: root.querySelector(".t-tz"),
    chips: root.querySelector(".t-chips"),
    dayhue: root.querySelector(".t-dayhue"),
    test: root.querySelector(".t-testlabel"),
    streak: root.querySelector(".t-streak")
  };
  if (!svg || !el.time) return;

  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  var night = mq.matches;
  var lastDoy = -1, lastNight = null, t = null;

  function norm(h) { return ((h % 360) + 360) % 360; }
  function col(h, l, c) {
    return "oklch(" + (l == null ? 0.72 : l) + " " + (c == null ? 0.16 : c) + " " + norm(h).toFixed(2) + ")";
  }
  function ball(h, l, c) {
    return "radial-gradient(circle at 35% 30%, " + col(h, 0.93, 0.07) + " 0%, " +
      col(h, l, c) + " 45%, " + col(h, 0.52, 0.13) + " 100%)";
  }
  function themeTokens() {
    return night ? {
      ink: "#F3EBDD", quiet: "#B8AE9C", rule: "rgba(201,164,92,0.22)",
      accent: "#C9A45C", link: "#3FD29A", face: "#121614", hand: "#C9A45C",
      streakEmpty: "rgba(243,235,221,0.12)", ringOuter: "#0B0E0D"
    } : {
      ink: "#1d1c1e", quiet: "#5F5B57", rule: "rgba(29,28,30,0.1)",
      accent: "#b98a1e", link: "#1f5c3d", face: "#FFFFFF", hand: "#1d1c1e",
      streakEmpty: "rgba(29,28,30,0.1)", ringOuter: "#faf9fb"
    };
  }
  function setVars(hue) {
    var s = root.style;
    s.setProperty("--t-ink", t.ink);
    s.setProperty("--t-quiet", t.quiet);
    s.setProperty("--t-rule", t.rule);
    s.setProperty("--t-accent", t.accent);
    s.setProperty("--t-link", t.link);
    s.setProperty("--t-hueedge", col(hue, night ? 0.78 : 0.55, 0.15));
    s.setProperty("--t-hand", t.hand);
    s.setProperty("--t-sechand", col(hue, night ? 0.8 : 0.55, 0.15));
  }
  function pt(a, r) {
    return [(150 + r * Math.cos(a)).toFixed(2), (150 + r * Math.sin(a)).toFixed(2)];
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  function buildStatic(now, hue, doy, yearDays) {
    var leap = (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0;
    var ticks = "", d, a, p1, p2, isT;
    for (d = 1; d <= yearDays; d++) {
      a = (d - 1) / yearDays * 2 * Math.PI - Math.PI / 2;
      isT = d === doy;
      p1 = pt(a, isT ? 114 : 120);
      p2 = pt(a, isT ? 140 : 133);
      ticks += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] +
        '" stroke="' + col(d * GA) + '" stroke-width="' + (isT ? 3.4 : 1.5) + '" stroke-linecap="round"/>';
    }
    var lens = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var initials = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    var months = "", acc = 0, i, mid, p;
    for (i = 0; i < 12; i++) {
      mid = acc + lens[i] / 2; acc += lens[i];
      a = mid / yearDays * 2 * Math.PI - Math.PI / 2;
      p = pt(a, 145);
      months += '<text x="' + p[0] + '" y="' + (Number(p[1]) + 3).toFixed(2) +
        '" text-anchor="middle" font-size="8.5" font-weight="600" fill="' + t.quiet + '">' + initials[i] + "</text>";
    }
    var hours = "";
    for (i = 0; i < 12; i++) {
      a = i / 12 * 2 * Math.PI - Math.PI / 2;
      p = pt(a, 102);
      hours += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i % 3 === 0 ? 3 : 1.8) + '" fill="' + t.accent + '"/>';
    }
    svg.innerHTML =
      '<defs><radialGradient id="t-hub" cx="36%" cy="30%" r="75%">' +
      '<stop offset="0" stop-color="' + col(hue, 0.93, 0.07) + '"/>' +
      '<stop offset="0.4" stop-color="' + col(hue) + '"/>' +
      '<stop offset="1" stop-color="' + col(hue, 0.5, 0.14) + '"/></radialGradient></defs>' +
      "<g>" + ticks + months + "</g>" +
      '<circle cx="150" cy="150" r="112" fill="' + t.face + '" stroke="' + t.rule + '" stroke-width="1"/>' +
      "<g>" + hours + "</g>" +
      '<g class="t-hands"></g>' +
      '<circle cx="150" cy="150" r="26" fill="url(#t-hub)" stroke="' +
        (night ? "#C9A45C" : col(hue, 0.6, 0.12)) + '" stroke-width="' + (night ? 2.5 : 1.5) + '"/>' +
      '<ellipse cx="141" cy="140" rx="7" ry="4" fill="#FFFFFF" fill-opacity="0.35" transform="rotate(-30 141 140)"/>';
    el.hands = svg.querySelector(".t-hands");
  }

  function buildDay(now, hue, doy, yearDays) {
    setVars(hue);
    el.weekday.textContent = now.toLocaleDateString("en-GB", { weekday: "long" });
    el.date.textContent = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    el.chips.innerHTML = [
      { name: "Sphere", h: hue },
      { name: "Rescue", h: hue + 120 },
      { name: "Auto-scroll", h: hue + 240 },
      { name: "REC", h: hue + 300 },
      { name: "Tools", h: hue + 180, l: 0.86, c: 0.07 }
    ].map(function (c) {
      return '<div class="t-chip"><div class="t-chip-ball" style="background:' + ball(c.h, c.l, c.c) +
        ';box-shadow:0 4px 10px ' + col(c.h, c.l, c.c).replace(")", " / 0.35)") +
        '"></div><span>' + c.name + "</span></div>";
    }).join("");
    el.dayhue.textContent = "Day " + doy + " of " + yearDays + " \u00b7 hue " + hue.toFixed(1) + "\u00b0";
    /* Closed-testing day counter removed 1 Nov 2026: testing has not begun,
       so the day numbers were not accurate. Restore the streak bars and the
       "Testing \u00b7 day N of 14" label once testing starts; TEST_START and
       TEST_DAYS above are kept for that. */
    el.streak.innerHTML = "";
    el.test.textContent = "";
  }

  function tick() {
    var now = new Date();
    var yr = now.getFullYear();
    var leap = (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
    var yearDays = leap ? 366 : 365;
    var today0 = new Date(yr, now.getMonth(), now.getDate());
    var doy = Math.round((today0 - new Date(yr, 0, 1)) / 864e5) + 1;
    var hue = norm(doy * GA);
    var nightNow = mq.matches;
    if (nightNow !== night || doy !== lastDoy) {
      night = nightNow;
      t = themeTokens();
      buildStatic(now, hue, doy, yearDays);
      buildDay(now, hue, doy, yearDays);
      lastDoy = doy;
    }
    var h12 = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
    var ha = (h12 + m / 60) / 12 * 2 * Math.PI - Math.PI / 2;
    var ma = (m + s / 60) / 60 * 2 * Math.PI - Math.PI / 2;
    var sa = s / 60 * 2 * Math.PI - Math.PI / 2;
    var ph = pt(ha, 58), pm = pt(ma, 86), ps = pt(sa, 98), pb = pt(sa + Math.PI, 16);
    el.hands.innerHTML =
      '<line x1="150" y1="150" x2="' + ph[0] + '" y2="' + ph[1] + '" stroke="' + t.hand + '" stroke-width="4.5" stroke-linecap="round"/>' +
      '<line x1="150" y1="150" x2="' + pm[0] + '" y2="' + pm[1] + '" stroke="' + t.hand + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<line x1="' + pb[0] + '" y1="' + pb[1] + '" x2="' + ps[0] + '" y2="' + ps[1] + '" stroke="var(--t-sechand)" stroke-width="1.4" stroke-linecap="round"/>';
    var timeTxt = pad(now.getHours()) + ":" + pad(m) + ":" + pad(s);
    el.time.textContent = timeTxt;
    var off = -now.getTimezoneOffset();
    var offTxt = "UTC" + (off >= 0 ? "+" : "\u2212") + Math.floor(Math.abs(off) / 60) +
      (Math.abs(off) % 60 ? ":" + pad(Math.abs(off) % 60) : "");
    var zone = "";
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " "); } catch (e) { zone = ""; }
    el.tz.textContent = zone ? zone + " \u00b7 " + offTxt : offTxt;
    svg.setAttribute("aria-label", "Clock showing " + timeTxt + ", " + el.weekday.textContent + " " +
      el.date.textContent + ", day " + doy + " of the year");
  }

  function onChange() { lastDoy = -1; tick(); }
  if (mq.addEventListener) { mq.addEventListener("change", onChange); }
  else if (mq.addListener) { mq.addListener(onChange); }

  tick();
  setInterval(tick, 1000);
})();
