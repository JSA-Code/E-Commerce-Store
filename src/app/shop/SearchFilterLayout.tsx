"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsSort } from "@/wix-api/products";
import { collections } from "@wix/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";

interface SearchFilterLayoutProps {
  collections: collections.Collection[];
  children: React.ReactNode;
}

export default function SearchFilterLayout({
  children,
  collections,
}: SearchFilterLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    collection: searchParams.getAll("collection"),
    price_min: searchParams.get("price_min") || undefined,
    price_max: searchParams.get("price_max") || undefined,
    sort: searchParams.get("sort") || undefined,
  });
  const [isPending, startTransition] = useTransition();

  function updateFilters(updates: Partial<typeof optimisticFilters>) {
    const newState = { ...optimisticFilters, ...updates };
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(newState).forEach(([key, value]) => {
      newSearchParams.delete(key);

      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      } else if (value) {
        // * check other filters if valid (eg. an empty get("price_min") returns null)
        newSearchParams.set(key, value);
      }
    });

    newSearchParams.delete("Page");

    // * startTransition() sets actions to low priority, IOW can click away w/o waiting for full load, uses most recent action and discards the rest
    // ? used bc of new req router.push and children page.tsx req searchParams on server, didn't use reactQuery bc overkill
    // * optimistic updates sets current state w/o waiting for server and once data is returned from server will then rerender w/ it unless error returned and reverted back to initial state
    startTransition(() => {
      setOptimisticFilters(newState);
      router.push(`?${newSearchParams.toString()}`);
    });
  }

  return (
    // TODO recreate design for filters
    <main className="group flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      <aside
        className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64"
        data-pending={isPending ? "" : undefined}
      >
        <CollectionFilter
          collections={collections}
          selectedCollectionIds={optimisticFilters.collection}
          // * passes callback arrow func which grabs arg (eg. param collectionIds) and execs updateFilters w/ obj
          updateCollectionIds={(collectionIds) =>
            updateFilters({ collection: collectionIds })
          }
        />
        <PriceFilter
          minDefaultInput={optimisticFilters.price_min}
          maxDefaultInput={optimisticFilters.price_max}
          updatePriceRange={(priceMin, priceMax) =>
            updateFilters({ price_min: priceMin, price_max: priceMax })
          }
        />
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex justify-center lg:justify-end">
          <SortFilter
            sort={optimisticFilters.sort}
            updateSort={(sort) => updateFilters({ sort })}
          />
        </div>
        {children}
      </div>
    </main>
  );
}

interface CollectionFilterProps {
  collections: collections.Collection[];
  selectedCollectionIds: string[];
  updateCollectionIds: (collectionIds: string[]) => void;
}

function CollectionFilter({
  collections,
  selectedCollectionIds,
  updateCollectionIds,
}: CollectionFilterProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-bold">Collections</h2>
      <ul className="space-y-1.5">
        {collections.map((collection) => {
          const collectionId = collection._id;

          if (!collectionId) return null;

          return (
            <li key={collectionId}>
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <Checkbox
                  id={collectionId}
                  checked={selectedCollectionIds.includes(collectionId)}
                  onCheckedChange={(checked) => {
                    updateCollectionIds(
                      checked
                        ? [...selectedCollectionIds, collectionId]
                        : selectedCollectionIds.filter(
                            (id) => id !== collectionId,
                          ),
                    );
                  }}
                />
                <span className="line-clamp-1 break-all">
                  {collection.name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {selectedCollectionIds.length > 0 && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => updateCollectionIds([])}
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface PriceFilterProps {
  minDefaultInput: string | undefined;
  maxDefaultInput: string | undefined;
  updatePriceRange: (min: string | undefined, max: string | undefined) => void;
}

function PriceFilter({
  minDefaultInput,
  maxDefaultInput,
  updatePriceRange,
}: PriceFilterProps) {
  // * input fields states are not managed by URL therefore requires useState
  const [minInput, setMinInput] = useState(minDefaultInput);
  const [maxInput, setMaxInput] = useState(maxDefaultInput);

  useEffect(() => {
    setMinInput(minDefaultInput || "");
    setMaxInput(maxDefaultInput || "");
  }, [minDefaultInput, maxDefaultInput]);

  // * not using React Hook Form bc validation not req
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    updatePriceRange(minInput, maxInput);
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold">Price Range</h2>
      <form className="flex items-center gap-2" onSubmit={onSubmit}>
        <Input
          className="w-20"
          type="number"
          name="min"
          placeholder="Min"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
        />
        <span>-</span>
        <Input
          className="w-20"
          type="number"
          name="max"
          placeholder="Max"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
        />
        <Button className="font-bold" type="submit">
          Go
        </Button>
      </form>
      {(!!minDefaultInput || !!maxDefaultInput) && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => updatePriceRange(undefined, undefined)}
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface SortFilterProps {
  sort: string | undefined;
  updateSort: (value: ProductsSort) => void;
}

function SortFilter({ sort, updateSort }: SortFilterProps) {
  return (
    <Select value={sort || "last_updated"} onValueChange={updateSort}>
      <SelectTrigger className="w-fit gap-2 text-start font-bold">
        <span>
          Sort by: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last_updated">Newest</SelectItem>
        <SelectItem value="price_asc">Price (Low to high)</SelectItem>
        <SelectItem value="price_desc">Price (High to low)</SelectItem>
      </SelectContent>
    </Select>
  );
}
