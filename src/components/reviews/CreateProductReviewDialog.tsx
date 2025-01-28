import { products } from "@wix/stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProductReview } from "@/hooks/reviews";
import { Label } from "../ui/label";
import WixImage from "../WixImage";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import LoadingButton from "../LoadingButton";
import StarRatingInput from "./StarRatingInput";
import { useRef } from "react";
import { Button } from "../ui/button";
import { CircleAlert, ImageUp, Loader2, X } from "lucide-react";
import useMediaUpload, { MediaAttachment } from "./useMediaUpload";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// * did not use .optional() bc will pass undefined and not an empty string
const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Must be at least 5 characters")
    .max(100, "Can't be longer than 100 characters")
    .or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, "Must be at least 10 characters")
    .max(3000, "Can't be longer than 3000 characters")
    .or(z.literal("")),
  rating: z.number().int().min(1, "Please rate this product"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProductReviewDialogProps {
  product: products.Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

// TODO figure out why we need both zod and React-Hook-Form? How does it all work below for React-Hook-Form?
export default function CreateProductReviewDialog({
  product,
  open,
  onOpenChange,
  onSubmitted,
}: CreateProductReviewDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      rating: 0,
    },
  });
  const mutation = useCreateProductReview();
  const { attachments, startUpload, removeAttachment, clearAttachments } =
    useMediaUpload();
  const router = useRouter();

  async function onSubmit({ title, body, rating }: FormValues) {
    if (!product._id) {
      throw Error("Product ID is missing");
    }

    // TODO why do we pass an obj w/ onSuccess rather than directly inside the useCreateProductReview() hook?
    mutation.mutate(
      {
        productId: product._id,
        title,
        body,
        rating,
        media: attachments
          .filter((m) => m.url)
          .map((m) => ({
            url: m.url!,
            type: m.file.type.startsWith("image") ? "image" : "video",
          })),
      },
      // TODO can we use optimistic updates instead? Purpose of router?
      {
        onSuccess: () => {
          form.reset();
          clearAttachments();
          onSubmitted();
          setTimeout(() => {
            router.refresh();
          }, 2000);
        },
      },
    );
  }

  const uploadInProgress = attachments.some((m) => m.state === "uploading");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Did you like this product? Share your thoughts with other customers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="flex items-center gap-3">
              <WixImage
                mediaIdentifier={product.media?.mainMedia?.image?.url}
                width={75}
                height={75}
              />
              <span className="font-bold">{product.name}</span>
            </div>
          </div>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <StarRatingInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell others about your experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Write a detailed review to help other customers.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-5">
                {attachments.map((attach) => (
                  <AttachmentPreview
                    key={attach.id}
                    attachment={attach}
                    onRemoveClick={removeAttachment}
                  />
                ))}
                <AddMediaButton
                  onFileSelected={startUpload}
                  disabled={
                    attachments.filter((a) => a.state !== "failed").length >= 5
                  }
                />
              </div>
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                disabled={uploadInProgress}
              >
                Submit
              </LoadingButton>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddMediaButtonProps {
  onFileSelected: (file: File) => void;
  disabled: boolean;
}

function AddMediaButton({ onFileSelected, disabled }: AddMediaButtonProps) {
  // * when button clicked, uses ref to trigger file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        title="Add media"
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageUp />
      </Button>
      <input
        className="sr-only hidden"
        id="upload-file"
        type="file"
        accept="image/*, video/*"
        ref={fileInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFileSelected(files[0]);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

// TODO edit and add this to button, what are benefits to label for input?
{
  /* <div className="flex w-full items-center justify-center">
        <label
          htmlFor="dropzone-file"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600 dark:hover:bg-gray-800"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <svg
              className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" />
        </label>
      </div> */
}

interface AttachmentPreviewProps {
  attachment: MediaAttachment;
  onRemoveClick: (id: string) => void;
}

function AttachmentPreview({
  attachment: { id, file, state, url },
  onRemoveClick,
}: AttachmentPreviewProps) {
  // TODO purpose of URL.createObjectURL()? Check why used WixImage rather than Next/Image at 6:24:00

  return (
    <div
      className={cn(
        "relative size-fit",
        state === "failed" && "outline outline-destructive",
      )}
    >
      {file.type.startsWith("image") ? (
        <WixImage
          className={cn(
            "max-h-24 max-w-24 object-contain",
            !url && "opacity-50",
          )}
          mediaIdentifier={url}
          scaleToFill={false}
          placeholder={URL.createObjectURL(file)}
          alt="Attachment preview"
        />
      ) : (
        <video
          className={cn("max-h-24 max-w-24", !url && "opacity-50")}
          controls
        >
          <source src={url || URL.createObjectURL(file)} type={file.type} />
        </video>
      )}
      {state === "uploading" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {state === "failed" && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
          title="Failed to upload media"
        >
          <CircleAlert className="text-destructive" />
        </div>
      )}
      <button
        className="absolute -right-1.5 -top-1.5 border bg-background"
        title="Remove media"
        type="button"
        onClick={() => onRemoveClick(id)}
      >
        <X size={20} />
      </button>
    </div>
  );
}
