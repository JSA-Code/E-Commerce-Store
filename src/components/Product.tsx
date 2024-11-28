import { products } from "@wix/stores";
import Link from "next/link";

interface ProductProps {
  product: products.Product;
}

export default function Product({ product }: ProductProps) {
  const mainImage = product.media?.mainMedia?.image;

  return <Link href={`/products/${product.slug}`}>{product.name}</Link>;
}
