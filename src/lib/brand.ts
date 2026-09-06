export const BRAND = {
  name: "Vizag Party World",
  tagline: "Make Every Moment Special",
  email: "vizagpartyworld@gmail.com",
  phone: "8019926065",
  phoneDisplay: "+91 8019926065",
  whatsapp: "8019926065",
  addressLines: [
    "Party World",
    "Poorna Market",
    "Visakhapatnam - 530001",
    "Andhra Pradesh, India",
  ],
  strip: "Celebrate Better. Shop Party World.",
} as const;

export function whatsappLink(message?: string) {
  const text = message ?? `Hello ${BRAND.name}, I would like to know more about your products.`;
  return `https://wa.me/91${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function productWhatsappLink(productName: string) {
  return whatsappLink(
    `Hello ${BRAND.name}, I am interested in ${productName}. Please share availability and details.`,
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
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];
