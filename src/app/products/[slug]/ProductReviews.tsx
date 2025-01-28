"use client";

import LoadingButton from "@/components/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { wixBrowserClient } from "@/lib/wix-client.browser";
import { getProductReviews } from "@/wix-api/reviews";
import { useInfiniteQuery } from "@tanstack/react-query";
import { reviews } from "@wix/reviews";
import { products } from "@wix/stores";
import { CornerDownRight, StarIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import WixImage from "@/components/WixImage";
import { media as wixMedia } from "@wix/sdk";

interface ProductReviewsProps {
  product: products.Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  // TODO how does useInfinityQuery work?
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["product-reviews", product._id],
      queryFn: async ({ pageParam }) => {
        if (!product._id) {
          throw Error("Product ID missing");
        }

        // * small # for pagination showcase
        const reviewCount = 2;

        return getProductReviews(wixBrowserClient, {
          productId: product._id,
          limit: reviewCount,
          cursor: pageParam,
        });
      },
      // * mod data before display, filters out non approved reviews
      // select: (data) => ({
      //   ...data,
      //   pages: data.pages.map((page) => ({
      //     ...page,
      //     items: page.items.filter(
      //       (item) =>
      //         item.moderation?.moderationStatus ===
      //         reviews.ModerationModerationStatus.APPROVED,
      //     ),
      //   })),
      // }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.cursors.next,
    });
  const reviewItems = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-5">
      {status === "pending" && <ProductReviewsLoadingSkeleton />}
      {status === "error" && (
        <p className="text-destructive">Error fetching reviews</p>
      )}
      {status === "success" && !reviewItems.length && !hasNextPage && (
        <p>No reviews yet</p>
      )}
      {/* // * divide-y adds horizontal divider line */}
      <div className="divide-y">
        {reviewItems.map((review) => (
          <Review key={review._id} review={review} />
        ))}
      </div>
      {/* // ? why can't I pass the function directly? It says type not suitable */}
      {hasNextPage && (
        <LoadingButton
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more reviews
        </LoadingButton>
      )}
    </div>
  );
}

interface ReviewProps {
  review: reviews.Review;
}

function Review({
  review: { author, reviewDate, content, reply, moderation },
}: ReviewProps) {
  // TODO review and update this logic
  // * not from vid
  const reviewDateObj = new Date(reviewDate || "");
  const currentDateObj = new Date();
  const isSameDay =
    reviewDateObj.toDateString() === currentDateObj.toDateString();
  const displayDate = isSameDay
    ? `today at ${currentDateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : `on ${reviewDateObj.toLocaleDateString()}`;
  const isPendingModeration =
    moderation?.moderationStatus ===
    reviews.ModerationModerationStatus.IN_MODERATION;

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div
        className={cn(
          "space-y-1.5",
          isPendingModeration && "animate-pulse text-muted-foreground",
        )}
      >
        {isPendingModeration && <p className="font-bold">Pending approval</p>}
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // TODO how does this styling work?
            <StarIcon
              className={cn(
                "size-5 text-primary",
                i < (content?.rating || 0) && "fill-primary",
              )}
              key={i}
            />
          ))}
          {content?.title && <h3 className="font-bold">{content.title}</h3>}
        </div>
        <p className="text-sm text-muted-foreground">
          by {author?.authorName || "Anonymous"}{" "}
          {/* TODO why do we pass a fragment? */}
          {reviewDate && <>{displayDate}</>}
        </p>
        {content?.body && <p className="whitespace-pre-line">{content.body}</p>}
        {!!content?.media?.length && (
          <div className="flex flex-wrap gap-2">
            {/* // * display each img/vid  */}
            {content.media.map((media) => (
              <MediaAttachment key={media.image || media.video} media={media} />
            ))}
          </div>
        )}
      </div>
      {reply?.message && (
        <div className="ms-10 mt-2.5 space-y-1 border-t pt-2.5">
          <div className="flex items-center gap-2">
            <CornerDownRight className="size-5" />
            {/* TODO diff b/w CSS and width/height props on image? */}
            <Image
              className="size-5"
              src={logo}
              alt="Awesome Sauce Shop Logo"
              width={24}
              height={24}
            />
            <span className="font-bold">Awesome Sauce Shop Team</span>
          </div>
          <p className="whitespace-pre-line">{reply.message}</p>
        </div>
      )}
    </div>
  );
}

export function ProductReviewsLoadingSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div className="space-y-1.5" key={i}>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-72" />
        </div>
      ))}
    </div>
  );
}

interface MediaAttachmentProps {
  media: reviews.Media;
}

function MediaAttachment({ media }: MediaAttachmentProps) {
  if (media.image) {
    return (
      <Zoom>
        <WixImage
          // object-contain
          className="max-h-40 max-w-40"
          mediaIdentifier={media.image}
          alt="Review media"
          scaleToFill={false}
        />
      </Zoom>
    );
  }

  if (media.video) {
    return (
      <video className="max-h-40 max-w-40" controls>
        <source src={wixMedia.getVideoUrl(media.video).url} type="video/mp4" />
      </video>
    );
  }

  return <span className="text-destructive">Unsupported media type</span>;
}
