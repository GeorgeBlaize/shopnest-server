const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('../utils/slugify');
const generateOrderNumber = require('../utils/orderNumber');

const prisma = new PrismaClient();

function img(seed, w = 800, h = 800) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
  return d;
}

const CATEGORIES = [
  { name: 'Electronics' },
  { name: 'Fashion & Apparel' },
  { name: 'Home & Kitchen' },
  { name: 'Beauty & Personal Care' },
  { name: 'Sports & Outdoors' },
  { name: 'Books & Stationery' },
  { name: 'Toys & Games' },
  { name: 'Groceries' },
];

const PRODUCTS = [
  // Electronics
  { category: 'Electronics', title: 'Sony WH-CH720N Wireless Noise Cancelling Headphones', shortDesc: 'Lightweight over-ear headphones with active noise cancellation and 35-hour battery life.', price: 129.99, compareAtPrice: 149.99, stock: 42, specs: { Weight: '192g', Battery: '35 hours', Connectivity: 'Bluetooth 5.2', Warranty: '1 year' }, featured: true },
  { category: 'Electronics', title: 'Anker PowerCore 10000 Portable Charger', shortDesc: 'Compact power bank with high-speed charging for phones and tablets.', price: 24.99, stock: 80, specs: { Capacity: '10000mAh', Output: '18W PD', Weight: '180g' } },
  { category: 'Electronics', title: 'Logitech MX Master 3S Wireless Mouse', shortDesc: 'Ergonomic wireless mouse with ultra-quiet clicks and 8K DPI tracking.', price: 99.99, stock: 35, specs: { DPI: '8000', Connectivity: 'Bluetooth / USB Receiver', Battery: '70 days' }, featured: true },
  { category: 'Electronics', title: 'Samsung 27" Odyssey G5 Curved Gaming Monitor', shortDesc: '1440p curved monitor with 165Hz refresh rate for smooth gaming.', price: 279.99, compareAtPrice: 329.99, stock: 18, specs: { Resolution: '2560x1440', RefreshRate: '165Hz', PanelType: 'VA' } },
  { category: 'Electronics', title: 'JBL Flip 6 Portable Bluetooth Speaker', shortDesc: 'Waterproof speaker with punchy bass and 12 hours of playtime.', price: 89.99, stock: 55, specs: { Battery: '12 hours', Waterproof: 'IP67', Weight: '550g' } },
  { category: 'Electronics', title: 'Apple 20W USB-C Power Adapter', shortDesc: 'Fast, compact charger compatible with iPhone and iPad.', price: 19.99, stock: 120, specs: { Output: '20W', Connector: 'USB-C' } },

  // Fashion & Apparel
  { category: 'Fashion & Apparel', title: "Levi's 501 Original Fit Jeans", shortDesc: 'Classic straight-leg denim jeans with a timeless, versatile fit.', price: 69.5, stock: 60, specs: { Material: '100% Cotton', Fit: 'Straight', Care: 'Machine wash cold' }, featured: true },
  { category: 'Fashion & Apparel', title: 'Nike Dri-FIT Running T-Shirt', shortDesc: 'Breathable performance tee that wicks sweat during workouts.', price: 29.99, stock: 90, specs: { Material: 'Polyester blend', Fit: 'Athletic', Care: 'Machine wash' } },
  { category: 'Fashion & Apparel', title: 'Champion Reverse Weave Hoodie', shortDesc: 'Heavyweight fleece hoodie that resists shrinking, built for daily wear.', price: 54.99, compareAtPrice: 64.99, stock: 40, specs: { Material: 'Cotton/Polyester', Fit: 'Regular', Care: 'Machine wash cold' } },
  { category: 'Fashion & Apparel', title: 'Ray-Ban Wayfarer Classic Sunglasses', shortDesc: 'Iconic acetate frame sunglasses with 100% UV protection.', price: 163.0, stock: 25, specs: { LensProtection: 'UV400', FrameMaterial: 'Acetate' }, featured: true },
  { category: 'Fashion & Apparel', title: "Adidas Ultraboost 22 Men's Running Shoes", shortDesc: 'Responsive Boost midsole running shoes for everyday training.', price: 179.99, stock: 33, specs: { Material: 'Primeknit upper', Midsole: 'Boost', Use: 'Running' } },

  // Home & Kitchen
  { category: 'Home & Kitchen', title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker', shortDesc: 'Pressure cook, slow cook, steam, and sauté with one appliance.', price: 89.95, compareAtPrice: 109.95, stock: 28, specs: { Capacity: '6 Quart', Functions: '7-in-1', Warranty: '1 year' }, featured: true },
  { category: 'Home & Kitchen', title: 'Dyson V8 Cordless Vacuum Cleaner', shortDesc: 'Powerful cordless vacuum with up to 40 minutes of run time.', price: 349.99, stock: 15, specs: { RunTime: '40 minutes', BinCapacity: '0.54L', Weight: '2.61kg' } },
  { category: 'Home & Kitchen', title: 'Ninja Foodi 10-in-1 Air Fryer Oven', shortDesc: 'Air fry, bake, roast, and dehydrate with one countertop oven.', price: 199.99, stock: 20, specs: { Capacity: '10 Quart', Functions: '10-in-1' } },
  { category: 'Home & Kitchen', title: 'Le Creuset Enameled Cast Iron Dutch Oven', shortDesc: 'Premium 5.5-quart Dutch oven for braising, baking, and roasting.', price: 379.95, stock: 12, specs: { Capacity: '5.5 Quart', Material: 'Enameled Cast Iron' } },
  { category: 'Home & Kitchen', title: 'Egyptian Cotton 4-Piece Bedsheet Set', shortDesc: 'Soft, breathable 800 thread-count sheets in a deep-pocket fit.', price: 64.99, stock: 45, specs: { ThreadCount: '800', Material: '100% Egyptian Cotton', Size: 'Queen' } },

  // Beauty & Personal Care
  { category: 'Beauty & Personal Care', title: 'CeraVe Foaming Facial Cleanser', shortDesc: 'Gentle daily cleanser with ceramides for normal to oily skin.', price: 15.99, stock: 100, specs: { Volume: '473ml', SkinType: 'Normal to Oily' }, featured: true },
  { category: 'Beauty & Personal Care', title: 'Oral-B iO Series 5 Electric Toothbrush', shortDesc: 'Smart electric toothbrush with pressure sensor and 5 cleaning modes.', price: 129.99, compareAtPrice: 159.99, stock: 30, specs: { Modes: '5', BatteryLife: '14 days' } },
  { category: 'Beauty & Personal Care', title: 'The Ordinary Niacinamide 10% + Zinc 1%', shortDesc: 'Concentrated serum that targets blemishes and congestion.', price: 6.5, stock: 150, specs: { Volume: '30ml' } },
  { category: 'Beauty & Personal Care', title: 'Dyson Supersonic Hair Dryer', shortDesc: 'Fast-drying hair dryer engineered to prevent extreme heat damage.', price: 429.99, stock: 10, specs: { Motor: 'Digital V9', Attachments: '3' } },
  { category: 'Beauty & Personal Care', title: 'Neutrogena Ultra Sheer Sunscreen SPF 100+', shortDesc: 'Lightweight, non-greasy broad spectrum sun protection.', price: 12.49, stock: 90, specs: { SPF: '100+', Volume: '88ml' } },

  // Sports & Outdoors
  { category: 'Sports & Outdoors', title: 'YETI Rambler 26oz Water Bottle', shortDesc: 'Vacuum-insulated stainless steel bottle that keeps drinks cold for hours.', price: 40.0, stock: 65, specs: { Capacity: '26oz', Material: 'Stainless Steel' }, featured: true },
  { category: 'Sports & Outdoors', title: 'Coleman Sundome 4-Person Camping Tent', shortDesc: 'Weatherproof dome tent that sets up in about 10 minutes.', price: 99.99, stock: 22, specs: { Capacity: '4 Person', SetupTime: '10 minutes' } },
  { category: 'Sports & Outdoors', title: 'Bowflex SelectTech 552 Adjustable Dumbbells', shortDesc: 'Adjustable dumbbell pair replacing 15 sets of weights, 5 to 52.5 lbs each.', price: 429.0, stock: 8, specs: { WeightRange: '5-52.5 lbs each', Pair: 'Yes' } },
  { category: 'Sports & Outdoors', title: 'Manduka PRO Yoga Mat', shortDesc: 'Extra-dense, high-performance mat built for a lifetime of practice.', price: 120.0, stock: 34, specs: { Thickness: '6mm', Length: '71 inches' } },
  { category: 'Sports & Outdoors', title: 'Wilson Evolution Indoor Basketball', shortDesc: 'Composite leather basketball with a soft feel used in high school games.', price: 64.99, stock: 40, specs: { Size: 'Official Size 7', Material: 'Composite Leather' } },

  // Books & Stationery
  { category: 'Books & Stationery', title: 'Atomic Habits by James Clear', shortDesc: 'A practical guide to building good habits and breaking bad ones.', price: 16.99, stock: 75, specs: { Format: 'Paperback', Pages: '320' }, featured: true },
  { category: 'Books & Stationery', title: 'Moleskine Classic Hardcover Notebook', shortDesc: 'Ruled hardcover notebook with an elastic closure and bookmark.', price: 21.95, stock: 88, specs: { Pages: '240', Ruling: 'Lined' } },
  { category: 'Books & Stationery', title: 'Pilot G2 Premium Gel Pens (12-Pack)', shortDesc: 'Smooth-writing retractable gel pens with comfortable grip.', price: 13.49, stock: 200, specs: { PackSize: '12', TipSize: '0.7mm' } },
  { category: 'Books & Stationery', title: 'Staedtler Watercolor Pencils Set of 24', shortDesc: 'Vibrant, water-soluble colored pencils for artists and students.', price: 24.99, stock: 55, specs: { PackSize: '24', Type: 'Watercolor' } },

  // Toys & Games
  { category: 'Toys & Games', title: 'LEGO Creator 3-in-1 Deep Sea Creatures', shortDesc: 'Buildable shark, anglerfish, or crab set for ages 7 and up.', price: 15.99, stock: 70, specs: { Pieces: '230', AgeRange: '7+' }, featured: true },
  { category: 'Toys & Games', title: 'Catan Board Game', shortDesc: 'The classic trading and building strategy game for 3-4 players.', price: 44.99, stock: 38, specs: { Players: '3-4', PlayTime: '60-120 min' } },
  { category: 'Toys & Games', title: 'Nerf Elite 2.0 Commander Blaster', shortDesc: 'Dart blaster with rotating drum and precision-tactical rail.', price: 19.99, stock: 60, specs: { DartCapacity: '12', Range: 'up to 90 feet' } },
  { category: 'Toys & Games', title: 'Rubik\'s Cube 3x3 Speed Cube', shortDesc: 'Smooth-turning speed cube for beginners and competitive solvers.', price: 9.99, stock: 150, specs: { Type: '3x3', Finish: 'Stickered' } },

  // Groceries
  { category: 'Groceries', title: 'Lavazza Qualità Oro Ground Coffee 1kg', shortDesc: 'Medium roast Italian coffee with a smooth, balanced flavor.', price: 18.99, stock: 95, specs: { Weight: '1kg', Roast: 'Medium' }, featured: true },
  { category: 'Groceries', title: "Kirkland Signature Organic Extra Virgin Olive Oil", shortDesc: 'Cold-pressed olive oil sourced from Mediterranean groves.', price: 21.99, stock: 60, specs: { Volume: '2L', Type: 'Extra Virgin' } },
  { category: 'Groceries', title: 'RXBAR Protein Bars Variety Pack (12-Count)', shortDesc: 'Simple-ingredient protein bars made with egg whites and nuts.', price: 22.49, stock: 130, specs: { PackSize: '12', ProteinPerBar: '12g' } },
  { category: 'Groceries', title: 'Manuka Honey UMF 10+', shortDesc: 'Raw, unpasteurized honey from New Zealand with certified potency.', price: 34.99, stock: 40, specs: { Weight: '250g', UMFRating: '10+' } },
];

const BLOG_POSTS = [
  {
    title: '5 Tips for Choosing the Right Wireless Headphones',
    excerpt: 'Battery life, comfort, and noise cancellation all matter — here is how to weigh them.',
    authorName: 'Maya Chen',
    content:
      'Picking a pair of wireless headphones comes down to how and where you will actually use them. If you commute on noisy trains, active noise cancellation and a snug over-ear fit matter more than anything else. If you exercise, look for a secure in-ear fit and at least an IPX4 sweat rating.\n\nBattery life is the second big factor. Anything above 20 hours will comfortably get you through a week of commuting without a nightly charge. Fast-charge features that give you a few hours of playback from a 10-minute top-up are worth paying extra for.\n\nFinally, try before you buy if you can. Comfort is personal, and a headphone that clamps too tightly will bother you within an hour no matter how good the sound is.',
    coverImage: img('blog-headphones', 1200, 630),
  },
  {
    title: '2026 Home Decor Trends You Can Shop Today',
    excerpt: 'From warm minimalism to statement lighting, here is what is shaping living rooms this year.',
    authorName: 'Priya Sharma',
    content:
      'Warm minimalism continues to dominate: think natural wood tones, linen textiles, and a muted, earthy color palette instead of stark white. Pair a few well-made pieces with warm lighting instead of filling every corner.\n\nStatement lighting is having a moment too. A single sculptural pendant over a dining table can do more for a room than a dozen smaller accessories.\n\nWhen shopping, prioritize a handful of durable, well-built pieces — a solid dutch oven, a good vacuum, real cotton bedding — over disposable ones. They tend to save money over a few years and simply feel nicer to use every day.',
    coverImage: img('blog-decor', 1200, 630),
  },
  {
    title: 'A Beginner\'s Guide to Building a Home Gym',
    excerpt: 'You do not need a garage full of machines — here is what actually gets used.',
    authorName: 'Jordan Lee',
    content:
      'Most people overbuy equipment when starting a home gym and end up using 20% of it. Adjustable dumbbells, a solid yoga mat, and a pull-up bar cover the vast majority of full-body strength training.\n\nAdjustable dumbbells in particular replace an entire rack of fixed weights and take up a fraction of the floor space, which matters if you are working out in a bedroom or living room.\n\nStart with the basics, track your workouts for a month, and only add equipment once you notice a specific gap in your routine — that is a far better filter than buying everything up front.',
    coverImage: img('blog-gym', 1200, 630),
  },
  {
    title: 'How to Read Skincare Ingredient Labels Like a Pro',
    excerpt: 'Niacinamide, ceramides, zinc — what they actually do and how to layer them.',
    authorName: 'Maya Chen',
    content:
      'Ingredient lists are ordered by concentration, so the first five ingredients after water tell you most of what a product actually does. Ceramides help repair the skin barrier, which is why they show up in gentle daily cleansers.\n\nNiacinamide is one of the most versatile actives available — it helps with oil control, redness, and texture, and it plays well with almost every other ingredient, including retinoids.\n\nWhen in doubt, introduce one new active at a time and give it two to three weeks before judging results. Skin needs time to adapt, and layering five new products at once makes it impossible to know what is working.',
    coverImage: img('blog-skincare', 1200, 630),
  },
  {
    title: 'Board Games That Are Actually Fun for Mixed Groups',
    excerpt: 'Recommendations that work whether your group is competitive or just here to hang out.',
    authorName: 'Jordan Lee',
    content:
      'Catan remains one of the best gateway strategy games because the trading mechanic keeps everyone involved even when it is not their turn — you are always negotiating with someone.\n\nFor larger groups, party-style games with shorter rounds keep energy up better than long strategy games where one elimination can leave a player sitting out for an hour.\n\nThe real trick to picking a good group game is matching the game length to your group\'s attention span, not the other way around. A 20-minute game that gets played three times beats a 90-minute game everyone quits halfway through.',
    coverImage: img('blog-boardgames', 1200, 630),
  },
  {
    title: 'Coffee Storage Mistakes That Are Wasting Your Beans',
    excerpt: 'That clear jar on your counter might be the reason your coffee tastes stale.',
    authorName: 'Priya Sharma',
    content:
      'Light, air, moisture, and heat are the four enemies of fresh coffee — and a clear glass jar next to the stove hits three of the four at once. An opaque, airtight container kept in a cool cabinet will keep beans fresher for weeks longer.\n\nBuying whole beans and grinding just before brewing makes a bigger difference than almost any other change you can make, since ground coffee loses its aroma compounds within days.\n\nIf you buy in bulk, portion out a week\'s worth into a small container and freeze the rest in an airtight bag, taking out only what you need.',
    coverImage: img('blog-coffee', 1200, 630),
  },
];

const TESTIMONIALS = [
  { name: 'Amanda Torres', role: 'Verified Buyer', message: 'Order arrived two days early and the packaging was spotless. The Dutch oven is even better than the photos.', rating: 5 },
  { name: 'Kevin Park', role: 'Repeat Customer', message: 'I have ordered from ShopNest four times now and the tracking updates are always accurate. Easy to recommend.', rating: 5 },
  { name: 'Sofia Ramirez', role: 'Verified Buyer', message: 'The size guide on the jeans was spot on for once. First time I did not have to return clothing ordered online.', rating: 4 },
  { name: 'Daniel Osei', role: 'Verified Buyer', message: 'Customer support helped me swap an order to a different address within minutes. Genuinely impressed.', rating: 5 },
  { name: 'Grace Kim', role: 'Repeat Customer', message: 'Prices are consistently better than the big marketplaces for the same electronics, and checkout is quick.', rating: 4 },
  { name: 'Marcus Webb', role: 'Verified Buyer', message: 'Bought a gift last minute and it still showed up on time with a proper invoice included. Will be back.', rating: 5 },
];

const EXTRA_USER_NAMES = [
  'Amanda Torres', 'Kevin Park', 'Sofia Ramirez', 'Daniel Osei', 'Grace Kim',
  'Marcus Webb', 'Elena Petrova', 'Noah Fischer',
];

async function main() {
  console.log('Seeding database...');

  await prisma.contactMessage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.user.deleteMany();

  const categoryMap = new Map();
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    const created = await prisma.category.create({
      data: { name: cat.name, slug, imageUrl: img(`cat-${slug}`, 600, 400) },
    });
    categoryMap.set(cat.name, created);
  }
  console.log(`Created ${categoryMap.size} categories`);

  const createdProducts = [];
  for (const p of PRODUCTS) {
    const slug = slugify(p.title);
    const category = categoryMap.get(p.category);
    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug,
        shortDesc: p.shortDesc,
        description: `${p.shortDesc} Designed for everyday reliability, this item is one of our most consistently reordered products in the ${p.category} category. It ships with manufacturer packaging and is covered by our standard return policy.`,
        specs: p.specs,
        price: p.price,
        compareAtPrice: p.compareAtPrice || null,
        stock: p.stock,
        images: [img(`${slug}-1`), img(`${slug}-2`), img(`${slug}-3`)],
        categoryId: category.id,
        isFeatured: Boolean(p.featured),
      },
    });
    createdProducts.push(product);
  }
  console.log(`Created ${createdProducts.length} products`);

  const passwordHash = async (pwd) => bcrypt.hash(pwd, 12);

  await prisma.user.create({
    data: { name: 'Ava Administrator', email: 'admin@shopnest.com', passwordHash: await passwordHash('Admin@123'), role: 'ADMIN' },
  });
  await prisma.user.create({
    data: { name: 'Miles Manager', email: 'manager@shopnest.com', passwordHash: await passwordHash('Manager@123'), role: 'MANAGER' },
  });
  const demoUser = await prisma.user.create({
    data: { name: 'Uma User', email: 'user@shopnest.com', passwordHash: await passwordHash('User@123'), role: 'USER' },
  });

  const extraUsers = [];
  for (const name of EXTRA_USER_NAMES) {
    const email = `${slugify(name)}@example.com`;
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await passwordHash('Password@123'), role: 'USER' },
    });
    extraUsers.push(user);
  }
  const orderingUsers = [demoUser, ...extraUsers];
  console.log(`Created ${3 + extraUsers.length} users`);

  const addressByUser = new Map();
  const cities = [
    { city: 'Austin', state: 'TX', postalCode: '78701' },
    { city: 'Seattle', state: 'WA', postalCode: '98101' },
    { city: 'Chicago', state: 'IL', postalCode: '60601' },
    { city: 'Denver', state: 'CO', postalCode: '80202' },
  ];
  for (const user of orderingUsers) {
    const loc = randomChoice(cities);
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: 'Home',
        line1: `${randomInt(100, 999)} Maple Street`,
        city: loc.city,
        state: loc.state,
        postalCode: loc.postalCode,
        country: 'USA',
        phone: `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        isDefault: true,
      },
    });
    addressByUser.set(user.id, address);
  }

  for (const product of createdProducts) {
    const reviewerCount = randomInt(3, 6);
    const reviewers = [...orderingUsers].sort(() => 0.5 - Math.random()).slice(0, reviewerCount);
    const comments = [
      'Exactly as described and arrived quickly. Would buy again.',
      'Good quality for the price, works as expected.',
      'Solid product overall, a couple of minor quirks but nothing dealbreaking.',
      'Better build quality than I expected at this price point.',
      'Does the job well. Packaging was secure and shipping was fast.',
      'Not perfect but a good value pick for daily use.',
    ];
    for (const reviewer of reviewers) {
      const rating = randomChoice([3, 4, 4, 5, 5, 5]);
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: reviewer.id,
          rating,
          comment: randomChoice(comments),
        },
      });
    }
    const agg = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { avgRating: agg._avg.rating || 0, reviewCount: agg._count.rating },
    });
  }
  console.log('Seeded reviews and recomputed ratings');

  const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING', 'CANCELLED'];
  let orderCount = 0;
  for (let i = 0; i < 18; i++) {
    const user = randomChoice(orderingUsers);
    const address = addressByUser.get(user.id);
    const itemCount = randomInt(1, 3);
    const chosenProducts = [...createdProducts].sort(() => 0.5 - Math.random()).slice(0, itemCount);

    let subtotal = 0;
    const itemsData = chosenProducts.map((p) => {
      const quantity = randomInt(1, 3);
      subtotal += Number(p.price) * quantity;
      return {
        productId: p.id,
        titleSnapshot: p.title,
        priceSnapshot: p.price,
        quantity,
      };
    });
    const shippingFee = subtotal >= 75 ? 0 : 5;
    const total = subtotal + shippingFee;
    const createdAt = daysAgo(randomInt(0, 85));

    await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(createdAt),
        userId: user.id,
        addressId: address.id,
        subtotal,
        shippingFee,
        total,
        status: randomChoice(statuses),
        paymentMethod: 'COD',
        createdAt,
        updatedAt: createdAt,
        items: { create: itemsData },
      },
    });
    orderCount++;
  }
  console.log(`Created ${orderCount} orders`);

  for (const post of BLOG_POSTS) {
    await prisma.blogPost.create({
      data: { ...post, slug: slugify(post.title), published: true },
    });
  }
  console.log(`Created ${BLOG_POSTS.length} blog posts`);

  for (const t of TESTIMONIALS) {
    await prisma.testimonial.create({
      data: { ...t, avatarUrl: img(`avatar-${slugify(t.name)}`, 200, 200) },
    });
  }
  console.log(`Created ${TESTIMONIALS.length} testimonials`);

  await prisma.contactMessage.createMany({
    data: [
      { name: 'Rachel Adams', email: 'rachel.adams@example.com', subject: 'Delayed shipment', message: 'My order #ORD-20260601-1234 has not updated in 4 days, can someone check on it?', resolved: true },
      { name: 'Tom Bennett', email: 'tom.bennett@example.com', subject: 'Bulk order inquiry', message: 'Do you offer discounts for orders of 50+ units for a corporate gift program?', resolved: false },
      { name: 'Lisa Nguyen', email: 'lisa.nguyen@example.com', subject: 'Return question', message: 'I would like to return an item I ordered last week, what is the process?', resolved: false },
    ],
  });
  console.log('Created contact messages');

  console.log('\nSeed complete. Demo credentials:');
  console.log('  Admin:   admin@shopnest.com / Admin@123');
  console.log('  Manager: manager@shopnest.com / Manager@123');
  console.log('  User:    user@shopnest.com / User@123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
