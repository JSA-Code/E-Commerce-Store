"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { collections } from "@wix/stores";
import Link from "next/link";

interface MainNavigationProps {
  collections: collections.Collection[];
  className?: string;
}

export default function MainNavigation({
  collections,
  className,
}: MainNavigationProps) {
  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        <NavigationMenuItem>
          {/* TODO purpose of legacyBehavior and passHref */}
          <Link href="/shop" legacyBehavior passHref>
            {/* // * navigationMenuTriggerStyle() applies correct styles to trigger */}
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Shop
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="p-4">
              {collections.map((collection) => (
                <li key={collection._id}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    legacyBehavior
                    passHref
                  >
                    {/* // * cn() func used to combine several styles */}
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "w-full justify-start whitespace-nowrap",
                      )}
                    >
                      {collection.name}
                    </NavigationMenuLink>
                  </Link>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
