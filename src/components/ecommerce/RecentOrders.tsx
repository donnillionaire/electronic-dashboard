

"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";

// const API_BASE = "http://localhost:8080";
import {BASE_URL} from "../../url.ts"


  const API_BASE = BASE_URL

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

type Listing = {
  id: number;
  title: string;
  category: string;
  subcategory: string;
  price: number;
  currency: string;
  status?: "Active" | "Pending" | "Cancel";
  listedOn?: string | null;
  createdAt?: string;
  images: any; // JSONB: array or string
};

type RecentListingsResponse = {
  items: Listing[];
  limit: number;
};

function safeParseJSON<T>(v: any, fallback: T): T {
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

function safeFirstImage(listing: Listing): string {
  const imgs = safeParseJSON<string[]>(listing.images, []);
  console.log("imgs:->", imgs)
  if (Array.isArray(imgs) && imgs.length > 0) return  imgs[0];
  return "/images/product/product-01.jpg"; // fallback
}

function formatDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString();
}

export default function RecentOrders() {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${API_BASE}/api/listings/recent?limit=10`);
        if (!res.ok) throw new Error((await res.text()) || "Failed to load recent properties");

        const json = (await res.json()) as RecentListingsResponse;
        if (!mounted) return;

        setData(json.items || []);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Fetch failed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return data.map((l) => ({
      id: l.id,
      title: l.title || `Listing #${l.id}`,
      meta: `${l.category} • ${l.subcategory}`,
      price: `${l.currency} ${Number(l.price || 0).toLocaleString()}`,
      date: formatDate(l.listedOn || l.createdAt),
      status: (l.status || "Pending") as "Active" | "Pending" | "Cancel",
      image: safeFirstImage(l),
    }));
  }, [data]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Properties
          </h3>
        </div>
      </div>

      {loading && (
        <div className="py-6 text-sm text-gray-500 dark:text-gray-400">
          Loading recent properties...
        </div>
      )}

      {!loading && err && (
        <div className="py-6 text-sm text-red-500">{err}</div>
      )}

      {!loading && !err && (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Property
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        <img
                          src={row.image}
                          className="h-[50px] w-[50px] object-cover"
                          alt={row.title}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {row.title}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {row.meta}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {row.price}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {row.date}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        row.status === "Active"
                          ? "success"
                          : row.status === "Pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell className="py-6 text-sm text-gray-500 dark:text-gray-400">
                    No recent properties found.
                  </TableCell>
                  {/* <TableCell />
                  <TableCell />
                  <TableCell /> */}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
