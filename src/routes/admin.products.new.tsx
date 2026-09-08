import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProduct,
});

function NewProduct() {
  return (
    <AdminPage title="Add product" description="Create a new catalogue item">
      <ProductForm />
    </AdminPage>
  );
}
