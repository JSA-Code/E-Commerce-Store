"use client";

import CheckoutButton from "@/components/CheckoutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import WixImage from "@/components/WixImage";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "@/hooks/cart";
import { currentCart } from "@wix/ecom";
import { Loader2, ShoppingCartIcon, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ShoppingCartButtonProps {
  initialData: currentCart.Cart | null;
}

export default function ShoppingCartButton({
  initialData,
}: ShoppingCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cartQuery = useCart(initialData);
  // TODO how does array reduce function work?
  const totalQuantity =
    cartQuery.data?.lineItems?.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0,
    ) || 0;

  return (
    <>
      <div className="relative">
        {/* // * this Shadcn btn does has FIXED size of "[&_svg]:size-4" which prevents ShoppingCartIcon below from sizing correctly */}
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <ShoppingCartIcon />
          <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {totalQuantity < 10 ? totalQuantity : "9+"}
          </span>
        </Button>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              Your cart{" "}
              <span className="text-base">
                ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex grow flex-col space-y-5 overflow-y-auto pt-1">
            <ul className="space-y-5">
              {cartQuery.data?.lineItems?.map((item) => (
                <ShoppingCartItem
                  key={item._id}
                  item={item}
                  onProductLinkClicked={() => setIsOpen(false)}
                />
              ))}
            </ul>
            {cartQuery.isPending && (
              <Loader2 className="mx-auto animate-spin" />
            )}
            {cartQuery.error && (
              <p className="text-destructive">{cartQuery.error.message}</p>
            )}
            {!cartQuery.isPending && !cartQuery.data?.lineItems?.length && (
              <div className="flex grow items-center justify-center text-center">
                <div className="space-y-1.5">
                  <p className="text-lg font-semibold">Your cart is empty</p>
                  <Link
                    className="text-primary hover:underline"
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                  >
                    Start shopping now
                  </Link>
                </div>
              </div>
            )}
            {/* // * <pre> preserves formatting, other args for JSON.stringify() adds whitespaces */}
            {/* // * <pre>{JSON.stringify(cartQuery.data, null, 2)}</pre> */}
          </div>
          <hr />
          <div className="flex items-center justify-between gap-5">
            <div className="space-y-0.5">
              <p className="text-sm">Subtotal amount:</p>
              <p className="font-bold">
                {/* @ts-expect-error // * wix sdk type does not include subtotal, expect vs ignore better bc indicates once subtotal is fixed */}
                {cartQuery.data?.subtotal?.formattedConvertedAmount}
              </p>
              <p className="text-xs text-muted-foreground">
                Shipping fees and taxes are calculated at checkout
              </p>
            </div>
            <div>
              <CheckoutButton
                disabled={!totalQuantity || cartQuery.isFetching}
                size="lg"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface ShoppingCartItemProps {
  item: currentCart.LineItem;
  onProductLinkClicked: () => void;
}

function ShoppingCartItem({
  item,
  onProductLinkClicked,
}: ShoppingCartItemProps) {
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();
  const productId = item._id;

  if (!productId) return null;

  const slug = item.url?.split("/").pop();
  const quantityLimitReached =
    !!item.quantity &&
    !!item.availability?.quantityAvailable &&
    item.quantity >= item.availability.quantityAvailable;

  return (
    <li className="flex items-center gap-3">
      <div className="relative size-fit flex-none">
        <Link href={`/products/${slug}`} onClick={onProductLinkClicked}>
          <WixImage
            className="flex-none bg-secondary"
            mediaIdentifier={item.image}
            width={110}
            height={110}
            alt={item.productName?.translated || "Product image"}
          />
        </Link>
        {/* // * regular btn bc Shadcn styling not needed */}
        <button
          className="absolute -right-1 -top-1 rounded-full border bg-background p-0.5"
          onClick={() => removeItemMutation.mutate(productId)}
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-1.5 text-sm">
        <Link href={`/products/${slug}`} onClick={onProductLinkClicked}>
          <p className="font-bold">{item.productName?.translated || "Item"}</p>
        </Link>
        {!!item.descriptionLines?.length && (
          <p>
            {item.descriptionLines
              .map(
                (line) =>
                  line.colorInfo?.translated || line.plainText?.translated,
              )
              .join(", ")}
          </p>
        )}
        <div className="flex items-center gap-2">
          {item.quantity} x {item.price?.formattedConvertedAmount}
          {item.fullPrice && item.fullPrice?.amount !== item.price?.amount && (
            <span className="text-muted-foreground line-through">
              {item.fullPrice.formattedConvertedAmount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() =>
              updateQuantityMutation.mutate({
                productId,
                newQuantity: !item.quantity ? 0 : item.quantity - 1,
              })
            }
            variant="outline"
            size="sm"
            disabled={item.quantity === 1}
          >
            -
          </Button>
          <span>{item.quantity}</span>
          <Button
            onClick={() =>
              updateQuantityMutation.mutate({
                productId,
                newQuantity: !item.quantity ? 1 : item.quantity + 1,
              })
            }
            variant="outline"
            size="sm"
            disabled={quantityLimitReached}
          >
            +
          </Button>
          {quantityLimitReached && <span>Quantity limit reached</span>}
        </div>
      </div>
    </li>
  );
}
