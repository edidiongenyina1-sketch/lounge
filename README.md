# De Managers Court, Owerri: Website

A fast, mobile-first website with an online menu, food ordering, online and offline payments, order tracking and an AI assistant called Ada. It is plain HTML, CSS and JavaScript, with no build step.

## Files
```
index.html          Page structure
css/styles.css      All styling (colours are at the top under :root)
js/config.js        ← YOUR BUSINESS DETAILS: phone, WhatsApp, address, bank, delivery fees, Paystack key
js/menu-data.js     ← YOUR MENU: names, prices, descriptions, tags, photos
js/app.js           Menu, cart, checkout, payments, order tracking
js/assistant.js     Ada, the AI assistant
```

## 1. Before launch: edit these
1. **`js/config.js`**: replace every value marked `(PLACEHOLDER)`. That covers the phone number, WhatsApp number, address, Instagram handle, bank account and delivery zones and fees.
2. **Photos:** put a wide photo of the room or bar at night in `images/` (for example `images/hero.jpg`) and set `heroImage: "images/hero.jpg"` in `js/config.js`. It replaces the logo panel at the top of the page.
3. **`js/menu-data.js`**: set your real dishes and prices. To show a photo on an item, add `img: "images/nkwobi.jpg"` and put the photo in an `images/` folder. Items without a photo show a styled icon instead.

## 2. Payments
- **Online (Paystack):** create an account at paystack.com. Copy your **Public Key** (Settings → API Keys) into `paystackPublicKey` in `config.js`. Use `pk_test_...` while testing and `pk_live_...` when you go live. Customers can then pay by card, bank transfer or USSD.
  - While the key is empty, the site runs in **demo mode** and payments are only simulated.
  - For full security, also verify each payment reference on a server with your *secret* key. Never put the secret key in these files.
- **Offline:** cash or POS on delivery, pay at the counter (pickup and dine-in), and direct bank transfer. These work with no setup.

## 3. How you receive orders
Without a backend, every confirmed order shows the customer a **"Send order to the lounge on WhatsApp"** button. It opens WhatsApp with the full order already filled in: items, total, address, payment method and order code.

To get orders straight into a kitchen dashboard, connect a backend at the `BACKEND HOOK` comment in `js/app.js`. Firebase, Supabase or a small Node/PHP API would all work.

## 4. Order tracking
Customers enter their code (for example `DMC-4821`) to see a live timeline: Received → Confirmed → Preparing → Out for delivery / Ready → Delivered.
- **Demo mode (now):** statuses move forward automatically, one stage every 60 seconds (`DEMO_STAGE_SECONDS` in `app.js`). Orders are saved in the customer's browser.
- **Live mode:** once you have a backend, staff update each order's `status` number (0, 1, 2…) and the tracker shows the real progress.

## 5. Ada, the AI assistant
Ada runs entirely in the browser and already knows the whole menu, prices, hours, delivery fees and payment options. She can:
- recommend dishes ("something spicy under ₦8k", "drinks for 4 people", "meat-free options")
- add items to the cart ("add 2 asun"), show the cart and go to checkout
- quote delivery fees by area ("do you deliver to New Owerri?")
- track orders ("track DMC-4821")
- answer questions about hours, location, payment and reservations

**Optional upgrade to a full language model:** set `assistantEndpoint` in `config.js` to a server URL. Ada sends `POST { messages, context }`, where `context` holds your menu, cart and business info. The server should reply with `{ "reply": "text", "add": [{ "id": "asun", "qty": 2 }] }`. If the server fails, Ada falls back to her built-in brain automatically.

## 6. Hosting (free options)
- **Netlify:** drag the whole folder onto app.netlify.com/drop.
- **Vercel / GitHub Pages / cPanel:** upload the folder as-is. `index.html` is the entry page.

To preview it on your computer, open `index.html` in a browser, or run `python3 -m http.server` inside the folder and visit http://localhost:8000.
