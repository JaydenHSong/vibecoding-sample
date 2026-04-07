require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Banner = require('./models/Banner');
const FAQ = require('./models/FAQ');
const Variant = require('./models/Variant');

const categories = [
  { name: 'Tops', slug: 'tops' },
  { name: 'Bottoms', slug: 'bottoms' },
  { name: 'Outerwear', slug: 'outerwear' },
  { name: 'Shoes', slug: 'shoes' },
  { name: 'Accessories', slug: 'accessories' },
];

const productTemplates = [
  // Tops (10)
  { name: 'Essential Cotton Tee', cat: 'tops', price: 35, desc: 'Soft cotton crewneck tee with a relaxed fit.', img: 'photo-1521572163474-6864f9cf17ab' },
  { name: 'Linen Button-Down', cat: 'tops', price: 78, desc: 'Breathable linen shirt for warm days.', img: 'photo-1596755094514-f87e34085b2c' },
  { name: 'Oversized Stripe Tee', cat: 'tops', price: 42, desc: 'Casual oversized fit with classic stripes.', img: 'photo-1618354691373-d851c5c3a990' },
  { name: 'Silk Blend Blouse', cat: 'tops', price: 120, desc: 'Elegant silk blend blouse for evening wear.', img: 'photo-1564257631407-4deb1f99d992' },
  { name: 'Merino Wool Polo', cat: 'tops', price: 95, desc: 'Premium merino wool polo knit.', img: 'photo-1586363104862-3a5e2ab60d99' },
  { name: 'Graphic Print Tee', cat: 'tops', price: 38, desc: 'Modern graphic print on organic cotton.', img: 'photo-1576566588028-4147f3842f27' },
  { name: 'Oxford Dress Shirt', cat: 'tops', price: 88, desc: 'Classic oxford shirt for formal occasions.', img: 'photo-1602810318383-e386cc2a3ccf' },
  { name: 'Relaxed Henley', cat: 'tops', price: 45, desc: 'Comfortable henley with button placket.', img: 'photo-1529374255404-311a2a4f1fd9' },
  { name: 'Cropped Tank', cat: 'tops', price: 28, desc: 'Minimal cropped tank in soft jersey.', img: 'photo-1622470953794-aa9c70b0fb9d' },
  { name: 'Knit Sweater Vest', cat: 'tops', price: 68, desc: 'Layering essential knit vest.', img: 'photo-1614975059251-992f11792b9f' },

  // Bottoms (10)
  { name: 'Slim Fit Chinos', cat: 'bottoms', price: 75, desc: 'Tailored chinos with stretch comfort.', img: 'photo-1473966968600-fa801b869a1a' },
  { name: 'Wide Leg Trousers', cat: 'bottoms', price: 95, desc: 'Relaxed wide leg silhouette.', img: 'photo-1594938298603-c8148c4dae35' },
  { name: 'Raw Denim Jeans', cat: 'bottoms', price: 128, desc: 'Japanese selvedge raw denim.', img: 'photo-1542272604-787c3835535d' },
  { name: 'Pleated Wool Pants', cat: 'bottoms', price: 135, desc: 'Elegant pleated wool trousers.', img: 'photo-1624378439575-d8705ad7ae80' },
  { name: 'Cargo Joggers', cat: 'bottoms', price: 65, desc: 'Utility cargo joggers with elastic cuff.', img: 'photo-1517438476312-10d79c077509' },
  { name: 'Linen Shorts', cat: 'bottoms', price: 55, desc: 'Lightweight linen shorts for summer.', img: 'photo-1591195853828-11db59a44f6b' },
  { name: 'Tailored Bermuda', cat: 'bottoms', price: 72, desc: 'Smart bermuda shorts for smart casual.', img: 'photo-1562157873-818bc0726f68' },
  { name: 'Track Pants', cat: 'bottoms', price: 48, desc: 'Comfortable track pants for everyday.', img: 'photo-1552902865-b72c031ac5ea' },
  { name: 'Corduroy Straight', cat: 'bottoms', price: 85, desc: 'Classic corduroy in straight cut.', img: 'photo-1605518216938-7c31b7b14ad0' },
  { name: 'High Rise Culottes', cat: 'bottoms', price: 78, desc: 'Modern culottes with high waist.', img: 'photo-1509631179647-0177331693ae' },

  // Outerwear (10)
  { name: 'Wool Overcoat', cat: 'outerwear', price: 285, desc: 'Premium wool blend overcoat.', img: 'photo-1539533018447-63fcce2678e3' },
  { name: 'Leather Biker Jacket', cat: 'outerwear', price: 350, desc: 'Classic leather motorcycle jacket.', img: 'photo-1551028719-00167b16eac5' },
  { name: 'Quilted Puffer', cat: 'outerwear', price: 195, desc: 'Lightweight quilted puffer jacket.', img: 'photo-1611312449408-fcece27cdbb7' },
  { name: 'Trench Coat', cat: 'outerwear', price: 245, desc: 'Timeless double-breasted trench.', img: 'photo-1591047139829-d91aecb6caea' },
  { name: 'Denim Trucker Jacket', cat: 'outerwear', price: 118, desc: 'Classic denim jacket with sherpa lining.', img: 'photo-1576995853123-5a10305d93c0' },
  { name: 'Bomber Jacket', cat: 'outerwear', price: 145, desc: 'MA-1 style bomber in satin.', img: 'photo-1556821840-3a63f95609a7' },
  { name: 'Rain Parka', cat: 'outerwear', price: 165, desc: 'Waterproof parka with sealed seams.', img: 'photo-1545594861-3bef43ff2fc8' },
  { name: 'Blazer Sport Coat', cat: 'outerwear', price: 215, desc: 'Unstructured linen-cotton blazer.', img: 'photo-1507679799987-c73779587ccf' },
  { name: 'Fleece Zip-Up', cat: 'outerwear', price: 85, desc: 'Cozy polar fleece full zip.', img: 'photo-1614251056798-0a63eda2bb25' },
  { name: 'Windbreaker', cat: 'outerwear', price: 98, desc: 'Packable windbreaker with hood.', img: 'photo-1495105787522-5334e3ffa0ef' },

  // Shoes (10)
  { name: 'Minimalist Sneakers', cat: 'shoes', price: 135, desc: 'Clean white leather sneakers.', img: 'photo-1549298916-b41d501d3772' },
  { name: 'Chelsea Boots', cat: 'shoes', price: 195, desc: 'Suede chelsea boots with elastic panel.', img: 'photo-1638247025967-b4e38f787b76' },
  { name: 'Canvas Slip-On', cat: 'shoes', price: 55, desc: 'Easy canvas slip-on for daily wear.', img: 'photo-1525966222134-fcfa99b8ae77' },
  { name: 'Leather Loafers', cat: 'shoes', price: 168, desc: 'Handcrafted leather penny loafers.', img: 'photo-1614252369475-531eba835eb1' },
  { name: 'Running Shoes', cat: 'shoes', price: 125, desc: 'Performance running shoes with cushion.', img: 'photo-1542291026-7eec264c27ff' },
  { name: 'Desert Boots', cat: 'shoes', price: 145, desc: 'Classic suede desert boots.', img: 'photo-1608256246200-53e635b5b65f' },
  { name: 'Platform Sandals', cat: 'shoes', price: 78, desc: 'Chunky platform leather sandals.', img: 'photo-1603487742131-4160ec999306' },
  { name: 'High-Top Sneakers', cat: 'shoes', price: 110, desc: 'Retro high-top sneakers in canvas.', img: 'photo-1460353581641-37baddab0fa2' },
  { name: 'Dress Oxford', cat: 'shoes', price: 215, desc: 'Polished leather oxford dress shoes.', img: 'photo-1533867617858-e7b97e060509' },
  { name: 'Espadrilles', cat: 'shoes', price: 65, desc: 'Woven jute sole espadrilles.', img: 'photo-1622560480654-d96214fdc887' },

  // Accessories (10)
  { name: 'Leather Tote Bag', cat: 'accessories', price: 185, desc: 'Full grain leather tote with zip.', img: 'photo-1548036328-c9fa89d128fa' },
  { name: 'Wool Scarf', cat: 'accessories', price: 58, desc: 'Soft cashmere-wool blend scarf.', img: 'photo-1520903920243-00d872a2d1c9' },
  { name: 'Aviator Sunglasses', cat: 'accessories', price: 145, desc: 'Classic aviator with polarized lens.', img: 'photo-1511499767150-a48a237f0083' },
  { name: 'Canvas Backpack', cat: 'accessories', price: 95, desc: 'Waxed canvas backpack with leather trim.', img: 'photo-1553062407-98eeb64c6a62' },
  { name: 'Leather Belt', cat: 'accessories', price: 68, desc: 'Italian leather belt with brass buckle.', img: 'photo-1624222247344-550fb60583dc' },
  { name: 'Beanie Hat', cat: 'accessories', price: 32, desc: 'Ribbed merino wool beanie.', img: 'photo-1576871337632-b9aef4c17ab9' },
  { name: 'Crossbody Bag', cat: 'accessories', price: 125, desc: 'Compact leather crossbody.', img: 'photo-1548036328-c9fa89d128fa' },
  { name: 'Silk Pocket Square', cat: 'accessories', price: 35, desc: 'Hand-rolled silk pocket square.', img: 'photo-1594223274512-ad4803739b7c' },
  { name: 'Minimalist Watch', cat: 'accessories', price: 225, desc: 'Swiss movement minimalist watch.', img: 'photo-1524592094714-0f0654e20314' },
  { name: 'Leather Wallet', cat: 'accessories', price: 85, desc: 'Slim bifold wallet in full grain leather.', img: 'photo-1627123424574-724758594e93' },
];

const banners = [
  { title: 'Summer Collection 2026', image: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/w_1280,q_80,f_auto/https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280`, link: '/products', position: 'main', order: 1 },
  { title: 'New Arrivals', image: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/w_1280,q_80,f_auto/https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1280`, link: '/products?sort=newest', position: 'main', order: 2 },
];

const faqs = [
  { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.', category: 'Shipping', order: 1 },
  { question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase. Items must be unworn with tags attached.', category: 'Returns', order: 2 },
  { question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries. International shipping takes 7-14 business days.', category: 'Shipping', order: 3 },
  { question: 'How can I track my order?', answer: 'Once shipped, you will receive a tracking number via email.', category: 'Shipping', order: 4 },
  { question: 'What payment methods do you accept?', answer: 'We accept credit cards, bank transfers, and virtual accounts.', category: 'Payment', order: 5 },
];

function generateCombinations(options) {
  if (!options || options.length === 0) return [{}];
  const [first, ...rest] = options;
  const restCombos = generateCombinations(rest);
  const combos = [];
  for (const value of first.values) {
    for (const combo of restCombos) {
      combos.push({ [first.name]: value, ...combo });
    }
  }
  return combos;
}

async function seed() {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Variant.deleteMany({}),
    Banner.deleteMany({}),
    FAQ.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({ email: 'admin@curated.com', password: adminPassword, name: 'Admin', role: 'admin' });

  // Create customer
  const custPassword = await bcrypt.hash('test1234', 10);
  await User.create({ email: 'customer@test.com', password: custPassword, name: 'Test Customer', phone: '5551234567', gender: 'male' });
  console.log('Created users (admin@curated.com / admin123, customer@test.com / test1234)');

  // Create categories
  const catDocs = await Category.insertMany(categories);
  const catMap = {};
  catDocs.forEach((c) => { catMap[c.slug] = c._id; });
  console.log(`Created ${catDocs.length} categories`);

  // Extra images per category for gallery views
  const extraImages = {
    tops: ['photo-1583743814966-8936f5b7be1a', 'photo-1489987707025-afc232f7ea0f', 'photo-1503341504253-dff4f94032fc'],
    bottoms: ['photo-1541099649105-f69ad21f3246', 'photo-1584370848010-d7fe6bc767ec', 'photo-1506629082955-511b1aa562c8'],
    outerwear: ['photo-1551488831-00ddcb6c6bd3', 'photo-1544022613-e87ca75a784a', 'photo-1520975954732-35dd22299614'],
    shoes: ['photo-1595341888016-a392ef81b7de', 'photo-1560769629-975ec94e6a86', 'photo-1597045566677-8cf032ed6634'],
    accessories: ['photo-1590874103328-eac38a683ce7', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1523170335258-f5ed11844a49'],
  };

  const colorOptions = {
    tops: { name: 'Color', values: ['Black', 'White', 'Navy', 'Grey'] },
    bottoms: { name: 'Color', values: ['Black', 'Khaki', 'Navy', 'Charcoal'] },
    outerwear: { name: 'Color', values: ['Black', 'Camel', 'Olive'] },
    shoes: { name: 'Color', values: ['Black', 'White', 'Brown'] },
    accessories: { name: 'Color', values: ['Black', 'Tan', 'Brown'] },
  };

  const cldUrl = (id) => `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/w_800,q_80,f_auto/https://images.unsplash.com/${id}?w=800`;

  // Create products
  const products = productTemplates.map((p, i) => {
    const extras = extraImages[p.cat];
    const options = [];
    if (p.cat === 'tops' || p.cat === 'bottoms') options.push({ name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] });
    else if (p.cat === 'shoes') options.push({ name: 'Size', values: ['7', '8', '9', '10', '11', '12'] });
    options.push(colorOptions[p.cat]);

    return {
      name: p.name,
      price: p.price,
      description: p.desc,
      images: [cldUrl(p.img), cldUrl(extras[i % 3]), cldUrl(extras[(i + 1) % 3]), cldUrl(extras[(i + 2) % 3])],
      category: catMap[p.cat],
      stock: Math.floor(Math.random() * 50) + 10,
      isBestSeller: i % 5 === 0,
      isNew: i % 4 === 0,
      options,
    };
  });

  const createdProducts = await Product.insertMany(products);
  console.log(`Created ${createdProducts.length} products`);

  // Create variants for each product
  const variantDocs = [];
  for (const prod of createdProducts) {
    const opts = prod.options || [];
    if (opts.length === 0) {
      // No options → single default variant
      variantDocs.push({
        product: prod._id,
        sku: `DEFAULT-${prod._id.toString().slice(-6).toUpperCase()}`,
        price: prod.price,
        stock: prod.stock,
        options: new Map(),
        isActive: true
      });
      continue;
    }
    // Generate all option combinations
    const combos = generateCombinations(opts);
    let totalStock = 0;
    for (const combo of combos) {
      const prodIdx = prod._id.toString().slice(-4).toUpperCase();
      const skuParts = [prod.name.split(' ')[0].toUpperCase().slice(0, 4) + prodIdx];
      for (const val of Object.values(combo)) {
        skuParts.push(val.toUpperCase().slice(0, 3));
      }
      const stock = Math.floor(Math.random() * 30) + 5;
      totalStock += stock;
      // Variant price: base price + size surcharge
      let price = prod.price;
      if (combo.Size === 'XL') price = Math.round(prod.price * 1.1);
      else if (combo.Size === '12' || combo.Size === '11') price = Math.round(prod.price * 1.05);

      variantDocs.push({
        product: prod._id,
        sku: skuParts.join('-'),
        price,
        stock,
        options: new Map(Object.entries(combo)),
        isActive: true
      });
    }
    // Update product stock to total of all variants
    await Product.findByIdAndUpdate(prod._id, { stock: totalStock });
  }
  await Variant.insertMany(variantDocs);
  console.log(`Created ${variantDocs.length} variants`);

  // Create banners
  await Banner.insertMany(banners);
  console.log(`Created ${banners.length} banners`);

  // Create FAQs
  await FAQ.insertMany(faqs);
  console.log(`Created ${faqs.length} FAQs`);

  console.log('\nSeed completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
