import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import BASE_URL from "../components/url";

const API_BASE = String(BASE_URL || "").replace(/\/$/, "");
const HERO_IMAGES_ENDPOINT = `${API_BASE}/api/hero-images`;
const HERO_UPLOAD_ENDPOINT = `${API_BASE}/api/hero-images/upload`;

function uniqueImages(images: string[]) {
  return Array.from(
    new Set(images.map((image) => image.trim()).filter(Boolean))
  );
}

function normalizeImageSrc(url: string) {
  if (!url) return "/images/grid-image/image-01.png";
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

function parseHeroImages(payload: any): string[] {
  if (Array.isArray(payload)) return uniqueImages(payload.map(String));

  if (Array.isArray(payload?.images)) {
    return uniqueImages(payload.images.map(String));
  }

  if (Array.isArray(payload?.heroImages)) {
    return uniqueImages(payload.heroImages.map(String));
  }

  if (Array.isArray(payload?.urls)) {
    return uniqueImages(payload.urls.map(String));
  }

  if (typeof payload?.image === "string") {
    return uniqueImages([payload.image]);
  }

  if (typeof payload?.url === "string") {
    return uniqueImages([payload.url]);
  }

  return [];
}

async function readJsonIfPresent(res: Response) {
  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default function HeroManagement() {
  const [images, setImages] = useState<string[]>([]);
  const [draftImages, setDraftImages] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const loadHeroImages = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(HERO_IMAGES_ENDPOINT, { method: "GET" });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch hero images");
      }

      const payload = await readJsonIfPresent(res);
      const nextImages = parseHeroImages(payload);
      setImages(nextImages);
      setDraftImages(nextImages.join("\n"));
    } catch (e: any) {
      setError(e?.message || "Failed to fetch hero images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeroImages();
  }, []);

  const draftList = useMemo(
    () => uniqueImages(draftImages.split(/\r?\n|,/)),
    [draftImages]
  );

  const saveHeroImages = async (nextImages = draftList) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(HERO_IMAGES_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: nextImages }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save hero images");
      }

      const payload = await readJsonIfPresent(res);
      const savedImages = parseHeroImages(payload);
      const finalImages = savedImages.length > 0 ? savedImages : nextImages;
      setImages(finalImages);
      setDraftImages(finalImages.join("\n"));
      setSuccess("Hero images updated.");
    } catch (e: any) {
      setError(e?.message || "Failed to save hero images");
    } finally {
      setIsSaving(false);
    }
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;

    const nextFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    setSelectedFiles(nextFiles);
    setError(null);
    setSuccess(null);
  };

  const removePickedFile = (index: number) => {
    setSelectedFiles((current) => current.filter((_, idx) => idx !== index));
  };

  const uploadHeroImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(HERO_UPLOAD_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to upload hero images");
      }

      const payload = await readJsonIfPresent(res);
      const uploadedImages = parseHeroImages(payload);

      setSelectedFiles([]);
      if (uploadedImages.length > 0) {
        setImages(uploadedImages);
        setDraftImages(uploadedImages.join("\n"));
      } else {
        await loadHeroImages();
      }

      setSuccess("Hero image upload completed.");
    } catch (e: any) {
      setError(e?.message || "Failed to upload hero images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeHeroImage = (image: string) => {
    const nextImages = images.filter((item) => item !== image);
    setDraftImages(nextImages.join("\n"));
    saveHeroImages(nextImages);
  };

  return (
    <>
      <PageMeta title="Hero Management" description="" />
      <PageBreadcrumb pageTitle="Hero Management" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Active Hero Images
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage the images displayed in the storefront hero section.
              </p>
            </div>

            <button
              type="button"
              onClick={loadHeroImages}
              disabled={isLoading || isSaving || isUploading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900/60 dark:bg-success-500/10 dark:text-success-300">
              {success}
            </div>
          )}

          {isLoading ? (
            <div className="mt-5 text-sm text-gray-500 dark:text-gray-400">
              Loading hero images...
            </div>
          ) : images.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No hero images are configured yet.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="relative aspect-[16/7] bg-gray-100 dark:bg-white/[0.05]">
                    <img
                      src={normalizeImageSrc(image)}
                      alt={`Hero image ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "/images/grid-image/image-01.png";
                      }}
                    />
                    {index === 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-medium text-white">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="text-xs uppercase text-gray-400">
                        Image {index + 1}
                      </div>
                      <div className="mt-1 truncate text-sm text-gray-700 dark:text-gray-300">
                        {image}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHeroImage(image)}
                      disabled={isSaving || isUploading}
                      className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Upload Replacement Images
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Uploaded files replace the current active hero image list.
            </p>

            <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPickFiles(e.target.files)}
                disabled={isUploading}
                className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400"
              />

              {selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="relative">
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="h-24 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePickedFile(index)}
                          disabled={isUploading}
                          className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="truncate p-2 text-xs text-gray-600 dark:text-gray-300">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={uploadHeroImages}
              disabled={isUploading || selectedFiles.length === 0}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload & Replace"}
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Replace With URLs
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Use one image path or URL per line. The first line becomes primary.
            </p>

            <textarea
              value={draftImages}
              onChange={(e) => setDraftImages(e.target.value)}
              rows={8}
              className="mt-5 w-full resize-y rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="/uploads/hero-1.jpg&#10;https://example.com/hero-2.webp"
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {draftList.length} image{draftList.length === 1 ? "" : "s"} ready to save
              </div>

              <button
                type="button"
                onClick={() => saveHeroImages()}
                disabled={isSaving || isUploading}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                {isSaving ? "Saving..." : "Save URL List"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
