"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/modal";
// import Modal from "@/components/modal/Modal"; // ✅ change this to your real path

type UploadImagesModalProps = {
  isOpen: boolean;
  onClose: () => void;

  /** Where to upload files (multipart/form-data) */
  uploadEndpoint: string;

  /** Called with the hosted URLs returned by your API */
  onUploaded: (urls: string[]) => void;

  /** Optional: limit number of files */
  maxFiles?: number;
};

export default function UploadImagesModal({
  isOpen,
  onClose,
  uploadEndpoint,
  onUploaded,
  maxFiles = 20,
}: UploadImagesModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const closeAndReset = () => {
    setSelectedFiles([]);
    setUploadError(null);
    setIsUploading(false);
    onClose();
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;

    const picked = Array.from(files).filter((f) => f.type.startsWith("image/"));

    // merge + dedupe by (name,size,lastModified)
    const merged = [...selectedFiles, ...picked];
    const unique = Array.from(
      new Map(merged.map((f) => [`${f.name}-${f.size}-${f.lastModified}`, f])).values()
    );

    setSelectedFiles(unique.slice(0, maxFiles));
  };

  const removePickedFile = (idx: number) => {
    setSelectedFiles((p) => p.filter((_, i) => i !== idx));
  };

  // Create preview URLs for the current selection
  const previewUrls = useMemo(() => {
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    return urls;
  }, [selectedFiles]);

  // Cleanup previews
  // useMemo(() => {
  //   return () => {
  //     previewUrls.forEach((u) => URL.revokeObjectURL(u));
  //   };
  // }, [previewUrls]);


  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      selectedFiles.forEach((file) => fd.append("files", file)); // 👈 backend expects "files"

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Upload failed");
      }

      /**
       * Expected API response shape:
       * { urls: string[] }
       */
      const data = (await res.json()) as { urls?: string[] };

      if (!data?.urls || !Array.isArray(data.urls) || data.urls.length === 0) {
        throw new Error("Upload succeeded but no urls[] returned by the API.");
      }

      onUploaded(data.urls);
      closeAndReset();
    } catch (e: any) {
      setUploadError(e?.message || "Upload failed");
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeAndReset} className="max-w-[700px] p-6 lg:p-10">
      <div className="flex flex-col gap-4">
        <div>
          <h5 className="mb-1 font-semibold text-gray-800 dark:text-white/90">
            Upload Images
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select images from your computer. We’ll upload them and store the returned links.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
              disabled={isUploading}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedFiles.length}/{maxFiles}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedFiles.map((f, idx) => (
                <div
                  key={`${f.name}-${f.size}-${f.lastModified}`}
                  className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrls[idx]}
                    alt={f.name}
                    className="h-24 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removePickedFile(idx)}
                    disabled={isUploading}
                    className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 disabled:opacity-50"
                    title="Remove"
                  >
                    ✕
                  </button>

                  <div className="truncate p-2 text-[11px] text-gray-600 dark:text-gray-300">
                    {f.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length === 0 && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Tip: You can select multiple images at once.
            </div>
          )}
        </div>

        {uploadError && <div className="text-sm text-red-500">{uploadError}</div>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeAndReset}
            disabled={isUploading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Close
          </button>

          <button
            type="button"
            onClick={uploadImages}
            disabled={isUploading || selectedFiles.length === 0}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload & Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
