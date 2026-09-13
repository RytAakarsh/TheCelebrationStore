# Premium Party World Navbar and Hero

## What will change
- Replace the customer-navbar image logo and “Vizag Party World” label with a responsive, single-line **PARTY WORLD** typographic wordmark.
- Keep the full Vizag Party World identity everywhere else, including admin, footer, metadata, and favicon.
- Replace the empty black homepage banner with six premium, image-led campaigns for first order, birthdays, return gifts, weddings, party décor, and German Silver gifting.
- Preserve Shop by Category and every existing product section, adding only a refined transition below the banner.

## Banner experience
- Generate coordinated desktop and mobile campaign artwork with clear text-safe areas and no baked-in promotional copy.
- Store optimized JPG/WebP files as real production assets under the public site assets path; no `.asset.json` dependency.
- Use the existing banner database for headings, descriptions, links, images, ordering, activation, and scheduling.
- Add smooth 5-second autoplay, hover pause, interaction pause/resume, keyboard-accessible arrows, pagination dots, and touch swipe.
- Prioritize the first image and defer later images where practical.

## Admin controls
- Extend the existing Hero Banners admin area rather than creating another banner system.
- Support add, edit, delete, activate/deactivate, ordering, desktop/mobile images, CTA details, and start/end dates.
- Seed the six requested campaigns as editable banner records without creating or activating a coupon.

## Verification
- Check desktop plus 360–430px mobile widths for wordmark fit, text readability, image composition, controls, and category visibility.
- Test autoplay, arrows, dots, swipe, pause/resume, banner management, image fallback, and production-safe image URLs.
- Confirm `.asset.json` has no runtime references and smoke-test homepage sections, products, cart, checkout, and admin routes.

## Technical details
- Reuse the existing Embla carousel, banner table/query, image uploader, semantic color tokens, and storefront components.
- Keep all data, authentication, checkout, product, order, and admin architecture unchanged outside the banner-management additions.
