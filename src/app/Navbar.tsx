import logo from "@/assets/logo.png";
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/wix-api/cart";

export default async function Navbar() {
  const cart = await getCart();

  const totalQuantity =
    cart?.lineItems.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

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
        {totalQuantity} items in your cart
      </div>
    </header>
  );
}
