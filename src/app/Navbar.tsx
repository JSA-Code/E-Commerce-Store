import logo from "@/assets/logo.png";
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/wix-api/cart";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";
import UserButton from "@/components/UserButton";
import { getLoggedInMember } from "@/wix-api/members";
import { getCollections } from "@/wix-api/collections";
import MainNavigation from "./MainNavigation";
import SearchField from "@/components/SearchField";
import MobileMenu from "./MobileMenu";
import { Suspense } from "react";

// * fetching data on server side fetches data before page has rendered
export default async function Navbar() {
  const wixServerClient = await getWixServerClient();
  const [cart, loggedInMember, collections] = await Promise.all([
    getCart(wixServerClient),
    getLoggedInMember(wixServerClient),
    getCollections(wixServerClient),
  ]);

  return (
    // * bg-background used bc not part of <body>
    <header className="bg-background shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 p-5">
        {/* // TODO diff b/w using tailwindcss vs js cond rendering? What's the purpose of <Suspense> here? */}
        <Suspense>
          <MobileMenu
            collections={collections}
            loggedInMember={loggedInMember}
          />
        </Suspense>
        <div className="flex flex-wrap items-center gap-5">
          <Link className="flex items-center gap-4" href="/">
            <Image
              src={logo}
              alt="Awesome Sauce Shop Logo"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold">Awesome Sauce Shop</span>
          </Link>
          <MainNavigation
            className="hidden lg:flex"
            collections={collections}
          />
        </div>
        <SearchField className="hidden max-w-96 lg:inline" />
        <div className="flex items-center justify-center gap-5">
          <UserButton
            className="hidden lg:inline-flex"
            loggedInMember={loggedInMember}
          />
          <ShoppingCartButton initialData={cart} />
        </div>
      </div>
    </header>
  );
}
