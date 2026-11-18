/* =========================================================
   DE MANAGERS COURT — page scripts
   Each page sets <body data-page="..."> and runs its block below.
   Order flow: cart.html → checkout.html → payment.html → order-confirmed.html
   ========================================================= */
(function () {
  "use strict";
  const ML = window.ML, C = ML.C;
  const { $, $$, fmt, esc, byId, MENU, CATS, store, pic, waLink } = ML;
  const params = new URLSearchParams(location.search);
  const DRAFT = "dmc_draft";

  /* ---------- shared pieces ---------- */
  const NOTE = { signature: "House signature", spicy: "Spicy", veg: "Meat-free", new: "New", share: "For sharing" };

  function dishCard(m) {
    const notes = m.tags.filter(t => NOTE[t]).slice(0, 2).map(t => `<span class="${t === "signature" ? "sig" : ""}">${NOTE[t]}</span>`).join("");
    return `<article class="dish">
      <div class="dish__img">${pic(m)}</div>
      <div class="dish__body">
        <div class="item__head"><h3>${esc(m.name)}</h3><span class="item__price">${fmt(m.price)}</span></div>
        <p class="item__desc">${esc(m.desc)}</p>
        <div class="dish__foot">${notes ? `<p class="item__notes">${notes}</p>` : "<span></span>"}<div data-ctrl="${m.id}">${ML.ctrlHTML(m.id)}</div></div>
      </div>
    </article>`;
  }

  function itemRow(m) {
    const notes = m.tags.filter(t => NOTE[t]).map(t => `<span class="${t === "signature" ? "sig" : ""}">${NOTE[t]}</span>`).join("");
    return `<li class="item">
      ${pic(m, "item__img", 240, 240)}
      <div class="item__main">
        <div class="item__head"><h4>${esc(m.name)}</h4><i aria-hidden="true"></i><span class="item__price">${fmt(m.price)}</span></div>
        <p class="item__desc">${esc(m.desc)}</p>
        ${notes ? `<p class="item__notes">${notes}</p>` : ""}
      </div>
      <div class="item__ctrl" data-ctrl="${m.id}">${ML.ctrlHTML(m.id)}</div>
    </li>`;
  }

  function stepper(active) {
    const steps = ["Your order", "Details", "Payment", "Confirmed"];
    $$("[data-stepper]").forEach(el => {
      el.innerHTML = steps.map((s, i) => {
        const n = i + 1, state = n < active ? "done" : n === active ? "current" : "";
        return `<li class="${state}" ${n === active ? 'aria-current="step"' : ""}><span>${n < active ? "✓" : n}</span>${s}</li>`;
      }).join("");
    });
  }

  function summaryHTML(items, rows) {
    return `<div class="sum__items">${items.map(it => `
        <div class="sum__line">${pic(byId[it.id], "sum__pic", 96, 96)}
          <span>${it.qty}× ${esc(it.name)}${it.note ? `<small>${esc(it.note)}</small>` : ""}</span><b>${fmt(it.price * it.qty)}</b></div>`).join("")}</div>
      ${rows.map(([k, v, cls]) => `<div class="row ${cls || ""}"><span>${k}</span><span>${v}</span></div>`).join("")}`;
  }

  const cartItems = () => Object.entries(ML.getCart()).map(([id, l]) => ({ id, name: byId[id].name, price: byId[id].price, qty: l.qty, note: l.note }));

  /* =========================================================
     HOME
     ========================================================= */
  function home() {
    const ev = C.events.find(e => e.day === new Date().getDay());
    if (ev) $("#tonight").innerHTML = `<p class="tonight__k">Tonight at the Court</p><h2>${esc(ev.title)}</h2><p>${esc(ev.desc)}</p>
      <div class="tonight__row"><span>From ${esc(ev.time)}</span><a target="_blank" rel="noopener" href="${waLink(`Hello ${C.name}, I'd like to book a table for ${ev.title} tonight.`)}">Reserve a table</a></div>`;
    const feat = (C.featured || []).map(id => byId[id]).filter(Boolean);
    $("#featured").innerHTML = feat.map(dishCard).join("");
  }

  /* =========================================================
     MENU
     ========================================================= */
  function menu() {
    const state = { q: "", tags: new Set() };
    $("#menuTabs").innerHTML = CATS.map(c => `<a href="#cat-${c.id}" data-cat="${c.id}">${esc(c.name)}<span>${MENU.filter(m => m.cat === c.id).length}</span></a>`).join("");
    function render() {
      const q = state.q.trim().toLowerCase();
      const list = MENU.filter(m => (!q || (m.name + " " + m.desc + " " + ML.catOf(m.cat).name).toLowerCase().includes(q)) && [...state.tags].every(t => m.tags.includes(t)));
      $("#menuGrid").innerHTML = CATS.map(c => {
        const items = list.filter(m => m.cat === c.id);
        return items.length ? `<section class="course" id="cat-${c.id}"><h2 class="course__title">${esc(c.name)}</h2><ul class="course__list">${items.map(itemRow).join("")}</ul></section>` : "";
      }).join("");
      $("#menuEmpty").hidden = list.length > 0;
    }
    $("#menuSearch").addEventListener("input", e => { state.q = e.target.value; render(); });
    document.addEventListener("click", e => {
      const tag = e.target.closest("[data-tag]"), cat = e.target.closest("[data-cat]");
      if (tag) { const g = tag.dataset.tag; state.tags.has(g) ? state.tags.delete(g) : state.tags.add(g); tag.classList.toggle("active"); render(); }
      if (cat) {
        e.preventDefault();
        if (state.q || state.tags.size) { state.q = ""; state.tags.clear(); $("#menuSearch").value = ""; $$("[data-tag]").forEach(b => b.classList.remove("active")); render(); }
        $("#cat-" + cat.dataset.cat)?.scrollIntoView({ behavior: "smooth" });
      }
    });
    render();
    if (location.hash) setTimeout(() => $(location.hash)?.scrollIntoView(), 50);
  }

  /* =========================================================
     EVENTS
     ========================================================= */
  function events() {
    const dow = new Date().getDay(), names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    $("#weekList").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => C.events.find(e => e.day === d)).filter(Boolean).map(e => `
      <li class="ev ${e.day === dow ? "ev--today" : ""}">
        <div class="ev__day"><span>${names[e.day].slice(0, 3)}</span>${e.day === dow ? "<em>Tonight</em>" : ""}</div>
        <div class="ev__body"><h3>${esc(e.title)} ${e.tag ? `<span class="ev__tag">${esc(e.tag)}</span>` : ""}</h3><p>${esc(e.desc)}</p></div>
        <div class="ev__time">${esc(e.time)}</div>
        <a class="ev__cta" target="_blank" rel="noopener" href="${waLink(`Hello ${C.name}, I'd like to book a table for ${e.title} on ${names[e.day]}.`)}">Book a table</a>
      </li>`).join("");
  }

  /* =========================================================
     ABOUT (FAQ) + CONTACT
     ========================================================= */
  function about() {
    $("#faqList").innerHTML = C.faq.map((f, i) => `<details class="qa" ${i === 0 ? "open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  }
  function contact() {
    const today = new Date().getDay(), group = today === 0 ? 2 : today >= 5 ? 1 : 0;
    $("#hoursList").innerHTML = C.hours.map((h, i) => `<li class="${i === group ? "today" : ""}"><span>${esc(h.days)}</span><span>${esc(h.time)}</span></li>`).join("");
    $("#feeList").innerHTML = C.deliveryZones.map(z => `<dt>${esc(z.name)}</dt><dd>${fmt(z.fee)}</dd>`).join("");
    $("#enquiryForm").addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target, msg = `Hello ${C.name}, this is ${f.ename.value.trim()} (${f.ephone.value.trim()}).\nEnquiry: ${f.etype.value}\nDate: ${f.edate.value || "not set"}, guests: ${f.eguests.value || "not set"}\n${f.emsg.value.trim()}`;
      if (!f.ename.value.trim() || !f.ephone.value.trim()) { $("#enqError").textContent = "Please add your name and phone number."; return; }
      $("#enqError").textContent = "";
      window.open(waLink(msg), "_blank", "noopener");
    });
  }

  /* =========================================================
     TRACK
     ========================================================= */
  function track() {
    let timer;
    function render(code) {
      clearInterval(timer);
      const o = ML.getOrder(code), panel = $("#trackPanel");
      $("#trackInput").value = String(code || "").toUpperCase();
      if (!o) {
        panel.innerHTML = `<div class="track__placeholder"><p>We couldn't find <strong>${esc(code)}</strong> on this device. Check the code, or call us on <a class="linklike" href="${ML.tel()}">${esc(C.phone)}</a>.</p></div>`;
        return;
      }
      const { st, i } = ML.progress(o), done = i === st.length - 1;
      const remaining = done ? 0 : Math.max(1, Math.ceil(((st.length - 1) * ML.DEMO_STAGE_SECONDS - (Date.now() - o.createdAt) / 1000) / 60) + (o.mode === "delivery" ? 20 : 10));
      const badge = done ? `<span class="badge badge--done">${esc(st[i].k)}</span>` : `<span class="badge ${i === 0 && o.pay === "transfer" ? "badge--warn" : ""}"><span class="live"></span>${esc(st[i].k)}</span>`;
      const payTxt = o.paid ? "Paid" : { cod: "Pay on delivery", counter: "Pay at the counter", transfer: "Awaiting transfer" }[o.pay] || "Unpaid";
      panel.innerHTML = `
        <div class="tk__top">
          <div><div class="tk__code">${o.code}</div><div class="tk__meta">${esc(ML.howText(o))} · ${new Date(o.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · ${payTxt}</div></div>
          ${badge}
        </div>
        ${done ? "" : `<div class="eta"><span>Estimated ${o.mode === "delivery" ? "arrival" : "ready"} in</span><strong>about ${remaining} min</strong></div>`}
        <ol class="timeline">${st.map((s, n) => `
          <li class="tl ${n < i || (done && n === i) ? "done" : n === i ? "current" : ""}">
            <span class="tl__dot">${n < i || (done && n === i) ? "✓" : n + 1}</span>
            <div><h5>${esc(s.k)}</h5><p>${esc(s.d)}</p></div>
          </li>`).join("")}</ol>
        <div class="tk__items">
          ${o.items.map(it => `<div class="row"><span>${it.qty}× ${esc(it.name)}</span><span>${fmt(it.price * it.qty)}</span></div>`).join("")}
          <div class="row row--total"><span>Total</span><strong>${fmt(o.total)}</strong></div>
        </div>
        <div class="tk__actions">
          <a class="btn btn--line" href="${ML.tel()}">Call us</a>
          <a class="btn btn--line" target="_blank" rel="noopener" href="${waLink(`Hello, I'm checking on my order ${o.code}`)}">WhatsApp us</a>
          ${done ? `<button class="btn btn--gold" id="reorder">Order again</button>` : ""}
        </div>`;
      $("#reorder")?.addEventListener("click", () => { o.items.forEach(it => byId[it.id] && ML.setQty(it.id, (ML.getCart()[it.id]?.qty || 0) + it.qty, true)); location.href = "cart.html"; });
      if (!done) timer = setInterval(() => render(o.code), 5000);
    }
    ML.renderTrack = render;
    const recent = ML.recentOrders().slice(0, 4);
    $("#recentOrders").innerHTML = recent.length ? `<p>Orders from this device</p>` + recent.map(o => `<button type="button" data-code="${o.code}">${o.code}</button>`).join("") : "";
    $("#recentOrders").addEventListener("click", e => { const b = e.target.closest("[data-code]"); if (b) render(b.dataset.code); });
    $("#trackForm").addEventListener("submit", e => { e.preventDefault(); render($("#trackInput").value.trim()); });
    if (params.get("code")) render(params.get("code"));
  }

  /* =========================================================
     ORDER FLOW 1 — CART
     ========================================================= */
  function cart() {
    stepper(1);
    function render() {
      const items = cartItems();
      $("#cartEmpty").hidden = items.length > 0;
      $("#cartFilled").hidden = !items.length;
      if (!items.length) return;
      $("#cartLines").innerHTML = items.map(it => `
        <li class="line">
          ${pic(byId[it.id], "line__pic", 240, 240)}
          <div class="line__main">
            <div class="line__head"><h3>${esc(it.name)}</h3><b>${fmt(it.price * it.qty)}</b></div>
            <p class="line__unit">${fmt(it.price)} each</p>
            <label class="line__note"><span class="sr">Note for ${esc(it.name)}</span><input data-note="${it.id}" value="${esc(it.note)}" maxlength="80" placeholder="Add a note, e.g. extra pepper"></label>
            <div class="line__ctrls"><div data-ctrl="${it.id}">${ML.ctrlHTML(it.id)}</div><button type="button" class="line__remove" data-remove="${it.id}">Remove</button></div>
          </div>
        </li>`).join("");
      $("#cartSum").innerHTML = `<div class="row"><span>Items</span><span>${ML.cartCount()}</span></div><div class="row row--total"><span>Subtotal</span><strong>${fmt(ML.cartSubtotal())}</strong></div>`;
    }
    document.addEventListener("input", e => { if (e.target.dataset.note) ML.setNote(e.target.dataset.note, e.target.value); });
    document.addEventListener("click", e => { const r = e.target.closest("[data-remove]"); if (r) ML.setQty(r.dataset.remove, 0, true); });
    ML.onCart(render);
    render();
  }

  /* =========================================================
     ORDER FLOW 2 — DETAILS
     ========================================================= */
  function checkout() {
    stepper(2);
    if (!ML.cartCount()) { $("#flowMain").innerHTML = `<div class="empty"><h2>Your order is empty</h2><p>Add dishes from the menu first.</p><a class="btn btn--gold" href="menu.html">Go to the menu</a></div>`; return; }
    const f = $("#detailsForm");
    f.zone.innerHTML = C.deliveryZones.map((z, i) => `<option value="${i}">${esc(z.name)} · ${fmt(z.fee)}</option>`).join("");
    const saved = Object.assign({}, store.get("ml_customer", {}), store.get(DRAFT, {}));
    ["name", "phone", "email", "address", "table", "note"].forEach(k => { if (saved[k]) f[k].value = saved[k]; });
    if (saved.zone != null) f.zone.value = saved.zone;
    if (saved.mode) f.querySelector(`input[name=mode][value=${saved.mode}]`).checked = true;
    if (saved.pickupTime) f.pickupTime.value = saved.pickupTime;
    if (params.get("mode") && /^(delivery|pickup|dinein)$/.test(params.get("mode"))) f.querySelector(`input[name=mode][value=${params.get("mode")}]`).checked = true;

    const fee = () => f.mode.value === "delivery" ? C.deliveryZones[f.zone.value].fee : 0;
    function sync() {
      const md = f.mode.value;
      $$("[data-mode-show]").forEach(el => el.hidden = !el.dataset.modeShow.split(" ").includes(md));
      const svc = ML.cartSubtotal() * (C.serviceChargePercent || 0) / 100;
      $("#detailsSum").innerHTML = summaryHTML(cartItems(), [
        ["Subtotal", fmt(ML.cartSubtotal())],
        ...(md === "delivery" ? [["Delivery", fmt(fee())]] : []),
        ...(svc ? [["Service charge", fmt(svc)]] : []),
        ["Total", `<strong>${fmt(ML.cartSubtotal() + fee() + svc)}</strong>`, "row--total"]
      ]);
    }
    f.addEventListener("change", sync); sync();

    f.addEventListener("submit", e => {
      e.preventDefault();
      $$(".field.invalid", f).forEach(x => x.classList.remove("invalid"));
      const errs = [], bad = (n, m) => { f[n].closest(".field").classList.add("invalid"); errs.push(m); };
      if (!f.name.value.trim()) bad("name", "your name");
      if (!/^(\+?234|0)[789][01]\d{8}$/.test(f.phone.value.replace(/[^\d+]/g, ""))) bad("phone", "a valid Nigerian phone number");
      if (f.email.value.trim() && !/^\S+@\S+\.\S+$/.test(f.email.value.trim())) bad("email", "a valid email address");
      if (f.mode.value === "delivery" && !f.address.value.trim()) bad("address", "your delivery address");
      if (f.mode.value === "dinein" && !f.table.value.trim()) bad("table", "your table number");
      $("#detailsError").textContent = errs.length ? "Please add " + errs.join(", ") + "." : "";
      if (errs.length) { f.querySelector(".invalid input")?.focus(); return; }
      const draft = { mode: f.mode.value, name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
        zone: f.zone.value, address: f.address.value.trim(), table: f.table.value.trim(), pickupTime: f.pickupTime.value, note: f.note.value.trim() };
      store.set(DRAFT, draft);
      store.set("ml_customer", { name: draft.name, phone: draft.phone, email: draft.email, address: draft.address, zone: draft.zone });
      location.href = "payment.html";
    });
  }

  /* =========================================================
     ORDER FLOW 3 — PAYMENT
     ========================================================= */
  function payment() {
    stepper(3);
    const d = store.get(DRAFT, null);
    if (!ML.cartCount() || !d) {
      $("#flowMain").innerHTML = `<div class="empty"><h2>Nothing to pay for yet</h2><p>${ML.cartCount() ? "Add your delivery details first." : "Your order is empty."}</p><a class="btn btn--gold" href="${ML.cartCount() ? "checkout.html" : "menu.html"}">${ML.cartCount() ? "Add your details" : "Go to the menu"}</a></div>`;
      return;
    }
    const fee = d.mode === "delivery" ? C.deliveryZones[d.zone].fee : 0;
    const svc = ML.cartSubtotal() * (C.serviceChargePercent || 0) / 100;
    const total = ML.cartSubtotal() + fee + svc;
    const address = d.mode === "delivery" ? `${d.address} (${C.deliveryZones[d.zone].name})` : null;
    const howTxt = d.mode === "delivery" ? `Delivery to ${address}` : d.mode === "pickup" ? `Pickup at the counter, ${d.pickupTime.toLowerCase()}` : `Dine-in at ${d.table}`;

    $("#payWho").innerHTML = `<div><h4>${esc(d.name)}</h4><p>${esc(d.phone)}${d.email ? " · " + esc(d.email) : ""}</p><p>${esc(howTxt)}</p>${d.note ? `<p class="muted">Note: ${esc(d.note)}</p>` : ""}</div><a class="linklike" href="checkout.html">Change</a>`;
    $("#paySum").innerHTML = summaryHTML(cartItems(), [
      ["Subtotal", fmt(ML.cartSubtotal())], ...(fee ? [["Delivery", fmt(fee)]] : []), ...(svc ? [["Service charge", fmt(svc)]] : []),
      ["Total to pay", `<strong>${fmt(total)}</strong>`, "row--total"]
    ]);
    $$("[data-pay-for]").forEach(el => el.hidden = !el.dataset.payFor.split(" ").includes(d.mode));
    const b = C.bank;
    $("#bankBox").innerHTML = `<div class="row"><span>Bank</span><strong>${esc(b.bankName)}</strong></div>
      <div class="row"><span>Account name</span><strong>${esc(b.accountName)}</strong></div>
      <div class="row"><span>Account number</span><span><strong id="acctNo">${esc(b.accountNumber)}</strong><button type="button" id="copyAcct">Copy</button></span></div>
      <div class="row"><span>Amount</span><strong>${fmt(total)}</strong></div>
      <p>Send the exact amount and use your order code (shown after you place the order) as the narration. We start cooking once the transfer is confirmed.</p>`;
    $("#copyAcct").onclick = () => navigator.clipboard?.writeText(b.accountNumber).then(() => ML.toast("Account number copied"), () => {});

    const f = $("#payForm"), btn = $("#payBtn");
    function sync() {
      const pay = f.pay.value;
      $("#bankBox").hidden = pay !== "transfer";
      $("#onlineNote").hidden = pay !== "online";
      btn.textContent = pay === "online" ? `Pay ${fmt(total)} securely` : `Place order · ${fmt(total)}`;
    }
    f.addEventListener("change", sync); sync();
    $("#onlineNote").innerHTML = C.paystackPublicKey
      ? "You'll pay in Paystack's secure window. Card details never touch this website."
      : "<strong>Test mode.</strong> Online payment is not switched on yet, so no money will be taken. Add a Paystack key in js/config.js to accept real payments.";

    function build(pay, paid, reference) {
      return {
        code: ML.newCode(), createdAt: Date.now(), mode: d.mode, pay, paid, reference: reference || null,
        customer: { name: d.name, phone: d.phone, email: d.email }, address, table: d.mode === "dinein" ? d.table : null,
        pickupTime: d.mode === "pickup" ? d.pickupTime : null, note: d.note, items: cartItems(),
        subtotal: ML.cartSubtotal(), fee, service: svc, total
      };
    }
    function finish(o) {
      ML.saveOrder(o); ML.clearCart(); store.del(DRAFT);
      location.href = "order-confirmed.html?code=" + encodeURIComponent(o.code);
    }
    const loadPaystack = () => new Promise((res, rej) => {
      if (window.PaystackPop) return res();
      const s = document.createElement("script"); s.src = "https://js.paystack.co/v1/inline.js";
      s.onload = res; s.onerror = () => rej(new Error("load")); document.head.appendChild(s);
    });

    f.addEventListener("submit", async e => {
      e.preventDefault();
      $("#payError").textContent = "";
      const pay = f.pay.value;
      if (pay !== "online") return finish(build(pay, false));
      const order = build("online", false);
      if (!C.paystackPublicKey) { // test mode panel
        $("#testAmount").textContent = fmt(total);
        $("#testPay").hidden = false; $("#testPay").scrollIntoView({ behavior: "smooth", block: "center" });
        $("#testSuccess").onclick = () => { order.paid = true; order.reference = "TEST-" + Date.now().toString(36).toUpperCase(); finish(order); };
        $("#testCancel").onclick = () => { $("#testPay").hidden = true; ML.toast("Payment cancelled"); };
        return;
      }
      if (!d.email) { $("#payError").innerHTML = 'Paystack needs an email address for your receipt. <a class="linklike" href="checkout.html">Add your email</a>.'; return; }
      try {
        btn.disabled = true; btn.textContent = "Opening secure payment…";
        await loadPaystack();
        window.PaystackPop.setup({
          key: C.paystackPublicKey, email: d.email, amount: Math.round(total * 100), currency: "NGN", ref: order.code + "-" + Date.now(),
          metadata: { order_code: order.code, custom_fields: [{ display_name: "Phone", variable_name: "phone", value: d.phone }] },
          callback: r => { order.paid = true; order.reference = r.reference; finish(order); },
          onClose: () => ML.toast("Payment window closed")
        }).openIframe();
      } catch { $("#payError").textContent = "We couldn't reach Paystack. Check your connection, or choose another way to pay."; }
      finally { btn.disabled = false; sync(); }
    });
  }

  /* =========================================================
     ORDER FLOW 4 — CONFIRMED
     ========================================================= */
  function confirmed() {
    stepper(4);
    const o = ML.getOrder(params.get("code"));
    if (!o) { $("#flowMain").innerHTML = `<div class="empty"><h2>We couldn't find that order</h2><p>If you placed one, check the code on the tracking page.</p><a class="btn btn--gold" href="track.html">Track an order</a></div>`; return; }
    $("#okCode").textContent = o.code;
    $("#okMsg").textContent = {
      online: "Payment received. The kitchen has your order.",
      cod: "Have cash ready, or pay by card with the rider's POS.",
      counter: "Pay at the counter when you collect or finish your meal.",
      transfer: `Transfer ${fmt(o.total)} to ${C.bank.bankName}, ${C.bank.accountNumber} (${C.bank.accountName}) with ${o.code} as the narration. We start once it's confirmed.`
    }[o.pay];
    $("#okHow").textContent = ML.howText(o);
    $("#okPay").textContent = ML.PAY_LABEL[o.pay] + (o.reference ? ` · ref ${o.reference}` : "");
    $("#okSum").innerHTML = summaryHTML(o.items, [
      ["Subtotal", fmt(o.subtotal)], ...(o.fee ? [["Delivery", fmt(o.fee)]] : []), ...(o.service ? [["Service charge", fmt(o.service)]] : []),
      ["Total", `<strong>${fmt(o.total)}</strong>`, "row--total"]
    ]);
    $("#okTrack").href = "track.html?code=" + encodeURIComponent(o.code);
    $("#okWa").href = waLink(ML.orderMessage(o));
  }

  /* =========================================================
     PHOTO CREDITS
     ========================================================= */
  function credits() {
    const list = window.PHOTO_CREDITS || [];
    $("#creditList").innerHTML = list.map(c => `<li><img src="${esc(c.file)}" alt="" width="120" height="90" loading="lazy">
      <div><strong>${esc(c.subject)}</strong><span>${esc(c.artist || "Unknown author")} · ${esc(c.license)}</span><a class="linklike" href="${esc(c.source)}" target="_blank" rel="noopener">Source on Wikimedia Commons</a></div></li>`).join("");
  }

  const run = { home, menu, events, about, contact, track, cart, checkout, payment, confirmed, credits }[ML.page];
  if (run) run();
})();
