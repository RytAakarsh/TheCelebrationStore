-- storage policies
create policy "shop images admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "shop images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "shop images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "shop images read" on storage.objects for select to authenticated, anon
  using (bucket_id = 'product-images');

-- categories
insert into public.categories (name, slug, description, image_url, icon, accent, display_order) values
('Birthday & Party','birthday-party','Balloons, candles, caps, lights and everything for a perfect birthday.','/__l5e/assets-v1/0ad26f8c-f059-44ef-b01c-73578e77bdea/seed-balloons.jpg','🎈','pink',1),
('German Silver','german-silver','Premium German silver gifting plates, bowls, cups and pooja items.','/__l5e/assets-v1/af2eee23-9113-4e05-9459-22e9962890a7/seed-german-silver.jpg','💍','gold',2),
('Return Gifts','return-gifts','Beautiful return gifts your guests will remember.','/__l5e/assets-v1/c715d4fb-89bc-4452-88e7-05594f98aab0/seed-return-gifts.jpg','🎁','purple',3),
('Bags','bags','Jute, potli, paper, laminated and non-woven bags.','/__l5e/assets-v1/251fec3b-22b1-4353-97aa-8705f1881575/seed-bags.jpg','🛍️','blue',4),
('Backdrop & Fabrics','backdrop-fabrics','Backdrop cloth, satin, velvet, fur and canopy fabrics.','/__l5e/assets-v1/1b938d34-7b03-4062-9a88-2c51af04511f/seed-fabrics.jpg','✨','orange',5),
('Wedding & Marriage','wedding-marriage','Marriage essentials, mala, kapoor, kumkum and traditional accessories.','/__l5e/assets-v1/76a4f8e0-66fa-4ab6-951c-bef732e30299/seed-wedding.jpg','💐','gold',6);

insert into public.subcategories (category_id, name, slug, display_order)
select c.id, s.name, s.slug, s.ord from public.categories c
join (values
 ('birthday-party','Balloons','balloons',1),('birthday-party','Candles','candles',2),
 ('birthday-party','Birthday Sets','birthday-sets',3),('birthday-party','Cake Accessories','cake-accessories',4),
 ('birthday-party','Lights','lights',5),('birthday-party','Party Props','party-props',6),
 ('birthday-party','Balloon Decoration','balloon-decoration',7),
 ('german-silver','Gift Sets','gift-sets',1),('german-silver','Plates','plates',2),
 ('german-silver','Bowls','bowls',3),('german-silver','Cups','cups',4),('german-silver','Kumkum Stands','kumkum-stands',5),
 ('return-gifts','Pichwai','pichwai',1),('return-gifts','Copper','copper',2),('return-gifts','White Finish','white-finish',3),
 ('return-gifts','Jars','jars',4),('return-gifts','Kumkum Items','kumkum-items',5),('return-gifts','Urli','urli',6),
 ('return-gifts','Gift Sets','gift-sets',7),
 ('bags','Jute','jute',1),('bags','Potli','potli',2),('bags','Paper','paper',3),
 ('bags','Laminated','laminated',4),('bags','Non-Woven','non-woven',5),('bags','Bottle Bags','bottle-bags',6),
 ('backdrop-fabrics','Backdrop Cloth','backdrop-cloth',1),('backdrop-fabrics','Satin','satin',2),
 ('backdrop-fabrics','Velvet','velvet',3),('backdrop-fabrics','Fur','fur',4),('backdrop-fabrics','Canopy','canopy',5),
 ('wedding-marriage','Marriage Essentials','marriage-essentials',1),('wedding-marriage','Mala','mala',2),
 ('wedding-marriage','Kapoor','kapoor',3),('wedding-marriage','Kumkum','kumkum',4),
 ('wedding-marriage','Traditional Accessories','traditional-accessories',5),('wedding-marriage','Flower Jewellery','flower-jewellery',6)
) as s(cat,name,slug,ord) on s.cat = c.slug;

-- products (DEMO / SEED DATA - prices are samples only)
insert into public.products (name, slug, sku, category_id, subcategory_id, short_description, description, mrp, price, moq, stock, tags, is_featured, is_bestseller, is_new, is_trending)
select p.name, p.slug, p.sku, c.id,
  (select sc.id from public.subcategories sc where sc.category_id = c.id and sc.slug = p.sub limit 1),
  p.shortd,
  p.shortd || E'\n\nDemo sample product added so you can preview the store. Edit or replace it from the admin panel.',
  p.mrp, p.price, p.moq, p.stock, p.tags, p.feat, p.best, p.isnew, p.trend
from (values
 ('Metallic Balloon Pack (100 pcs)','metallic-balloon-pack-100','VPW-BAL-001','birthday-party','balloons','Shiny metallic latex balloons in assorted festive colours.',499,299,1,240,array['balloons','birthday','decoration'],true,true,false,true),
 ('Chrome Balloon Set (50 pcs)','chrome-balloon-set-50','VPW-BAL-002','birthday-party','balloons','Premium chrome finish balloons for a luxe balloon arch.',699,449,1,120,array['balloons','chrome'],false,true,true,false),
 ('Number Foil Balloon 32 inch','number-foil-balloon-32','VPW-BAL-003','birthday-party','balloons','Large number foil balloon, available in gold, pink and silver.',249,149,1,300,array['foil','number','balloons'],true,false,false,true),
 ('Happy Birthday Decoration Kit','happy-birthday-decoration-kit','VPW-SET-001','birthday-party','birthday-sets','Complete birthday kit with banner, balloons, tape and pump.',999,649,1,80,array['birthday','kit'],true,true,false,false),
 ('Sparkle Candles (Pack of 10)','sparkle-candles-10','VPW-CAN-001','birthday-party','candles','Glitter sparkle candles that add magic to the cake moment.',199,129,5,400,array['candles','cake'],false,false,true,false),
 ('Spiral Candles (Pack of 12)','spiral-candles-12','VPW-CAN-002','birthday-party','candles','Colourful spiral candles for cakes and table decor.',179,119,5,350,array['candles'],false,false,false,false),
 ('Number Candle Gold','number-candle-gold','VPW-CAN-003','birthday-party','candles','Elegant gold number candle for milestone birthdays.',99,59,10,500,array['candles','number'],false,true,false,false),
 ('Cold Fire Sparkler Sticks','cold-fire-sparkler-sticks','VPW-PRP-001','birthday-party','party-props','Smokeless celebration sparklers for cake cutting moments.',349,249,6,150,array['sparkler','celebration'],true,false,true,true),
 ('LED Fairy String Light 10m','led-fairy-string-light-10m','VPW-LGT-001','birthday-party','lights','Warm white LED string light for backdrops and decor.',399,229,1,200,array['lights','decor'],false,true,false,false),
 ('Balloon Arch Stand Kit','balloon-arch-stand-kit','VPW-DEC-001','birthday-party','balloon-decoration','Adjustable arch rod stand for balloon decoration setups.',1499,999,1,40,array['arch','decoration'],true,false,false,true),
 ('German Silver Magic Set (Medium)','german-silver-magic-set-medium','VPW-GS-001','german-silver','gift-sets','Ornate German silver magic gift set, ideal for weddings.',1899,1399,1,45,array['german silver','gifting'],true,true,false,false),
 ('German Silver Imported Plate 6"','german-silver-imported-plate-6','VPW-GS-002','german-silver','plates','Finely engraved imported German silver plate.',799,549,2,90,array['german silver','plate'],false,false,true,false),
 ('German Silver Bowl & Spoon Set','german-silver-bowl-spoon-set','VPW-GS-003','german-silver','bowls','Classic bowl and spoon gift set in German silver finish.',699,479,2,110,array['german silver','bowl'],false,true,false,true),
 ('Chandan Ginni Set','chandan-ginni-set','VPW-GS-004','german-silver','gift-sets','Traditional chandan ginni set for pooja and gifting.',549,399,2,70,array['pooja','gifting'],false,false,false,false),
 ('Kumkum Stand German Silver','kumkum-stand-german-silver','VPW-GS-005','german-silver','kumkum-stands','Elegant kumkum stand for festive occasions.',649,449,2,60,array['kumkum','pooja'],false,false,true,false),
 ('Pichwai Painted Pot 4 inch','pichwai-painted-pot-4','VPW-RG-001','return-gifts','pichwai','Hand-finished pichwai art pot, a lovely return gift.',299,199,10,500,array['return gift','pichwai'],true,true,false,true),
 ('Copper Finish Pot 5 inch','copper-finish-pot-5','VPW-RG-002','return-gifts','copper','Copper finish decorative pot with traditional motifs.',349,239,10,420,array['return gift','copper'],false,true,false,false),
 ('White Finish Pot 6 inch','white-finish-pot-6','VPW-RG-003','return-gifts','white-finish','Minimal white finish pot for modern gifting.',399,279,10,300,array['return gift'],false,false,true,false),
 ('Tea Coffee Sugar Jar Set','tea-coffee-sugar-jar-set','VPW-RG-004','return-gifts','jars','Three-piece jar set, a practical and premium return gift.',899,629,5,150,array['jars','return gift'],true,false,false,false),
 ('Decorative Brass Urli','decorative-brass-urli','VPW-RG-005','return-gifts','urli','Traditional urli for floating flowers and diyas.',1299,899,2,55,array['urli','decor'],false,true,false,true),
 ('Velvet Gift Box with 2 Bowls','velvet-gift-box-2-bowls','VPW-RG-006','return-gifts','gift-sets','Velvet presentation box with two bowls and spoons.',999,699,5,120,array['gift set'],false,false,true,false),
 ('Printed Jute Bag (Medium)','printed-jute-bag-medium','VPW-BAG-001','bags','jute','Sturdy printed jute bag for gifting and shopping.',149,89,20,900,array['jute','bag'],true,true,false,true),
 ('Window Jute Bag','window-jute-bag','VPW-BAG-002','bags','jute','Jute bag with transparent window panel.',179,109,20,700,array['jute','bag'],false,false,true,false),
 ('Silk Potli Bag (Pack of 10)','silk-potli-bag-10','VPW-BAG-003','bags','potli','Festive silk potli bags for wedding return gifts.',499,349,5,260,array['potli','wedding'],false,true,false,false),
 ('Laminated Carry Bag','laminated-carry-bag','VPW-BAG-004','bags','laminated','Glossy laminated carry bag, reusable and strong.',99,59,25,1200,array['bag'],false,false,false,false),
 ('Kraft Paper Bag','kraft-paper-bag','VPW-BAG-005','bags','paper','Eco-friendly kraft paper bag with handles.',79,45,25,1500,array['paper','eco'],false,false,true,false),
 ('Satin Backdrop Cloth 5x8 ft','satin-backdrop-cloth-5x8','VPW-FAB-001','backdrop-fabrics','backdrop-cloth','Smooth satin backdrop cloth for party photo walls.',1299,849,1,70,array['backdrop','satin'],true,true,false,true),
 ('Velvet Backdrop Cloth 8x8 ft','velvet-backdrop-cloth-8x8','VPW-FAB-002','backdrop-fabrics','velvet','Rich velvet backdrop for premium event setups.',2499,1749,1,35,array['backdrop','velvet'],false,true,false,false),
 ('Fur Cloth Roll','fur-cloth-roll','VPW-FAB-003','backdrop-fabrics','fur','Soft fur cloth for baby shower and birthday setups.',1499,999,1,40,array['fur'],false,false,true,false),
 ('Canopy Cloth Set','canopy-cloth-set','VPW-FAB-004','backdrop-fabrics','canopy','Draping canopy cloth set for ceiling decoration.',1899,1299,1,25,array['canopy'],false,false,false,true),
 ('Fresh Style Flower Mala Pair','flower-mala-pair','VPW-WED-001','wedding-marriage','mala','Artificial flower mala pair for wedding rituals.',899,599,1,90,array['mala','wedding'],true,true,false,false),
 ('Kapoor Mala Pack','kapoor-mala-pack','VPW-WED-002','wedding-marriage','kapoor','Camphor mala pack for traditional ceremonies.',249,169,5,300,array['kapoor','pooja'],false,false,true,false),
 ('Haldi Kumkum Brass Set','haldi-kumkum-brass-set','VPW-WED-003','wedding-marriage','kumkum','Brass haldi kumkum containers for auspicious occasions.',699,469,2,140,array['kumkum','brass'],false,true,false,true),
 ('Flower Jewellery Set','flower-jewellery-set','VPW-WED-004','wedding-marriage','flower-jewellery','Complete floral jewellery set for haldi and mehendi.',1499,999,1,60,array['flower jewellery','haldi'],true,false,true,false),
 ('Marriage Parat & Chambu Set','marriage-parat-chambu-set','VPW-WED-005','wedding-marriage','marriage-essentials','Traditional parat and chambu set for wedding rituals.',2199,1599,1,30,array['marriage','traditional'],false,false,false,false)
) as p(name,slug,sku,cat,sub,shortd,mrp,price,moq,stock,tags,feat,best,isnew,trend)
join public.categories c on c.slug = p.cat;

-- images per product (by category)
insert into public.product_images (product_id, url, alt, position, is_primary)
select p.id,
 case c.slug
  when 'birthday-party' then case when p.slug like '%candle%' then '/__l5e/assets-v1/bb6b6d27-fa43-4f62-a5a8-0687db7fcbe7/seed-candles.jpg' else '/__l5e/assets-v1/0ad26f8c-f059-44ef-b01c-73578e77bdea/seed-balloons.jpg' end
  when 'german-silver' then '/__l5e/assets-v1/af2eee23-9113-4e05-9459-22e9962890a7/seed-german-silver.jpg'
  when 'return-gifts' then '/__l5e/assets-v1/c715d4fb-89bc-4452-88e7-05594f98aab0/seed-return-gifts.jpg'
  when 'bags' then '/__l5e/assets-v1/251fec3b-22b1-4353-97aa-8705f1881575/seed-bags.jpg'
  when 'backdrop-fabrics' then '/__l5e/assets-v1/1b938d34-7b03-4062-9a88-2c51af04511f/seed-fabrics.jpg'
  else '/__l5e/assets-v1/76a4f8e0-66fa-4ab6-951c-bef732e30299/seed-wedding.jpg' end,
 p.name, 0, true
from public.products p join public.categories c on c.id = p.category_id;

insert into public.product_images (product_id, url, alt, position, is_primary)
select p.id, '/__l5e/assets-v1/79a77353-b3e9-46eb-aee1-10f0177f7a61/hero-1.jpg', p.name || ' - alternate view', 1, false
from public.products p;

-- variants for balloon + fabric products
insert into public.product_variants (product_id, name, color_name, color_hex, sku, price, mrp, stock, moq, position)
select p.id, v.name, v.name, v.hex, p.sku || '-' || upper(left(v.name,3)), p.price + v.delta, p.mrp, 60, p.moq, v.ord
from public.products p
join (values ('Pink','#FF2B7A',0,1),('Purple','#8B3DFF',0,2),('Blue','#2196F3',0,3),('Golden','#F5B62A',20,4),('Rainbow','#FF7A00',40,5)) as v(name,hex,delta,ord) on true
where p.slug in ('metallic-balloon-pack-100','chrome-balloon-set-50','number-foil-balloon-32','satin-backdrop-cloth-5x8','velvet-backdrop-cloth-8x8','silk-potli-bag-10');

insert into public.variant_images (variant_id, url, position)
select v.id, pi.url, 0 from public.product_variants v
join public.product_images pi on pi.product_id = v.product_id and pi.is_primary;

-- hero banners
insert into public.hero_banners (heading, subheading, cta_text, cta_link, desktop_image_url, mobile_image_url, display_order) values
('Make Every Moment Special','Everything you need for birthdays, weddings, gifting & unforgettable celebrations.','Shop Celebration Essentials','/shop','/__l5e/assets-v1/79a77353-b3e9-46eb-aee1-10f0177f7a61/hero-1.jpg','/__l5e/assets-v1/79a77353-b3e9-46eb-aee1-10f0177f7a61/hero-1.jpg',1),
('Beautiful Return Gifts','Make your guests remember the celebration long after it ends.','Explore Return Gifts','/category/return-gifts','/__l5e/assets-v1/c715d4fb-89bc-4452-88e7-05594f98aab0/seed-return-gifts.jpg','/__l5e/assets-v1/c715d4fb-89bc-4452-88e7-05594f98aab0/seed-return-gifts.jpg',2),
('Party Essentials from ₹45','Balloons, candles, lights and props for every celebration.','Shop Offers','/offers','/__l5e/assets-v1/0ad26f8c-f059-44ef-b01c-73578e77bdea/seed-balloons.jpg','/__l5e/assets-v1/0ad26f8c-f059-44ef-b01c-73578e77bdea/seed-balloons.jpg',3);

-- offer
insert into public.offers (name, discount_type, discount_value, starts_at, ends_at, display_order)
values ('Today''s Celebration Deals','percent',0, now() - interval '1 day', now() + interval '90 days', 1);
insert into public.offer_products (offer_id, product_id)
select (select id from public.offers limit 1), id from public.products where price < mrp order by (mrp - price) desc limit 10;

-- home sections
insert into public.home_sections (key, title, subtitle, source, category_id, display_order) values
('deals','Today''s Celebration Deals','Handpicked party savings','offer',null,1),
('bestsellers','Best Sellers','Loved by our customers','bestseller',null,2),
('birthday','Popular for Birthdays','Balloons, candles & decoration','category',(select id from public.categories where slug='birthday-party'),3),
('return-gifts','Beautiful Return Gifts','Thoughtful gifts for your guests','category',(select id from public.categories where slug='return-gifts'),4),
('wedding','Wedding & Marriage Essentials','Traditional favourites','category',(select id from public.categories where slug='wedding-marriage'),5),
('german-silver','German Silver Collection','Premium gifting','category',(select id from public.categories where slug='german-silver'),6),
('fabrics','Backdrop & Fabric Collection','Set the perfect scene','category',(select id from public.categories where slug='backdrop-fabrics'),7);