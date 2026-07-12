(function () {
  if (window.__niftyLibraryIcons) return;
  window.__niftyLibraryIcons = true;

  var ICONS = {
    radar: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 12l6-6"></path><path d="M12 4v3M20 12h-3M12 20v-3M4 12h3"></path>',
    shield: '<path d="M12 3l7 3v5c0 4.5-2.8 8.2-7 10-4.2-1.8-7-5.5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-5"></path>',
    backpack: '<path d="M8 7V6a4 4 0 0 1 8 0v1"></path><rect x="6" y="7" width="12" height="14" rx="3"></rect><path d="M9 11h6M9 15h6M6 11H4v5h2M18 11h2v5h-2"></path>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .8-7.9A6 6 0 0 0 6.4 9.1 4.5 4.5 0 0 0 7 18z"></path><path d="M8 14h8M10 11h4"></path>',
    cyber: '<path d="M12 3l7 3v5c0 4.5-2.8 8.2-7 10-4.2-1.8-7-5.5-7-10V6l7-3z"></path><path d="M8 12h8M12 8v8"></path>',
    aurora: '<path d="M3 17c4-7 7 3 11-4 2.5-4 4-2 7-6"></path><path d="M3 12c4-4 7 4 11-1 2.2-3 4-1.5 7-5"></path><path d="M5 20h14"></path>',
    waveform: '<path d="M3 12h3l2-6 4 12 3-9 2 3h4"></path><path d="M4 19h16M4 5h16"></path>',
    coin: '<circle cx="12" cy="12" r="8"></circle><path d="M12 7v10M9 9.5c.7-1 4-1.1 5 .4.9 1.4-.5 2.6-2 2.6s-2.8 1-2 2.4c.8 1.5 4.4 1.4 5.1.1"></path>',
    chart: '<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M7 15l4-4 3 3 5-7"></path><path d="M16 7h3v3"></path>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 7h8"></path><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"></path>',
    percent: '<path d="M19 5L5 19"></path><circle cx="7" cy="7" r="2"></circle><circle cx="17" cy="17" r="2"></circle>',
    clock: '<circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path>',
    monitor: '<rect x="3" y="5" width="18" height="12" rx="2"></rect><path d="M8 21h8M12 17v4"></path>',
    camera: '<rect x="4" y="7" width="16" height="12" rx="3"></rect><path d="M8 7l1.5-3h5L16 7"></path><circle cx="12" cy="13" r="3"></circle>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.5"></circle><path d="M4 16l4-4 4 4 2-2 6 5"></path>',
    file: '<path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5"></path><path d="M9 13h6M9 17h6"></path>',
    code: '<path d="M8 9l-4 3 4 3"></path><path d="M16 9l4 3-4 3"></path><path d="M14 5l-4 14"></path>',
    text: '<path d="M4 6h16M4 12h12M4 18h9"></path><path d="M17 15l3 3-3 3"></path>',
    qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"></path><path d="M14 14h2M18 14h2M14 18h6M14 20h2"></path>',
    receipt: '<path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21z"></path><path d="M9 8h6M9 12h6M9 16h4"></path>',
    key: '<circle cx="8" cy="14" r="4"></circle><path d="M12 14h8M16 14v-3M19 14v-2"></path>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"></rect><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"></path>',
    palette: '<path d="M12 4a8 8 0 0 0 0 16h1.5a2 2 0 0 0 1.2-3.6 1.8 1.8 0 0 1 1-3.4H17a3 3 0 0 0 2.9-3.8A8 8 0 0 0 12 4z"></path><path d="M8 10h.01M10 7.5h.01M14 7.5h.01M16 10h.01"></path>',
    moon: '<path d="M18 16.5A8 8 0 1 1 10.5 5a6.5 6.5 0 0 0 7.5 11.5z"></path><path d="M17 4v4M15 6h4"></path>',
    star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"></path>',
    hash: '<path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16"></path>',
    barcode: '<path d="M5 5v14M8 5v14M12 5v14M15 5v14M19 5v14"></path><path d="M3 3h18v18H3z"></path>',
    graduation: '<path d="M3 8l9-4 9 4-9 4z"></path><path d="M7 10v5c3 2 7 2 10 0v-5"></path><path d="M21 8v6"></path>',
    home: '<path d="M4 11l8-7 8 7"></path><path d="M6 10v10h12V10"></path><path d="M10 20v-6h4v6"></path>',
    notebook: '<path d="M7 4h11v16H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path><path d="M9 8h6M9 12h6M9 16h4"></path>',
    love: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path>'
  };

  var RULES = [
    [/cyber|threat|attack|security|vulnerability|cisa|kev/, "cyber", "red"],
    [/outage|downtime|carrier|cellular|cloudflare|internet weather|status/, "cloud", "cyan"],
    [/aurora|northern lights|sky|space weather/, "aurora", "violet"],
    [/earth pulse|schumann|kumiana|cymatic|resonance/, "waveform", "violet"],
    [/signal suite|early warning|radar|scanner|monitor|watch|pulse/, "radar", "green"],
    [/prepper|preparedness|emergency|survival|go bag|risk/, "backpack", "amber"],
    [/password|passphrase|key/, "key", "amber"],
    [/qr code|qr\b/, "qr", "cyan"],
    [/barcode/, "barcode", "green"],
    [/receipt|invoice|bill|tip/, "receipt", "amber"],
    [/loan|mortgage|home/, "home", "amber"],
    [/salary|paycheck|debt|finance|interest|roi|roe|market volume|positioning|stock|trading|crypto|bitcoin|ethereum/, "chart", "cyan"],
    [/coin|btc|eth|crypto/, "coin", "amber"],
    [/math|calculator|percentage|factorial|gpa|base converter|gematria/, "calculator", "green"],
    [/percent|percentage/, "percent", "green"],
    [/time|clock|timer|timestamp|stopwatch|pomodoro/, "clock", "cyan"],
    [/days lived|date|calendar/, "calendar", "cyan"],
    [/screen|device|dead pixel|webcam|microphone|camera|keyboard|mouse/, "monitor", "cyan"],
    [/image|photo|webp|jpg|png|palette|color/, "image", "violet"],
    [/color|hsl|palette|contrast|gradient/, "palette", "violet"],
    [/pdf|document|file organizer|organizer/, "file", "amber"],
    [/developer|json|yaml|csv|base64|url|jwt|hash|regex|html|css|javascript|code/, "code", "cyan"],
    [/text|word|writing|case|morse|slug|markdown|readability/, "text", "green"],
    [/random|dice|lottery|picker|magic|8-ball|coin flip|rng/, "dice", "violet"],
    [/tarot|moon|card reader/, "moon", "violet"],
    [/zodiac|astrology|horoscope|love match|birth chart/, "star", "violet"],
    [/meme|viral|trend/, "hash", "green"],
    [/scratchpad|notepad|notes/, "notebook", "green"],
    [/gpa|school|grade/, "graduation", "cyan"],
    [/love|romance|compatibility/, "love", "red"]
  ];

  function iconFor(card) {
    var title = card.querySelector("h3") ? card.querySelector("h3").textContent : "";
    var hay = [
      title,
      card.dataset.name || "",
      card.dataset.tags || "",
      card.getAttribute("onclick") || ""
    ].join(" ").toLowerCase();
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(hay)) return { name: RULES[i][1], tone: RULES[i][2], title: title || RULES[i][1] };
    }
    return { name: "radar", tone: "green", title: title || "Tool" };
  }

  function renderIcon(icon) {
    var body = ICONS[icon.name] || ICONS.radar;
    return '<svg class="nt-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function applyIcons() {
    document.querySelectorAll(".tool").forEach(function (card) {
      var slot = card.querySelector(".ico");
      if (!slot || slot.dataset.iconReady) return;
      var icon = iconFor(card);
      slot.dataset.iconReady = "1";
      slot.dataset.icon = icon.name;
      slot.dataset.tone = icon.tone;
      slot.setAttribute("title", icon.title);
      slot.setAttribute("aria-hidden", "true");
      slot.classList.add("nt-icon", "nt-icon-" + icon.name, "nt-tone-" + icon.tone);
      slot.innerHTML = renderIcon(icon);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyIcons);
  } else {
    applyIcons();
  }
})();
