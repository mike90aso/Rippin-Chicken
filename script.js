const CONFIG = {
  phone: "3863163559",
  displayPhone: "(386) 316-3559",
  // Add these to send customers straight into your apps with the right amount:
  paypalMe: "", // e.g. RippinChicken
  paypalEmail: "", // PayPal business email for hosted checkout
  venmo: "", // e.g. RippinChicken
  cashApp: "" // e.g. RippinChicken (no $)
};

const PRODUCTS = [
  { id: "set", name: "Beach Day Set", desc: "2 chairs, 1 umbrella, and a side table — the easy family setup.", price: 50, featured: true },
  { id: "chair", name: "Beach Chair", desc: "A sturdy sand chair, planted and ready.", price: 12 },
  { id: "umbrella", name: "Beach Umbrella", desc: "Wide shade, anchored so it stays put.", price: 30 },
  { id: "table", name: "Side Table", desc: "A little perch for drinks, phones, and snacks.", price: 8 },
  { id: "boogie", name: "Boogie Board", desc: "Ride the whitewater all afternoon.", price: 20 },
  { id: "soft", name: "Soft-Top Surfboard", desc: "Friendly foam board for fun, mellow waves.", price: 40 }
];

const ICONS = {
  set: '<svg viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 34c8-14 20-14 28 0"/><path d="M24 8v10"/><circle cx="24" cy="20" r="3"/><path d="M8 38h10v4H8zM30 38h10v4H30z"/></svg>',
  chair: '<svg viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 14h24l-4 14H16z"/><path d="M16 28v10M32 28v10M14 38h6M28 38h6"/></svg>',
  umbrella: '<svg viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 8c10 0 16 6 16 10H8c0-4 6-10 16-10z"/><path d="M24 18v20M24 38c-4 0-6 2-6 4"/></svg>',
  table: '<svg viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 20h32"/><path d="M14 20v16M34 20v16M24 20v10"/></svg>',
  boogie: '<svg viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="14" width="28" height="20" rx="10"/><path d="M18 24h12"/></svg>',
  soft: '<svg viewBox="0 0 48 48" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 6c6 10 8 18 8 28 0 6-3.5 8-8 8s-8-2-8-8c0-10 2-18 8-28z"/></svg>'
};

const state = {
  cart: loadCart(),
  step: 1
};

const $ = (id) => document.getElementById(id);

function loadCart() {
  try { return JSON.parse(localStorage.getItem("rc-cart") || "{}"); }
  catch { return {}; }
}
function saveCart() {
  localStorage.setItem("rc-cart", JSON.stringify(state.cart));
}

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

function days() {
  const start = $("date").value;
  const end = $("end-date").value || start;
  if (!start) return 1;
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  const n = Math.round((b - a) / 86400000) + 1;
  return Math.max(1, n);
}

function cartQty(id) { return state.cart[id] || 0; }

function setQty(id, qty) {
  qty = Math.max(0, Math.min(20, qty));
  if (qty === 0) delete state.cart[id];
  else state.cart[id] = qty;
  saveCart();
  renderGear();
  renderPicker();
  updateCartBadge();
}

function items() {
  return PRODUCTS.filter((p) => cartQty(p.id)).map((p) => ({
    ...p,
    qty: cartQty(p.id),
    line: p.price * cartQty(p.id) * days()
  }));
}

function subtotal() {
  return items().reduce((s, i) => s + i.line, 0);
}

function money(n) {
  return `$${n.toFixed(2).replace(/\.00$/, "")}`;
}

function updateCartBadge() {
  const n = Object.values(state.cart).reduce((s, q) => s + q, 0);
  const el = $("cart-count");
  el.hidden = n === 0;
  el.textContent = n;
}

function renderGear() {
  $("gear-grid").innerHTML = PRODUCTS.map((p) => {
    const q = cartQty(p.id);
    return `
      <article class="gear-card ${p.featured ? "featured" : ""}">
        <div class="icon-blob">${ICONS[p.id]}</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div>
          <span class="price">${money(p.price)}</span>
          <span class="price-sub"> / day</span>
        </div>
        <div class="qty-row">
          <div class="qty">
            <button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Less ${p.name}">−</button>
            <span>${q}</span>
            <button type="button" data-qty="${p.id}" data-delta="1" aria-label="More ${p.name}">+</button>
          </div>
          ${q ? "" : `<button class="btn ${p.featured ? "btn-light" : "btn-primary"}" type="button" data-add="${p.id}">Add</button>`}
        </div>
      </article>`;
  }).join("");
}

function renderPicker() {
  const box = $("gear-picker");
  if (!box) return;
  box.innerHTML = PRODUCTS.map((p) => {
    const q = cartQty(p.id);
    return `
      <div class="picker-row">
        <div>
          <strong>${p.name}</strong>
          <small>${money(p.price)} / day</small>
        </div>
        <div class="qty">
          <button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Less">−</button>
          <span>${q}</span>
          <button type="button" data-qty="${p.id}" data-delta="1" aria-label="More">+</button>
        </div>
      </div>`;
  }).join("");
  const d = days();
  $("days-hint").textContent = d === 1
    ? "Totals are for one beach day."
    : `Totals below will cover ${d} days.`;
}

function renderSummary() {
  const list = items();
  const d = days();
  $("summary").innerHTML = `
    <ul>
      ${list.map((i) => `<li><span>${i.qty} × ${i.name}${d > 1 ? ` × ${d} days` : ""}</span><span>${money(i.line)}</span></li>`).join("")}
    </ul>
    <div class="total-line"><span>Total</span><span>${money(subtotal())}</span></div>
  `;
}

function toast(msg) {
  const el = $("toast");
  el.hidden = false;
  el.textContent = msg;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2400);
}

function openCheckout() {
  if (!$("date").value) $("date").value = todayISO();
  $("overlay").hidden = false;
  document.body.style.overflow = "hidden";
  document.body.classList.add("checkout-open");
  goStep(1);
  $("close-panel").focus();
}

function closeCheckout() {
  $("overlay").hidden = true;
  document.body.style.overflow = "";
  document.body.classList.remove("checkout-open");
}

function goStep(n) {
  state.step = n;
  document.querySelectorAll(".step-pane").forEach((el) => {
    el.classList.toggle("is-on", Number(el.dataset.step) === n);
  });
  document.querySelectorAll("[data-step-dot]").forEach((el) => {
    const s = Number(el.dataset.stepDot);
    el.classList.toggle("is-on", s === Math.min(n, 4));
    el.classList.toggle("is-done", s < n && n < 5);
  });
  $("back-btn").hidden = n === 1 || n === 5;
  $("panel-foot").hidden = n === 5;
  $("next-btn").textContent = n === 4
    ? (payMethod() === "sand" ? "Confirm reservation" : `Pay ${money(subtotal())}`)
    : n === 3 ? "Review & pay" : "Continue";
  $("form-error").hidden = true;
  if (n === 2) renderPicker();
  if (n === 4) {
    renderSummary();
    syncPayBox();
  }
  $("progress").style.display = n === 5 ? "none" : "grid";
}

function showError(msg) {
  const el = $("form-error");
  el.hidden = false;
  el.textContent = msg;
}

function selectedLocation() {
  return document.querySelector('input[name="location"]:checked')?.value || "";
}

function payMethod() {
  return document.querySelector('input[name="pay"]:checked')?.value || "card";
}

function validateStep(step) {
  if (step === 1) {
    if (!$("date").value) return "Pick your first beach day.";
    const end = $("end-date").value;
    if (end && end < $("date").value) return "Last day can’t be before the first day.";
    if (!selectedLocation()) return "Choose where we should meet you.";
    if (selectedLocation() === "Hotel / condo drop" && !$("hotel").value.trim()) {
      return "Tell us the hotel, condo, or landmark.";
    }
  }
  if (step === 2) {
    if (!items().length) return "Add at least one rental.";
  }
  if (step === 3) {
    if ($("name").value.trim().length < 2) return "We need a name for the reservation.";
    if ($("phone").value.replace(/\D/g, "").length < 10) return "Add a mobile number we can text.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("email").value)) return "Add a valid email for your receipt.";
  }
  if (step === 4 && payMethod() === "card") return validateCard();
  return "";
}

function digits(s) { return (s || "").replace(/\D/g, ""); }

function luhn(num) {
  const s = digits(num);
  let sum = 0;
  let alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = Number(s[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return s.length >= 13 && s.length <= 19 && sum % 10 === 0;
}

function validateCard() {
  if ($("card-name").value.trim().length < 2) return "Enter the name on the card.";
  if (!luhn($("card-number").value)) return "Check the card number.";
  const exp = $("card-exp").value.replace(/\s/g, "");
  const m = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return "Expiry should look like MM / YY.";
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return "Check the expiry month.";
  const end = new Date(year, month, 1);
  if (end <= new Date()) return "That card looks expired.";
  if (digits($("card-cvc").value).length < 3) return "Enter the CVC.";
  if (digits($("card-zip").value).length < 5) return "Enter the billing ZIP.";
  return "";
}

function bookingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "RC-";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function reservationPayload(code, method, last4) {
  return {
    code,
    name: $("name").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    date: $("date").value,
    endDate: $("end-date").value || $("date").value,
    days: days(),
    location: selectedLocation(),
    hotel: $("hotel").value.trim(),
    notes: $("notes").value.trim(),
    items: items().map((i) => ({ id: i.id, name: i.name, qty: i.qty, line: i.line })),
    total: subtotal(),
    method,
    last4: last4 || "",
    created: new Date().toISOString()
  };
}

function smsHref(res) {
  const lines = [
    `Rippin Chicken reservation ${res.code}`,
    `${res.name} · ${res.phone}`,
    `${res.date}${res.days > 1 ? ` to ${res.endDate} (${res.days} days)` : ""}`,
    res.location + (res.hotel ? ` (${res.hotel})` : ""),
    res.items.map((i) => `${i.qty}× ${i.name}`).join(", "),
    `Total ${money(res.total)} · ${res.method}`
  ];
  return `sms:${CONFIG.phone}?body=${encodeURIComponent(lines.join(" — "))}`;
}

function walletUrl(method, res) {
  const note = encodeURIComponent(`Rippin Chicken ${res.code}`);
  const amt = res.total.toFixed(2);
  if (method === "venmo") {
    const to = CONFIG.venmo ? `&recipients=${encodeURIComponent(CONFIG.venmo)}` : "";
    return `https://venmo.com/?txn=pay&audience=private&amount=${amt}&note=${note}${to}`;
  }
  if (method === "cashapp") {
    const tag = CONFIG.cashApp ? CONFIG.cashApp.replace(/^\$/, "") : "";
    return tag ? `https://cash.app/$${tag}/${amt}` : `https://cash.app/`;
  }
  if (method === "paypal") {
    if (CONFIG.paypalEmail) {
      return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(CONFIG.paypalEmail)}&item_name=${note}&amount=${amt}&currency_code=USD`;
    }
    if (CONFIG.paypalMe) {
      return `https://www.paypal.com/paypalme/${encodeURIComponent(CONFIG.paypalMe)}/${amt}`;
    }
    return `https://www.paypal.com/myaccount/transfer/homepage/send`;
  }
  return "#";
}

function syncPayBox() {
  const method = payMethod();
  const card = method === "card";
  const wallet = ["paypal", "venmo", "cashapp"].includes(method);
  $("card-box").hidden = !card;
  $("wallet-box").hidden = !wallet;
  if (wallet) {
    const names = { paypal: "PayPal", venmo: "Venmo", cashapp: "Cash App" };
    $("wallet-copy").textContent = `We’ll confirm your reservation, then open ${names[method]} so you can send ${money(subtotal())}. Put your booking code in the note and send it to Rippin Chicken, ${CONFIG.displayPhone}.`;
    $("wallet-link").textContent = `Open ${names[method]}`;
  }
}

function last4() {
  const d = digits($("card-number").value);
  return d.slice(-4);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function finish(method) {
  const code = bookingCode();
  const res = reservationPayload(code, method, method === "card" ? last4() : "");
  localStorage.setItem("rc-last-reservation", JSON.stringify(res));
  $("card-number").value = "";
  $("card-cvc").value = "";
  if (["paypal", "venmo", "cashapp"].includes(method)) {
    const url = walletUrl(method, res);
    $("wallet-link").href = url;
    window.open(url, "_blank", "noopener");
  }
  showConfirmation(res);
  state.cart = {};
  saveCart();
  renderGear();
  updateCartBadge();
  goStep(5);
}

function showConfirmation(res) {
  const wallet = ["paypal", "venmo", "cashapp"].includes(res.method);
  const payBtn = wallet
    ? `<a class="btn btn-primary" href="${walletUrl(res.method, res)}" target="_blank" rel="noopener">Send ${money(res.total)} in ${labelFor(res.method)}</a>`
    : `<a class="btn btn-primary" href="${smsHref(res)}">Text ${res.code} to the truck</a>`;
  $("done").innerHTML = `
    <p class="eyebrow">${res.method === "sand" ? "You’re booked" : "Reservation confirmed"}</p>
    <div class="done-code">${res.code}</div>
    <p>${res.name}, we’ll look for you at <strong>${res.location}</strong>${res.hotel ? ` · ${res.hotel}` : ""} on <strong>${formatDate(res.date)}</strong>${res.days > 1 ? ` through ${formatDate(res.endDate)}` : ""}.</p>
    <p>${res.items.map((i) => `${i.qty} × ${i.name}`).join(" · ")}<br><strong>${money(res.total)}</strong> · ${labelFor(res.method)}${res.last4 ? ` · card ending ${res.last4}` : ""}</p>
    <p>Screenshot this, and text it to us so the truck has your name.</p>
    <div class="hero-cta" style="justify-content:center">
      ${payBtn}
      <a class="btn btn-ghost" href="${smsHref(res)}">Text the truck</a>
    </div>
  `;
}

function labelFor(method) {
  return {
    card: "Paid by card",
    paypal: "PayPal",
    venmo: "Venmo",
    cashapp: "Cash App",
    sand: "Pay on the sand"
  }[method] || method;
}

function formatDate(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) {
    setQty(add.dataset.add, cartQty(add.dataset.add) + 1);
    toast("Added to your rental");
  }
  const qty = e.target.closest("[data-qty]");
  if (qty) setQty(qty.dataset.qty, cartQty(qty.dataset.qty) + Number(qty.dataset.delta));
  if (e.target.closest("[data-open-checkout]")) openCheckout();
});

$("cart-btn").addEventListener("click", openCheckout);
$("close-panel").addEventListener("click", closeCheckout);
$("overlay").addEventListener("click", (e) => {
  if (e.target === $("overlay")) closeCheckout();
});
$("menu-btn").addEventListener("click", () => {
  const open = $("nav-links").classList.toggle("is-open");
  $("menu-btn").setAttribute("aria-expanded", String(open));
});
$("nav-links").addEventListener("click", () => $("nav-links").classList.remove("is-open"));

document.querySelectorAll('input[name="location"]').forEach((el) => {
  el.addEventListener("change", () => {
    $("hotel-field").hidden = selectedLocation() !== "Hotel / condo drop";
  });
});
document.querySelectorAll('input[name="pay"]').forEach((el) => {
  el.addEventListener("change", () => {
    syncPayBox();
    if (state.step === 4) {
      $("next-btn").textContent = payMethod() === "sand"
        ? "Confirm reservation"
        : `Pay ${money(subtotal())}`;
    }
  });
});

$("back-btn").addEventListener("click", () => goStep(state.step - 1));

$("checkout-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = validateStep(state.step);
  if (err) return showError(err);
  if (state.step < 4) return goStep(state.step + 1);
  const method = payMethod();
  $("next-btn").disabled = true;
  $("next-btn").textContent = method === "sand" ? "Saving…" : "Processing…";
  await sleep(method === "card" ? 900 : 400);
  try {
    await finish(method);
  } finally {
    $("next-btn").disabled = false;
  }
});

$("card-number").addEventListener("input", (e) => {
  const d = digits(e.target.value).slice(0, 16);
  e.target.value = d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
});
$("card-exp").addEventListener("input", (e) => {
  let d = digits(e.target.value).slice(0, 4);
  if (d.length >= 3) d = d.slice(0, 2) + " / " + d.slice(2);
  e.target.value = d;
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("overlay").hidden) closeCheckout();
});
window.addEventListener("scroll", () => {
  $("nav").classList.toggle("is-scrolled", window.scrollY > 8);
}, { passive: true });

$("date").min = todayISO();
$("end-date").min = todayISO();
$("date").addEventListener("change", () => {
  $("end-date").min = $("date").value || todayISO();
  if ($("end-date").value && $("end-date").value < $("date").value) $("end-date").value = $("date").value;
});

renderGear();
updateCartBadge();
if (location.hash === "#reserve") openCheckout();
