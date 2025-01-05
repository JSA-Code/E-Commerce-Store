import { products } from "@wix/stores";
import Link from "next/link";
import WixImage from "./WixImage";
import Badge from "./ui/badge";
import { formatCurrency } from "@/lib/utils";
import DiscountBadge from "./DiscountBadge";

interface ProductProps {
  product: products.Product;
}

// * VID "resizing img requires compute power = $$$, but free on WIX"
// * "could've used Next Image as it resizes img which requires whitelisting in next.config"
// * "but if URL not owned, anyone can use our server to resize/compute img"
export default function Product({ product }: ProductProps) {
  const mainImage = product.media?.mainMedia?.image;

  return (
    <Link className="h-full border bg-card" href={`/products/${product.slug}`}>
      <div className="relative overflow-hidden">
        <WixImage
          className="transition-transform duration-300 hover:scale-105"
          mediaIdentifier={mainImage?.url}
          alt={mainImage?.altText}
          width={700}
          height={700}
        />
        <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2">
          {product.ribbon && <Badge>{product.ribbon}</Badge>}
          {product.discount && <DiscountBadge data={product.discount} />}
          <Badge className="bg-secondary font-semibold text-secondary-foreground">
            {getFormattedPrice(product)}
          </Badge>
        </div>
      </div>
      <div className="space-y-3 p-3">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <div
          className="line-clamp-5"
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        />
      </div>
    </Link>
  );
}

function getFormattedPrice(product: products.Product) {
  const minPrice = product.priceRange?.minValue;
  const maxPrice = product.priceRange?.maxValue;

  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `from ${formatCurrency(minPrice, product.priceData?.currency)}`;
  } else {
    return (
      product.priceData?.formatted?.discountedPrice ||
      product.priceData?.formatted?.price ||
      "n/a"
    );
  }
}
