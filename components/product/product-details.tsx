import type { Product } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "./add-to-cart-button";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // Format category for display
  const categoryDisplay = product.category.replace("_", " ");

  return (
    <div className="space-y-6 mt-4 sticky top-21 h-[fit-content]">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 capitalize">
          Category: {categoryDisplay}
        </span>
        {product.is_bestseller && (
          <Badge className="bg-yellow-100 text-yellow-800">Bestseller</Badge>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-800 font-montserrat capitalize">
        {product.name}
      </h1>

      <p className="text-2xl font-semibold text-green-600">
        ${product.price ? product.price.toFixed(2) : "0.00"}
      </p>

      {product.short_description && (
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}

      <div>
        <span className="text-sm text-gray-600">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} in stock`
            : "Out of stock"}
        </span>
      </div>

      <AddToCartButton product={product} />
    </div>
  );
}
