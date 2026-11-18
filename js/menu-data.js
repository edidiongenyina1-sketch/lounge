/* =========================================================
   MENU DATA — edit names, prices (₦), descriptions here.
   tags: "spicy", "signature", "popular", "veg", "new", "share"
   img: photo path. If left out, images/menu/<id>.webp is used.
   ========================================================= */
window.MENU_CATEGORIES = [
  { id: "native",  name: "Native Delicacies", icon: "pot" },
  { id: "grills",  name: "Grills & Small Chops", icon: "flame" },
  { id: "mains",   name: "Rice & Mains", icon: "bowl" },
  { id: "soups",   name: "Soups & Swallow", icon: "soup" },
  { id: "cocktails", name: "Cocktails & Mocktails", icon: "glass" },
  { id: "bottles", name: "Bottle Service", icon: "bottle" },
  { id: "drinks",  name: "Beers & Soft Drinks", icon: "can" },
  { id: "shisha",  name: "Shisha", icon: "smoke" }
];

window.MENU = [
  // Native delicacies
  { id: "nkwobi", cat: "native", name: "Nkwobi", price: 8500, tags: ["signature","spicy"], desc: "Cow foot in rich palm-oil ugba sauce, utazi leaves, served in a wooden bowl." },
  { id: "isiewu", cat: "native", name: "Isi Ewu", price: 12000, tags: ["signature","spicy","share"], desc: "Goat head, slow-cooked and tossed in spicy ugba and onion sauce." },
  { id: "abacha", cat: "native", name: "Abacha & Ugba", price: 5000, tags: ["veg","popular"], desc: "African salad with ugba, garden egg leaves, onions and fried fish on the side." },
  { id: "goatpep", cat: "native", name: "Goat Meat Pepper Soup", price: 6500, tags: ["spicy","popular"], desc: "Tender goat in our house pepper soup spice, with uziza and scent leaves." },
  { id: "catpep", cat: "native", name: "Point & Kill Catfish Pepper Soup", price: 15000, tags: ["signature","spicy","share"], desc: "Fresh whole catfish, cooked to order. Our most-loved pot." },
  { id: "ugba", cat: "native", name: "Ugba & Kpomo", price: 4500, tags: ["spicy"], desc: "Oil bean salad with soft cow skin, crayfish and fresh pepper." },

  // Grills & small chops
  { id: "asun", cat: "grills", name: "Peppered Asun", price: 7000, tags: ["spicy","popular"], desc: "Smoky grilled goat chunks, fired up with habanero and onions." },
  { id: "suya", cat: "grills", name: "Beef Suya Platter", price: 6000, tags: ["spicy","popular"], desc: "Thin-sliced beef in yaji spice, with onions, tomatoes and cabbage." },
  { id: "wings", cat: "grills", name: "Honey Chilli Wings (10)", price: 7500, tags: ["new"], desc: "Crispy wings glazed in honey and scotch bonnet." },
  { id: "fish", cat: "grills", name: "Grilled Croaker & Chips", price: 14000, tags: ["share"], desc: "Whole croaker, charcoal-grilled, with yam or potato chips and pepper sauce." },
  { id: "chops", cat: "grills", name: "Small Chops Box", price: 8000, tags: ["share","popular"], desc: "Puff-puff, samosa, spring rolls, peppered gizzard and chicken." },
  { id: "dodo", cat: "grills", name: "Dodo & Gizzard (Gizdodo)", price: 5500, tags: ["spicy"], desc: "Fried plantain and gizzard tossed in pepper sauce." },

  // Rice & mains
  { id: "jollof", cat: "mains", name: "Party Jollof & Chicken", price: 7500, tags: ["popular"], desc: "Smoky firewood jollof, fried plantain, coleslaw and a quarter chicken." },
  { id: "friedrice", cat: "mains", name: "Fried Rice & Turkey", price: 9000, tags: [], desc: "Nigerian fried rice with liver, prawns and peppered turkey." },
  { id: "ofada", cat: "mains", name: "Ofada Rice & Ayamase", price: 8000, tags: ["spicy"], desc: "Local rice with green pepper ayamase stew, assorted meat and egg." },
  { id: "pasta", cat: "mains", name: "Spicy Seafood Pasta", price: 11000, tags: ["new","spicy"], desc: "Spaghetti with prawns, calamari and a peppery tomato sauce." },
  { id: "vegrice", cat: "mains", name: "Coconut Rice & Veg Sauce", price: 6000, tags: ["veg"], desc: "Coconut rice, plantain and garden vegetable sauce." },

  // Soups & swallow
  { id: "ofeowerri", cat: "soups", name: "Ofe Owerri & Pounded Yam", price: 9500, tags: ["signature"], desc: "The pride of Owerri: ukazi, uziza, cocoyam and assorted meats." },
  { id: "oha", cat: "soups", name: "Oha Soup & Fufu", price: 8500, tags: [], desc: "Oha leaves in a cocoyam base with stockfish and goat meat." },
  { id: "egusi", cat: "soups", name: "Egusi Soup & Eba", price: 7500, tags: ["popular"], desc: "Melon seed soup with bitter leaf, beef and dry fish." },
  { id: "afang", cat: "soups", name: "Afang Soup & Semo", price: 8500, tags: [], desc: "Afang and waterleaf with periwinkle and assorted meat." },

  // Cocktails & mocktails
  { id: "manager", cat: "cocktails", name: "The Manager (House Signature)", price: 8000, tags: ["signature"], desc: "Aged rum, hibiscus (zobo) syrup, lime and ginger. Strong and smooth." },
  { id: "chapman", cat: "cocktails", name: "Classic Chapman", price: 4000, tags: ["popular","veg"], desc: "The Nigerian classic, alcohol-free. Grenadine, citrus, cucumber." },
  { id: "palmtini", cat: "cocktails", name: "Palm-Tini", price: 7500, tags: ["new"], desc: "Fresh palm wine, vodka and pineapple, shaken cold." },
  { id: "mojito", cat: "cocktails", name: "Mojito", price: 7000, tags: [], desc: "White rum, fresh mint, lime and soda." },
  { id: "zobo", cat: "cocktails", name: "Spiced Zobo Cooler", price: 3500, tags: ["veg"], desc: "Hibiscus, ginger, clove and pineapple. Alcohol-free." },

  // Bottle service
  { id: "henvs", cat: "bottles", name: "Hennessy VS", price: 95000, tags: ["popular"], desc: "Served with ice bucket and mixers." },
  { id: "henvsop", cat: "bottles", name: "Hennessy VSOP", price: 150000, tags: [], desc: "Served with ice bucket and mixers." },
  { id: "moet", cat: "bottles", name: "Moët & Chandon Brut", price: 180000, tags: ["signature"], desc: "Champagne on ice, with sparklers on request." },
  { id: "donjulio", cat: "bottles", name: "Don Julio Reposado", price: 160000, tags: [], desc: "Served with lime, salt and mixers." },
  { id: "jw", cat: "bottles", name: "Johnnie Walker Black Label", price: 65000, tags: [], desc: "12-year blended Scotch, with ice and mixers." },
  { id: "azul", cat: "bottles", name: "Clase Azul Reposado", price: 750000, tags: ["signature"], desc: "The VIP statement bottle. Comes with full table service." },

  // Beers & soft
  { id: "heineken", cat: "drinks", name: "Heineken", price: 1500, tags: ["popular"], desc: "Ice-cold, 33cl." },
  { id: "guinness", cat: "drinks", name: "Guinness Foreign Extra", price: 1500, tags: [], desc: "Big stout, 60cl." },
  { id: "star", cat: "drinks", name: "Star Lager", price: 1200, tags: [], desc: "60cl." },
  { id: "palmwine", cat: "drinks", name: "Fresh Palm Wine (Jug)", price: 3000, tags: ["new"], desc: "Tapped fresh, served chilled." },
  { id: "coke", cat: "drinks", name: "Coke / Fanta / Sprite", price: 800, tags: ["veg"], desc: "35cl bottle." },
  { id: "water", cat: "drinks", name: "Table Water", price: 500, tags: ["veg"], desc: "75cl." },

  // Shisha
  { id: "shisha1", cat: "shisha", name: "Classic Shisha", price: 15000, tags: [], desc: "Single flavour: double apple, mint, grape or watermelon." },
  { id: "shisha2", cat: "shisha", name: "Premium Shisha", price: 25000, tags: ["popular"], desc: "Mixed flavours, ice hose, served on fresh fruit head." }
];

// Items with a photo in images/menu/<id>.webp. Add an id here when you add its photo.
// Items not listed show a neutral placeholder with the dish name.
window.MENU_PHOTOS = ["nkwobi"];
window.MENU.forEach(m => { if (!m.img && window.MENU_PHOTOS.includes(m.id)) m.img = "images/menu/" + m.id + ".webp"; });
