import logo from "@/assets/logo.png";
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/wix-api/cart";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";
import UserButton from "@/components/UserButton";
import { getLoggedInMember } from "@/wix-api/members";

export default async function Navbar() {
  const wixServerClient = await getWixServerClient();
  const [cart, loggedInMember] = await Promise.all([
    getCart(wixServerClient),
    getLoggedInMember(wixServerClient),
  ]);

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
        <div className="flex items-center justify-center gap-5">
          <UserButton loggedInMember={loggedInMember} />
          <ShoppingCartButton initialData={cart} />
        </div>
      </div>
    </header>
  );
}
