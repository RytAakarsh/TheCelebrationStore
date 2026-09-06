ALTER TABLE public.home_sections ADD COLUMN IF NOT EXISTS max_items integer NOT NULL DEFAULT 10;
ALTER TABLE public.home_sections ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.home_section_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.home_sections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, product_id)
);

GRANT SELECT ON public.home_section_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_section_products TO authenticated;
GRANT ALL ON public.home_section_products TO service_role;

ALTER TABLE public.home_section_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hsp read" ON public.home_section_products FOR SELECT USING (true);
CREATE POLICY "hsp admin" ON public.home_section_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS home_sections_updated ON public.home_sections;
CREATE TRIGGER home_sections_updated BEFORE UPDATE ON public.home_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();