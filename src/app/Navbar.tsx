import logo from "@/assets/logo.png";
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/wix-api/cart";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";

export default async function Navbar() {
  const wixServerClient = await getWixServerClient();
  const cart = await getCart(wixServerClient);

  return (
    <header className="bg-background shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 p-5">
        <Link className="flex items-center gap-4" href="/">
          <Image
            src={logo}
            alt="Awesome Sauce Shop Logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold">Awesome Sauce Shop</span>
        </Link>
        <ShoppingCartButton initialData={cart} />
      </div>
    </header>
  );
}
