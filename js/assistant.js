/* =========================================================
   ADA — De Managers Court AI assistant
   Runs in the browser with full knowledge of the menu, cart,
   hours, delivery zones and orders. Can recommend dishes,
   answer questions, add items to the cart and track orders.

   Optional: set CONFIG.assistantEndpoint to route messages to a
   real language model on your server (see README). If the server
   fails, Ada falls back to the built-in brain automatically.
   ========================================================= */
(function () {
  "use strict";
  const C = window.CONFIG, ML = window.ML;
  const { MENU, CATS, byId, fmt, esc } = ML;
  const $ = s => document.querySelector(s);
  const panel = $("#aiPanel"), log = $("#aiLog"), input = $("#aiInput"), fab = $("#aiFab");
  const history = [];
  let greeted = false;

  /* ---------- Language helpers ---------- */
  const norm = s => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9₦\s.-]/g, " ").replace(/\s+/g, " ").trim();
  const has = (t, ...words) => words.some(w => new RegExp("\\b" + w + "\\b").test(t));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const ALIASES = {
    goatpep: ["goat pepper soup", "goat meat pepper soup", "pepper soup", "pp soup", "peppersoup"],
    catpep: ["catfish", "point and kill", "point kill", "fish pepper soup", "catfish pepper soup"],
    isiewu: ["isi ewu", "isiewu", "goat head"],
    henvs: ["hennessy", "henny", "hennessy vs"], henvsop: ["vsop"], moet: ["moet", "champagne", "chandon"],
    donjulio: ["don julio", "tequila"], jw: ["johnnie walker", "black label", "whisky", "whiskey"], azul: ["clase azul"],
    heineken: ["heineken", "beer"], guinness: ["guinness", "stout"], star: ["star"], coke: ["coke", "fanta", "sprite", "soft drink", "minerals"],
    water: ["water"], palmwine: ["palm wine", "palmwine", "mmanya"], jollof: ["jollof"], friedrice: ["fried rice"],
    ofada: ["ofada", "ayamase"], asun: ["asun"], suya: ["suya"], wings: ["wings", "chicken wings"],
    chops: ["small chops", "puff puff", "samosa"], fish: ["croaker", "grilled fish"], dodo: ["gizdodo", "dodo", "plantain"],
    ofeowerri: ["ofe owerri", "owerri soup"], oha: ["oha", "ofe oha"], egusi: ["egusi"], afang: ["afang"],
    nkwobi: ["nkwobi"], abacha: ["abacha", "african salad"], ugba: ["ugba", "kpomo"], pasta: ["pasta", "spaghetti"],
    vegrice: ["coconut rice"], chapman: ["chapman"], zobo: ["zobo"], mojito: ["mojito"], manager: ["the manager", "house cocktail", "signature cocktail"],
    palmtini: ["palm tini", "palmtini"], shisha1: ["shisha", "hookah", "hooka"], shisha2: ["premium shisha"]
  };
  const CAT_WORDS = {
    native: ["native", "local", "delicacy", "delicacies", "igbo"], grills: ["grill", "grills", "small chops", "bbq", "barbecue", "finger food", "snack", "snacks"],
    mains: ["rice", "main", "mains", "food", "meal"], soups: ["soup", "soups", "swallow", "fufu", "pounded yam", "eba", "semo"],
    cocktails: ["cocktail", "cocktails", "mocktail", "mocktails"], bottles: ["bottle", "bottles", "bottle service", "spirits", "liquor", "champagne"],
    drinks: ["beer", "beers", "soft drink", "soft drinks", "minerals"], shisha: ["shisha", "hookah"]
  };

  function findItems(t) {
    const hits = [];
    for (const m of MENU) {
      const names = [norm(m.name), ...(ALIASES[m.id] || [])];
      let best = "";
      for (const n of names) if (new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(t) && n.length > best.length) best = n;
      if (best) hits.push({ m, s: best });
    }
    // prefer longest matches; drop shorter ones covered by a longer one ("shisha" inside "premium shisha")
    hits.sort((a, b) => b.s.length - a.s.length);
    const out = [];
    for (const h of hits) if (!out.some(o => o.s !== h.s && o.s.includes(h.s))) out.push(h);
    return out.map(h => h.m);
  }
  function findCat(t) {
    for (const [id, words] of Object.entries(CAT_WORDS)) if (words.some(w => has(t, w))) return id;
    return null;
  }
  function budget(t) {
    const m = t.match(/(?:under|below|less than|max|maximum|within|budget(?: of| is)?|not more than|around|about)\s*₦?\s*(\d[\d,.]*)\s*(k|thousand)?/) ||
              t.match(/₦\s*(\d[\d,.]*)\s*(k)?/) || t.match(/\b(\d+(?:\.\d+)?)\s*(k)\b/);
    if (!m) return null;
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (m[2] || n < 1000) n *= 1000;
    return n >= 500 ? n : null;
  }
  function people(t) {
    const m = t.match(/\b(\d+|two|three|four|five|six|seven|eight|ten)\s*(people|persons|of us|guys|friends|pax)\b/) || t.match(/\bfor\s+(\d+|two|three|four|five|six|seven|eight|ten)\b/);
    if (!m) return null;
    const w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, ten: 10 };
    return w[m[1]] || parseInt(m[1], 10);
  }
  function qtyBefore(t) {
    const m = t.match(/\b(\d+|one|two|three|four|five|a|an)\s+(?:x\s+)?(?:plates?|bottles?|portions?|of)?\s*/);
    const w = { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5 };
    if (!m) return 1;
    return w[m[1]] || Math.min(parseInt(m[1], 10) || 1, 20);
  }

  /* ---------- Reply building ---------- */
  const recs = items => `<div class="recs">${items.map(m =>
    `<div class="rec"><div><b>${esc(m.name)}</b><small>${fmt(m.price)}</small></div><button data-ai-add="${m.id}">+ Add</button></div>`).join("")}</div>`;
  const P = s => `<p>${s}</p>`;
  const top = (list, n = 3) => list.slice().sort((a, b) => score(b) - score(a)).slice(0, n);
  const score = m => (m.tags.includes("signature") ? 3 : 0) + (m.tags.includes("popular") ? 2 : 0) + (m.tags.includes("new") ? 1 : 0) + Math.random() * .8;
  const FOOD = ["native", "grills", "mains", "soups"], DRINK = ["cocktails", "bottles", "drinks"];

  function hoursText() { return C.hours.map(h => `<strong>${esc(h.days)}</strong> ${esc(h.time)}`).join("<br>"); }

  function brain(raw) {
    const t = norm(raw);
    const items = findItems(t), cat = findCat(t), bud = budget(t), ppl = people(t);
    const spicy = has(t, "spicy", "pepper", "hot", "peppery", "fire"), veg = has(t, "vegetarian", "vegan", "no meat", "meat free", "meatless");
    const wantsDrink = has(t, "drink", "drinks", "cocktail", "booze", "alcohol", "thirsty", "sip"), wantsFood = has(t, "food", "eat", "hungry", "meal", "chop");

    // greetings / small talk
    if (/^(hi|hello|hey|good (morning|afternoon|evening)|howdy|yo|sup|kedu|how far)\b/.test(t) && t.split(" ").length <= 4)
      return P(pick(["Hey there! 👋 Welcome to De Managers Court.", "Hello! Good to have you at the lounge.", "Kedu! Welcome in."])) +
             P("I can recommend dishes, add them to your cart, tell you delivery fees, or track an order. What are you in the mood for?");
    if (has(t, "thanks", "thank you", "thank u", "thx", "nice one", "great", "perfect", "awesome"))
      return P(pick(["Anytime! Enjoy. 🥂", "My pleasure! Anything else you'd like?", "You're welcome. Holler if you need me!"]));
    if (has(t, "who are you", "what are you", "are you human", "are you a bot", "your name"))
      return P(`I'm <strong>${esc(C.assistantName)}</strong>, the lounge's AI host. I know every item on the menu and can help you order, pay and track. For anything I can't handle, our team is on WhatsApp.`);

    // order tracking
    const code = raw.match(/\bDMC[-\s]?(\d{4})\b/i) || (has(t, "track", "order status", "where is my", "my order") && raw.match(/\b(\d{4})\b/));
    if (code || has(t, "track", "where is my order", "where is my food", "order status", "status of my order", "is my order", "how long")) {
      let o = code ? ML.getOrder(code[1]) : ML.recentOrders()[0];
      if (!o) return P(code ? `I couldn't find order <strong>DMC-${code[1]}</strong> on this device. Double-check the code or call us on ${esc(C.phone)}.` : "I don't see any orders from this device yet. Once you place one you'll get a code like <strong>DMC-1234</strong> and I can track it for you.");
      ML.trackOrder(o.code);
      return P(`Order <strong>${o.code}</strong> is currently: <strong>${esc(ML.orderStatusText(o))}</strong>.`) + P("I've opened the live tracker on the page for you.");
    }

    // cart / checkout
    if (has(t, "checkout", "check out", "pay now", "place order", "place my order", "complete order", "proceed")) {
      if (!ML.cartCount()) return P("Your cart is empty right now. Want a recommendation to get started?");
      setTimeout(ML.openCheckout, 500);
      return P(`Opening checkout. Your subtotal is <strong>${fmt(ML.cartSubtotal())}</strong>. 🧾`);
    }
    if (has(t, "my cart", "in my cart", "my basket", "what did i order", "remove", "clear cart", "empty cart")) {
      if (has(t, "clear cart", "empty cart", "remove all", "remove everything")) { Object.keys(ML.getCart()).forEach(id => ML.setQty(id, 0, true)); return P("Done, your cart is cleared."); }
      if (has(t, "remove") && items.length) { items.forEach(m => ML.setQty(m.id, 0, true)); return P(`Removed ${items.map(m => `<strong>${esc(m.name)}</strong>`).join(", ")} from your cart.`); }
      const c = ML.getCart(), ids = Object.keys(c);
      if (!ids.length) return P("Your cart is empty. Shall I suggest something?");
      return P("Here's your cart:") + P(ids.map(id => `${c[id].qty}× ${esc(byId[id].name)}: ${fmt(byId[id].price * c[id].qty)}`).join("<br>")) +
             P(`Subtotal <strong>${fmt(ML.cartSubtotal())}</strong>. Say <em>"checkout"</em> when you're ready.`);
    }

    // add to cart
    if (items.length && has(t, "add", "i want", "i will have", "ill have", "id like", "i would like", "give me", "get me", "order", "buy", "bring", "lemme get", "let me get")) {
      const q = qtyBefore(t.replace(/dmc-?\d{4}/, ""));
      items.slice(0, 3).forEach(m => ML.addToCart(m.id, items.length === 1 ? q : 1));
      const names = items.slice(0, 3).map(m => `<strong>${items.length === 1 && q > 1 ? q + "× " : ""}${esc(m.name)}</strong>`).join(", ");
      const pairing = pairFor(items[0]);
      return P(`Added ${names} to your cart. ✅ Subtotal is now <strong>${fmt(ML.cartSubtotal())}</strong>.`) +
             (pairing ? P(`It goes beautifully with:`) + recs([pairing]) : "") + P(`Say <em>"checkout"</em> whenever you're ready.`);
    }

    // hours
    if (has(t, "open", "opening", "close", "closing", "hours", "what time", "today", "tonight") && !items.length && !cat) {
      return P(ML.isOpenNow() ? "Yes, we're <strong>open right now</strong>! 🟢" : "We're <strong>closed at the moment</strong>, but you can still place an order ahead.") + P(hoursText());
    }
    // location
    if (has(t, "where", "location", "address", "located", "direction", "directions", "find you", "map"))
      return P(`We're at <strong>${esc(C.address)}</strong>.`) + P(`<a class="linklike" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.mapQuery)}">Open in Google Maps →</a>`);
    // delivery
    if (has(t, "deliver", "delivery", "dispatch", "rider", "ship", "bring it", "fee", "fees") || C.deliveryZones.some(z => z.name.toLowerCase().split(/[\s/]+/).some(w => w.length > 4 && t.includes(w)))) {
      const z = C.deliveryZones.find(z => z.name.toLowerCase().split(/[\s/]+/).some(w => w.length > 4 && t.includes(w)));
      if (z) return P(`Yes, we deliver to <strong>${esc(z.name)}</strong> for <strong>${fmt(z.fee)}</strong>. Average delivery is about 35–45 minutes.`);
      return P("We deliver all over Owerri. Fees by area:") + P(C.deliveryZones.map(z => `${esc(z.name)}: <strong>${fmt(z.fee)}</strong>`).join("<br>")) + P("You can also choose pickup or dine-in at checkout.");
    }
    // payment
    if (has(t, "pay", "payment", "transfer", "cash", "pos", "card", "ussd", "paystack", "account number"))
      return P("You can pay however suits you:") +
             P("<strong>Online:</strong> card, bank transfer or USSD via Paystack<br><strong>Offline:</strong> cash or POS on delivery, pay at the counter, or direct bank transfer to our account") +
             (has(t, "account", "transfer") ? P(`Our account: <strong>${esc(C.bank.accountNumber)}</strong>, ${esc(C.bank.bankName)} (${esc(C.bank.accountName)}). Use your order code as narration.`) : "");
    // reservations / events
    if (has(t, "reserve", "reservation", "book", "booking", "table for", "birthday", "event", "party", "vip", "private"))
      return P("We'd love to host you! VIP sections, birthday setups with sparklers, and corporate hangouts are all available.") +
             P(`<a class="linklike" target="_blank" rel="noopener" href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent("Hello, I'd like to make a reservation at " + C.name)}">Book on WhatsApp →</a>`) +
             (ppl ? P(`For ${ppl} people, I'd suggest:`) + recs(groupPack(ppl)) : "");
    // age / alcohol
    if (has(t, "age", "18", "underage", "id card")) return P("You must be 18+ to order alcohol. Our riders may ask for ID on delivery. 🙏");

    // item info
    if (items.length) {
      const m = items[0];
      const extra = items.length > 1 ? P("Also matching:") + recs(items.slice(1, 4)) : "";
      return P(`<strong>${esc(m.name)}</strong>, ${fmt(m.price)}`) + P(esc(m.desc)) +
             P(m.tags.includes("signature") ? "It's one of our signatures. Guests come back for it. 👌" : m.tags.includes("spicy") ? "Fair warning: it's got some heat. 🌶" : "A solid choice.") +
             recs([m]) + extra;
    }

    // recommendations
    const recWords = has(t, "recommend", "suggest", "suggestion", "best", "popular", "signature", "special", "what should", "what can i", "whats good", "what is good", "hungry", "surprise", "favourite", "favorite", "menu", "options", "something");
    if (recWords || spicy || veg || bud || ppl || cat || wantsDrink || wantsFood) {
      if (ppl && ppl > 2 && (wantsDrink || DRINK.includes(cat)) && !wantsFood) {
        const bottle = byId[ppl >= 6 ? "henvsop" : ppl >= 4 ? "henvs" : "jw"];
        return P(`For ${ppl} people, a bottle is the move. It comes with an ice bucket and mixers:`) + recs([bottle, byId.moet, byId.manager, byId.chapman]) + P("Add a Small Chops Box or Peppered Asun to share, too. 😉");
      }
      if (ppl && ppl > 2 && !cat) return P(`For a group of ${ppl}, here's a solid spread:`) + recs(groupPack(ppl)) + P("Want me to add them all? Just say <em>add</em> and the names, or tap +.");
      let pool = MENU.slice();
      if (cat) pool = pool.filter(m => m.cat === cat);
      else if (wantsDrink && !wantsFood) pool = pool.filter(m => DRINK.includes(m.cat));
      else if (wantsFood && !wantsDrink) pool = pool.filter(m => FOOD.includes(m.cat));
      if (spicy) pool = pool.filter(m => m.tags.includes("spicy"));
      if (veg) pool = pool.filter(m => m.tags.includes("veg"));
      if (bud) pool = pool.filter(m => m.price <= bud);
      if (!pool.length) return P(`Hmm, nothing matches all of that${bud ? ` under ${fmt(bud)}` : ""}. Here are the closest options:`) + recs(top(MENU.filter(m => !bud || m.price <= bud * 1.6), 3));
      const label = [spicy && "spicy", veg && "meat-free", cat && CATS.find(c => c.id === cat).name.toLowerCase()].filter(Boolean).join(" ");
      const intro = cat && !recWords && !spicy && !veg && !bud
        ? `Here's our ${label} selection:`
        : pick(["Great choice of mood! Try these:", "Here's what I'd pick for you:", "You'll love these:"]) + (label || bud ? ` <span class="muted">(${[label, bud && "under " + fmt(bud)].filter(Boolean).join(", ")})</span>` : "");
      return P(intro) + recs(cat && !recWords ? pool.slice(0, 6) : top(pool, 3));
    }

    // fallback
    return P("I'm not sure I caught that, but I'm learning! 😅 Try asking:") +
           P("• <em>Something spicy under ₦8k</em><br>• <em>Add 2 asun</em><br>• <em>Do you deliver to New Owerri?</em><br>• <em>Track DMC-1234</em>") +
           P(`Or chat with the team on <a class="linklike" target="_blank" rel="noopener" href="https://wa.me/${C.whatsapp}">WhatsApp</a>.`);
  }

  function pairFor(m) {
    const map = { native: ["heineken", "palmwine", "guinness"], grills: ["heineken", "chapman", "star"], mains: ["chapman", "coke", "zobo"], soups: ["palmwine", "water", "zobo"],
      cocktails: ["chops", "wings", "suya"], bottles: ["chops", "asun", "suya"], drinks: ["asun", "suya", "nkwobi"], shisha: ["mojito", "manager", "chops"] };
    const opts = (map[m.cat] || []).filter(id => !ML.getCart()[id]);
    return opts.length ? byId[pick(opts)] : null;
  }
  function groupPack(n) {
    const ids = ["catpep", "chops", "asun"];
    ids.push(n >= 6 ? "henvsop" : n >= 4 ? "henvs" : "manager");
    if (n >= 5) ids.push("shisha2");
    return ids.map(id => byId[id]);
  }

  /* ---------- Optional remote AI ---------- */
  async function remote(msg) {
    const context = {
      business: { name: C.name, address: C.address, phone: C.phone, hours: C.hours, deliveryZones: C.deliveryZones, openNow: ML.isOpenNow() },
      menu: MENU.map(m => ({ id: m.id, name: m.name, price: m.price, category: m.cat, tags: m.tags, desc: m.desc })),
      cart: ML.getCart()
    };
    const r = await fetch(C.assistantEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.slice(-12), context }) });
    if (!r.ok) throw new Error("bad status");
    const data = await r.json();
    // optional actions from server: { reply, add: [{id, qty}] }
    (data.add || []).forEach(a => byId[a.id] && ML.addToCart(a.id, a.qty || 1));
    return esc(data.reply || "").split(/\n{2,}/).map(P).join("").replace(/\n/g, "<br>");
  }

  /* ---------- UI ---------- */
  function bubble(html, who) {
    const d = document.createElement("div");
    d.className = "msg msg--" + who; d.innerHTML = html; log.appendChild(d);
    log.scrollTop = log.scrollHeight; return d;
  }
  async function send(text) {
    text = text.trim(); if (!text) return;
    bubble(esc(text), "me"); history.push({ role: "user", content: text });
    input.value = "";
    const typing = bubble('<span class="typing"><i></i><i></i><i></i></span>', "bot");
    typing.style.padding = "0";
    let html;
    const started = Date.now();
    if (C.assistantEndpoint) { try { html = await remote(text); } catch { html = null; } }
    if (!html) html = brain(text);
    await new Promise(r => setTimeout(r, Math.max(0, 450 + Math.random() * 450 - (Date.now() - started))));
    typing.remove();
    bubble(html, "bot");
    history.push({ role: "assistant", content: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
  }

  function open() {
    panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); fab.classList.add("hide");
    if (!greeted) {
      greeted = true;
      const hr = new Date().getHours(), g = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
      bubble(P(`${g}! I'm <strong>${esc(C.assistantName)}</strong>, your AI host at ${esc(C.name)}. ✨`) +
             P("Tell me what you're craving, your budget, or how many people you're with, and I'll sort you out. I can also add items to your cart and track your order."), "bot");
    }
    setTimeout(() => input.focus({ preventScroll: true }), 250);
  }
  function close() { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); fab.classList.remove("hide"); }

  const CHIPS = ["What's your signature dish?", "Something spicy under ₦8k", "Drinks for 4 people", "Do you deliver to New Owerri?", "Track my order", "Are you open now?", "How can I pay?"];
  $("#aiChips").innerHTML = CHIPS.map(c => `<button type="button">${esc(c)}</button>`).join("");
  $("#aiChips").addEventListener("click", e => { if (e.target.tagName === "BUTTON") send(e.target.textContent); });
  $("#aiForm").addEventListener("submit", e => { e.preventDefault(); send(input.value); });
  $("#aiClose").onclick = close;
  document.addEventListener("click", e => {
    if (e.target.closest("[data-open-assistant]")) open();
    const add = e.target.closest("[data-ai-add]");
    if (add) { ML.addToCart(add.dataset.aiAdd); add.textContent = "✓ Added"; add.classList.add("added"); ML.toast(`${byId[add.dataset.aiAdd].name} added`); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("open") && !document.querySelector(".modal:not([hidden])")) close(); });
})();
