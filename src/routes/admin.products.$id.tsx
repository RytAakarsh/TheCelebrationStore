import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  return (
    <AdminPage title="Edit product" description="Update details, images, stock and variants">
      <ProductForm productId={id} />
    </AdminPage>
  );
}
