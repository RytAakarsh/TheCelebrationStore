export const BRAND = {
  name: "The Celebration Store",
  tagline: "Make Every Moment Special",
  about:
    "Welcome to The Celebration Store — your one-stop destination for making every celebration extra special! From beautiful balloons and party decorations to German silver return gifts and unique celebration essentials, we have everything you need to make your occasions memorable. Whether it’s a birthday, anniversary, baby shower, wedding, or any special event, we’re here to add more colour, joy, and happiness to your celebrations.",
  email: "thecelebrationstore@gmail.com",
  phone: "8019926065",
  phoneDisplay: "+91 8019926065",
  whatsapp: "8019926065",
  addressLines: [
    "Party World",
    "Poorna Market",
    "Visakhapatnam - 530001",
    "Andhra Pradesh, India",
  ],
  strip: "Make Every Moment Special ✨ | Flat ₹79 Delivery Across India | Free Shipping over ₹999 🎉",
  logoUrl: "/the-celebration-store-logo.png",
  logoFullUrl: "/the-celebration-store-logo-full.png",
  city: "Visakhapatnam",
  state: "Andhra Pradesh",
  pincode: "530001",
} as const;

export function whatsappLink(message?: string) {
  const text =
    message ?? `Hello ${BRAND.name}, I would like to know more about your celebration products and orders.`;
  return `https://wa.me/91${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function productWhatsappLink(productName: string) {
  return whatsappLink(
    `Hello ${BRAND.name}, I am interested in "${productName}". Please share availability, pricing and bulk order details.`,
  );
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const TRACK_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];
