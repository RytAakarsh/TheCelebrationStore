import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductImage = { id: string; url: string; alt: string | null; position: number; is_primary: boolean };
export type Variant = {
  id: string;
  product_id: string;
  name: string;
  color_name: string | null;
  color_hex: string | null;
  sku: string | null;
  price: number | null;
  mrp: number | null;
  stock: number;
  moq: number;
  description: string | null;
  is_active: boolean;
  position: number;
  variant_images?: { id: string; url: string; position: number }[];
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  short_description: string | null;
  description: string | null;
  mrp: number;
  price: number;
  moq: number;
  stock: number;
  low_stock_threshold: number;
  tags: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_published: boolean;
  is_archived: boolean;
  rating: number;
  review_count: number;
  sold_count: number;
  created_at: string;
  product_images?: ProductImage[];
  product_variants?: Variant[];
  categories?: { id: string; name: string; slug: string } | null;
  subcategories?: { id: string; name: string; slug: string } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  icon: string | null;
  accent: string | null;
  display_order: number;
  is_active: boolean;
  subcategories?: { id: string; name: string; slug: string; display_order: number; is_active: boolean }[];
};

const PRODUCT_SELECT =
  "*, product_images(id,url,alt,position,is_primary), product_variants(*, variant_images(id,url,position)), categories(id,name,slug), subcategories(id,name,slug)";

export const CARD_SELECT =
  "id,name,slug,price,mrp,moq,stock,is_featured,is_bestseller,is_new,is_trending,rating,review_count,created_at,sold_count,category_id,product_images(id,url,alt,position,is_primary),product_variants(id,color_hex,color_name)";

export type CardProduct = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "mrp"
  | "moq"
  | "stock"
  | "is_featured"
  | "is_bestseller"
  | "is_new"
  | "is_trending"
  | "rating"
  | "review_count"
  | "created_at"
  | "sold_count"
  | "category_id"
> & {
  product_images?: ProductImage[];
  product_variants?: { id: string; color_hex: string | null; color_name: string | null }[];
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async () =>
      unwrap<Category[]>(
        await supabase
          .from("categories")
          .select("*, subcategories(id,name,slug,display_order,is_active)")
          .eq("is_active", true)
          .order("display_order"),
      ),
    staleTime: 5 * 60 * 1000,
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const heroBannersQuery = () =>
  queryOptions({
    queryKey: ["hero_banners"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw new Error(error.message);
      return (data ?? []).filter(
        (b) => (!b.starts_at || b.starts_at <= nowIso) && (!b.ends_at || b.ends_at >= nowIso),
      );
    },
    staleTime: 60 * 1000,
  });

export const homeSectionsQuery = () =>
  queryOptions({
    queryKey: ["home_sections"],
    queryFn: async () =>
      unwrap<
        {
          id: string;
          key: string;
          title: string;
          subtitle: string | null;
          source: string;
          category_id: string | null;
          display_order: number;
          is_active: boolean;
        }[]
      >(await supabase.from("home_sections").select("*").eq("is_active", true).order("display_order")),
    staleTime: 60 * 1000,
  });

export const offerProductsQuery = () =>
  queryOptions({
    queryKey: ["offer_products"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data: offers, error } = await supabase
        .from("offers")
        .select("id,name,starts_at,ends_at,is_active")
        .eq("is_active", true);
      if (error) throw new Error(error.message);
      const live = (offers ?? []).filter(
        (o) => (!o.starts_at || o.starts_at <= nowIso) && (!o.ends_at || o.ends_at >= nowIso),
      );
      if (!live.length) return [] as CardProduct[];
      const { data: links, error: e2 } = await supabase
        .from("offer_products")
        .select("product_id")
        .in(
          "offer_id",
          live.map((o) => o.id),
        );
      if (e2) throw new Error(e2.message);
      const ids = [...new Set((links ?? []).map((l) => l.product_id))];
      if (!ids.length) return [] as CardProduct[];
      const { data, error: e3 } = await supabase.from("products").select(CARD_SELECT).in("id", ids);
      if (e3) throw new Error(e3.message);
      return (data ?? []) as unknown as CardProduct[];
    },
    staleTime: 60 * 1000,
  });

export const liveOffersQuery = () =>
  queryOptions({
    queryKey: ["live_offers"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw new Error(error.message);
      return (data ?? []).filter(
        (o) => (!o.starts_at || o.starts_at <= nowIso) && (!o.ends_at || o.ends_at >= nowIso),
      );
    },
    staleTime: 60 * 1000,
  });

export type ProductFilters = {
  categorySlug?: string | undefined;
  subcategorySlug?: string | undefined;
  search?: string | undefined;
  sort?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  inStockOnly?: boolean | undefined;
  minDiscount?: number | undefined;
  badge?: string | undefined;
  limit?: number | undefined;
};


export const productsQuery = (filters: ProductFilters = {}) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: async () => {
      let q = supabase.from("products").select(CARD_SELECT).eq("is_published", true).eq("is_archived", false);

      if (filters.categorySlug) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", filters.categorySlug)
          .maybeSingle();
        if (!cat) return [] as CardProduct[];
        q = q.eq("category_id", cat.id);
        if (filters.subcategorySlug) {
          const { data: sub } = await supabase
            .from("subcategories")
            .select("id")
            .eq("category_id", cat.id)
            .eq("slug", filters.subcategorySlug)
            .maybeSingle();
          if (sub) q = q.eq("subcategory_id", sub.id);
        }
      }
      if (filters.search) {
        const term = `%${filters.search}%`;
        q = q.or(`name.ilike.${term},short_description.ilike.${term},description.ilike.${term},sku.ilike.${term}`);
      }
      if (filters.minPrice != null) q = q.gte("price", filters.minPrice);
      if (filters.maxPrice != null) q = q.lte("price", filters.maxPrice);
      if (filters.inStockOnly) q = q.gt("stock", 0);
      if (filters.badge === "featured") q = q.eq("is_featured", true);
      if (filters.badge === "bestseller") q = q.eq("is_bestseller", true);
      if (filters.badge === "new") q = q.eq("is_new", true);
      if (filters.badge === "trending") q = q.eq("is_trending", true);

      switch (filters.sort) {
        case "price_asc":
          q = q.order("price", { ascending: true });
          break;
        case "price_desc":
          q = q.order("price", { ascending: false });
          break;
        case "newest":
          q = q.order("created_at", { ascending: false });
          break;
        case "bestselling":
          q = q.order("sold_count", { ascending: false });
          break;
        default:
          q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }
      if (filters.limit) q = q.limit(filters.limit);

      const { data, error } = await q;
      if (error) throw new Error(error.message);
      let rows = (data ?? []) as unknown as CardProduct[];
      if (filters.minDiscount) {
        rows = rows.filter(
          (p) => Number(p.mrp) > 0 && ((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100 >= filters.minDiscount!,
        );
      }
      return rows;
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as Product | null;
    },
  });

export const reviewsQuery = (productId: string | undefined) =>
  queryOptions({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId!)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
