import { getProductBySlug } from "@/wix-api/products";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { notFound } from "next/navigation";

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
    </main>
  );
}
