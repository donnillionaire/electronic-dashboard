// import {
//   ArrowDownIcon,
//   ArrowUpIcon,
//   BoxIconLine,
//   GroupIcon,
// } from "../../icons";
// import Badge from "../ui/badge/Badge";

// export default function EcommerceMetrics() {
//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
//       {/* <!-- Metric Item Start --> */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Total Views
//             </span>

//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               3,782
//             </h4>
//           </div>
//           <Badge color="success">
//             <ArrowUpIcon />
//             11.01%
//           </Badge>
//         </div>
//       </div>
//       {/* <!-- Metric Item End --> */}

//       {/* <!-- Metric Item Start --> */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
//         </div>
//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Active Listings
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               5,359
//             </h4>
//           </div>

//           <Badge color="error">
//             <ArrowDownIcon />
//             9.05%
//           </Badge>
//         </div>
//       </div>
//       {/* <!-- Metric Item End --> */}
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

import {BASE_URL} from "../../url.ts"


// const API_BASE = "http://localhost:8080";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const API_BASE = BASE_URL


type Metric = {
  value: number;
  changePct: number; // positive or negative
};

type DashboardMetricsResponse = {
  totalViews: Metric;
  activeListings: Metric;
};

function formatPct(n: number) {
  // show absolute value in the badge, arrow/color shows direction
  return `${Math.abs(n).toFixed(2)}%`;
}

function formatInt(n: number) {
  return Number(n || 0).toLocaleString();
}

export default function EcommerceMetrics() {
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${API_BASE}/api/dashboard/metrics`);
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Request failed: ${res.status}`);
        }

        const json = (await res.json()) as DashboardMetricsResponse;
        if (!mounted) return;
        setData(json);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load metrics");
        setData(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const totalViews = data?.totalViews;
  const activeListings = data?.activeListings;

  const totalViewsUp = useMemo(() => (totalViews?.changePct ?? 0) >= 0, [totalViews?.changePct]);
  const activeListingsUp = useMemo(() => (activeListings?.changePct ?? 0) >= 0, [activeListings?.changePct]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Views */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Views
            </span>

            {loading ? (
              <div className="mt-2 h-6 w-20 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
            ) : (
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatInt(totalViews?.value ?? 0)}
              </h4>
            )}

            {err && (
              <div className="mt-2 text-xs text-red-600">{err}</div>
            )}
          </div>

          {!loading && !err && totalViews && (
            <Badge color={totalViewsUp ? "success" : "error"}>
              {totalViewsUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {formatPct(totalViews.changePct)}
            </Badge>
          )}
        </div>
      </div>

      {/* Active Listings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Listings
            </span>

            {loading ? (
              <div className="mt-2 h-6 w-20 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
            ) : (
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatInt(activeListings?.value ?? 0)}
              </h4>
            )}

            {err && (
              <div className="mt-2 text-xs text-red-600">{err}</div>
            )}
          </div>

          {!loading && !err && activeListings && (
            <Badge color={activeListingsUp ? "success" : "error"}>
              {activeListingsUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {formatPct(activeListings.changePct)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
