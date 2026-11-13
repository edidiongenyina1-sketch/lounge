/* =========================================================
   DE MANAGERS COURT — app logic
   Menu · Cart · Checkout · Payments · Order tracking
   ========================================================= */
(function () {
  "use strict";
  const C = window.CONFIG, MENU = window.MENU, CATS = window.MENU_CATEGORIES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => "₦" + Math.round(n).toLocaleString("en-NG");
  const byId = Object.fromEntries(MENU.map(m => [m.id, m]));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Demo tracking speed: seconds each stage lasts before advancing automatically.
     When you connect a real backend, statuses come from your kitchen instead. */
  const DEMO_STAGE_SECONDS = 60;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- Icons ---------- */
  const ICONS = {
    pot: '<path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5Z"/><path d="M2 10h20M9 6c0-1 1-1.5 1-2.5M14 6c0-1 1-1.5 1-2.5"/>',
    flame: '<path d="M12 21c4 0 7-2.8 7-6.8 0-3.6-2.6-5.7-4-8.2-.5 2-1.7 3-3 3.5C12 7 11 4.5 9 3c.3 3-3.9 5.5-3.9 10.6C5.1 18 8 21 12 21Z"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M8 7c1.5-2 6.5-2 8 0M12 3v2"/>',
    soup: '<path d="M3 12h18a9 9 0 0 1-18 0Z"/><circle cx="9" cy="15" r="1.4"/><circle cx="14" cy="16" r="1"/><path d="m15 12 5-8"/>',
    glass: '<path d="M5 4h14l-7 8-7-8Z"/><path d="M12 12v8M8 20h8M15 4l2-2"/>',
    bottle: '<path d="M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3V2Z"/><path d="M8 13h8"/>',
    can: '<rect x="7" y="4" width="10" height="17" rx="2"/><path d="M7 8h10M10 2h4"/>',
    smoke: '<path d="M10 22h4M12 22v-6M8 16h8l-1-5H9l-1 5Z"/><path d="M12 11V8M9 6c0-2 3-2 3-4M14 6c0-1.5 2-1.5 2-3"/>',
    all: '<path d="M4 6h16M4 12h16M4 18h10"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.all}</svg>`;
  const catOf = id => CATS.find(c => c.id === id);

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Opening hours ---------- */
  function isOpenNow(d = new Date()) {
    const h = d.getHours() + d.getMinutes() / 60, day = d.getDay();
    const [o, c] = C.openingTimes[day], [, pc] = C.openingTimes[(day + 6) % 7];
    return (h >= o && h < c) || (pc > 24 && h < pc - 24);
  }

  /* =========================================================
     MENU
     ========================================================= */
  const state = { cat: "all", q: "", tags: new Set() };

  function renderTabs() {
    const tabs = [{ id: "all", name: "All", icon: "all" }, ...CATS];
    $("#menuTabs").innerHTML = tabs.map(t =>
      `<button class="tab" role="tab" data-cat="${t.id}" aria-selected="${t.id === state.cat}">${icon(t.icon)}${esc(t.name)}</button>`).join("");
  }

  function dishCard(m, i) {
    const cat = catOf(m.cat), qty = cart[m.id]?.qty || 0;
    const tagLabel = { signature: "Signature", spicy: "Spicy", veg: "Meat-free", new: "New", popular: "Popular", share: "For sharing" };
    const tags = m.tags.slice(0, 2).map(t => `<span class="tag tag--${t}">${tagLabel[t] || t}</span>`).join("");
    const media = m.img
      ? `<img src="${esc(m.img)}" alt="${esc(m.name)}" loading="lazy">`
      : `<div class="dish__art g-${m.cat}">${icon(cat.icon)}</div>`;
    const ctrl = qty
      ? `<div class="qty" aria-label="Quantity"><button data-dec="${m.id}" aria-label="Remove one">−</button><span>${qty}</span><button data-inc="${m.id}" aria-label="Add one">+</button></div>`
      : `<button class="add-btn" data-inc="${m.id}">+ Add</button>`;
    return `<article class="dish" style="animation-delay:${Math.min(i, 12) * 35}ms">
      <div class="dish__img">${media}<div class="dish__tags">${tags}</div></div>
      <div class="dish__body">
        <h3 class="dish__name">${esc(m.name)}</h3>
        <p class="dish__desc">${esc(m.desc)}</p>
        <div class="dish__foot"><span class="dish__price">${fmt(m.price)}</span>${ctrl}</div>
      </div></article>`;
  }

  function filteredMenu() {
    const q = state.q.trim().toLowerCase();
    return MENU.filter(m =>
      (q ? true : state.cat === "all" || m.cat === state.cat) &&
      (!q || (m.name + " " + m.desc + " " + catOf(m.cat).name).toLowerCase().includes(q)) &&
      [...state.tags].every(t => m.tags.includes(t)));
  }

  function renderMenu() {
    const list = filteredMenu();
    $("#menuGrid").innerHTML = list.map(dishCard).join("");
    $("#menuEmpty").hidden = list.length > 0;
  }

  // Update just the quantity controls without re-animating the grid
  function refreshMenuControls() {
    $$("#menuGrid .dish").forEach(card => {
      const btn = card.querySelector("[data-inc]"); if (!btn) return;
      const id = btn.dataset.inc, foot = card.querySelector(".dish__foot");
      const qty = cart[id]?.qty || 0;
      foot.lastElementChild.outerHTML = qty
        ? `<div class="qty" aria-label="Quantity"><button data-dec="${id}" aria-label="Remove one">−</button><span>${qty}</span><button data-inc="${id}" aria-label="Add one">+</button></div>`
        : `<button class="add-btn" data-inc="${id}">+ Add</button>`;
    });
  }

  /* =========================================================
     CART
     ========================================================= */
  let cart = store.get("ml_cart", {});
  Object.keys(cart).forEach(id => { if (!byId[id]) delete cart[id]; });

  const cartCount = () => Object.values(cart).reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = () => Object.entries(cart).reduce((a, [id, l]) => a + byId[id].price * l.qty, 0);

  function setQty(id, qty, silent) {
    if (!byId[id]) return false;
    if (qty <= 0) delete cart[id];
    else cart[id] = { qty: Math.min(qty, 99), note: cart[id]?.note || "" };
    store.set("ml_cart", cart);
    updateCartUI();
    if (!silent) { const b = $("#cartBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
    return true;
  }
  const addToCart = (id, n = 1) => setQty(id, (cart[id]?.qty || 0) + n);

  function updateCartUI() {
    $("#cartCount").textContent = cartCount();
    $("#cartSubtotal").textContent = fmt(cartSubtotal());
    $("#checkoutBtn").disabled = cartCount() === 0;
    const ids = Object.keys(cart);
    $("#cartItems").innerHTML = ids.length ? ids.map(id => {
      const m = byId[id], l = cart[id];
      return `<div class="cart-line">
        <div class="cart-line__thumb g-${m.cat}">${icon(catOf(m.cat).icon)}</div>
        <div><h5>${esc(m.name)}</h5><small>${fmt(m.price)} × ${l.qty} = <b>${fmt(m.price * l.qty)}</b></small>
          <input class="cart-line__note" data-note="${id}" placeholder="Add a note (e.g. extra pepper)" value="${esc(l.note)}" maxlength="80"></div>
        <div class="qty"><button data-dec="${id}" aria-label="Remove one">−</button><span>${l.qty}</span><button data-inc="${id}" aria-label="Add one">+</button></div>
      </div>`;
    }).join("") : `<div class="cart-empty"><strong>Your cart is empty</strong>Add something delicious from the menu, or ask Ada for a recommendation.</div>`;
    refreshMenuControls();
  }

  /* ---------- Drawer & modals ---------- */
  function openDrawer() { $("#cartDrawer").classList.add("open"); $("#cartDrawer").setAttribute("aria-hidden", "false"); $("#scrim").hidden = false; document.body.classList.add("locked"); }
  function closeDrawer() { $("#cartDrawer").classList.remove("open"); $("#cartDrawer").setAttribute("aria-hidden", "true"); $("#scrim").hidden = true; if (!$$(".modal:not([hidden])").length) document.body.classList.remove("locked"); }
  function openModal(id) { $(id).hidden = false; document.body.classList.add("locked"); }
  function closeModal(id) { $(id).hidden = true; if (!$$(".modal:not([hidden])").length && !$("#cartDrawer").classList.contains("open")) document.body.classList.remove("locked"); }

  /* =========================================================
     CHECKOUT
     ========================================================= */
  const form = $("#checkoutForm");
  const mode = () => form.mode.value;
  const zoneFee = () => mode() === "delivery" ? (C.deliveryZones[form.zone.value]?.fee || 0) : 0;
  const svc = () => cartSubtotal() * (C.serviceChargePercent || 0) / 100;
  const total = () => cartSubtotal() + zoneFee() + svc();

  function openCheckout() {
    if (!cartCount()) { toast("Your cart is empty"); return; }
    closeDrawer();
    const saved = store.get("ml_customer", {});
    ["name", "phone", "email", "address"].forEach(k => { if (saved[k] && !form[k].value) form[k].value = saved[k]; });
    if (saved.zone != null && form.zone.value === "0") form.zone.value = saved.zone;
    $("#coError").textContent = "";
    syncCheckout();
    openModal("#checkoutModal");
  }

  function syncCheckout() {
    const md = mode();
    $$("[data-mode-show]").forEach(el => el.hidden = el.dataset.modeShow !== md);
    $$("[data-pay-for]").forEach(el => {
      const show = el.dataset.payFor.split(" ").includes(md);
      el.hidden = !show;
      if (!show && el.querySelector("input").checked) form.querySelector('input[name="pay"][value="online"]').checked = true;
    });
    const pay = form.pay.value;
    $("#bankBox").hidden = pay !== "transfer";
    $("#coItems").innerHTML = Object.entries(cart).map(([id, l]) =>
      `<div class="row"><span>${l.qty}× ${esc(byId[id].name)}</span><span>${fmt(byId[id].price * l.qty)}</span></div>`).join("");
    $("#coSub").textContent = fmt(cartSubtotal());
    $("#coFeeRow").hidden = md !== "delivery";
    $("#coFee").textContent = fmt(zoneFee());
    $("#coSvcRow").hidden = !C.serviceChargePercent;
    $("#coSvc").textContent = fmt(svc());
    $("#coTotal").textContent = fmt(total());
    $("#placeBtn").textContent = pay === "online" ? `Pay ${fmt(total())}` : "Place order";
    $("#demoNote").textContent = pay === "online" && !C.paystackPublicKey ? "Demo mode: payment will be simulated." : "";
  }

  function validate() {
    $$(".field.invalid", form).forEach(f => f.classList.remove("invalid"));
    const errs = [];
    const need = (name, msg) => { if (!form[name].value.trim()) { form[name].closest(".field").classList.add("invalid"); errs.push(msg); } };
    need("name", "your name");
    const phone = form.phone.value.replace(/[^\d+]/g, "");
    if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone)) { form.phone.closest(".field").classList.add("invalid"); errs.push("a valid Nigerian phone number"); }
    if (mode() === "delivery") need("address", "a delivery address");
    if (mode() === "dinein") need("table", "your table number");
    if (form.pay.value === "online" && C.paystackPublicKey && !/^\S+@\S+\.\S+$/.test(form.email.value)) {
      form.email.closest(".field").classList.add("invalid"); errs.push("an email for your Paystack receipt");
    }
    $("#coError").textContent = errs.length ? "Please add " + errs.join(", ") + "." : "";
    return !errs.length;
  }

  function newCode() {
    const orders = store.get("ml_orders", {});
    let code; do { code = "DMC-" + Math.floor(1000 + Math.random() * 9000); } while (orders[code]);
    return code;
  }

  function buildOrder(paid, reference) {
    const md = mode(), pay = form.pay.value;
    return {
      code: newCode(), createdAt: Date.now(), mode: md, pay, paid: !!paid, reference: reference || null,
      customer: { name: form.name.value.trim(), phone: form.phone.value.trim(), email: form.email.value.trim() },
      address: md === "delivery" ? `${form.address.value.trim()} (${C.deliveryZones[form.zone.value].name})` : null,
      table: md === "dinein" ? form.table.value.trim() : null,
      pickupTime: md === "pickup" ? form.pickupTime.value : null,
      note: form.note.value.trim(),
      items: Object.entries(cart).map(([id, l]) => ({ id, name: byId[id].name, price: byId[id].price, qty: l.qty, note: l.note })),
      subtotal: cartSubtotal(), fee: zoneFee(), service: svc(), total: total()
    };
  }

  function finalizeOrder(order) {
    const orders = store.get("ml_orders", {});
    orders[order.code] = order; store.set("ml_orders", orders);
    store.set("ml_customer", { name: order.customer.name, phone: order.customer.phone, email: order.customer.email, address: form.address.value, zone: form.zone.value });
    /* ▶ BACKEND HOOK: send `order` to your server / kitchen dashboard here, e.g.
       fetch("/api/orders", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(order) }); */
    cart = {}; store.set("ml_cart", cart); updateCartUI();
    form.note.value = "";
    closeModal("#checkoutModal");
    $("#successCode").textContent = order.code;
    $("#successMsg").textContent = {
      online: "Payment received. The kitchen has your order.",
      cod: "Please have cash or your card ready for the rider.",
      counter: "Pay at the counter when you arrive.",
      transfer: `Transfer ${fmt(order.total)} to the account shown and use ${order.code} as the narration. We'll start once it's confirmed.`
    }[order.pay];
    $("#successWa").href = waLink(orderMessage(order));
    openModal("#successModal");
    renderRecent();
  }

  function orderMessage(o) {
    const lines = o.items.map(i => `• ${i.qty}× ${i.name} (${fmt(i.price * i.qty)})${i.note ? " – " + i.note : ""}`);
    const how = o.mode === "delivery" ? `Delivery to: ${o.address}` : o.mode === "pickup" ? `Pickup: ${o.pickupTime}` : `Dine-in: ${o.table}`;
    const payTxt = { online: "Paid online" + (o.reference ? ` (ref ${o.reference})` : ""), cod: "Cash/POS on delivery", counter: "Pay at counter", transfer: "Bank transfer" }[o.pay];
    return `Hello ${C.name}! New order ${o.code}\n\n${lines.join("\n")}\n\nTotal: ${fmt(o.total)}\n${how}\nPayment: ${payTxt}\nName: ${o.customer.name}\nPhone: ${o.customer.phone}${o.note ? "\nNote: " + o.note : ""}`;
  }
  const waLink = text => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------- Payments ---------- */
  function loadPaystack() {
    return new Promise((res, rej) => {
      if (window.PaystackPop) return res();
      const s = document.createElement("script"); s.src = "https://js.paystack.co/v1/inline.js";
      s.onload = res; s.onerror = () => rej(new Error("Could not load Paystack")); document.head.appendChild(s);
    });
  }

  async function payOnline(order) {
    if (!C.paystackPublicKey) { // DEMO
      $("#demoPayAmount").textContent = fmt(order.total);
      openModal("#demoPayModal");
      $("#demoPaySuccess").onclick = () => { closeModal("#demoPayModal"); order.paid = true; order.reference = "DEMO-" + Date.now().toString(36).toUpperCase(); finalizeOrder(order); };
      $("#demoPayCancel").onclick = () => { closeModal("#demoPayModal"); toast("Payment cancelled"); };
      return;
    }
    try {
      $("#placeBtn").disabled = true; $("#placeBtn").textContent = "Opening secure payment…";
      await loadPaystack();
      const handler = window.PaystackPop.setup({
        key: C.paystackPublicKey, email: order.customer.email, amount: Math.round(order.total * 100), currency: "NGN",
        ref: order.code + "-" + Date.now(),
        metadata: { order_code: order.code, custom_fields: [{ display_name: "Phone", variable_name: "phone", value: order.customer.phone }] },
        callback: resp => { order.paid = true; order.reference = resp.reference; finalizeOrder(order); },
        onClose: () => toast("Payment window closed")
      });
      handler.openIframe();
    } catch (e) { $("#coError").textContent = "Couldn't reach Paystack. Check your connection, or choose another payment option."; }
    finally { $("#placeBtn").disabled = false; syncCheckout(); }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!cartCount() || !validate()) return;
    const order = buildOrder(false);
    if (order.pay === "online") payOnline(order); else finalizeOrder(order);
  });
  form.addEventListener("change", syncCheckout);

  /* =========================================================
     ORDER TRACKING
     ========================================================= */
  function stagesFor(o) {
    const base = [{ k: "Order received", d: "We've got your order." }];
    if (o.pay === "transfer") base.push({ k: "Payment confirmed", d: "Transfer verified by our cashier." });
    else base.push({ k: "Confirmed", d: "The lounge has accepted your order." });
    base.push({ k: "Preparing", d: "Our chefs are on it, fresh from the pot and grill." });
    if (o.mode === "delivery") base.push({ k: "Out for delivery", d: "Your rider is on the way." }, { k: "Delivered", d: "Enjoy your meal!" });
    if (o.mode === "pickup") base.push({ k: "Ready for pickup", d: "Come grab it at the counter." }, { k: "Collected", d: "Thanks for stopping by!" });
    if (o.mode === "dinein") base.push({ k: "Served", d: "On your table. Enjoy!" });
    return base;
  }
  function progress(o) {
    const st = stagesFor(o);
    if (o.status != null) return { st, i: Math.min(o.status, st.length - 1) }; // set by a real backend
    const i = Math.min(Math.floor((Date.now() - o.createdAt) / 1000 / DEMO_STAGE_SECONDS), st.length - 1);
    return { st, i };
  }
  function getOrder(code) {
    code = String(code || "").toUpperCase().replace(/\s/g, "");
    if (/^\d{4}$/.test(code)) code = "DMC-" + code;
    if (/^DMC\d{4}$/.test(code)) code = "DMC-" + code.slice(3);
    return store.get("ml_orders", {})[code] || null;
  }
  function orderStatusText(o) { const { st, i } = progress(o); return st[i].k; }

  let trackTimer, trackedCode;
  function renderTrack(code) {
    const o = getOrder(code), panel = $("#trackPanel");
    clearInterval(trackTimer);
    if (!o) {
      panel.innerHTML = `<div class="track__placeholder"><svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="24" cy="24" r="20"/><path d="M17 17l14 14M31 17 17 31"/></svg>
        <p>We couldn't find <strong>${esc(code)}</strong> on this device.<br>Check the code, or call us on <a class="linklike" href="tel:${C.phone.replace(/\s/g, "")}">${esc(C.phone)}</a>.</p></div>`;
      return;
    }
    trackedCode = o.code;
    const { st, i } = progress(o), done = i === st.length - 1;
    const remaining = done ? 0 : Math.max(1, Math.ceil(((st.length - 1) * DEMO_STAGE_SECONDS - (Date.now() - o.createdAt) / 1000) / 60) + (o.mode === "delivery" ? 20 : 10));
    const badge = done ? `<span class="badge badge--done">✓ ${esc(st[i].k)}</span>` : `<span class="badge ${i === 0 && o.pay === "transfer" ? "badge--warn" : ""}"><span class="live"></span>${esc(st[i].k)}</span>`;
    const how = o.mode === "delivery" ? "Delivery" : o.mode === "pickup" ? "Pickup" : `Dine-in · ${esc(o.table)}`;
    const payTxt = o.paid ? "Paid" : { cod: "Pay on delivery", counter: "Pay at counter", transfer: "Awaiting transfer" }[o.pay] || "Unpaid";
    panel.innerHTML = `
      <div class="tk__top">
        <div><div class="tk__code">${o.code}</div><div class="tk__meta">${how} · ${new Date(o.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · ${payTxt}</div></div>
        ${badge}
      </div>
      ${done ? "" : `<div class="eta"><span class="muted">Estimated ${o.mode === "delivery" ? "arrival" : "ready"} in</span><strong>~${remaining} min</strong></div>`}
      <ol class="timeline">${st.map((s, n) => `
        <li class="tl ${n < i || (done && n === i) ? "done" : n === i ? "current" : ""}">
          <span class="tl__dot">${n < i || (done && n === i) ? "✓" : n + 1}</span>
          <div><h5>${esc(s.k)}</h5><p>${esc(s.d)}</p></div>
        </li>`).join("")}</ol>
      <div class="tk__items">
        ${o.items.map(it => `<div class="row"><span>${it.qty}× ${esc(it.name)}</span><span>${fmt(it.price * it.qty)}</span></div>`).join("")}
        <div class="row" style="margin-top:.4rem"><strong>Total</strong><strong style="color:var(--gold-2)">${fmt(o.total)}</strong></div>
      </div>
      <div class="tk__actions">
        <a class="btn btn--ghost" href="tel:${C.phone.replace(/\s/g, "")}">Call the lounge</a>
        <a class="btn btn--ghost" target="_blank" rel="noopener" href="${waLink(`Hi, I'm checking on my order ${o.code}`)}">WhatsApp us</a>
        ${done ? `<button class="btn btn--gold" data-reorder="${o.code}">Order again</button>` : ""}
      </div>`;
    if (!done) trackTimer = setInterval(() => trackedCode === o.code && renderTrack(o.code), 5000);
  }

  function trackOrder(code) {
    $("#trackInput").value = String(code).toUpperCase();
    renderTrack(code);
    $("#track").scrollIntoView({ behavior: "smooth" });
  }

  function renderRecent() {
    const orders = Object.values(store.get("ml_orders", {})).sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
    $("#recentOrders").innerHTML = orders.length ? `<p>Your recent orders</p>` + orders.map(o => `<button data-track="${o.code}">${o.code}</button>`).join("") : "";
  }

  /* =========================================================
     EVENTS & INIT
     ========================================================= */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-inc],[data-dec],[data-cat],[data-tag],[data-track],[data-reorder],[data-close-drawer],[data-close-modal]");
    if (!t) return;
    if (t.dataset.inc) { const first = !cart[t.dataset.inc]; addToCart(t.dataset.inc); if (first) toast(`${byId[t.dataset.inc].name} added`); }
    else if (t.dataset.dec) setQty(t.dataset.dec, (cart[t.dataset.dec]?.qty || 0) - 1, true);
    else if (t.dataset.cat) { state.cat = t.dataset.cat; state.q = ""; $("#menuSearch").value = ""; renderTabs(); renderMenu(); }
    else if (t.dataset.tag) { const g = t.dataset.tag; state.tags.has(g) ? state.tags.delete(g) : state.tags.add(g); t.classList.toggle("active"); renderMenu(); }
    else if (t.dataset.track) trackOrder(t.dataset.track);
    else if (t.dataset.reorder) { const o = getOrder(t.dataset.reorder); o.items.forEach(it => byId[it.id] && setQty(it.id, (cart[it.id]?.qty || 0) + it.qty, true)); openDrawer(); }
    else if (t.hasAttribute("data-close-drawer")) closeDrawer();
    else if (t.hasAttribute("data-close-modal")) closeModal("#" + t.closest(".modal").id);
  });
  document.addEventListener("input", e => {
    if (e.target.dataset.note) { cart[e.target.dataset.note].note = e.target.value; store.set("ml_cart", cart); }
  });
  $("#menuSearch").addEventListener("input", e => { state.q = e.target.value; renderMenu(); });
  $("#cartBtn").onclick = openDrawer;
  $("#scrim").onclick = closeDrawer;
  $("#checkoutBtn").onclick = openCheckout;
  $("#trackForm").addEventListener("submit", e => { e.preventDefault(); renderTrack($("#trackInput").value.trim()); });
  $("#successTrack").onclick = () => { closeModal("#successModal"); trackOrder($("#successCode").textContent); };
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) closeModal("#" + m.id); }));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const open = $$(".modal:not([hidden])").pop();
    if (open) closeModal("#" + open.id); else closeDrawer();
  });

  // nav
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.onclick = () => { const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
  links.addEventListener("click", e => { if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });

  // static content from config
  function fillInfo() {
    const open = isOpenNow();
    $("#openStatus").textContent = open ? "Open now" : "Closed now · order ahead";
    $(".hero .eyebrow .dot").classList.toggle("closed", !open);
    $("#addr").textContent = C.address;
    $("#dirLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.mapQuery);
    $("#mapCard").href = $("#dirLink").href;
    $("#mapAddr").textContent = C.address;
    const dow = new Date().getDay(), order = [1, 2, 3, 4, 5, 6, 0];
    const dayName = d => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d];
    $("#weekList").innerHTML = order.map(d => C.events.find(e => e.day === d)).filter(Boolean).map(e => `
      <li class="ev ${e.day === dow ? "ev--today" : ""}">
        <div class="ev__day"><span>${dayName(e.day).slice(0, 3)}</span>${e.day === dow ? "<em>Tonight</em>" : ""}</div>
        <div class="ev__body"><h3>${esc(e.title)} ${e.tag ? `<span class="ev__tag">${esc(e.tag)}</span>` : ""}</h3><p>${esc(e.desc)}</p></div>
        <div class="ev__time">${esc(e.time)}</div>
        <a class="ev__cta" target="_blank" rel="noopener" href="${waLink(`Hello ${C.name}, I'd like to book a table for ${e.title} on ${dayName(e.day)}.`)}">Book a table</a>
      </li>`).join("");
    $("#faqList").innerHTML = C.faq.map((f, i) => `<details class="qa" ${i === 0 ? "open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
    const today = new Date().getDay(), dayGroup = today === 0 ? 2 : today >= 5 ? 1 : 0;
    $("#hoursList").innerHTML = C.hours.map((h, i) => `<li class="${i === dayGroup ? "today" : ""}"><span>${esc(h.days)}</span><span>${esc(h.time)}</span></li>`).join("");
    $("#waReserve").href = waLink(`Hello ${C.name}, I'd like to reserve a table.`);
    $("#phoneLink").href = "tel:" + C.phone.replace(/\s/g, ""); $("#phoneLink").textContent = C.phone;
    $("#igLink").href = "https://instagram.com/" + C.instagram;
    $("#waLink").href = waLink(`Hello ${C.name}!`);
    $("#mailLink").href = "mailto:" + C.email;
    $("#year").textContent = new Date().getFullYear();
    $("#zoneSelect").innerHTML = C.deliveryZones.map((z, i) => `<option value="${i}">${esc(z.name)} · ${fmt(z.fee)}</option>`).join("");
    const b = C.bank;
    $("#bankBox").innerHTML = `<div class="row"><span class="muted">Bank</span><strong>${esc(b.bankName)}</strong></div>
      <div class="row"><span class="muted">Account name</span><strong>${esc(b.accountName)}</strong></div>
      <div class="row"><span class="muted">Account no.</span><span><strong>${esc(b.accountNumber)}</strong> <button type="button" id="copyAcct">Copy</button></span></div>
      <p class="muted small" style="margin:.5rem 0 0">Use your order code as the transfer narration. We'll confirm and start cooking.</p>`;
    $("#copyAcct").onclick = () => { navigator.clipboard?.writeText(b.accountNumber).then(() => toast("Account number copied"), () => {}); };
  }

  fillInfo(); renderTabs(); renderMenu(); updateCartUI(); renderRecent();

  // Public API used by the AI assistant
  window.ML = { MENU, CATS, byId, fmt, esc, addToCart, setQty, getCart: () => cart, cartSubtotal, cartCount,
    openDrawer, openCheckout, trackOrder, getOrder, orderStatusText, isOpenNow, toast,
    recentOrders: () => Object.values(store.get("ml_orders", {})).sort((a, b) => b.createdAt - a.createdAt) };
})();
