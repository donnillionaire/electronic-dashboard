

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
// import BASE_URL from "../../../url";
import ListingStepperForm from "../../form/form-elements/ListingFormInputs";
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

  images: any; // jsonb -> array OR stringified JSON
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

/* ---------------- Helpers ---------------- */

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
  const v = product.images;

  if (Array.isArray(v)) return v.filter(Boolean).map(String);

  if (typeof v === "string") {
    const trimmed = v.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const arr = safeParseJSON<any[]>(trimmed, []);
      return Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
    }

    return trimmed ? [trimmed] : [];
  }

  return [];
}

function safeFirstImage(product: Product): string {
  const imgs = safeImages(product);
  if (imgs.length > 0) return normalizeImageUrl(imgs[0]);
  return "/images/user/user-17.jpg";
}

function moneyCents(priceCents: number, currency = "USD") {
  const val = (priceCents ?? 0) / 100;
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/* ---------------- Component ---------------- */

export default function BasicTableProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // optional pagination
  const [page] = useState(1);
  const limit = 20;

  // modal (used for both create + edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [selected, setSelected] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/products?page=${page}&limit=${limit}&status=Active`,
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
    return data.map((p) => ({
      id: p.id,
      image: safeFirstImage(p),
      title: p.title || `Product #${p.id}`,
      meta: `${p.brand || "—"} • ${p.category || "—"}${p.subcategory ? `/${p.subcategory}` : ""
        }`,
      status: p.status || "Active",
      price: moneyCents(p.priceCents, p.currency),
      stock: typeof p.stock === "number" ? String(p.stock) : "—",
      raw: p,
    }));
  }, [data]);

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

  // blank/default for create
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
    currency: "USD",
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
        {/* Top bar */}
        <div className="flex items-center justify-end gap-2 border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
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
              {tableData.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                        <img
                          width={40}
                          height={40}
                          src={row.image}
                          alt={row.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.src = "/images/user/user-17.jpg";
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

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(row.raw);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                      title="Edit product"
                      aria-label="Edit product"
                    >
                      <span className="text-xl leading-none">⋯</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {tableData.length === 0 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              No products found.
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
    </>
  );
}