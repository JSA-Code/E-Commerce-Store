"use client";

import SearchField from "@/components/SearchField";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import UserButton from "@/components/UserButton";
import { twConfig } from "@/lib/utils";
import { members } from "@wix/members";
import { collections } from "@wix/stores";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MobileMenuProps {
  collections: collections.Collection[];
  loggedInMember: members.Member | null;
}

export default function MobileMenu({
  collections,
  loggedInMember,
}: MobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleSize = () => {
      if (window.innerWidth > parseInt(twConfig.theme.screens.lg)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleSize);

    return () => window.removeEventListener("resize", handleSize);
  }, []);

  // * if we hover on sheet menu and nav back or front will not close sheet, therefore useEffect based on paths/params
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <Button
        className="inline-flex lg:hidden"
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full" side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center space-y-10 py-10">
            <SearchField className="w-full" />
            <ul className="space-y-5 text-center text-lg">
              <li>
                <Link className="font-semibold hover:underline" href="/shop">
                  Shop
                </Link>
              </li>
              {collections.map((collection) => (
                <li key={collection._id}>
                  <Link
                    className="font-semibold hover:underline"
                    href={`/collections/${collection.slug}`}
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <UserButton loggedInMember={loggedInMember} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
