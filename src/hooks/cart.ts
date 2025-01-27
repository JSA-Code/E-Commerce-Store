import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  addToCart,
  AddToCartValues,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  UpdateCartItemQuantityValues,
} from "@/wix-api/cart";
import {
  MutationKey,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { useToast } from "./use-toast";

const queryKey: QueryKey = ["cart"];

// * is react hook bc uses useQuery hook, will be deduped if useCart() is called in several locations
// * initialData is passed from server side (although client fetching) to show correct cart num asap or else 0 shown
// * fetching data on client side takes a moment bc it fetches after page has rendered
export function useCart(initialData: currentCart.Cart | null) {
  return useQuery({
    queryKey: queryKey,
    queryFn: () => getCart(wixBrowserClient),
    initialData,
  });
}

// * useMutation() updates data on server
// * could've NOT used ^, but used try-catch block and manage own state
// * benefits of useMutation() are handles loading/error state and useful callback funcs
// * cancelQueries() prevents outdated data from being fetched on in progress reqs (race conditions)
// ? how does setQueryData() update cache w/ new data and change quantity for ShoppingCartButton automatically (w/o rerendering?)?
export function useAddItemToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: AddToCartValues) =>
      addToCart(wixBrowserClient, values),
    onSuccess(data) {
      // TODO move to left side bc ShoppingCartButton opens on right side
      toast({ description: "Item added to cart" });
      queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, data.cart);
    },
    onError(error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to add item to cart. Please try again.",
      });
    },
  });
}

// * previousCart/State is returned to allow data to be reverted
// * setQueryData() in onMutate directly modded cache which requires us searching for correct prod w/ ID vs WIX's backend
// * onSettled() occurs on either error or success states
// * added if statement to prevent race conditions (only makes reqs when not clicking button) by using mutation key/isMutating()
// * invalidateQueries() calls for refetch of data from WIX
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutationKey: MutationKey = ["useUpdateCartItemQuantity"];

  return useMutation({
    mutationKey,
    mutationFn: (values: UpdateCartItemQuantityValues) =>
      updateCartItemQuantity(wixBrowserClient, values),
    onMutate: async ({ productId, newQuantity }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);
      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.map((lineItem) =>
          lineItem._id === productId
            ? { ...lineItem, quantity: newQuantity }
            : lineItem,
        ),
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled() {
      if (queryClient.isMutating({ mutationKey }) === 1) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) =>
      removeCartItem(wixBrowserClient, productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);
      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.filter(
          (lineItem) => lineItem._id !== productId,
        ),
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
