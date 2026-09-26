# The Celebration Store — Full-Stack E-Commerce & Admin Platform

> **"Make Every Moment Special"**  
> Luxury celebration, party supplies, German silver return gifts, and event essentials e-commerce business based in Visakhapatnam, Andhra Pradesh, India.

---

## 🛍️ Brand & Business Information

- **Brand Name**: The Celebration Store
- **Tagline**: Make Every Moment Special
- **Support & Orders Helpline**: `+91 8019926065`
- **WhatsApp Direct**: `+91 8019926065`
- **Official Email**: `thecelebrationstore@gmail.com`
- **Admin Email**: `thecelebrationstore@gmail.com`
- **Storefront & Office**: Party World, Poorna Market, Visakhapatnam - 530001, Andhra Pradesh, India

---

## 🚀 Technology Stack

- **Framework**: TanStack Start (Full-stack React 19 + SSR + Vite 8)
- **Routing & State**: TanStack Router + TanStack React Query v5
- **Database & Auth**: Supabase PostgreSQL (Row-Level Security, Server Functions, Auth)
- **Styling**: Tailwind CSS v4 + Festive Luxury Theme (`#FFFDF9` Warm White, `#101827` Deep Navy, `#D9A441` Champagne Gold, `#F05A78` Celebration Pink)
- **Icons & UI**: Lucide React + Radix UI primitives + Sonner Toasts
- **Charts & Reports**: Recharts (IST Date Aggregations)

---

## 📦 Features

### 🛒 Customer Storefront
1. **Festive Luxury Header & Mobile Drawer**: Instant search, category accordions, cart badge, wishlist, and WhatsApp help button.
2. **Dynamic Hero Carousel**: Responsive banners, custom headings, CTA buttons, configurable via Admin.
3. **Curated Categories & Taxonomies**: Birthday & Party, German Silver, Return Gifts, Bags, Backdrops & Fabrics, Marriage/Wedding Essentials.
4. **Interactive Product Details (`/product/:slug`)**:
   - Multi-image gallery with thumbnail switcher & zoom.
   - Real-time variant selection (Color hex circles, custom prices, SKU, stock).
   - Strict Minimum Order Quantity (MOQ) enforcement.
   - WhatsApp product enquiry button with pre-filled message.
   - Detailed tabs (Description, Specifications, Shipping & Return, Verified Reviews).
5. **Database Shopping Cart (`/cart`)**:
   - Live Free Delivery progress tracker (Threshold: ₹999; Flat ₹79 for smaller orders).
   - Real-time coupon validation with minimum order check & discount calculation.
   - MOQ step increment controls.
6. **Secure Checkout (`/checkout`)**:
   - Saved Address selector with complete Indian address fields.
   - Payment method selection (Cash on Delivery & Online Razorpay/UPI).
   - Server-side price recalculation (never trusts browser prices).
7. **Customer Account & Order Tracking (`/account`)**:
   - 7-step visual order tracking timeline.
   - Itemized invoices, customer details, and direct WhatsApp support.

### 🛡️ Admin Management Console (`/admin`)
1. **Executive Dashboard**: Real-time sales area chart (IST), order metrics, low stock alerts, top-selling items.
2. **Catalogue & Product Form (`/admin/products`)**:
   - 5-image uploader (Supabase Storage / URL).
   - Unlimited variant matrix (Color Hex, Name, SKU, Price, MRP, Stock, MOQ).
   - Badges (Featured, Bestseller, New Arrival, Trending).
   - One-click duplicate product action.
3. **Category & Subcategory Manager (`/admin/categories`)**: Full hierarchical taxonomies with image uploaders and display ordering.
4. **Order Management & Invoicing (`/admin/orders`)**:
   - Real-time fulfillment status changer (Pending → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered → Cancelled).
   - One-click Printable Tax Invoice with store header and itemized table.
   - Direct WhatsApp customer messaging and click-to-call buttons.
5. **Live Offers & Hero Banners (`/admin/offers`, `/admin/banners`)**: Time-bound promotions and banner controls.
6. **Homepage Section Builder (`/admin/homepage`)**: Drag, toggle, and map homepage product grids.
7. **Coupon Engine (`/admin/coupons`)**: Percentage or flat discounts, usage caps, and expiration dates.
8. **Inventory & Stock Manager (`/admin/inventory`)**: Inline stock updater with low stock warnings.
9. **Customer Directory (`/admin/customers`)**: Customer spend history and order frequency.
10. **Review Moderation (`/admin/reviews`)**: Approve or reject customer product ratings.
11. **Store Settings (`/admin/settings`)**: Live store profile, contact numbers, free shipping thresholds, payment toggles, and SEO tags.

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js `20.x` or `22.x`
- npm `10.x`

### 1. Clone & Install
```bash
git clone <repo-url>
cd the-celebration-store
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Admin Authentication
- Access URL: `/admin` or `/admin/login`
- Authorized Admin Email: `thecelebrationstore@gmail.com`
