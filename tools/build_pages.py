#!/usr/bin/env python3
"""Generates the site's HTML pages from one shared layout.

Edit the page bodies below (or the shared header/footer), then run:
    python3 tools/build_pages.py
from the project folder. The generated .html files are what Netlify serves.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NAV = [("index.html", "home", "Home"), ("menu.html", "menu", "Menu"), ("events.html", "events", "Events"),
       ("about.html", "about", "About"), ("contact.html", "contact", "Contact"), ("track.html", "track", "Track order")]

def head(title, desc):
    t = "De Managers Court" if title is None else f"{title} · De Managers Court"
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{t}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#0a0a0b">
  <link rel="icon" type="image/png" href="images/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>'''

def header(flow=False):
    links = "\n".join(f'      <a href="{h}" data-nav="{p}">{label}</a>' for h, p, label in NAV)
    return f'''<header class="nav" id="nav">
  <div class="wrap nav__inner">
    <a href="index.html" class="brand" aria-label="De Managers Court home">
      <img class="brand__mark" src="images/logo-mark-160.webp" alt="" width="160" height="192">
      <span class="brand__text"><span class="brand__name">De Managers</span><span class="brand__sub">Court</span></span>
    </a>
    <nav class="nav__links" id="navLinks" aria-label="Main">
{links}
    </nav>
    <div class="nav__actions">
      <a class="cart-btn" href="cart.html" aria-label="Your order">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
        <span class="cart-btn__label">Your order</span>
        <span class="cart-btn__count" data-cart-count>0</span>
      </a>
      <button class="burger" id="burger" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>'''

FOOTER = '''<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <img class="footer__logo" src="images/logo-full-640.webp" alt="De Managers Court" width="640" height="584">
    </div>
    <div>
      <h4>Visit</h4>
      <p data-fill="address"></p>
      <p><span data-fill="open-status"></span> · <span data-fill="today-hours"></span></p>
      <a class="linklike" data-link="directions" target="_blank" rel="noopener">Get directions</a>
    </div>
    <div>
      <h4>Order</h4>
      <a href="menu.html">Menu</a>
      <a href="cart.html">Your order</a>
      <a href="track.html">Track an order</a>
    </div>
    <div>
      <h4>Contact</h4>
      <a data-fill="phone"></a>
      <a data-link="whatsapp" target="_blank" rel="noopener">WhatsApp</a>
      <a data-link="instagram" target="_blank" rel="noopener">Instagram</a>
    </div>
  </div>
  <div class="wrap footer__legal">
    <p>© <span data-fill="year"></span> De Managers Court, Owerri. Please drink responsibly. 18+ for alcohol and shisha.</p>
    <a href="credits.html">Photo credits</a>
  </div>
</footer>'''

ADA = '''<button class="ai-fab" id="aiFab" data-open-assistant aria-label="Chat with Ada, our assistant">
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z"/></svg>
  <span class="ai-fab__txt">Ask Ada</span>
</button>
<section class="ai" id="aiPanel" aria-label="Ada, assistant" aria-hidden="true">
  <header class="ai__head">
    <img class="ai__avatar" src="images/logo-mark-160.webp" alt="" width="160" height="192">
    <div><strong>Ada</strong><span class="ai__sub">Assistant · knows the full menu</span></div>
    <button class="icon-btn" id="aiClose" aria-label="Close chat">✕</button>
  </header>
  <div class="ai__log" id="aiLog" aria-live="polite"></div>
  <div class="ai__chips" id="aiChips"></div>
  <form class="ai__form" id="aiForm">
    <input id="aiInput" placeholder="Ask about dishes, delivery or your order" autocomplete="off" aria-label="Message Ada">
    <button class="ai__send" aria-label="Send"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
  </form>
</section>
<div class="toast" id="toast" role="status" aria-live="polite"></div>'''

ORDER_BAR = '''<div class="orderbar" id="orderBar" hidden>
  <div class="wrap orderbar__inner">
    <span id="orderBarText"></span>
    <a class="btn btn--gold" href="cart.html">View order</a>
  </div>
</div>'''

def scripts(extra=()):
    s = ["js/config.js", "js/menu-data.js", *extra, "js/core.js", "js/pages.js", "js/assistant.js"]
    return "\n".join(f'<script src="{x}"></script>' for x in s)

def page(fname, key, title, desc, body, bar=False, extra=()):
    html = f'''{head(title, desc)}
<body data-page="{key}">
{header()}
<main id="main">
{body.strip()}
</main>
{FOOTER}
{ORDER_BAR if bar else ""}
{ADA}
{scripts(extra)}
</body>
</html>
'''
    open(os.path.join(ROOT, fname), "w").write(html)
    print("wrote", fname)

def page_head(title, note=""):
    return f'''<header class="pagehead">
  <div class="wrap">
    <h1 class="pagehead__title">{title}</h1>
    {f'<p class="pagehead__note">{note}</p>' if note else ""}
  </div>
</header>'''

STEPPER = '<ol class="stepper" data-stepper aria-label="Order steps"></ol>'

# ---------------------------------------------------------------- HOME
page("index.html", "home", None,
 "De Managers Court, Owerri. Native kitchen, grills, cocktails and bottle service. Order online for delivery, pickup or dine-in.",
 '''
<section class="hero">
  <img class="hero__img" src="images/hero.webp" alt="A bowl of goat meat pepper soup" width="1600" height="900" fetchpriority="high">
  <div class="hero__shade"></div>
  <div class="wrap hero__inner">
    <p class="status"><span class="status__dot" data-fill="open-dot"></span><span data-fill="open-status">Open now</span><span class="status__sep">·</span><span data-fill="today-hours"></span></p>
    <h1 class="hero__title">Native pots, a full bar and late nights in Owerri.</h1>
    <p class="hero__lead">Order for delivery anywhere in Owerri, pick up at the counter, or have it brought to your table.</p>
    <div class="hero__cta">
      <a href="menu.html" class="btn btn--gold">Order online</a>
      <a class="btn btn--line btn--light" data-link="book" target="_blank" rel="noopener">Book a table</a>
    </div>
  </div>
</section>

<section class="strip">
  <div class="wrap strip__grid">
    <a href="checkout.html?mode=delivery" class="strip__item"><h3>Delivery</h3><p>Across Owerri from ₦1,000, usually 35 to 45 minutes.</p></a>
    <a href="checkout.html?mode=pickup" class="strip__item"><h3>Pickup</h3><p>Order ahead and collect at the counter. No delivery fee.</p></a>
    <a href="checkout.html?mode=dinein" class="strip__item"><h3>Dine-in</h3><p>Order from your seat with your table number.</p></a>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <header class="head">
      <h2 class="head__title">From the kitchen and the bar</h2>
      <a class="head__link" href="menu.html">See the full menu</a>
    </header>
    <div class="dishes" id="featured"></div>
  </div>
</section>

<section class="section section--band">
  <div class="wrap split">
    <div class="split__copy">
      <h2 class="head__title">Tonight</h2>
      <p class="lead">Something is on every night of the week, from quiz night to Afrobeats Friday.</p>
      <a class="btn btn--line" href="events.html">See this week</a>
    </div>
    <div class="tonight" id="tonight"></div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="split__copy">
      <h2 class="head__title">Pay your way</h2>
      <p class="lead">Pay online by card, transfer or USSD through Paystack, or pay with cash or POS when your order arrives.</p>
    </div>
    <div class="split__copy">
      <h2 class="head__title">Follow your order</h2>
      <p class="lead">Every order gets a code. Use it to watch your order go from the kitchen to your door.</p>
      <a class="btn btn--line" href="track.html">Track an order</a>
    </div>
  </div>
</section>
''', bar=True)

# ---------------------------------------------------------------- MENU
page("menu.html", "menu", "Menu",
 "The full De Managers Court menu: native delicacies, grills, rice, soups, cocktails, bottle service, beers and shisha.",
 page_head("Menu", "Prices in naira. Tell us about allergies in the order note. Alcohol and shisha are for guests 18 and over.") + '''
<section class="section section--tight">
  <div class="wrap menu">
    <nav class="menu__nav" aria-label="Menu sections"><div class="menu__navlist" id="menuTabs"></div></nav>
    <div class="menu__body">
      <div class="menu__tools">
        <label class="search" for="menuSearch">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="menuSearch" placeholder="Search the menu" aria-label="Search the menu">
        </label>
        <div class="filters" role="group" aria-label="Show only">
          <button type="button" class="chip" data-tag="signature">House signature</button>
          <button type="button" class="chip" data-tag="spicy">Spicy</button>
          <button type="button" class="chip" data-tag="veg">Meat-free</button>
          <button type="button" class="chip" data-tag="share">For sharing</button>
        </div>
      </div>
      <div id="menuGrid" aria-live="polite"></div>
      <p class="menu-empty" id="menuEmpty" hidden>No dishes match that search. Try another word or <button type="button" class="linklike" data-open-assistant>ask Ada</button>.</p>
    </div>
  </div>
</section>
''', bar=True)

# ---------------------------------------------------------------- EVENTS
page("events.html", "events", "Events",
 "What's on at De Managers Court this week: quiz night, karaoke, ladies' night, live highlife, Afrobeats Friday and match day.",
 page_head("This week at the Court", "Free entry unless stated. VIP tables go quickly on Friday and Saturday, so book ahead on WhatsApp.") + '''
<section class="section section--tight">
  <div class="wrap"><ol class="week" id="weekList"></ol></div>
</section>
<section class="section section--band">
  <div class="wrap split">
    <div class="split__copy">
      <h2 class="head__title">Private events</h2>
      <p class="lead">Birthdays with sparklers and cake service, VIP sections for groups, and corporate hangouts.</p>
    </div>
    <div class="split__copy split__copy--end">
      <a class="btn btn--gold" href="contact.html#enquiry">Send an enquiry</a>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- ABOUT
page("about.html", "about", "About",
 "About De Managers Court in Owerri: the kitchen, the bar and the lounge, plus answers to common questions.",
 page_head("About the Court") + '''
<section class="section section--tight">
  <div class="wrap about">
    <div class="about__copy">
      <p class="about__lead">De Managers Court is where Owerri's working crowd comes to unwind. Deals close over pepper soup, birthdays end with sparklers, and Fridays run until three.</p>
      <p>The kitchen cooks Imo classics the slow way: Nkwobi, Isi Ewu, Ofe Owerri and point-and-kill catfish, with asun and suya off the charcoal. The bar mixes zobo, palm wine and Chapman into house cocktails and runs full bottle service for VIP tables.</p>
    </div>
    <img class="about__img" src="images/menu/nkwobi.webp" alt="Nkwobi served in a wooden bowl" width="640" height="480">
  </div>
</section>
<section class="section section--band">
  <div class="wrap pillars">
    <article><h3>Kitchen</h3><p>Native pots and open grills. Nkwobi, Isi Ewu, Ofe Owerri and point-and-kill catfish, next to asun and suya straight off the charcoal.</p></article>
    <article><h3>Bar</h3><p>Cocktails with a local accent. Zobo, palm wine and Chapman worked into house signatures, plus full bottle service.</p></article>
    <article><h3>Lounge</h3><p>VIP tables and shisha. Private sections for groups, and a team that remembers how you take your drink.</p></article>
  </div>
</section>
<section class="section">
  <div class="wrap faq">
    <h2 class="head__title">Questions guests ask</h2>
    <div class="faq__list" id="faqList"></div>
    <p class="faq__more">Something else? <button type="button" class="linklike" data-open-assistant>Ask Ada</button> or <a class="linklike" href="contact.html">contact us</a>.</p>
  </div>
</section>
''')

# ---------------------------------------------------------------- CONTACT
page("contact.html", "contact", "Contact",
 "Find De Managers Court on Wetheral Road, Owerri. Opening hours, delivery areas, phone, WhatsApp and event enquiries.",
 page_head("Contact and visit") + '''
<section class="section section--tight">
  <div class="wrap visit">
    <div class="visit__grid">
      <div><h4>Address</h4><p data-fill="address"></p><a class="linklike" data-link="directions" target="_blank" rel="noopener">Get directions</a></div>
      <div><h4>Hours</h4><ul class="hours" id="hoursList"></ul></div>
      <div><h4>Phone</h4><p><a class="linklike" data-fill="phone"></a></p><p><a class="linklike" data-link="whatsapp" target="_blank" rel="noopener">Message us on WhatsApp</a></p></div>
      <div><h4>Email</h4><p><a class="linklike" data-fill="email"></a></p></div>
    </div>
    <a class="map" data-link="directions" target="_blank" rel="noopener" aria-label="Open the location in Google Maps">
      <svg class="map__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="300" fill="var(--panel)"/>
        <path d="M0 52H400M0 128H400M0 206H400M0 270H400M64 0V300M160 0V300M252 0V300M336 0V300" stroke="var(--rule)" fill="none"/>
        <path d="M-10 222 C 90 196, 150 112, 228 102 S 360 56, 420 38" stroke="var(--panel-2)" stroke-width="20" fill="none"/>
        <path d="M120 -10 L 196 310" stroke="var(--panel-2)" stroke-width="13" fill="none"/>
        <path d="M204 82c-11 0-20 9-20 20 0 15 20 32 20 32s20-17 20-32c0-11-9-20-20-20Z" fill="var(--gold)"/>
        <circle cx="204" cy="102" r="6.5" fill="var(--ink)"/>
        <text x="30" y="214" fill="var(--text-2)" font-size="10" font-family="Montserrat, sans-serif" letter-spacing="2">WETHERAL RD</text>
      </svg>
      <span class="map__label"><strong>De Managers Court</strong><span data-fill="address"></span><em>Open in Google Maps</em></span>
    </a>
  </div>
</section>
<section class="section section--band">
  <div class="wrap split">
    <div class="split__copy">
      <h2 class="head__title">Delivery areas</h2>
      <p class="lead">Fees are added at checkout. Most deliveries arrive in 35 to 45 minutes.</p>
    </div>
    <dl class="fees fees--big" id="feeList"></dl>
  </div>
</section>
<section class="section" id="enquiry">
  <div class="wrap split">
    <div class="split__copy">
      <h2 class="head__title">Reservations and events</h2>
      <p class="lead">Tell us what you're planning. Your enquiry opens in WhatsApp so our team can reply straight away.</p>
    </div>
    <form class="enquiry" id="enquiryForm" novalidate>
      <div class="grid2">
        <label class="field"><span>Your name</span><input id="ename" name="ename" autocomplete="name"></label>
        <label class="field"><span>Phone</span><input id="ephone" name="ephone" type="tel" autocomplete="tel"></label>
      </div>
      <div class="grid3">
        <label class="field"><span>Type</span><select id="etype" name="etype"><option>Table reservation</option><option>VIP section</option><option>Birthday</option><option>Corporate event</option></select></label>
        <label class="field"><span>Date</span><input id="edate" name="edate" type="date"></label>
        <label class="field"><span>Guests</span><input id="eguests" name="eguests" type="number" min="1" max="200"></label>
      </div>
      <label class="field"><span>Anything else</span><textarea id="emsg" name="emsg" rows="3"></textarea></label>
      <p class="form-error" id="enqError" role="alert"></p>
      <button class="btn btn--gold" type="submit">Send on WhatsApp</button>
    </form>
  </div>
</section>
''')

# ---------------------------------------------------------------- TRACK
page("track.html", "track", "Track your order",
 "Track your De Managers Court order with your order code.",
 page_head("Track your order", "Enter the code from your confirmation, for example DMC-4821.") + '''
<section class="section section--tight">
  <div class="wrap track">
    <div class="track__intro">
      <form class="track__form" id="trackForm">
        <input id="trackInput" placeholder="DMC-0000" aria-label="Order code" autocomplete="off" required>
        <button class="btn btn--gold" type="submit">Track</button>
      </form>
      <div class="recent" id="recentOrders"></div>
    </div>
    <div class="track__panel" id="trackPanel">
      <div class="track__placeholder"><p>Your order's progress will show here, from the kitchen to your door.</p></div>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- FLOW 1: CART
page("cart.html", "cart", "Your order",
 "Review your De Managers Court order.",
 f'''
<section class="flow">
  <div class="wrap">
    {STEPPER}
    <div id="flowMain">
      <div class="empty" id="cartEmpty" hidden>
        <h2>Your order is empty</h2>
        <p>Add dishes and drinks from the menu to get started.</p>
        <a class="btn btn--gold" href="menu.html">Go to the menu</a>
      </div>
      <div class="flow__grid" id="cartFilled" hidden>
        <div class="flow__main">
          <h1 class="flow__title">Your order</h1>
          <ul class="lines" id="cartLines"></ul>
          <a class="linklike" href="menu.html">Add more from the menu</a>
        </div>
        <aside class="flow__side">
          <h2>Summary</h2>
          <div id="cartSum"></div>
          <a class="btn btn--gold btn--block" href="checkout.html">Continue to details</a>
          <p class="side__note">Delivery fee and payment come next.</p>
        </aside>
      </div>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- FLOW 2: DETAILS
page("checkout.html", "checkout", "Your details",
 "Choose delivery, pickup or dine-in and add your details.",
 f'''
<section class="flow">
  <div class="wrap">
    {STEPPER}
    <div id="flowMain">
      <form class="flow__grid" id="detailsForm" novalidate>
        <div class="flow__main">
          <h1 class="flow__title">How should we get it to you?</h1>
          <fieldset>
            <legend>Order type</legend>
            <div class="seg">
              <label><input type="radio" name="mode" value="delivery" checked><span>Delivery</span></label>
              <label><input type="radio" name="mode" value="pickup"><span>Pickup</span></label>
              <label><input type="radio" name="mode" value="dinein"><span>Dine-in</span></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Your details</legend>
            <div class="grid2">
              <label class="field"><span>Full name</span><input id="name" name="name" autocomplete="name"></label>
              <label class="field"><span>Phone</span><input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="0803 123 4567"></label>
            </div>
            <label class="field"><span>Email <em>(optional, for your receipt)</em></span><input id="email" name="email" type="email" autocomplete="email"></label>
          </fieldset>
          <fieldset data-mode-show="delivery">
            <legend>Delivery address</legend>
            <label class="field"><span>Area</span><select id="zone" name="zone"></select></label>
            <label class="field"><span>Street address and landmark</span><input id="address" name="address" autocomplete="street-address" placeholder="e.g. 5 Okigwe Road, opposite First Bank"></label>
          </fieldset>
          <fieldset data-mode-show="pickup" hidden>
            <legend>Pickup time</legend>
            <label class="field"><span>When will you collect?</span>
              <select id="pickupTime" name="pickupTime"><option>As soon as possible</option><option>In 30 minutes</option><option>In 1 hour</option><option>In 2 hours</option></select></label>
          </fieldset>
          <fieldset data-mode-show="dinein" hidden>
            <legend>Your table</legend>
            <label class="field"><span>Table number</span><input id="table" name="table" placeholder="e.g. Table 12 or VIP 3"></label>
          </fieldset>
          <label class="field"><span>Note for the kitchen <em>(optional)</em></span><textarea id="note" name="note" rows="2" placeholder="Less pepper, no onions, extra cold drinks"></textarea></label>
          <p class="form-error" id="detailsError" role="alert"></p>
        </div>
        <aside class="flow__side">
          <h2>Summary</h2>
          <div id="detailsSum"></div>
          <button class="btn btn--gold btn--block" type="submit">Continue to payment</button>
          <a class="side__back" href="cart.html">Back to your order</a>
        </aside>
      </form>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- FLOW 3: PAYMENT
page("payment.html", "payment", "Payment",
 "Pay for your De Managers Court order online or on arrival.",
 f'''
<section class="flow">
  <div class="wrap">
    {STEPPER}
    <div id="flowMain">
      <form class="flow__grid" id="payForm" novalidate>
        <div class="flow__main">
          <h1 class="flow__title">Payment</h1>
          <div class="who" id="payWho"></div>
          <fieldset>
            <legend>How would you like to pay?</legend>
            <div class="paylist">
              <label class="payopt"><input type="radio" name="pay" value="online" checked>
                <span><strong>Pay online now</strong><small>Card, bank transfer or USSD through Paystack</small></span>
                <span class="payopt__marks" aria-hidden="true"><i>Visa</i><i>Mastercard</i><i>Verve</i></span></label>
              <label class="payopt" data-pay-for="delivery"><input type="radio" name="pay" value="cod">
                <span><strong>Cash or POS on delivery</strong><small>Pay the rider when your order arrives</small></span></label>
              <label class="payopt" data-pay-for="pickup dinein"><input type="radio" name="pay" value="counter">
                <span><strong>Pay at the counter</strong><small>Cash or POS at the Court</small></span></label>
              <label class="payopt" data-pay-for="delivery pickup dinein"><input type="radio" name="pay" value="transfer">
                <span><strong>Direct bank transfer</strong><small>We confirm the transfer before we start cooking</small></span></label>
            </div>
          </fieldset>
          <div class="bankbox" id="bankBox" hidden></div>
          <p class="paynote" id="onlineNote"></p>
          <div class="testpay" id="testPay" hidden>
            <p class="testpay__k">Test payment</p>
            <p class="testpay__amt" id="testAmount"></p>
            <p>Online payments are not switched on yet, so this only simulates a successful payment. No card details are needed and no money is taken.</p>
            <div class="testpay__btns">
              <button type="button" class="btn btn--gold" id="testSuccess">Simulate successful payment</button>
              <button type="button" class="btn btn--line" id="testCancel">Cancel</button>
            </div>
          </div>
          <p class="form-error" id="payError" role="alert"></p>
        </div>
        <aside class="flow__side">
          <h2>Summary</h2>
          <div id="paySum"></div>
          <button class="btn btn--gold btn--block" type="submit" id="payBtn">Pay</button>
          <p class="side__note side__note--lock"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg> Online payments are handled by Paystack.</p>
          <a class="side__back" href="checkout.html">Back to details</a>
        </aside>
      </form>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- FLOW 4: CONFIRMED
page("order-confirmed.html", "confirmed", "Order confirmed",
 "Your De Managers Court order is confirmed.",
 f'''
<section class="flow">
  <div class="wrap">
    {STEPPER}
    <div id="flowMain">
      <div class="flow__grid">
        <div class="flow__main ok">
          <div class="ok__mark" aria-hidden="true">✓</div>
          <h1 class="flow__title">Thank you. Your order is in.</h1>
          <p class="ok__label">Your order code</p>
          <p class="ok__code" id="okCode"></p>
          <p class="ok__msg" id="okMsg"></p>
          <dl class="ok__facts"><dt>How</dt><dd id="okHow"></dd><dt>Payment</dt><dd id="okPay"></dd></dl>
          <div class="ok__btns">
            <a class="btn btn--gold" id="okTrack">Track this order</a>
            <a class="btn btn--line" id="okWa" target="_blank" rel="noopener">Send it to us on WhatsApp</a>
          </div>
        </div>
        <aside class="flow__side">
          <h2>Receipt</h2>
          <div id="okSum"></div>
          <a class="side__back" href="menu.html">Back to the menu</a>
        </aside>
      </div>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- CREDITS
page("credits.html", "credits", "Photo credits",
 "Credits for the photographs used on this website.",
 page_head("Photo credits", "These photos come from Wikimedia Commons and are used under the licenses shown. They will be replaced with De Managers Court's own photography.") + '''
<section class="section section--tight">
  <div class="wrap"><ul class="credits" id="creditList"></ul></div>
</section>
''', extra=("js/photo-credits.js",))
