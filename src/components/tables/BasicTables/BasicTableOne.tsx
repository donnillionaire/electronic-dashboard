"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Modal from "../../modal/Modal";
import ListingStepperForm from "../../form/form-elements/ListingFormInputs";
import Input from "../../form/input/InputField";
import BASE_URL from "../../url";

const API_BASE = String(BASE_URL || "").replace(/\/$/, "");

type Product = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  sku?: string;
  priceCents: number;
  compareAtCents?: number;
  currency: string;
  stock?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  images: any;
  specs?: any;
  tags?: any;
  variants?: any;
  status: "Active" | "Draft" | "Archived";
  createdAt?: string;
  updatedAt?: string;
};

interface RowVM {
  id: number;
  image: string;
  title: string;
  meta: string;
  status: "Active" | "Draft" | "Archived";
  price: string;
  stock: string;
  raw: Product;
}

function safeParseJSON<T = any>(v: any, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "object") return v as T;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function normalizeImageUrl(url: string): string {
  if (!url) return "/images/user/user-17.jpg";
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

function safeImages(product: Product): string[] {
  const value = product.images;

  if (Array.isArray(value)) return value.filter(Boolean).map(String);

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const parsed = safeParseJSON<any[]>(trimmed, []);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    }

    return trimmed ? [trimmed] : [];
  }

  return [];
}

function safeFirstImage(product: Product): string {
  const images = safeImages(product);
  if (images.length > 0) return normalizeImageUrl(images[0]);
  return "/images/user/user-17.jpg";
}

function moneyCents(priceCents: number, currency = "USD") {
  const value = priceCents ?? 0;
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function buildSearchText(product: Product, row: RowVM): string {
  const rawTags = safeParseJSON<any>(product.tags, []);
  const specs = safeParseJSON<Record<string, unknown>>(product.specs, {});
  const rawVariants = safeParseJSON<any>(product.variants, []);
  const tags = Array.isArray(rawTags) ? rawTags : [rawTags];
  const variants = Array.isArray(rawVariants) ? rawVariants : [rawVariants];

  return [
    product.id,
    product.title,
    product.slug,
    product.description,
    product.brand,
    product.category,
    product.subcategory,
    product.sku,
    product.currency,
    product.status,
    product.priceCents,
    product.compareAtCents,
    product.stock,
    row.price,
    row.stock,
    row.meta,
    ...tags,
    JSON.stringify(specs),
    JSON.stringify(variants),
  ]
    .filter((value) => value != null && String(value).trim() !== "")
    .join(" ")
    .toLowerCase();
}

export default function BasicTableProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [page] = useState(1);
  const limit = 100;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [selected, setSelected] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/products?page=${page}&limit=${limit}`,
        { method: "GET" }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch products");
      }

      const json = await res.json();

      const items: Product[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.items)
          ? (json.items as Product[])
          : [];

      setData(items);
    } catch (e: any) {
      setErr(e?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await fetchProducts();
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const tableData: RowVM[] = useMemo(() => {
    return data.map((product) => ({
      id: product.id,
      image: safeFirstImage(product),
      title: product.title || `Product #${product.id}`,
      meta: `${product.brand || "-"} - ${product.category || "-"}${
        product.subcategory ? `/${product.subcategory}` : ""
      }`,
      status: product.status || "Active",
      price: moneyCents(product.priceCents, product.currency),
      stock: typeof product.stock === "number" ? String(product.stock) : "-",
      raw: product,
    }));
  }, [data]);

  const filteredTableData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tableData;

    return tableData.filter((row) => buildSearchText(row.raw, row).includes(query));
  }, [search, tableData]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const openEdit = (product: Product) => {
    setMode("edit");
    setSelected(product);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setIsModalOpen(true);
  };

  const openDelete = (product: Product) => {
    setDeleteErr(null);
    setDeleteTarget(product);
  };

  const closeDelete = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteErr(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteErr(null);

    try {
      const res = await fetch(`${API_BASE}/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete product");
      }

      setData((current) => current.filter((product) => product.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      setDeleteErr(e?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const createInitialValue: Partial<Product> = {
    title: "",
    slug: "",
    description: "",
    brand: "",
    category: "",
    subcategory: "",
    sku: "",
    priceCents: 0,
    compareAtCents: undefined,
    currency: "KES",
    stock: 0,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    images: [],
    specs: {},
    tags: [],
    variants: null,
    status: "Active",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading products...
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="text-sm text-red-500">{err}</div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          <div className="w-full sm:max-w-sm">
            <Input
              type="text"
              placeholder="Search products by title, brand, SKU, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <span className="text-base leading-none">+</span>
            Add Listing
          </button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Product
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Stock
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredTableData.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                        <img
                          width={40}
                          height={40}
                          src={row.image}
                          alt={row.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "/images/user/user-17.jpg";
                          }}
                          className="h-10 w-10 object-cover"
                        />
                      </div>

                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {row.title}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {row.meta}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        row.status === "Active"
                          ? "success"
                          : row.status === "Draft"
                            ? "warning"
                            : "error"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {row.price}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {row.stock}
                  </TableCell>

                  <TableCell className="px-5 py-3 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(row.raw);
                        }}
                        className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        title="Edit product"
                        aria-label="Edit product"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(row.raw);
                        }}
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-500/10"
                        title="Delete product"
                        aria-label="Delete product"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTableData.length === 0 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              {search.trim()
                ? `No products match "${search.trim()}".`
                : "No products found."}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[980px]">
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain p-6 lg:p-10">
          {mode === "edit" && selected && (
            <ListingStepperForm
              initialValue={{
                ...selected,
                images: safeImages(selected),
                specs: safeParseJSON(selected.specs, selected.specs ?? {}),
                tags: safeParseJSON(selected.tags, selected.tags ?? []),
                variants: safeParseJSON(selected.variants, selected.variants ?? null),
              }}
              onSaved={() => {
                closeModal();
                fetchProducts();
              }}
            />
          )}

          {mode === "create" && (
            <ListingStepperForm
              initialValue={createInitialValue}
              onSaved={() => {
                closeModal();
                fetchProducts();
              }}
            />
          )}
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={closeDelete} className="max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete product?
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {deleteTarget
              ? `This will permanently delete "${deleteTarget.title || `Product #${deleteTarget.id}`}".`
              : "This action cannot be undone."}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            This action cannot be undone.
          </p>

          {deleteErr && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
              {deleteErr}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeDelete}
              disabled={isDeleting}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
