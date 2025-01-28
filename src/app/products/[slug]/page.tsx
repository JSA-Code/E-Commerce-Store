import { getProductBySlug, getRelatedProducts } from "@/wix-api/products";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { products } from "@wix/stores";
import { getLoggedInMember } from "@/wix-api/members";
import CreateProductReviewButton from "@/components/reviews/CreateProductReviewButton";
import ProductReviews, {
  ProductReviewsLoadingSkeleton,
} from "./ProductReviews";
import { getProductReviews } from "@/wix-api/reviews";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const wixServerClient = await getWixServerClient();
  const { slug } = await params;
  const product = await getProductBySlug(wixServerClient, slug);

  if (!product?._id) notFound();

  const mainImage = product.media?.mainMedia?.image;

  return {
    title: product.name,
    description: "Get this product on Awesome Sauce Shop",
    openGraph: {
      images: mainImage?.url
        ? [
            {
              url: mainImage.url,
              width: mainImage.width,
              height: mainImage.height,
              alt: mainImage.altText || "",
            },
          ]
        : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  await delay(2000);
  // ? is this correct to use "await"? docs says yes
  const wixServerClient = await getWixServerClient();
  const { slug } = await params;
  const product = await getProductBySlug(wixServerClient, slug);

  if (!product?._id) notFound();

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <ProductDetails product={product} />
      <hr />
      {/* // * wrapped in suspense or else will halt entire page until product._id found */}
      <Suspense fallback={<RelatedProductsLoadingSkeleton />}>
        <RelatedProducts productId={product._id} />
      </Suspense>
      <hr />
      <div className="space-y-5">
        <h2 className="text-2xl font-bold">Buyer reviews</h2>
        <Suspense fallback={<ProductReviewsLoadingSkeleton />}>
          <ProductReviewSection product={product} />
        </Suspense>
      </div>
    </main>
  );
}

interface RelatedProductsProps {
  productId: string;
}

async function RelatedProducts({ productId }: RelatedProductsProps) {
  await delay(2000);

  const wixServerClient = await getWixServerClient();
  const relatedProducts = await getRelatedProducts(wixServerClient, productId);

  if (!relatedProducts.length) return null;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Related Products</h2>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RelatedProductsLoadingSkeleton() {
  return (
    <div className="flex grid-cols-2 flex-col gap-5 pt-12 sm:grid lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton className="h-[26rem] w-full" key={i} />
      ))}
    </div>
  );
}

interface ProductReviewSectionProps {
  product: products.Product;
}

async function ProductReviewSection({ product }: ProductReviewSectionProps) {
  if (!product._id) return null;
  const wixServerClient = await getWixServerClient();
  const loggedInMember = await getLoggedInMember(wixServerClient);
  const hasExistingReview = !!(loggedInMember?.contactId
    ? (
        await getProductReviews(wixServerClient, {
          productId: product._id,
          contactId: loggedInMember.contactId,
        })
      ).items[0]
    : null);

  await delay(5000);

  return (
    <div className="space-y-5">
      <CreateProductReviewButton
        product={product}
        loggedInMember={loggedInMember}
        hasExistingReview={hasExistingReview}
      />
      <ProductReviews product={product} />
    </div>
  );
}
