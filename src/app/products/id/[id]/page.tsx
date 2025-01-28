import { getWixServerClient } from "@/lib/wix-client.server";
import { getProductById } from "@/wix-api/products";
import { notFound, redirect } from "next/navigation";

// * type any used bc passing searchParams and not using
interface PageProps {
  params: { id: string };
  searchParams: any;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const searchParamValues = await searchParams;

  // * "someId" used in dev
  // TODO toString() on new URLSearchParams() not used bc automatically stringified?
  // TODO diff b/w redirect vs push?
  if (id === "someId") {
    redirect(
      `/products/i-m-a-product-1?${new URLSearchParams(searchParamValues)}`,
    );
  }

  const wixServerClient = await getWixServerClient();
  const product = await getProductById(wixServerClient, id);

  if (!product) notFound();

  redirect(
    `/products/${product.slug}?${new URLSearchParams(searchParamValues)}`,
  );
}
