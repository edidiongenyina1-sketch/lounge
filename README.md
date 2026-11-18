# De Managers Court, Owerri: Website

A multi-page website with an online menu, a step-by-step online ordering flow that ends in payment, order tracking, and an assistant called Ada. It is plain HTML, CSS and JavaScript, hosted on Netlify from this GitHub repository.

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Menu | `menu.html` |
| Events | `events.html` |
| About and FAQ | `about.html` |
| Contact, delivery areas and event enquiries | `contact.html` |
| Track an order | `track.html` |
| Photo credits | `credits.html` |

**Ordering flow** (one page per step):
1. `cart.html`: review the order, change quantities, add notes
2. `checkout.html`: delivery, pickup or dine-in, plus name, phone and address
3. `payment.html`: pay online (Paystack) or choose cash/POS on delivery, pay at the counter, or bank transfer
4. `order-confirmed.html`: order code, receipt, tracking link and a button to send the order to the Court on WhatsApp

## Files
```
*.html              Pages (generated, see "Editing pages" below)
css/styles.css      All styling
js/config.js        ← YOUR DETAILS: phone, WhatsApp, address, hours, bank, delivery fees, events, FAQ, Paystack key
js/menu-data.js     ← YOUR MENU: names, prices, descriptions, tags
js/core.js          Cart, orders and shared header/footer behaviour
js/pages.js         Code for each page and the ordering flow
js/assistant.js     Ada, the assistant
js/photo-credits.js Credits for the current photos
images/hero.webp    Home page photo
images/menu/<id>.webp  One photo per menu item (id from menu-data.js)
tools/build_pages.py   Generates the .html pages from one shared layout
```

## Before launch
1. **`js/config.js`**: replace everything marked `(PLACEHOLDER)`. That covers phone, WhatsApp, address, Instagram, bank account and delivery fees.
2. **`js/menu-data.js`**: set your real dishes and prices.
3. **Photos**: the current photos are free-licence photos from Wikimedia Commons, credited on `credits.html`. To use your own, save them with the same file names (for example `images/menu/nkwobi.webp`, `images/hero.webp`). JPG works too if you set `img: "images/menu/nkwobi.jpg"` on that item in `menu-data.js`. Once every photo is your own, you can remove the Photo credits link.

## Payments
- **Online (Paystack):** copy your Paystack **public key** into `paystackPublicKey` in `js/config.js`. Until then the payment page runs in **test mode**: it simulates a successful payment and never asks for card details. Verify each payment reference on a server with your secret key before relying on it, and never put the secret key in these files.
- **On arrival:** cash or POS on delivery, pay at the counter (pickup and dine-in), and direct bank transfer. These work with no setup.

## Receiving orders
Each confirmed order offers the customer a **Send it to us on WhatsApp** button with the full order filled in. To send orders straight to a kitchen dashboard, connect a backend at the `BACKEND HOOK` comment in `js/core.js`.

## Order tracking
Customers enter their order code (for example `DMC-4821`) on `track.html`. In this version, stages move forward automatically every 60 seconds (`DEMO_STAGE_SECONDS` in `js/core.js`) and orders are saved in the customer's browser. With a backend, staff set each order's `status` number and the tracker shows real progress.

## Ada
Ada knows the menu, prices, hours, delivery fees and payment options. She recommends dishes, adds them to the order, quotes delivery fees and tracks orders. To connect a full language model, set `assistantEndpoint` in `js/config.js` (it receives `{ messages, context }` and returns `{ "reply": "...", "add": [{ "id": "asun", "qty": 2 }] }`).

## Editing pages
The header, footer and Ada panel are shared, so the pages are generated from `tools/build_pages.py`. Edit the page you want in that file, then run:

```bash
python3 tools/build_pages.py
```

Commit and push, and Netlify publishes the change.
