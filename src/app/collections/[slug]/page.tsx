import PaginationBar from "@/components/PaginationBar";
import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getCollectionBySlug } from "@/wix-api/collections";
import { queryProducts } from "@/wix-api/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const wixServerClient = await getWixServerClient();
  const { slug } = await params;
  const collection = await getCollectionBySlug(wixServerClient, slug);

  if (!collection) notFound();

  const banner = collection.media?.mainMedia?.image;

  return {
    title: collection.name,
    description: collection.description,
    openGraph: {
      images: banner ? [{ url: banner.url }] : [],
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const wixServerClient = await getWixServerClient();
  const { slug } = await params;
  const collection = await getCollectionBySlug(wixServerClient, slug);

  if (!collection?._id) notFound();

  const { page = "1" } = await searchParams;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Products</h2>
      {/* // * by default, does not reactivate w/ new data, requires key to rerender */}
      <Suspense fallback={<LoadingSkeleton />} key={page}>
        <Products collectionId={collection._id} page={parseInt(page)} />
      </Suspense>
    </div>
  );
}

interface ProductsProps {
  collectionId: string;
  page: number;
}

async function Products({ collectionId, page }: ProductsProps) {
  await delay(2000);

  // * 12 good size as it's divisible by grid-cols-# below but 8 good for pagination showcase
  const totalProducts = 8;

  const wixServerClient = await getWixServerClient();
  const collectionProducts = await queryProducts(wixServerClient, {
    collectionIds: collectionId,
    limit: totalProducts,
    // TODO how does this work?
    skip: (page - 1) * totalProducts,
  });

  if (!collectionProducts.length) notFound();

  if (page > (collectionProducts.totalPages || 1)) notFound();

  return (
    <div className="space-y-10">
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {collectionProducts.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar
        currentPage={page}
        totalPages={collectionProducts.totalPages || 1}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-[26rem] w-full" />
      ))}
    </div>
  );
}
