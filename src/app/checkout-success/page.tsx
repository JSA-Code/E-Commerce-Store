import Order from "@/components/Order";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getLoggedInMember } from "@/wix-api/members";
import { getOrder } from "@/wix-api/orders";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout success",
};

interface PageProps {
  searchParams: { orderId: string };
}

export default async function Page({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const wixServerClient = await getWixServerClient();
  const [order, loggedInMember] = await Promise.all([
    getOrder(wixServerClient, orderId),
    getLoggedInMember(wixServerClient),
  ]);

  if (!order) notFound();

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center space-y-5 px-5 py-10">
      <h1 className="text-3xl font-bold">We received your order!</h1>
      <p>A summary of your order was sent to your email address</p>
      <h2 className="text-2xl font-bold">Order Details</h2>
      <Order order={order} />
      {loggedInMember && (
        <Link className="block text-primary hover:underline" href="/profile">
          View all your orders
        </Link>
      )}
    </main>
  );
}
