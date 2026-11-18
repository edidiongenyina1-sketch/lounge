/* =========================================================
   DE MANAGERS COURT — shared core (loaded on every page)
   Cart, orders, header, footer and small helpers.
   Exposes window.ML for the page scripts and for Ada.
   ========================================================= */
(function () {
  "use strict";
  const C = window.CONFIG, MENU = window.MENU, CATS = window.MENU_CATEGORIES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => "₦" + Math.round(n).toLocaleString("en-NG");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = Object.fromEntries(MENU.map(m => [m.id, m]));
  const catOf = id => CATS.find(c => c.id === id);
  const page = document.body.dataset.page || "";

  /* Demo tracking speed: seconds per stage before it advances on its own.
     Once a backend sets order.status, real statuses are shown instead. */
  const DEMO_STAGE_SECONDS = 60;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };

  const waLink = text => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;
  const tel = () => "tel:" + C.phone.replace(/\s/g, "");
  const hh = h => { h = h % 24; return h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? h + " AM" : (h - 12) + " PM"; };
  const imgOf = m => (m && m.img) || null;
  // photo, or a placeholder panel with the dish name when there is no photo yet
  const pic = (m, cls = "", w = 640, h = 480) => m && m.img
    ? `<img class="${cls}" src="${esc(m.img)}" alt="${esc(m.name)}" loading="lazy" width="${w}" height="${h}">`
    : `<span class="noimg ${cls}" role="img" aria-label="${esc(m ? m.name : "")}, photo coming soon"><span>${esc(m ? m.name : "")}</span></span>`;

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Hours ---------- */
  function isOpenNow(d = new Date()) {
    const h = d.getHours() + d.getMinutes() / 60, day = d.getDay();
    const [o, c] = C.openingTimes[day], [, pc] = C.openingTimes[(day + 6) % 7];
    return (h >= o && h < c) || (pc > 24 && h < pc - 24);
  }
  function todayHours() { const [o, c] = C.openingTimes[new Date().getDay()]; return `${hh(o)} – ${hh(c)}`; }

  /* =========================================================
     CART
     ========================================================= */
  let cart = store.get("ml_cart", {});
  Object.keys(cart).forEach(id => { if (!byId[id]) delete cart[id]; });
  const listeners = [];
  const onCart = fn => listeners.push(fn);
  const cartCount = () => Object.values(cart).reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = () => Object.entries(cart).reduce((a, [id, l]) => a + byId[id].price * l.qty, 0);

  function emit() {
    store.set("ml_cart", cart);
    $$("[data-cart-count]").forEach(el => el.textContent = cartCount());
    const bar = $("#orderBar");
    if (bar) {
      const n = cartCount();
      bar.hidden = !n;
      document.body.classList.toggle("has-bar", !!n);
      if (n) $("#orderBarText").textContent = `${n} item${n === 1 ? "" : "s"} · ${fmt(cartSubtotal())}`;
    }
    listeners.forEach(fn => fn());
  }
  function setQty(id, qty, quiet) {
    if (!byId[id]) return false;
    if (qty <= 0) delete cart[id];
    else cart[id] = { qty: Math.min(qty, 99), note: cart[id]?.note || "" };
    emit();
    if (!quiet) { const b = $(".cart-btn"); if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); } }
    return true;
  }
  const addToCart = (id, n = 1) => setQty(id, (cart[id]?.qty || 0) + n);
  const setNote = (id, note) => { if (cart[id]) { cart[id].note = note; store.set("ml_cart", cart); } };
  const clearCart = () => { cart = {}; emit(); };

  // qty control markup shared by menu, home and cart
  function ctrlHTML(id) {
    const qty = cart[id]?.qty || 0;
    return qty
      ? `<div class="qty" aria-label="Quantity"><button type="button" data-dec="${id}" aria-label="Remove one ${esc(byId[id].name)}">−</button><span>${qty}</span><button type="button" data-inc="${id}" aria-label="Add one ${esc(byId[id].name)}">+</button></div>`
      : `<button type="button" class="add" data-inc="${id}" aria-label="Add ${esc(byId[id].name)} to your order">Add</button>`;
  }
  const refreshCtrls = () => $$("[data-ctrl]").forEach(el => { el.innerHTML = ctrlHTML(el.dataset.ctrl); });
  onCart(refreshCtrls);

  /* =========================================================
     ORDERS
     ========================================================= */
  const orders = () => store.get("ml_orders", {});
  function newCode() {
    const all = orders(); let code;
    do { code = "DMC-" + Math.floor(1000 + Math.random() * 9000); } while (all[code]);
    return code;
  }
  function saveOrder(o) {
    const all = orders(); all[o.code] = o; store.set("ml_orders", all);
    /* ▶ BACKEND HOOK: send the order to your server or kitchen dashboard here, e.g.
       fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) }); */
  }
  function getOrder(code) {
    code = String(code || "").toUpperCase().replace(/\s/g, "");
    if (/^\d{4}$/.test(code)) code = "DMC-" + code;
    if (/^DMC\d{4}$/.test(code)) code = "DMC-" + code.slice(3);
    return orders()[code] || null;
  }
  const recentOrders = () => Object.values(orders()).sort((a, b) => b.createdAt - a.createdAt);

  function stagesFor(o) {
    const s = [{ k: "Order received", d: "We have your order." }];
    s.push(o.pay === "transfer" ? { k: "Payment confirmed", d: "Our cashier has verified your transfer." } : { k: "Confirmed", d: "The kitchen has accepted your order." });
    s.push({ k: "Preparing", d: "Your food is being cooked fresh." });
    if (o.mode === "delivery") s.push({ k: "Out for delivery", d: "Your rider is on the way." }, { k: "Delivered", d: "Enjoy your meal." });
    if (o.mode === "pickup") s.push({ k: "Ready for pickup", d: "Collect it at the counter." }, { k: "Collected", d: "Thanks for coming by." });
    if (o.mode === "dinein") s.push({ k: "Served", d: "On your table. Enjoy." });
    return s;
  }
  function progress(o) {
    const st = stagesFor(o);
    if (o.status != null) return { st, i: Math.min(o.status, st.length - 1) };
    return { st, i: Math.min(Math.floor((Date.now() - o.createdAt) / 1000 / DEMO_STAGE_SECONDS), st.length - 1) };
  }
  const orderStatusText = o => { const { st, i } = progress(o); return st[i].k; };
  const PAY_LABEL = { online: "Paid online", cod: "Cash or POS on delivery", counter: "Pay at the counter", transfer: "Bank transfer" };
  function howText(o) {
    return o.mode === "delivery" ? `Delivery to ${o.address}` : o.mode === "pickup" ? `Pickup, ${o.pickupTime.toLowerCase()}` : `Dine-in, ${o.table}`;
  }
  function orderMessage(o) {
    const lines = o.items.map(i => `• ${i.qty}× ${i.name} (${fmt(i.price * i.qty)})${i.note ? " – " + i.note : ""}`);
    return `Hello ${C.name}, new order ${o.code}\n\n${lines.join("\n")}\n\nTotal: ${fmt(o.total)}\n${howText(o)}\nPayment: ${PAY_LABEL[o.pay]}${o.reference ? " (ref " + o.reference + ")" : ""}\nName: ${o.customer.name}\nPhone: ${o.customer.phone}${o.note ? "\nNote: " + o.note : ""}`;
  }

  /* ---------- Navigation used by Ada ---------- */
  const go = url => { location.href = url; };
  function trackOrder(code) {
    if (page === "track" && window.ML.renderTrack) { window.ML.renderTrack(code); return; }
    go("track.html?code=" + encodeURIComponent(code));
  }

  /* =========================================================
     SHELL: header, footer, shared clicks
     ========================================================= */
  function shell() {
    // active nav link
    $$(".nav__links a").forEach(a => { if (a.dataset.nav === page) a.setAttribute("aria-current", "page"); });
    const burger = $("#burger"), links = $("#navLinks");
    if (burger) burger.onclick = () => { const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };

    // footer + contact bits present on many pages
    const set = (sel, fn) => $$(sel).forEach(fn);
    set("[data-fill=address]", el => el.textContent = C.address);
    set("[data-fill=phone]", el => { el.textContent = C.phone; if (el.tagName === "A") el.href = tel(); });
    set("[data-fill=email]", el => { el.textContent = C.email; if (el.tagName === "A") el.href = "mailto:" + C.email; });
    set("[data-fill=today-hours]", el => el.textContent = "Today " + todayHours());
    set("[data-fill=open-status]", el => el.textContent = isOpenNow() ? "Open now" : "Closed now · order ahead");
    set("[data-fill=open-dot]", el => el.classList.toggle("closed", !isOpenNow()));
    set("[data-fill=year]", el => el.textContent = new Date().getFullYear());
    set("[data-link=instagram]", el => el.href = "https://instagram.com/" + C.instagram);
    set("[data-link=whatsapp]", el => el.href = waLink(`Hello ${C.name}!`));
    set("[data-link=book]", el => el.href = waLink(`Hello ${C.name}, I'd like to book a table.`));
    set("[data-link=directions]", el => el.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.mapQuery));
    set("[data-link=email]", el => el.href = "mailto:" + C.email);

    document.addEventListener("click", e => {
      const t = e.target.closest("[data-inc],[data-dec]");
      if (!t) return;
      if (t.dataset.inc) { const first = !cart[t.dataset.inc]; addToCart(t.dataset.inc); if (first) toast(`${byId[t.dataset.inc].name} added to your order`); }
      else setQty(t.dataset.dec, (cart[t.dataset.dec]?.qty || 0) - 1, true);
    });
    emit();
  }

  // If a photo is missing, show the neutral placeholder instead of a broken image
  document.addEventListener("error", e => {
    const t = e.target;
    if (t.tagName === "IMG" && t.closest("main") && !t.dataset.fallback) { t.dataset.fallback = "1"; t.outerHTML = `<span class="noimg ${t.className}" role="img" aria-label="${esc(t.alt)}"><span>${esc(t.alt)}</span></span>`; }
  }, true);

  window.ML = {
    C, MENU, CATS, byId, catOf, $, $$, fmt, esc, store, page, imgOf, pic, waLink, tel, hh,
    toast, isOpenNow, todayHours,
    getCart: () => cart, cartCount, cartSubtotal, setQty, addToCart, setNote, clearCart, onCart, ctrlHTML,
    newCode, saveOrder, getOrder, recentOrders, stagesFor, progress, orderStatusText, orderMessage, howText, PAY_LABEL,
    DEMO_STAGE_SECONDS,
    // used by Ada
    openDrawer: () => go("cart.html"), openCheckout: () => go(cartCount() ? "checkout.html" : "menu.html"), trackOrder
  };
  shell();
})();
