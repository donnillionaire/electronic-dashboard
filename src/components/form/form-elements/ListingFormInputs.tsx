

"use client";

import { useMemo, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import Modal from "../../modal/Modal";
import BASE_URL from "../../url";
// import BASE_URL from "../../../url";

type ListingStatus = "Pending" | "Draft" | "Active" | "Archived";

export type ListingFormState = {
  id: number;

  title: string;
  slug: string;
  description: string;

  brand: string;
  category: string;
  subcategory: string;
  sku: string;

  priceCents: number;
  compareAtCents: number;
  currency: string;

  stock: number;

  images: string[];

  // ✅ flags
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;

  // dynamic “features”
  specs: Record<string, any>;

  tags: string[];

  variants?: any,


  contact: {
    name: string;
    company: string;
    phone: string;
    email: string;
    whatsapp: string;
  };

  status: ListingStatus;
};

const API_BASE = String(BASE_URL || "").replace(/\/$/, "");
const UPLOAD_ENDPOINT = `${API_BASE}/api/upload-pic`;

const CURRENCY_OPTIONS = [
  { value: "KES", label: "KES" },
  { value: "USD", label: "USD" },
];

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Active", label: "Active" },
  { value: "Archived", label: "Archived" },
];

const CATEGORY_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "tv", label: "TV" },
  { value: "audio", label: "Audio" },
  { value: "laptop", label: "Laptop" },
  { value: "camera", label: "Camera" },
  { value: "accessory", label: "Accessory" },
  { value: "refrigerator", label: "Refrigerator" },
  { value: "microwaves", label: "Microwaves" },
  { value: "kitchen", label: "Kitchen" },
  { value: "washers", label: "Washers" },
  { value: "freezer", label: "Freezer" },
  { value: "airconditioners", label: "Airconditioners" },
];

const SUBCATEGORY_BY_CATEGORY: Record<string, { value: string; label: string }[]> =
{
  phone: [
    { value: "smartphone", label: "Smartphone" },
    { value: "feature-phone", label: "Feature phone" },
  ],
  tv: [
    { value: "smart-tv", label: "Smart TV" },
    { value: "oled", label: "OLED" },
    { value: "qled", label: "QLED" },
  ],
  audio: [
    { value: "earbuds", label: "Earbuds" },
    { value: "headphones", label: "Headphones" },
    { value: "soundbar", label: "Soundbar" },
    { value: "speaker", label: "Speaker" },
  ],
  laptop: [
    { value: "ultrabook", label: "Ultrabook" },
    { value: "gaming", label: "Gaming" },
  ],
  camera: [
    { value: "mirrorless", label: "Mirrorless" },
    { value: "dslr", label: "DSLR" },
    { value: "action", label: "Action camera" },
  ],
  accessory: [
    { value: "charger", label: "Charger" },
    { value: "case", label: "Case" },
    { value: "cable", label: "Cable" },
  ],
  refrigerator: [{ value: "refrigerator", label: "Refrigerator" }],
  microwaves: [{ value: "microwave", label: "Microwave" }],
  kitchen: [{ value: "kitchen-appliance", label: "Kitchen Appliance" }],
  washers: [{ value: "washer", label: "Washer" }],
  freezer: [{ value: "freezer", label: "Freezer" }],
  airconditioners: [{ value: "airconditioner", label: "Airconditioner" }],
};

const STEPS = [
  { key: "basic", title: "Basic" },
  { key: "pricing", title: "Pricing & Stock" },
  { key: "media", title: "Images" },
  { key: "specs", title: "Features (Specs)" },
  { key: "review", title: "Review" },
] as const;

function defaultListing(): ListingFormState {
  return {
    id: 0,
    title: "",
    slug: "",
    description: "",

    brand: "",
    category: "phone",
    subcategory: "smartphone",
    sku: "",

    priceCents: 0,
    compareAtCents: 0,
    currency: "KES",
    stock: 0,

    images: [],

    // ✅ default flags
    isNew: false,
    isBestSeller: false,
    isFeatured: false,



    specs: {},
    tags: [],

    contact: { name: "", company: "", phone: "", email: "", whatsapp: "" },
    status: "Pending",
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeImageSrc(url: string) {
  if (!url) return "/images/user/user-17.jpg";
  if (/^https?:\/\//i.test(url)) return url; // absolute already
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

// Small checkbox UI helper (works with your Tailwind setup)
function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export default function ListingStepperForm({
  initialValue,
  onSaved,
}: {
  initialValue?: Partial<ListingFormState>;
  onSaved?: () => void;
}) {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<ListingFormState>(() => {
    const base = defaultListing();
    return {
      ...base,
      ...(initialValue as any),

      // ensure flags are boolean even if backend returns null/undefined
      isNew: Boolean((initialValue as any)?.isNew ?? base.isNew),
      isBestSeller: Boolean((initialValue as any)?.isBestSeller ?? base.isBestSeller),
      isFeatured: Boolean((initialValue as any)?.isFeatured ?? base.isFeatured),

      specs: { ...(base.specs ?? {}), ...(initialValue?.specs ?? {}) },
      tags: Array.isArray(initialValue?.tags) ? (initialValue?.tags as any) : base.tags,
      images: Array.isArray(initialValue?.images) ? (initialValue?.images as any) : base.images,
    };
  });

  // If slug exists from initialValue, treat it as "touched"
  const [slugTouched, setSlugTouched] = useState<boolean>(() => !!initialValue?.slug?.trim());

  // image upload modal
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const updateTop = <K extends keyof ListingFormState>(
    key: K,
    value: ListingFormState[K]
  ) => setForm((p) => ({ ...p, [key]: value }));

  const subcategoryOptions = SUBCATEGORY_BY_CATEGORY[form.category] || [];

  // tags
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    setForm((p) => (p.tags.includes(t) ? p : { ...p, tags: [...p.tags, t] }));
  };
  const removeTag = (tag: string) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== tag) }));

  // specs editor (key/value)
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");

  const addSpec = () => {
    const k = specKey.trim();
    const v = specVal.trim();
    if (!k || !v) return;
    setForm((p) => ({ ...p, specs: { ...(p.specs || {}), [k]: v } }));
    setSpecKey("");
    setSpecVal("");
  };

  const removeSpec = (k: string) => {
    setForm((p) => {
      const copy = { ...(p.specs || {}) };
      delete copy[k];
      return { ...p, specs: copy };
    });
  };

  // images
  const addImageUrls = (urls: string[]) =>
    updateTop("images", Array.from(new Set([...(form.images || []), ...urls])));

  const removeImageUrl = (url: string) =>
    updateTop(
      "images",
      (form.images || []).filter((u) => u !== url)
    );

  const openImagesModal = () => {
    setUploadError(null);
    setSelectedFiles([]);
    setIsImagesModalOpen(true);
  };

  const closeImagesModal = () => {
    setIsImagesModalOpen(false);
    setSelectedFiles([]);
    setUploadError(null);
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const onlyImages = arr.filter((f) => f.type.startsWith("image/"));
    setSelectedFiles(onlyImages);
  };

  const removePickedFile = (idx: number) =>
    setSelectedFiles((p) => p.filter((_, i) => i !== idx));

  const previewUrls = useMemo(
    () => selectedFiles.map((f) => URL.createObjectURL(f)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFiles.map((f) => `${f.name}-${f.size}-${f.lastModified}`).join("|")]
  );

  useMemo(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls.join("|")]);

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("pic", file);

        const res = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: fd });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Upload failed");
        }

        const data = (await res.json()) as { image_url?: string; url?: string };
        const url = data.image_url || data.url;
        if (!url) throw new Error("Upload ok but missing url in response");

        uploadedUrls.push(url);
        console.log("uploaded", uploadedUrls)

      }

      addImageUrls(uploadedUrls);
      closeImagesModal();
    } catch (e: any) {
      setUploadError(e?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const submitListing = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const finalSlug = (form.slug || "").trim() || slugify(form.title);

      const payload = {
        title: form.title,
        slug: finalSlug,
        description: form.description,

        brand: form.brand,
        category: form.category,
        subcategory: form.subcategory,
        sku: "default",

        priceCents: Number(form.priceCents || 0),
        compareAtCents: Number(form.compareAtCents || 0),
        currency: form.currency,
        stock: Number(form.stock || 0),

        images: form.images || [],
        specs: form.specs || {},
        tags: form.tags || [],

        // ✅ include flags
        isNew: Boolean(form.isNew),
        isBestSeller: Boolean(form.isBestSeller),
        isFeatured: Boolean(form.isFeatured),

        status: form.status,
      };

      const isEdit = !!form.id && form.id > 0;
      const url = isEdit ? `${API_BASE}/api/products/${form.id}` : `${API_BASE}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save listing");
      }

      const saved = await res.json();
      updateTop("id", Number(saved?.id ?? form.id));
      updateTop("slug", String(saved?.slug ?? finalSlug));
      setSubmitSuccess(`Saved successfully (ID: ${saved?.id ?? form.id})`);
      onSaved?.();
    } catch (e: any) {
      setSubmitError(e?.message || "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // step nav
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canContinue = useMemo(() => {
    const k = STEPS[step].key;
    if (k === "basic") return form.title.trim().length > 0 && form.category.trim().length > 0;
    if (k === "pricing") return Number(form.priceCents) >= 0;
    return true;
  }, [step, form]);

  return (
    <ComponentCard title={form.id ? `Edit Listing #${form.id}` : "Create Listing"}>
      <div className="space-y-6">
        {/* Stepper header */}
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, idx) => {
            const active = idx === step;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(idx)}
                className={[
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition",
                    active
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-300",
                  ].join(" ")}
                >
                  {idx + 1}
                </span>
                <span className="whitespace-nowrap">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="mb-3 text-sm font-semibold">
            Step {step + 1}: {STEPS[step].title}
          </div>

          {/* BASIC */}
          {STEPS[step].key === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label>ID</Label>
                  <Input
                    type="number"
                    value={form.id}
                    onChange={(e) => updateTop("id", Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                    value={form.status}
                    onChange={(v: any) => updateTop("status", v)}
                    className="dark:bg-dark-900"
                  />
                </div>

                <div>
                  <Label>Currency</Label>
                  <Select
                    options={CURRENCY_OPTIONS}
                    placeholder="Select currency"
                    value={form.currency}
                    onChange={(v: any) => updateTop("currency", v)}
                    className="dark:bg-dark-900"
                  />
                </div>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    updateTop("title", title);
                    if (!slugTouched) updateTop("slug", slugify(title));
                  }}
                  placeholder="e.g. Apple iPhone 14 Pro Max"
                />
              </div>

              <div>
                <Label>Slug</Label>
                <Input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateTop("slug", v);
                    setSlugTouched(v.trim().length > 0);
                  }}
                  placeholder="e.g. iphone-14-pro-max"
                />
              </div>

              {/* ✅ FLAGS CHECKBOXES */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <Label>Flags</Label>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <CheckboxRow
                      label="New"
                      checked={Boolean(form.isNew)}
                      onChange={(next) => updateTop("isNew", next as any)}
                    />
                    <CheckboxRow
                      label="Best Seller"
                      checked={Boolean(form.isBestSeller)}
                      onChange={(next) => updateTop("isBestSeller", next as any)}
                    />
                    <CheckboxRow
                      label="Featured"
                      checked={Boolean(form.isFeatured)}
                      onChange={(next) => updateTop("isFeatured", next as any)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <Label>Brand</Label>
                  <Input value={form.brand} onChange={(e) => updateTop("brand", e.target.value)} />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    options={CATEGORY_OPTIONS}
                    placeholder="Select category"
                    value={form.category}
                    onChange={(v: any) => {
                      updateTop("category", v);
                      const nextSub = SUBCATEGORY_BY_CATEGORY[v]?.[0]?.value || "";
                      if (nextSub) updateTop("subcategory", nextSub);
                    }}
                    className="dark:bg-dark-900"
                  />
                </div>

                <div>
                  <Label>Subcategory</Label>
                  <Select
                    options={subcategoryOptions}
                    placeholder="Select subcategory"
                    value={form.subcategory}
                    onChange={(v: any) => updateTop("subcategory", v)}
                    className="dark:bg-dark-900"
                  />
                </div>

                {/* <div>
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={(e) => updateTop("sku", e.target.value)} />
                </div> */}
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateTop("description", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-transparent p-3 text-sm outline-none focus:border-gray-400 dark:border-gray-800"
                  rows={4}
                  placeholder="Write a clear description..."
                />
              </div>
            </div>
          )}

          {/* PRICING */}
          {STEPS[step].key === "pricing" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="text"
                  value={String(form.priceCents || 0)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    updateTop("priceCents", raw === "" ? 0 : Number(raw));
                  }}
                />
              </div>

              <div>
                <Label>Compare at</Label>
                <Input
                  type="text"
                  value={String(form.compareAtCents || 0)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    updateTop("compareAtCents", raw === "" ? 0 : Number(raw));
                  }}
                />
              </div>

              <div>
                <Label>Stock</Label>
                <Input
                  type="text"
                  value={String(form.stock || 0)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    updateTop("stock", raw === "" ? 0 : Number(raw));
                  }}
                />
              </div>
            </div>
          )}

          {/* MEDIA */}
          {STEPS[step].key === "media" && (
            <div>
              <div className="flex items-center justify-between">
                <Label>Images</Label>

                <button
                  type="button"
                  onClick={openImagesModal}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-dark-900"
                >
                  Upload Images
                </button>
              </div>

              {form.images.length === 0 ? (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  No images uploaded yet.
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.images.map((url) => (
                    <div
                      key={url}
                      className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <img
                        src={normalizeImageSrc(url)}
                        alt="listing"
                        className="h-24 w-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/images/user/user-17.jpg")}
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(url)}
                        className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Modal isOpen={isImagesModalOpen} onClose={closeImagesModal} className="max-w-[700px] p-6 lg:p-10">
                <div className="flex flex-col gap-4">
                  <div>
                    <h5 className="mb-1 font-semibold text-gray-800 dark:text-white/90">Upload Images</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select images from your computer. We’ll upload them and save the returned links.
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Endpoint: <span className="font-mono">{UPLOAD_ENDPOINT}</span>
                    </p>
                  </div>

                  <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
                    <input type="file" accept="image/*" multiple onChange={(e) => onPickFiles(e.target.files)} />

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {selectedFiles.map((f, idx) => (
                          <div
                            key={`${f.name}-${f.size}-${f.lastModified}`}
                            className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                          >
                            <img src={previewUrls[idx]} alt={f.name} className="h-24 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePickedFile(idx)}
                              className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                              title="Remove"
                            >
                              ✕
                            </button>
                            <div className="truncate p-2 text-[11px] text-gray-600 dark:text-gray-300">{f.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {uploadError && <div className="text-sm text-red-500">{uploadError}</div>}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeImagesModal}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      disabled={isUploading || selectedFiles.length === 0}
                      onClick={uploadImages}
                      className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload & Add"}
                    </button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {/* SPECS */}
          {STEPS[step].key === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <Label>Spec key</Label>
                  <Input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="e.g. screenSize" />
                </div>
                <div>
                  <Label>Spec value</Label>
                  <Input value={specVal} onChange={(e) => setSpecVal(e.target.value)} placeholder='e.g. 6.7"' />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addSpec}
                    className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                  >
                    Add spec
                  </button>
                </div>
              </div>

              {Object.keys(form.specs || {}).length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No specs added yet.</div>
              ) : (
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {Object.entries(form.specs).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-800 dark:text-white/90">{k}</div>
                          <div className="text-gray-600 dark:text-gray-300">{String(v)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSpec(k)}
                          className="rounded-lg border border-gray-200 px-3 py-1 text-xs hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/[0.06]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>Add tag</Label>

                  <input
                    className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-800"
                    placeholder="Type a tag then press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.currentTarget.value || "").trim();
                        if (val) addTag(val);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(form.tags || []).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-dark-900"
                    title="Click to remove"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVIEW */}
          {STEPS[step].key === "review" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="text-sm font-semibold text-gray-800 dark:text-white/90">{form.title || "Untitled"}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {form.brand ? `${form.brand} • ` : ""}
                  {form.category} • {form.subcategory}
                  {form.isNew ? " • New" : ""}
                  {form.isBestSeller ? " • Best Seller" : ""}
                  {form.isFeatured ? " • Featured" : ""}
                </div>
                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {form.description || "—"}
                </div>
              </div>

              <button
                type="button"
                onClick={submitListing}
                disabled={isSubmitting}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

              {submitError && <div className="text-sm text-red-500">{submitError}</div>}
              {submitSuccess && <div className="text-sm text-green-600">{submitSuccess}</div>}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={isFirst}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800"
          >
            Back
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400">{STEPS[step].title}</div>

          <button
            type="button"
            onClick={next}
            disabled={isLast || !canContinue}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {!canContinue && STEPS[step].key === "basic" && (
          <div className="text-xs text-red-500">Title + Category are required to continue.</div>
        )}
      </div>
    </ComponentCard>
  );
}
