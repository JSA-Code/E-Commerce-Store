/* eslint-disable @next/next/no-img-element */
import { products } from "@wix/stores";
import Link from "next/link";
import { media as wixMedia } from "@wix/sdk";

interface ProductProps {
  product: products.Product;
}

export default function Product({ product }: ProductProps) {
  const mainImage = product.media?.mainMedia?.image;
  const resizedImageUrl = mainImage?.url
    ? wixMedia.getScaledToFillImageUrl(mainImage.url, 700, 700, {})
    : null;

  return (
    <Link className="h-full border" href={`/products/${product.slug}`}>
      <div className="overflow-hidden">
        <img
          className="transition-transform duration-300 hover:scale-105"
          src={resizedImageUrl || "/placeholder.png"}
          alt={mainImage?.altText || ""}
        />
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
