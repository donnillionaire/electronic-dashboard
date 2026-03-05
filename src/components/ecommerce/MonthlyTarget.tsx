import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import BASE_URL from "../url";

// import {BASE_URL} from "../../url.ts"


// const API_BASE = "http://localhost:8080";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;


  const API_BASE = BASE_URL



type Metric = { value: number; changePct: number };
type DashboardMetricsResponse = {
  totalViews: Metric;
  activeListings: Metric; // NOTE: your backend currently uses this key for total listings
};

type ViewsSummaryResponse = {
  targetMonthlyViews: number;
  viewsToday: number;
  viewsThisMonth: number;
  viewsLastMonth: number;
};

function pctChange(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return ((current - prev) / prev) * 100;
}

export default function MonthlyTarget() {
  const [isOpen, setIsOpen] = useState(false);

  const [summary, setSummary] = useState<ViewsSummaryResponse | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [summaryRes, metricsRes] = await Promise.all([
          fetch(`${API_BASE}/api/dashboard/views/summary`),
          fetch(`${API_BASE}/api/dashboard/metrics`),
        ]);

        if (!summaryRes.ok) throw new Error(`summary failed: ${summaryRes.status}`);
        if (!metricsRes.ok) throw new Error(`metrics failed: ${metricsRes.status}`);

        const s = (await summaryRes.json()) as ViewsSummaryResponse;
        const m = (await metricsRes.json()) as DashboardMetricsResponse;

        if (!mounted) return;
        setSummary(s);
        setMetrics(m);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function toggleDropdown() {
    setIsOpen((v) => !v);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const target = summary?.targetMonthlyViews ?? 0;
  const viewsThisMonth = summary?.viewsThisMonth ?? 0;
  const viewsLastMonth = summary?.viewsLastMonth ?? 0;
  const viewsToday = summary?.viewsToday ?? 0;

  const progressPct = useMemo(() => {
    if (!target || target <= 0) return 0;
    const pct = (viewsThisMonth / target) * 100;
    return Math.max(0, Math.min(100, Number(pct.toFixed(2))));
  }, [viewsThisMonth, target]);

  const monthDeltaPct = useMemo(() => {
    return Number(pctChange(viewsThisMonth, viewsLastMonth).toFixed(2));
  }, [viewsThisMonth, viewsLastMonth]);

  const badgeIsUp = monthDeltaPct >= 0;
  const badgeText = `${badgeIsUp ? "+" : ""}${monthDeltaPct}%`;

  const listingsTotal = metrics?.activeListings?.value ?? 0; // (your backend uses activeListings key for total listings)

  const series = useMemo(() => [progressPct], [progressPct]);

  const options: ApexOptions = useMemo(() => ({
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val: number) => `${val.toFixed(2)}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  }), []);

  const message = useMemo(() => {
    if (!summary) return "Loading insights...";
    if (viewsLastMonth === 0 && viewsThisMonth > 0) {
      return `You have ${viewsThisMonth} views this month. Great start — keep it up!`;
    }
    if (monthDeltaPct >= 0) {
      return `You have ${viewsThisMonth} views this month. That's higher than last month. Keep up the good work!`;
    }
    return `You have ${viewsThisMonth} views this month. It's lower than last month — consider boosting traffic.`;
  }, [summary, viewsThisMonth, viewsLastMonth, monthDeltaPct]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Target you’ve set for each month
            </p>
            {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          </div>

          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>

          {/* badge from real month-over-month delta */}
          {!loading && !err && (
            <span
              className={[
                "absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium",
                badgeIsUp
                  ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                  : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
              ].join(" ")}
            >
              {badgeText}
            </span>
          )}
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {loading ? "Loading..." : message}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Target
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {target ? `${target} Views` : "—"}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Listings
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {listingsTotal ? `${listingsTotal}` : "—"}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Today
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {summary ? `${viewsToday} Views` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
