# Celebration Hub

I want you to build a COMPLETE, PRODUCTION-READY FULL-STACK ECOMMERCE WEBSITE + ADMIN PANEL for my brand:

BRAND NAME:
Vizag Party World

TAGLINE:
Make Every Moment Special

BUSINESS:
Vizag Party World is a party supplies, gifting, celebration and event-decoration ecommerce business based in Visakhapatnam, Andhra Pradesh.

ABOUT THE BRAND:
"Welcome to The Party World — your one-stop destination for making every celebration extra special! From beautiful balloons and party decorations to German silver return gifts and unique celebration essentials, we have everything you need to make your occasions memorable. Whether it’s a birthday, anniversary, baby shower, wedding, or any special event, we’re here to add more colour, joy, and happiness to your celebrations."

CONTACT:
Email: vizagpartyworld@gmail.com
Phone: 8019926065
WhatsApp: 8019926065

OFFICE ADDRESS:
Party World
Poorna Market
Visakhapatnam - 530001
Andhra Pradesh, India

==================================================
1. MOST IMPORTANT REQUIREMENT
==================================================

DO NOT BUILD A STATIC DEMO OR FRONTEND-ONLY WEBSITE.

I need a REAL ecommerce application with:

- Real database
- Real user authentication
- Google login/signup
- Real product database
- Real product image storage
- Real categories
- Real product variants
- Real cart
- Real wishlist
- Real checkout
- Real orders
- Real order status management
- Real admin panel
- Real offer/banner management
- Real inventory/product management
- Real customer management
- Proper authentication and authorization
- Mobile responsive design
- Secure database access
- Production-ready architecture

Every important piece of data must be persisted in the database.

If something requires configuration such as Google OAuth, payment gateway credentials, storage credentials, etc., build the complete implementation and clearly show me exactly which environment variables/configuration values I need to provide.

Do NOT replace backend functionality with localStorage or fake/mock data except for temporary seed/demo data.

==================================================
2. BRANDING & VISUAL DIRECTION
==================================================

I have attached the official Vizag Party World logo.

USE THE ATTACHED LOGO AS THE PRIMARY BRANDING REFERENCE.

The logo has:

- Extremely festive visual language
- Bright pink/magenta
- Purple
- Electric blue
- Orange
- Golden/yellow
- White
- Deep black/dark background
- Balloons
- Confetti
- Gift/celebration elements
- Large colorful typography
- Gold ornamental elements
- Premium party/event feeling

The website must visually belong to the SAME BRAND.

However:

DO NOT make the website look childish, cheap, overly cartoonish, or visually chaotic.

The target should be:

"Premium Indian celebration ecommerce + colorful party store"

Think:

- Premium ecommerce
- Festive
- Colorful
- Modern
- Trustworthy
- High-conversion
- Mobile-first
- Visually exciting
- Easy to shop

The logo should be prominent but not oversized.

COLOR SYSTEM:

Primary background:
#050505 / near-black

Secondary dark:
#111111

Gold:
#F5B62A

Pink:
#FF2B7A

Purple:
#8B3DFF

Blue:
#2196F3 / electric blue

Orange:
#FF7A00

White:
#FFFFFF

Light background:
#FFF9F4

Use these colors intelligently.

Do NOT use all colors everywhere.

Use a mostly clean ecommerce interface with colorful festive accents.

Gold should communicate:
- premium
- wedding
- gifting
- celebration

Pink/purple/blue/orange should be used for:
- offers
- category accents
- badges
- festive decorative details
- CTAs where appropriate

==================================================
3. DESIGN PRINCIPLE
==================================================

The website should feel like a combination of:

- Modern ecommerce marketplace
- Premium party store
- Celebration/gifting boutique

Functionality can be inspired by the best ecommerce experiences such as Amazon/Flipkart, but DO NOT copy their branding, exact layouts, or UI.

Create an ORIGINAL Vizag Party World design system.

The website should prioritize:

1. Mobile shopping experience
2. Product discovery
3. Fast checkout
4. Strong product imagery
5. Easy category navigation
6. Offers
7. Trust
8. Easy repeat purchasing

==================================================
4. TECH STACK
==================================================

Use a modern production-ready stack.

Preferred:

Frontend:
- React
- TypeScript
- Tailwind CSS
- Modern component architecture

Backend:
- Supabase

Use Supabase for:

- PostgreSQL database
- Authentication
- Google OAuth
- Storage
- Row Level Security
- Database functions where appropriate

Authentication:
- Supabase Auth
- Google OAuth
- Email/password fallback may also be supported

Images:
- Supabase Storage
- Optimized image handling
- Product image compression/optimization where possible

Payments:
Design the architecture so Razorpay can be integrated for Indian payments.

Support:
- UPI
- Cards
- Net banking
- Wallets
- Cash on Delivery if enabled by admin

Do not hard-code secret credentials.

Use environment variables.

==================================================
5. USER AUTHENTICATION
==================================================

Create a proper authentication system.

PRIMARY LOGIN OPTION:

"Continue with Google"

Google login should:

- Open Google OAuth
- Authenticate the customer
- Create account automatically if first-time user
- Login automatically for existing users
- Store customer information in database

Store:

- User ID
- Full name
- Email
- Profile image
- Phone number if provided
- Created date
- Last login
- Account status

Also provide:

- Logout
- Login
- Signup
- Forgot password if email/password is enabled
- Account settings

Users should NOT need to manually create a complicated account if they use Google.

==================================================
6. WEBSITE STRUCTURE
==================================================

Create these primary pages:

PUBLIC WEBSITE:

1. Home
2. Shop All
3. Categories
4. Category Product Listing
5. Product Details
6. Search Results
7. Offers
8. Wishlist
9. Cart
10. Checkout
11. Order Success
12. My Orders
13. Order Details
14. My Account
15. About Us
16. Contact Us
17. FAQ
18. Privacy Policy
19. Terms & Conditions
20. Shipping Policy
21. Cancellation/Refund Policy

ADMIN:

/admin

Admin dashboard and complete management system.

==================================================
7. HEADER / NAVIGATION
==================================================

Desktop header:

Top small strip:

"Celebrate Better. Shop Party World."

Then main header:

LEFT:
Vizag Party World logo

CENTER:
Large search bar:

"Search balloons, return gifts, wedding decor..."

RIGHT:
- Account
- Wishlist
- Cart

Below that:

Home
Shop
Categories
Offers
Birthday
Wedding
Return Gifts
Decor
Contact

On mobile:

Use a compact premium header.

Top:

[Menu] [Logo] [Search] [Cart]

Search should be highly accessible.

Also create a MOBILE BOTTOM NAVIGATION:

Home
Categories
Search
Wishlist
Account

This is extremely important because most users will use mobile.

==================================================
8. SIDE MENU
==================================================

Create a beautiful slide-out mobile side menu.

When user taps hamburger icon:

Open full-height drawer.

Top:

Vizag Party World logo

Then:

Home
Shop All
Categories
Offers
Birthday
Wedding
Return Gifts
Party Decorations
Wedding Essentials
Bags
Backdrop & Fabrics
Marriage Items

Then:

My Account
My Orders
Wishlist
Cart

Then:

Contact Us
WhatsApp Us
Call Us

Then social media placeholders which can be configured later from admin/settings.

The side menu should have subtle festive decorative elements but remain clean.

==================================================
9. HERO SECTION
==================================================

Home page hero should be premium and dynamic.

Do NOT use a single static hero.

Create a carousel/banner system.

Admin must be able to create/edit/delete/reorder hero banners.

Each banner should support:

- Desktop image
- Mobile image
- Heading
- Subheading
- CTA text
- CTA destination
- Product/category link
- Active/inactive
- Start date
- End date
- Display order

Examples:

"Make Every Celebration Special"
"Everything you need for birthdays, weddings & unforgettable moments."

CTA:
"Shop Now"

Another:

"Beautiful Return Gifts"
"Make your guests remember the celebration."

CTA:
"Explore Return Gifts"

Another:

"Party Essentials Starting at ₹99"

CTA:
"Shop Offers"

Carousel behavior should be similar in usability to major ecommerce websites:

- Auto-rotate
- Pause on hover
- Swipe on mobile
- Dots/indicators
- Previous/next controls
- Smooth transitions

Do not make transitions excessive.

==================================================
10. OFFER SECTION
==================================================

Create a highly visible OFFER system.

Home page should have:

"Today's Celebration Deals"

or

"Party Time Offers"

Admin can select products to appear in offers.

Offer card should show:

- Product image
- Product name
- Original price
- Offer price
- Discount percentage
- Optional "Only X left"
- Add to cart
- Quick view

Create horizontal scrolling product carousel on mobile.

Desktop can show 4-6 products depending on screen size.

Offer section must be dynamically controlled from admin.

==================================================
11. CATEGORY SECTION
==================================================

Create a visually beautiful category section.

Use colorful but premium category cards.

Categories should be based on the handwritten product list I provided.

IMPORTANT:

Some handwritten product names are difficult to read.

Do not invent completely unrelated products.

Use the readable product/category names from my reference images and structure them cleanly.

Initial category structure should include:

CATEGORY 1:
BIRTHDAY & PARTY ESSENTIALS

Products/items include:

- Balloons
- Rings
- Paper
- Cake Spray
- Caps
- Birthday Sets
- Cutting Ribbon
- Candles
- Sparkle Candles
- Spiral Candles
- Flower Candles
- Magic Candles
- Number Candles
- Whistlers
- Cones
- Curtains
- Square Curtains
- Straight Curtains
- Birthday Cloth
- 5x8 Birthday Cloth
- 8x8 Birthday Cloth
- Balloon Stand
- Balloon Spray
- Foil Balloons / Foil Items
- Number Foils
- Cloth Tape
- Purple Tape
- Grip Tape
- Arch Rod
- Cake Light
- LED Light
- LED Candle
- Wire/Coat-related decoration item as applicable
- Neon Board
- LED Letters / Numbers
- Cold Fire / Sparkler-type celebration item
- Fire Gun
- Cake Stand
- Gift Wheel
- T-Light Candle
- Baby-related celebration items

For ambiguous handwritten product names, create editable product/category entries so I can rename them from the admin panel.

--------------------------------------------------

CATEGORY 2:
GERMAN SILVER

Products:

- Magic Set – different sizes
- Imported Plates
- Bowl & Spoon
- Chandan Ginni
- Cups
- Riya
- Kumkum Stand
- Chambar / Chamber
- Other German Silver items

--------------------------------------------------

CATEGORY 3:
RETURN GIFTS

Products include:

- Pichwai 4"
- Copper 4"
- White 4"
- Pichwai 5"
- Copper 5"
- Pichwai 6"
- Copper 6"
- White 6"
- Nandi 7"
- Velvet Box
- 2 Bowl / 2 Spoon gift sets
- Cow-related gift items
- Lemon Jar
- Chota Jar
- Tea Coffee Sugar Jar
- Push/Window Jar
- Onion Jar
- Ganesh Steel Daliya
- Urli
- Silver return-gift items
- Potli Box
- Paspu Kumkum / Haldi Kumkum items

--------------------------------------------------

CATEGORY 4:
BAGS

Products:

- Jute Bags
- Window Jute Bags
- Coach Jute Bags
- Pichwai Jute Bags
- Potli Bags
- Laminated Bags
- All Grey Laminated Bags
- Paper Bags
- Non-Woven Bags
- Bottle Bags

--------------------------------------------------

CATEGORY 5:
BACKDROP & FABRICS

Products:

- Backdrop Cloth 3x4
- Backdrop Cloth 5x8
- Backdrop Cloth 8x8
- Satin Cloth
- Chips Cloth
- Fur Cloth
- Velvet Cloth
- Canopy / Canape Cloth

--------------------------------------------------

CATEGORY 8:
MARRIAGE / WEDDING ESSENTIALS

Products:

- Marriage Items
- Mala
- Baskalu / related marriage item
- Tera
- Kapooram Stick
- Kapoor Mala
- Coconut / Local Coconut Items
- Traditional marriage accessories
- Posalu
- Props
- Dolls
- Paspu Kumkum
- Bindi
- Parat
- Chambu
- Jhaldi
- Flower Jewelry
- Water Gun
- Water Balloons
- Pichkari / related Holi celebration products
- Color Smoke
- Other seasonal celebration products

Again, if any handwritten name is unclear, do NOT make an irreversible assumption. Make it editable through admin.

==================================================
12. CATEGORY UX
==================================================

On homepage:

"Shop by Category"

Use visual cards.

Example:

🎈 Birthday & Party
💍 German Silver
🎁 Return Gifts
🛍️ Bags
✨ Backdrop & Fabrics
💐 Wedding & Marriage
🎉 Celebration Essentials
🔥 Offers

Every category card must link to its category page.

Category page should have:

- Category banner
- Category description
- Subcategory chips
- Sort
- Filter
- Product count
- Product grid

==================================================
13. SHOP / PRODUCT LISTING PAGE
==================================================

Create a professional ecommerce PLP.

Desktop:

Sidebar filters + product grid.

Mobile:

Filter button + Sort button.

Filters:

- Category
- Subcategory
- Price
- Color
- Availability
- Discount
- Rating if reviews are enabled
- Product type

Sorting:

- Relevance
- Newest
- Price low to high
- Price high to low
- Discount
- Best selling

Product cards:

- Product image
- Hover second image on desktop
- Product name
- Rating/reviews if available
- Original price
- Sale price
- Discount
- Color/variant indicator
- Minimum order quantity
- Add to cart
- Wishlist
- Quick view

==================================================
14. PRODUCT DETAILS PAGE
==================================================

This is extremely important.

When user clicks any product, open a dedicated product page.

Desktop layout:

LEFT:
Large image gallery

- Main image
- Up to 5 product images
- Thumbnail navigation
- Zoom
- Full-screen image view

RIGHT:

Product name

Rating

Product availability

Price

MRP

Discount

Minimum order quantity

Color/variant selection

Quantity selector

ADD TO CART

BUY NOW

WHATSAPP ENQUIRY

Below:

Product description

Specifications

What's Included

Available Colors

Minimum Order

Shipping information

Return policy

FAQ

Then:

"Available in Other Colours"

Display the same product variants as cards.

Example:

Red
Blue
Pink
Golden
Purple

When the user selects a different color:

- Update product image
- Update variant
- Update SKU if applicable
- Update price if different
- Update stock
- Update availability

This should work like a professional ecommerce product variant system.

==================================================
15. PRODUCT VARIANT SYSTEM
==================================================

Admin must be able to create variants.

Example:

Product:
Birthday Balloon Set

Variants:

Pink
Blue
Golden
Purple
Rainbow

Each variant can have:

- Variant name
- Color
- Color hex code
- SKU
- Price
- MRP
- Stock
- Minimum order quantity
- Up to 5 images
- Variant-specific description
- Active/inactive

Selecting a variant on product page changes the relevant images and information.

==================================================
16. CART
==================================================

Create a REAL persistent cart.

Cart should show:

- Product image
- Product name
- Variant
- Price
- Quantity
- Minimum order quantity
- Remove
- Move to wishlist
- Subtotal

If product has minimum order quantity:

Example:

MOQ = 10

User cannot order 1.

Show:

"Minimum order quantity is 10 pieces."

Quantity controls should respect MOQ.

Cart summary:

Subtotal
Discount
Shipping
Tax if applicable
Grand Total

CTA:

Proceed to Checkout

Continue Shopping

==================================================
17. CHECKOUT
==================================================

Create a proper multi-step checkout.

STEP 1:
Login / Continue with Google

STEP 2:
Delivery Address

Fields:

Full Name
Phone
House/Flat
Street
Area
Landmark
City
State
PIN Code

Allow multiple saved addresses.

STEP 3:
Order Summary

STEP 4:
Payment

Support architecture for:

- Razorpay
- UPI
- Card
- Net banking
- Wallet
- Cash on Delivery if enabled

STEP 5:
Place Order

After successful order:

Create REAL order in database.

Generate:

- Order ID
- Customer details
- Products
- Variants
- Quantity
- Price
- Discount
- Shipping
- Total
- Payment status
- Order status
- Delivery address
- Timestamp

==================================================
18. ORDER STATUS
==================================================

Admin should be able to update:

Pending
Confirmed
Processing
Packed
Shipped
Out for Delivery
Delivered
Cancelled
Refunded

Customer should see visual order tracking.

Example:

Order Placed ✓
Confirmed ✓
Packed ✓
Shipped
Out for Delivery
Delivered

==================================================
19. WHATSAPP INTEGRATION
==================================================

Since this is a local Indian business, WhatsApp should be prominent.

Use:

8019926065

Add:

"Chat on WhatsApp"

buttons on:

- Header/mobile menu
- Product page
- Contact page
- Checkout where appropriate
- Footer

Product WhatsApp button should dynamically create a message such as:

"Hello Vizag Party World, I am interested in [PRODUCT NAME]. Please share availability and details."

Do not expose unnecessary customer information in URLs.

==================================================
20. SEARCH
==================================================

Create real product search.

Search should work against:

- Product name
- Description
- SKU
- Category
- Subcategory
- Tags
- Variant names

Search UI:

Desktop:
Large search box

Mobile:
Dedicated search page

Include:

Recent searches
Popular searches
Search suggestions
"No products found" state

==================================================
21. WISHLIST
==================================================

Users can save products.

Wishlist should be persisted to database for logged-in users.

Wishlist page:

Product image
Name
Price
Availability
Add to cart
Remove

==================================================
22. PRODUCT REVIEWS
==================================================

Build architecture for reviews.

Customers can review only products they purchased.

Review:

- Star rating
- Text
- Optional image
- Date

Admin can:

- Approve
- Hide
- Delete reviews

Show average rating on product cards/product page.

==================================================
23. ADMIN PANEL
==================================================

THIS IS ONE OF THE MOST IMPORTANT PARTS.

Create a professional admin dashboard.

URL:

/admin

Only authorized admin users can access it.

Use proper role-based access control.

Roles:

- Customer
- Admin

Do NOT rely only on hiding UI.

Use backend/database security and Row Level Security.

==================================================
24. ADMIN DASHBOARD
==================================================

Dashboard should show:

Total Products
Active Products
Out of Stock
Low Stock
Total Orders
Pending Orders
Processing Orders
Delivered Orders
Cancelled Orders
Total Customers
Today's Sales
This Week's Sales
This Month's Sales
Offer Products
Top Selling Products
Top Categories

Use clean charts.

Revenue chart:

Daily
Weekly
Monthly

Order chart:

Pending
Processing
Shipped
Delivered
Cancelled

==================================================
25. ADMIN PRODUCT MANAGEMENT
==================================================

Admin must have:

Products

- Add Product
- Edit Product
- Delete Product
- Duplicate Product
- Publish / Unpublish
- Archive

ADD PRODUCT FORM:

Basic Information:

Product Name
Slug
SKU
Category
Subcategory
Brand
Short Description
Full Description

Pricing:

MRP
Selling Price
Discount
Tax if applicable
Minimum Order Quantity

Inventory:

Stock
Low Stock Threshold
Track Inventory
Allow Backorders

Images:

Allow UP TO 5 main product images.

Upload:

Image 1
Image 2
Image 3
Image 4
Image 5

Admin should be able to:

- Drag and reorder images
- Delete image
- Set primary image

VARIANTS:

Add Variant

Variant Name
Color Name
Color Hex
SKU
Price
MRP
Stock
MOQ
Up to 5 variant images

Admin can add unlimited variants.

Example:

+ Add Color

Pink
Blue
Golden
Purple
Red

Each can have its own images.

==================================================
26. ADMIN CATEGORY MANAGEMENT
==================================================

Admin can:

- Create category
- Edit category
- Delete category
- Reorder category
- Upload category image
- Add category banner
- Add category description
- Activate/deactivate category
- Create subcategories

Do NOT hard-code categories permanently.

I want complete control.

==================================================
27. ADMIN OFFER MANAGEMENT
==================================================

Admin can create offers.

Fields:

Offer Name
Banner
Start Date
End Date
Discount Type
Discount Value
Selected Products
Selected Categories
Display Order
Active/Inactive

Admin can select:

- Individual products
- Entire category
- Multiple products

Offer should automatically stop showing after expiry.

==================================================
28. ADMIN HERO BANNER MANAGEMENT
==================================================

Admin dashboard section:

Hero Banners

Admin can:

- Upload desktop image
- Upload mobile image
- Add heading
- Add subheading
- CTA text
- CTA URL/product/category
- Start date
- End date
- Enable/disable
- Reorder

==================================================
29. ADMIN ORDER MANAGEMENT
==================================================

Create complete order management.

Admin can see:

Order ID
Customer
Phone
Email
Products
Variants
Quantity
Amount
Payment
Payment status
Order status
Date
Delivery address

Actions:

View Order
Update Status
Print Invoice
Cancel
Refund if supported
Contact Customer
WhatsApp Customer

Order detail should be professional and printable.

==================================================
30. ADMIN CUSTOMER MANAGEMENT
==================================================

Admin can view:

Customer name
Email
Phone
Total orders
Total spending
Last order
Registration date
Account status

Admin should NOT be able to view sensitive authentication credentials/passwords.

==================================================
31. ADMIN SETTINGS
==================================================

Create Settings section.

Business:

Brand name
Logo
Email
Phone
WhatsApp
Address

Shipping:

Shipping charges
Free shipping threshold
COD enabled/disabled
Delivery areas

Payments:

Razorpay configuration placeholders
COD settings

Website:

Homepage settings
Footer settings
Social links
SEO settings

==================================================
32. DATABASE DESIGN
==================================================

Create a proper normalized relational database.

Suggested tables:

profiles
user_roles
categories
subcategories
products
product_images
product_variants
variant_images
inventory
offers
offer_products
hero_banners
wishlists
wishlist_items
carts
cart_items
addresses
orders
order_items
payments
reviews
coupons
site_settings

Use UUID primary keys.

Include:

created_at
updated_at

where appropriate.

Relationships must be properly defined.

==================================================
33. SECURITY
==================================================

Security is extremely important.

Implement:

- Supabase Row Level Security
- Customer can only access own orders
- Customer can only edit own profile
- Customer can only access own cart
- Customer can only access own wishlist
- Admin-only product management
- Admin-only category management
- Admin-only order management
- Admin-only offer management
- Admin-only banner management
- Admin-only customer management

Never expose service role keys on frontend.

Never store passwords yourself.

Use Supabase Auth.

Validate all user inputs.

Protect admin routes.

==================================================
34. IMAGE STORAGE
==================================================

Create proper Supabase Storage buckets.

Suggested:

product-images
variant-images
category-images
hero-banners
brand-assets
review-images

Use appropriate policies.

Do not store base64 images inside the database.

Store URLs/storage paths in database.

==================================================
35. HOMEPAGE STRUCTURE
==================================================

Homepage should have approximately this hierarchy:

1. Announcement bar

2. Main navigation

3. Search

4. Hero carousel

5. Quick category icons

6. "Shop by Category"

7. "Today's Celebration Deals"

8. "Best Sellers"

9. "Birthday Essentials"

10. "Wedding & Marriage Collection"

11. "Beautiful Return Gifts"

12. "Party Decoration Essentials"

13. "German Silver Collection"

14. "Backdrop & Fabric Collection"

15. "Why Vizag Party World?"

16. WhatsApp CTA

17. Customer reviews

18. Newsletter/updates if appropriate

19. Footer

Do not make every section visually identical.

Create visual rhythm.

==================================================
36. WHY VIZAG PARTY WORLD
==================================================

Create a premium trust section.

Possible points:

Wide Celebration Collection
Quality Products
Great Value
Local Vizag Store
Easy Ordering
WhatsApp Support

Do not make fake claims such as "10,000+ customers" unless I provide those numbers.

==================================================
37. FOOTER
==================================================

Footer should include:

Vizag Party World

"Make Every Moment Special"

Quick Links

Home
Shop
Categories
Offers
About
Contact

Customer Care

Shipping Policy
Return Policy
Cancellation Policy
FAQ

Categories

Birthday
Wedding
Return Gifts
German Silver
Bags
Backdrop & Fabrics

Contact:

Party World
Poorna Market
Visakhapatnam - 530001
Andhra Pradesh

Phone:
8019926065

WhatsApp:
8019926065

Email:
vizagpartyworld@gmail.com

Add social media links only when configured.

==================================================
38. MOBILE-FIRST DESIGN
==================================================

THIS IS CRITICAL.

Most users will access this website through mobile.

Do not simply shrink desktop UI.

Design mobile-first.

Mobile homepage should have:

- Compact header
- Large search
- Swipeable hero
- Horizontal category scrolling
- Horizontal offer carousels
- 2-column product grid
- Large touch targets
- Sticky cart/checkout actions where appropriate
- Bottom navigation
- Slide-out side menu

Product page mobile:

Image gallery at top
Product information
Price
Variant selector
MOQ
Quantity
Add to Cart / Buy Now sticky bottom bar
Description
Reviews
Related products

Use safe-area padding for modern phones.

Avoid tiny text.

Minimum comfortable touch target approximately 44px.

==================================================
39. DESKTOP RESPONSIVENESS
==================================================

Also support:

- 1440px
- 1280px
- 1024px
- Tablet
- Mobile
- Small mobile

No horizontal overflow.

No broken images.

No overlapping text.

No fixed-width elements that break on mobile.

==================================================
40. PRODUCT CARD DESIGN
==================================================

Create a premium product card.

Card:

Product image

Small badges:

NEW
SALE
BESTSELLER
LOW STOCK

Product name

★★★★★

₹799
₹1,199
30% OFF

MOQ: 10

Color dots

Heart icon

Add to Cart

On desktop:

Hover image changes to second image.

On mobile:

Keep interface clean and touch friendly.

==================================================
41. RELATED PRODUCTS
==================================================

On product page:

"People Also Shop"

"More From This Category"

"Available in Other Colours"

Use real database relationships.

Do not randomly repeat the same product.

==================================================
42. COUPONS
==================================================

Build coupon architecture.

Admin can create:

Coupon code
Discount percentage/fixed
Minimum cart value
Maximum discount
Start date
Expiry date
Usage limit
Per-user usage limit
Applicable categories/products
Active/inactive

Checkout should validate coupons server-side.

==================================================
43. SEO
==================================================

Implement proper SEO.

Dynamic:

Title
Meta description
Open Graph
Canonical URLs

Product pages:

Product schema

Category pages:

Category metadata

Create SEO-friendly URLs:

/shop
/category/birthday-party
/category/return-gifts
/product/birthday-balloon-set

Generate sitemap architecture.

Use semantic HTML.

==================================================
44. PERFORMANCE
==================================================

Optimize for mobile.

Requirements:

- Lazy-load images
- Responsive image sizes
- Avoid huge JS bundles
- Avoid unnecessary animations
- Skeleton loading
- Proper caching
- Fast first render
- Optimized database queries
- Pagination/infinite scrolling for product lists

The site should feel fast even on normal Indian mobile internet.

==================================================
45. LOADING / EMPTY / ERROR STATES
==================================================

Every important page must have proper states.

Examples:

Loading:
Skeleton cards

No products:
"Nothing here yet — check another category."

Empty cart:
"Your celebration cart is waiting!"

Empty wishlist:
"Save your favourites for later."

Network error:
"Something went wrong. Please try again."

Order success:
"Your celebration order is confirmed!"

Use friendly brand language but do not overdo it.

==================================================
46. FESTIVE MICRO-INTERACTIONS
==================================================

Add tasteful micro-interactions:

- Button hover
- Product card hover
- Wishlist heart animation
- Cart count animation
- Subtle confetti on successful order
- Smooth drawer opening
- Smooth carousel
- Image zoom

DO NOT over-animate the website.

The goal is premium ecommerce, not an animation demo.

==================================================
47. ADMIN UX
==================================================

Admin panel should NOT look like the customer-facing website.

Make it clean and functional.

Admin sidebar:

Dashboard
Products
Categories
Orders
Customers
Offers
Hero Banners
Coupons
Reviews
Inventory
Settings

Top bar:

Search
Notifications
Admin profile
Logout

Desktop admin:
Sidebar + content

Mobile admin:
Collapsible sidebar / drawer

==================================================
48. INVENTORY
==================================================

Inventory should be real.

Admin can set:

Stock quantity
MOQ
Low stock threshold

Product should automatically display:

In Stock
Low Stock
Out of Stock

If stock reaches zero:

Disable Buy Now/Add to Cart unless backorders are enabled.

Variant stock should be independent.

==================================================
49. ANALYTICS
==================================================

Admin dashboard should show:

Sales
Orders
Customers
Products sold
Top categories
Top products
Average order value
Low stock products

Use database-derived data.

Do not display fake analytics after real data is available.

==================================================
50. NOTIFICATIONS
==================================================

Architecture should support:

Order confirmation
Payment confirmation
Order status updates

Email notification architecture should be prepared.

WhatsApp notification integration can be added later.

Do not fake successful emails/messages.

==================================================
51. ADMIN FULL CONTROL
==================================================

The core principle is:

"Anything I may need to change later should be manageable from Admin."

Therefore admin should control:

- Products
- Product images
- Product variants
- Colors
- Prices
- MRP
- Discounts
- MOQ
- Stock
- Categories
- Subcategories
- Hero banners
- Homepage offers
- Coupons
- Orders
- Customers
- Reviews
- Shipping settings
- COD
- Business information
- Contact details
- Footer links
- SEO information
- Featured products
- Bestseller products
- Homepage section visibility/order

Do not make me edit source code for normal business operations.

==================================================
52. HOMEPAGE SECTION MANAGER
==================================================

This would be especially useful.

Create an admin feature where I can control homepage sections.

For example:

Section:
Today's Celebration Deals

Status:
ON

Display order:
3

Products:
[Select products]

Similarly:

Best Sellers
Birthday Essentials
Wedding Collection
Return Gifts
German Silver
Backdrop Collection

Admin can:

- Enable/disable
- Rename section
- Select products
- Reorder sections

==================================================
53. FEATURED PRODUCT MANAGEMENT
==================================================

Admin can mark:

- Featured
- Bestseller
- New Arrival
- Trending
- Sale

These badges should automatically appear on the website.

==================================================
54. LOCAL BUSINESS / VIZAG FOCUS
==================================================

The website is for a business in Visakhapatnam.

Use language that works for Indian customers.

Currency:

₹ INR

Date/time:

Indian Standard Time

Phone formatting:

+91 8019926065

PIN code validation should support Indian PIN codes.

Address fields should be India-friendly.

==================================================
55. SEARCHABLE CATEGORY STRUCTURE
==================================================

Do not force all handwritten products into a flat list.

Create a logical ecommerce taxonomy.

For example:

Birthday & Party
  - Balloons
  - Candles
  - Birthday Sets
  - Cake Accessories
  - Lights
  - Party Props
  - Balloon Decoration

Return Gifts
  - Pichwai
  - Copper
  - White Finish
  - Jars
  - Kumkum Items
  - Urli
  - Gift Sets

Wedding
  - Marriage Essentials
  - Mala
  - Kapoor
  - Kumkum
  - Traditional Accessories
  - Flower Jewellery

Bags
  - Jute
  - Potli
  - Paper
  - Laminated
  - Non-Woven
  - Bottle Bags

Backdrop & Fabrics
  - Backdrop Cloth
  - Satin
  - Velvet
  - Fur
  - Canopy

German Silver
  - Gift Sets
  - Plates
  - Bowls
  - Cups
  - Kumkum Stands

Make the taxonomy editable.

==================================================
56. PRODUCT DATA MODEL
==================================================

A product should support at minimum:

Product ID
Name
Slug
SKU
Category
Subcategory
Short description
Long description
MRP
Selling price
Discount
MOQ
Stock
Low-stock threshold
Main images
Variants
Colors
Tags
Featured
Bestseller
New
Trending
Published
Created date
Updated date

Variant:

Variant ID
Product ID
Name
Color
Color hex
SKU
Price
MRP
Stock
MOQ
Images
Active

==================================================
57. ORDER DATA MODEL
==================================================

Order:

Order ID
User ID
Customer name
Phone
Email
Address
Items
Subtotal
Discount
Coupon
Shipping
Tax
Total
Payment method
Payment status
Order status
Created at
Updated at

Order item:

Product ID
Variant ID
Product name snapshot
Variant snapshot
Price snapshot
Quantity
Total

Store snapshots so historical orders remain correct even if product information changes later.

==================================================
58. IMPORTANT DATA INTEGRITY
==================================================

If an admin changes a product price later:

OLD ORDERS MUST NOT CHANGE.

Order records should preserve the price at the time of purchase.

If a product is deleted:

Existing orders must remain intact.

Use proper foreign keys and soft-delete/archive where appropriate.

==================================================
59. RESPONSIVE PRODUCT IMAGE RULES
==================================================

Product images should look premium.

Use:

object-fit: contain

for product images where appropriate.

Do not crop products unnecessarily.

Maintain consistent product card image area.

Product gallery should support portrait and landscape images gracefully.

==================================================
60. UI COMPONENT SYSTEM
==================================================

Create reusable components:

Header
MobileHeader
BottomNav
SideMenu
SearchBar
HeroCarousel
CategoryCard
ProductCard
ProductGrid
OfferCarousel
PriceBlock
VariantSelector
QuantitySelector
ImageGallery
CartDrawer
WishlistButton
FilterDrawer
CheckoutForm
AddressCard
OrderTimeline
Footer
AdminSidebar
AdminTable
AdminProductForm
AdminVariantForm
AdminBannerForm
AdminOfferForm
StatsCard
Charts

Keep code modular.

==================================================
61. ACCESSIBILITY
==================================================

Implement:

- Proper contrast
- Keyboard navigation
- ARIA labels
- Accessible buttons
- Form labels
- Focus states
- Alt text
- Screen-reader friendly navigation

==================================================
62. SECURITY AGAINST COMMON ISSUES
==================================================

Protect against:

- Unauthorized admin access
- Client-side price manipulation
- Invalid quantities
- Invalid coupons
- Unauthorized order access
- Unauthorized profile access
- Unauthorized inventory modification

Important:

Prices and totals must be validated server-side.

Never trust price values sent from the client.

==================================================
63. MOBILE CHECKOUT UX
==================================================

Mobile checkout should be extremely simple.

Use:

Step 1 Address
Step 2 Delivery
Step 3 Payment
Step 4 Confirm

Keep order summary accessible.

Use sticky bottom CTA:

"Place Order • ₹XXXX"

==================================================
64. TRUST & CONVERSION
==================================================

Add subtle trust elements:

Secure Checkout
Easy Support
Quality Celebration Products
Local Vizag Store
Multiple Payment Options

Only make claims that are actually true.

==================================================
65. HOME PAGE COPY
==================================================

Suggested hero:

"Make Every Moment Special"

"Everything you need for birthdays, weddings, gifting & unforgettable celebrations."

CTA:

"Shop Celebration Essentials"

Secondary:

"Explore Offers"

Use other dynamic banners from admin.

==================================================
66. BRAND EXPERIENCE
==================================================

The website should communicate:

"Whatever celebration I am planning, I can find it here."

The visitor should immediately understand:

WHAT:
Party supplies, gifting, wedding and celebration essentials

WHERE:
Vizag Party World

WHY:
One-stop celebration shopping

HOW:
Browse → Select → Add to Cart → Checkout

==================================================
67. DO NOT DO THESE THINGS
==================================================

DO NOT:

- Build only a frontend mockup
- Use fake products permanently
- Use localStorage as the main database
- Hard-code products
- Hard-code offers
- Hard-code homepage sections
- Hard-code admin credentials
- Put secrets in frontend
- Make fake login
- Make fake Google authentication
- Make fake checkout
- Make fake order success
- Make fake admin statistics
- Use generic stock branding that doesn't match Vizag Party World
- Overuse gradients
- Make the UI childish
- Copy Amazon/Flipkart exactly
- Create excessive animations
- Make desktop-only layouts
- Ignore mobile users

==================================================
68. SEED DATA
==================================================

Initially create sensible sample products based on the categories provided above so I can see the complete application working.

However, make it extremely clear that these are seed/demo products.

The actual products will eventually be entered through Admin.

Use realistic Indian INR pricing for seed/demo data only.

Do not claim those prices are actual Vizag Party World prices.

==================================================
69. ADMIN FIRST-SETUP
==================================================

Create a safe admin setup process.

I should be able to configure my first admin account using my authenticated Google account.

Do NOT create a publicly exposed:

username: admin
password: admin

Instead implement proper admin role assignment.

==================================================
70. PRODUCTION READINESS
==================================================

Before considering the project complete, verify:

Authentication works
Google login works after credentials are configured
Database works
RLS works
Storage works
Products can be created
Products can be edited
Products can be published
Products can be unpublished
Variants work
Variant images work
Categories work
Offers work
Hero banners work
Cart works
Wishlist works
Checkout works
Orders are created
Admin can update orders
Inventory updates correctly
Mobile layout works
Desktop layout works
Search works
Filters work
Sorting works
No unauthorized admin access
No unauthorized customer data access

==================================================
71. FINAL UI QUALITY BAR
==================================================

I want the final website to look like a professionally designed ecommerce startup that could compete visually with established Indian ecommerce websites.

It should NOT look like:

- a generic template
- a college project
- a basic Shopify clone
- an AI-generated dashboard
- a basic CRUD application

The visual experience should be:

PREMIUM
FESTIVE
COLORFUL
FAST
MODERN
TRUSTWORTHY
MOBILE-FIRST

The logo should feel naturally integrated throughout the experience.

==================================================
72. FINAL HOMEPAGE VISUAL DIRECTION
==================================================

Imagine entering the website on mobile.

At the top:

Vizag Party World logo
Search
Cart

Then a premium festive hero banner.

Then:

"Shop by Category"

with colorful category cards.

Then:

"Today's Celebration Deals"

with horizontally scrollable product cards.

Then:

"Popular for Birthdays"

Then:

"Beautiful Return Gifts"

Then:

"Wedding & Marriage Essentials"

Then:

"German Silver Collection"

Then:

"Backdrop & Fabric Collection"

Then:

"Why Vizag Party World?"

Then:

WhatsApp CTA

Then footer.

The homepage should feel exciting within the first 3 seconds.

==================================================
73. IMPORTANT: BUILD IN PHASES
==================================================

Build this systematically.

PHASE 1:
Design system + responsive frontend architecture

PHASE 2:
Supabase database + authentication + Google OAuth

PHASE 3:
Product/category/variant system

PHASE 4:
Customer shopping experience

PHASE 5:
Cart + wishlist + checkout

PHASE 6:
Orders + inventory

PHASE 7:
Admin dashboard

PHASE 8:
Offers + banners + homepage management

PHASE 9:
Security + RLS + validation

PHASE 10:
Responsive QA + performance + polish

Do not skip backend work just because the frontend is visually complete.

==================================================
74. IMPORTANT: BEFORE FINISHING
==================================================

Perform a complete audit of the application.

Check:

- Every button works
- Every route works
- Every form saves correctly
- Every CRUD action works
- Authentication works
- Admin permissions work
- Product variants work
- Product images work
- Cart persistence works
- Checkout creates orders
- Order statuses work
- Inventory works
- Mobile navigation works
- Side menu works
- Search works
- Filters work
- Offers work
- Hero banners work
- Homepage content comes from database/admin where appropriate
- No console errors
- No broken links
- No horizontal scrolling
- No fake data remaining where real database data is expected

==================================================
75. DESIGN DETAILS THAT I WANT YOU TO PRIORITIZE
==================================================

Use:

- Premium rounded cards
- Clean spacing
- Strong typography hierarchy
- Beautiful product photography
- Subtle gold borders
- Dark luxury navigation
- White/light product areas where readability benefits
- Festive accent colors
- Smooth but restrained animation
- High-quality icons
- Excellent mobile bottom navigation
- Sticky mobile purchase controls
- Large product imagery
- Clear pricing
- Clear MOQ
- Clear variants
- Clear CTA buttons

Do not make every element black.

Use dark branding areas combined with clean ecommerce shopping areas.

==================================================
76. BRAND INFORMATION MUST BE ACCURATE
==================================================

Use exactly:

Vizag Party World

Make Every Moment Special

vizagpartyworld@gmail.com

8019926065

Party World
Poorna Market
Visakhapatnam - 530001
Andhra Pradesh, India

Do not invent another address, phone number, email or business name.

==================================================
77. DELIVERABLE
==================================================

I want the complete working application.

Deliver:

1. Customer-facing ecommerce website
2. Admin dashboard
3. Database schema
4. Supabase authentication
5. Google OAuth integration
6. Supabase storage
7. Product management
8. Variant management
9. Category management
10. Offer management
11. Hero/banner management
12. Cart
13. Wishlist
14. Checkout
15. Orders
16. Inventory
17. Customer accounts
18. Reviews
19. Coupons
20. Search
21. Filters
22. Responsive mobile UI
23. Responsive desktop UI
24. SEO foundation
25. Security/RLS
26. Production-ready code structure

==================================================
78. VERY IMPORTANT FINAL INSTRUCTION
==================================================

DO NOT stop after creating the homepage.

DO NOT tell me "this can be implemented later."

Implement the complete architecture now.

If an external credential is required, such as:

Google OAuth Client ID
Google OAuth Client Secret
Supabase credentials
Razorpay Key ID
Razorpay Key Secret

create the complete integration structure and tell me exactly what needs to be configured.

If a feature cannot be fully activated without an external credential, make everything else functional and clearly mark the remaining configuration step.

The application must be designed so that once I enter the required credentials, it becomes a real production system.

The goal is to create:

"THE BEST PARTY & CELEBRATION ECOMMERCE WEBSITE IN VIZAG"

with a premium, colorful, festive brand identity based on the attached Vizag Party World logo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e845f7c1-06a0-4172-b6e6-b3a65c93042b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
