import PaginationBar from "@/components/PaginationBar";
import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { queryProducts } from "@/wix-api/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Results for "${q}"` : "Products",
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { q, page = "1" } = await searchParams;
  const title = q ? `Results for "${q}"` : "Products";

  return (
    // TODO recreate design for filters
    <main className="flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      <div>filter sidebar</div>
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex justify-center lg:justify-end">sort filter</div>
        <div className="space-y-10">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            {title}
          </h1>
          {/* // * if query or page change, rerender LoadingSkeleton */}
          <Suspense fallback={<LoadingSkeleton />} key={`${q}-${page}`}>
            <ProductResults q={q} page={parseInt(page)} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

interface ProductResultsProps {
  q?: string;
  page: number;
}

async function ProductResults({ q, page }: ProductResultsProps) {
  await delay(1000);

  const totalProducts = 8;
  const wixServerClient = await getWixServerClient();
  const products = await queryProducts(wixServerClient, {
    q,
    limit: totalProducts,
    skip: (page - 1) * totalProducts,
  });

  if (page > (products.totalPages || 1)) notFound();

  return (
    <div className="space-y-10">
      <p className="text-center text-xl">
        {products.totalCount}{" "}
        {products.totalCount === 1 ? "product" : "products"} found
      </p>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {products.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar currentPage={page} totalPages={products.totalPages || 1} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="mx-auto h-9 w-52" />
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton className="h-[26rem]" key={i} />
        ))}
      </div>
    </div>
  );
}
