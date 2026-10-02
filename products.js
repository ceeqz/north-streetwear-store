/*
  PRODUCT DATA — edit this file to change the catalog.

  ───────────── PRODUCT PHOTOGRAPHY ─────────────
  Every product has a gallery of three images:
    images.front   clean product shot   → default catalog image
    images.model   on-body photo        → shown when hovering a catalog card
    images.detail  fabric / stitching / zip / pocket close-up   (null = slot hidden)

  The photos below are free stock photos from Unsplash (unsplash.com/license), picked as the closest
  match for each item; they are stand-ins, not NORTH's own product shots.

  TO USE YOUR OWN PHOTOS (3:4 portrait, e.g. 1200×1600, JPG/WEBP):
    1. put them in  public/images/products/<slug>/front.jpg, model.jpg, detail.jpg
    2. add the slug to LOCAL_PHOTOS below, e.g.  const LOCAL_PHOTOS = ['heavy-tee-black'];
  Slugs: heavy-tee-black, heavy-tee-stone, boxy-hoodie-grey, core-hoodie-black, utility-pants-black,
         relaxed-pants-stone, shell-jacket-stone, technical-jacket-black, oversized-tee-grey,
         zip-hoodie-washed, light-shell-grey

  Optional per product, only when the data is real — shown as a caption on the MODEL photo:
    model: { height: '182 cm', size: 'M' }

  soldOut: sizes that are not available.
  isNew / isBestseller: drive the NEW and BESTSELLERS filters.
  released: ISO date, used by "Newest" sorting.
*/
const TOPS = ['S', 'M', 'L', 'XL'];
const WAIST = ['28', '30', '32', '34', '36'];

/* ---- image sources: the ONLY place they are defined ---- */
const IMAGE_ROOT = 'public/images/products';   // site-root URL form: '/images/products'
const IMAGE_EXT = 'jpg';
const IMAGE_SLOTS = [{key: 'front', label: 'Front'}, {key: 'model', label: 'Model'}, {key: 'detail', label: 'Detail'}];
const LOCAL_PHOTOS = [];                        // slugs that use your own files from IMAGE_ROOT

const unsplash = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1600&q=80`;
const PHOTOS = {   // slug: [front, model, detail] — Unsplash photo ids. null = no image (slot hidden).
  // Only photos from ONE shoot (same garment) are combined; otherwise a product gets a single photo.
  'heavy-tee-black':        ['1657364891013-8324e4db9dc9', null, '1657364890921-dbd85cf0398b'],
  'heavy-tee-stone':        ['1666358059751-3accf39c2d95', '1666358085449-a10a39f33942', '1666358070746-881bce1ccb3f'],
  'boxy-hoodie-grey':       ['1576775068951-d4983d253497', null, null],
  'core-hoodie-black':      ['1673092147872-5ddb03194341', null, null],
  'utility-pants-black':    ['1565358601269-0e3a269c8de7', null, null],
  'relaxed-pants-stone':    ['1711443813147-def27861b9af', null, null],
  'shell-jacket-stone':     ['1645819133607-cd84092bee6f', null, null],
  'technical-jacket-black': ['1700026707154-8166008042f7', null, null],
  'oversized-tee-grey':     ['1780566759999-4dbaa4218959', '1780566759972-08eecc32ef3c', null],
  'zip-hoodie-washed':      ['1647771746277-eac927afab2c', '1647771746351-7235cf9df865', null],
  'light-shell-grey':       ['1719237414039-577cf52a55a5', null, null]
};
const slugOf = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const photoSet = slug => Object.fromEntries(IMAGE_SLOTS.map((s, i) => {
  const id = (PHOTOS[slug] || [])[i];
  const src = LOCAL_PHOTOS.includes(slug) ? `${IMAGE_ROOT}/${slug}/${s.key}.${IMAGE_EXT}` : id ? unsplash(id) : null;
  return [s.key, src];
}));
/* Size guides, separated by product type. Values are GARMENT measurements in cm (the "cm" is added when displayed). */
const SIZE_GUIDES = {
  tops:    {title: 'T-shirts & Hoodies', unit: 'cm', cols: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [['S', '108', '68', '52'], ['M', '112', '70', '54'], ['L', '116', '72', '56'], ['XL', '120', '74', '58']],
            notes: ['Chest — garment width at the armpits, doubled.', 'Length — highest point of the shoulder to the hem.', 'Shoulder — seam to seam across the back.']},
  jackets: {title: 'Jackets', unit: 'cm', cols: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [['S', '112', '70', '53'], ['M', '116', '72', '55'], ['L', '120', '74', '57'], ['XL', '124', '76', '59']],
            notes: ['Cut for layering: allow extra room over a hoodie.']},
  pants:   {title: 'Pants', unit: 'cm', cols: ['Size', 'Waist', 'Inseam'], rows: [['28', '74', '78'], ['30', '79', '79'], ['32', '84', '80'], ['34', '89', '81'], ['36', '94', '82']],
            notes: ['Size — waist size in inches.', 'Waist — garment waistband, laid flat and doubled.', 'Inseam — crotch seam to the hem.']}
};
const SHIPPING_INFO = 'Free standard shipping on orders over €150, otherwise €8. Delivery in 2–4 working days. Free returns within 30 days of delivery.';

const PRODUCTS = [
  {id:1,  name:'Heavy Tee / Black',        price:45,  category:'T-shirts', color:'Black',  sizes:TOPS,  soldOut:[],               isNew:false, isBestseller:true,  released:'2026-02-10',
   description:'Our core tee. Heavyweight cotton jersey with a boxy cut and a clean, ribbed neck. No graphics, no logos.',
   details:['Boxy fit, dropped shoulder','Ribbed crew neck','Pre-washed to limit shrinkage','Machine wash at 30°C'],
   materials:'100% cotton jersey, 240 gsm.'},
  {id:2,  name:'Heavy Tee / Stone',        price:45,  category:'T-shirts', color:'Stone',  sizes:TOPS,  soldOut:[],               isNew:false, isBestseller:false, released:'2026-02-10',
   description:'The Heavy Tee in a warm stone tone. The same weight and cut, softer on the eye.',
   details:['Boxy fit, dropped shoulder','Garment-dyed in stone','Ribbed crew neck','Machine wash at 30°C'],
   materials:'100% cotton jersey, 240 gsm. Garment-dyed.'},
  {id:3,  name:'Boxy Hoodie / Grey',       price:89,  category:'Hoodies',  color:'Grey',   sizes:TOPS,  soldOut:[],               isNew:false, isBestseller:true,  released:'2026-01-20',
   description:'A relaxed, boxy hoodie in brushed grey fleece. Dropped shoulders and a deep hood.',
   details:['Boxy fit, dropped shoulder','Double-layer hood, flat drawcord','Kangaroo pocket','Machine wash at 30°C'],
   materials:'100% brushed cotton fleece, 380 gsm.'},
  {id:4,  name:'Core Hoodie / Black',      price:95,  category:'Hoodies',  color:'Black',  sizes:TOPS,  soldOut:['S','XL'],       isNew:false, isBestseller:false, released:'2026-01-20',
   description:'The everyday pullover. Dense loopback cotton, clean lines and nothing extra.',
   details:['Regular fit','Tonal drawcord and eyelets','Kangaroo pocket','Machine wash at 30°C'],
   materials:'100% loopback cotton, 400 gsm.'},
  {id:5,  name:'Utility Pants / Black',    price:110, category:'Pants',    color:'Black',  sizes:WAIST, soldOut:[],               isNew:false, isBestseller:true,  released:'2026-02-24',
   description:'Straight-leg utility pants in a durable cotton twill. Practical pockets, quiet look.',
   details:['Straight leg, mid rise','Zip fly with button closure','Two hip pockets, one back pocket','Machine wash at 30°C'],
   materials:'100% cotton twill, 320 gsm.'},
  {id:6,  name:'Relaxed Pants / Stone',    price:105, category:'Pants',    color:'Stone',  sizes:WAIST, soldOut:['28','36'],      isNew:false, isBestseller:false, released:'2026-03-02',
   description:'Relaxed trousers with a soft drape and a wide leg. Smart enough for anything.',
   details:['Relaxed fit, wide leg','Single pleat at the front','Elasticated back waist','Machine wash at 30°C'],
   materials:'78% cotton, 22% lyocell blend.'},
  {id:7,  name:'Shell Jacket / Stone',     price:145, category:'Jackets',  color:'Stone',  sizes:TOPS,  soldOut:[],               isNew:false, isBestseller:true,  released:'2026-03-10',
   description:'A lightweight water-resistant shell with a concealed zip and a quiet silhouette.',
   details:['Concealed centre zip','Stand collar','Two zipped hand pockets','Wipe or machine wash at 30°C'],
   materials:'100% nylon, water-resistant finish.'},
  {id:8,  name:'Technical Jacket / Black', price:165, category:'Jackets',  color:'Black',  sizes:TOPS,  soldOut:['S'],            isNew:true,  isBestseller:false, released:'2026-04-18',
   description:'Our most technical piece. Taped seams, a matte finish and a structured collar.',
   details:['Taped seams','Adjustable hem and cuffs','Chest zip pocket','Wipe clean'],
   materials:'3-layer waterproof nylon shell.'},
  {id:9,  name:'Oversized Tee / Grey',     price:49,  category:'T-shirts', color:'Grey',   sizes:TOPS,  soldOut:[],               isNew:false, isBestseller:false, released:'2026-03-25',
   description:'An oversized tee in washed grey cotton, with a longer body and a relaxed shoulder.',
   details:['Oversized fit','Extended body length','Ribbed crew neck','Machine wash at 30°C'],
   materials:'100% washed cotton jersey, 220 gsm.'},
  {id:10, name:'Zip Hoodie / Washed',      price:99,  category:'Hoodies',  color:'Washed', sizes:TOPS,  soldOut:[],               isNew:true,  isBestseller:false, released:'2026-04-02',
   description:'A full-zip hoodie with a garment-washed finish that gets better with every wear.',
   details:['Regular fit','Full-length matte zip','Side seam pockets','Machine wash at 30°C'],
   materials:'100% garment-washed cotton fleece, 380 gsm.'},
  {id:12, name:'Light Shell / Grey',       price:135, category:'Jackets',  color:'Grey',   sizes:TOPS,  soldOut:[],               isNew:true,  isBestseller:false, released:'2026-04-25',
   description:'A packable light shell for changing weather. Minimal branding, maximum movement.',
   details:['Regular fit','Packs into its own pocket','Elastic cuffs','Wipe or machine wash at 30°C'],
   materials:'100% ultralight ripstop nylon.'}
].map(p => {
  const slug = slugOf(p.name);
  return {
    ...p,
    slug,
    images: p.images || photoSet(slug),              // { front, model, detail }
    placeholders: {},
    guide: p.category === 'Pants' ? 'pants' : p.category === 'Jackets' ? 'jackets' : 'tops'
  };
});