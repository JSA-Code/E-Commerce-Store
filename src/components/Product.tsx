import { products } from "@wix/stores";
import Link from "next/link";
import WixImage from "./WixImage";

interface ProductProps {
  product: products.Product;
}

export default function Product({ product }: ProductProps) {
  const mainImage = product.media?.mainMedia?.image;

  return (
    <Link className="h-full border" href={`/products/${product.slug}`}>
      <div className="relative overflow-hidden">
        <WixImage
          className="transition-transform duration-300 hover:scale-105"
          mediaIdentifier={mainImage?.url}
          alt={mainImage?.altText}
          width={700}
          height={700}
        />
        <div className="aboslute bottom-3 right-3 flex flex-wrap items-center gap-2">
          Here
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
