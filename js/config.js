/* =========================================================
   DE MANAGERS COURT — SITE CONFIG
   Edit the values below. Everything marked (PLACEHOLDER)
   should be replaced with your real details before launch.
   ========================================================= */
window.CONFIG = {
  name: "De Managers Court",
  tagline: "Owerri's finest table. Good food, cold drinks, better company.",
  address: "Plot 12, Wetheral Road, Owerri, Imo State", // (PLACEHOLDER)
  mapQuery: "Wetheral Road, Owerri, Imo State",          // used for the Google Map embed
  phone: "+234 800 000 0000",                            // (PLACEHOLDER)
  whatsapp: "2348000000000",                             // (PLACEHOLDER) digits only, with country code
  email: "hello@demanagerscourt.ng",                      // (PLACEHOLDER)
  instagram: "demanagerscourt",                         // (PLACEHOLDER)
  hours: [
    { days: "Mon – Thu", time: "12:00 PM – 12:00 AM" },
    { days: "Fri – Sat", time: "12:00 PM – 3:00 AM" },
    { days: "Sunday",    time: "2:00 PM – 12:00 AM" }
  ],
  /* Same hours in 24h numbers, used for the live "Open now" badge.
     Index 0 = Sunday. A close time past 24 means after midnight (27 = 3 AM). */
  openingTimes: [[14, 24], [12, 24], [12, 24], [12, 24], [12, 24], [12, 27], [12, 27]],

  /* ---------- PHOTOS ----------
     Put your photos in the images/ folder and set the path here,
     e.g. "images/hero.jpg" (a wide photo of the room or bar at night). */
  heroImage: "",

  /* ---------- WEEKLY EVENTS ---------- (day: 0 = Sunday) */
  events: [
    { day: 1, title: "Quiz & Wings", time: "7 PM", desc: "Teams of four, cash prize for the winners, half-price wings for every table." },
    { day: 2, title: "Karaoke Tuesday", time: "8 PM", desc: "Afrobeats, highlife and old-school classics. The mic is open all night." },
    { day: 3, title: "Ladies' Night", time: "7 PM", desc: "Free first cocktail for ladies before 10 PM, with a live saxophonist." },
    { day: 4, title: "Highlife Live", time: "8 PM", desc: "A live band playing highlife and Igbo classics, with pepper soup specials." },
    { day: 5, title: "Afrobeats Friday", time: "10 PM", desc: "Resident DJ until 3 AM. VIP tables come with a free shisha.", tag: "VIP" },
    { day: 6, title: "Saturday Signature", time: "10 PM", desc: "Guest DJ, bottle parades and our biggest night of the week.", tag: "VIP" },
    { day: 0, title: "Match Day & Pepper Soup", time: "3 PM", desc: "Live football on the big screen and bucket deals on beer." }
  ],

  /* ---------- FAQ ---------- */
  faq: [
    { q: "Which areas do you deliver to?", a: "All of Owerri. Fees start at ₦1,000 near Wetheral Road and go up to ₦3,500 for FUTO and Ihiagwa. You'll see the exact fee at checkout." },
    { q: "How long does delivery take?", a: "Most orders arrive in 35 to 45 minutes. Point-and-kill fish is cooked fresh, so allow a little longer." },
    { q: "Can I pay when my food arrives?", a: "Yes. Choose cash or POS on delivery at checkout. For pickup and dine-in you can pay at the counter." },
    { q: "How do I know my bank transfer went through?", a: "Use your order code as the narration. Our cashier confirms it, and your order tracker moves to \"Payment confirmed\" before the kitchen starts." },
    { q: "Do you take reservations and host birthdays?", a: "Yes. VIP sections, birthday setups with sparklers and cake service, and private corporate hangouts. Book on WhatsApp." },
    { q: "Is there an age limit?", a: "You must be 18 or older to order alcohol or shisha. Riders may ask for ID on delivery." }
  ],

  /* ---------- PAYMENTS ----------
     Online: Paystack. Paste your PUBLIC key (pk_live_... or pk_test_...).
     Leave empty to run the site in DEMO mode (payments are simulated). */
  paystackPublicKey: "",

  /* Offline: bank transfer details shown at checkout (PLACEHOLDER) */
  bank: {
    bankName: "Your Bank Name",
    accountName: "De Managers Court Ltd",
    accountNumber: "0123456789"
  },

  /* ---------- DELIVERY ---------- (fees in Naira) */
  deliveryZones: [
    { name: "Wetheral Road / Douglas Road", fee: 1000 },
    { name: "Ikenegbu / Works Layout",      fee: 1500 },
    { name: "New Owerri / World Bank",      fee: 2000 },
    { name: "Aladinma / Orji",              fee: 2000 },
    { name: "Amakohia / Akwakuma",          fee: 2500 },
    { name: "FUTO / Ihiagwa / Eziobodo",    fee: 3500 }
  ],
  serviceChargePercent: 0, // e.g. 7.5 for VAT-like charge; 0 to disable

  /* ---------- AI ASSISTANT ----------
     The built-in assistant runs fully in the browser and knows your menu.
     To connect a real AI model, set this to your backend URL (see README).
     The endpoint receives { messages, context } and must return { reply }. */
  assistantEndpoint: "",
  assistantName: "Ada"
};
