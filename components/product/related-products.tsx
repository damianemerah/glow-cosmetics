import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/dashboard";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-montserrat">
        You May Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={
                    product.image_url && product.image_url.length > 0
                      ? product.image_url[0]
                      : "/placeholder.svg"
                  }
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.is_bestseller && (
                  <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                    Bestseller
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800 group-hover:text-green-500 transition-colors">
                  {product.name}
                </h3>
                <p className="text-green-600 font-semibold mt-1">
                  ${product.price ? product.price.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
