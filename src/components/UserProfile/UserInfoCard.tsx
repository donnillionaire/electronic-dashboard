// import { useModal } from "../../hooks/useModal";
// import { Modal } from "../ui/modal";
// import Button from "../ui/button/Button";
// import Input from "../form/input/InputField";
// import Label from "../form/Label";

// export default function UserInfoCard() {
//   const { isOpen, openModal, closeModal } = useModal();
//   const handleSave = () => {
//     // Handle save logic here
//     console.log("Saving changes...");
//     closeModal();
//   };
//   return (
//     <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
//       <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
//         <div>
//           <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
//             Personal Information
//           </h4>

//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
//             <div>
//               <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                 First Name
//               </p>
//               <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                 Musharof
//               </p>
//             </div>

//             <div>
//               <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                 Last Name
//               </p>
//               <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                 Chowdhury
//               </p>
//             </div>

//             <div>
//               <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                 Email address
//               </p>
//               <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                 randomuser@pimjo.com
//               </p>
//             </div>

//             <div>
//               <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                 Phone
//               </p>
//               <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                 +09 363 398 46
//               </p>
//             </div>

//             <div>
//               <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
//                 Bio
//               </p>
//               <p className="text-sm font-medium text-gray-800 dark:text-white/90">
//                 Team Manager
//               </p>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={openModal}
//           className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
//         >
//           <svg
//             className="fill-current"
//             width="18"
//             height="18"
//             viewBox="0 0 18 18"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               fillRule="evenodd"
//               clipRule="evenodd"
//               d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
//               fill=""
//             />
//           </svg>
//           Edit
//         </button>
//       </div>

//       <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//         <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
//           <div className="px-2 pr-14">
//             <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
//               Edit Personal Information
//             </h4>
//             <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
//               Update your details to keep your profile up-to-date.
//             </p>
//           </div>
//           <form className="flex flex-col">
//             <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
//               <div>
//                 <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
//                   Social Links
//                 </h5>

//                 <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
//                   <div>
//                     <Label>Facebook</Label>
//                     <Input
//                       type="text"
//                       value="https://www.facebook.com/PimjoHQ"
//                     />
//                   </div>

//                   <div>
//                     <Label>X.com</Label>
//                     <Input type="text" value="https://x.com/PimjoHQ" />
//                   </div>

//                   <div>
//                     <Label>Linkedin</Label>
//                     <Input
//                       type="text"
//                       value="https://www.linkedin.com/company/pimjo"
//                     />
//                   </div>

//                   <div>
//                     <Label>Instagram</Label>
//                     <Input type="text" value="https://instagram.com/PimjoHQ" />
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-7">
//                 <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
//                   Personal Information
//                 </h5>

//                 <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
//                   <div className="col-span-2 lg:col-span-1">
//                     <Label>First Name</Label>
//                     <Input type="text" value="Musharof" />
//                   </div>

//                   <div className="col-span-2 lg:col-span-1">
//                     <Label>Last Name</Label>
//                     <Input type="text" value="Chowdhury" />
//                   </div>

//                   <div className="col-span-2 lg:col-span-1">
//                     <Label>Email Address</Label>
//                     <Input type="text" value="randomuser@pimjo.com" />
//                   </div>

//                   <div className="col-span-2 lg:col-span-1">
//                     <Label>Phone</Label>
//                     <Input type="text" value="+09 363 398 46" />
//                   </div>

//                   <div className="col-span-2">
//                     <Label>Bio</Label>
//                     <Input type="text" value="Team Manager" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
//               <Button size="sm" variant="outline" onClick={closeModal}>
//                 Close
//               </Button>
//               <Button size="sm" onClick={handleSave}>
//                 Save Changes
//               </Button>
//             </div>
//           </form>
//         </div>
//       </Modal>
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import BASE_URL from "../url";
// import BASE_URL from "../../url";

type MeResponse = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  role?: string;
  avatar_url?: string;

  country?: string;
  city_state?: string;

  social_facebook?: string;
  social_x?: string;
  social_linkedin?: string;
  social_instagram?: string;
};

// const API_BASE = "http://localhost:8080";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const API_BASE = BASE_URL



function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form state for modal edits
  const [form, setForm] = useState({
    social_facebook: "",
    social_x: "",
    social_linkedin: "",
    social_instagram: "",
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    // email stays readonly (not patched)
    country: "",
    city_state: "",
  });

  const displayEmail = useMemo(() => me?.email || "—", [me?.email]);

  async function fetchMe() {
    const token = getToken();
    if (!token) {
      setMe(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(`${API_BASE}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        setMe(null);
        setErrorMsg("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        setErrorMsg(`Failed to load profile (${res.status})`);
        setMe(null);
        return;
      }

      const data = (await res.json()) as MeResponse;
      setMe(data);

      // hydrate modal form
      setForm({
        social_facebook: data.social_facebook || "",
        social_x: data.social_x || "",
        social_linkedin: data.social_linkedin || "",
        social_instagram: data.social_instagram || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        bio: data.bio || "",
        country: data.country || "",
        city_state: data.city_state || "",
      });
    } catch (err) {
      console.error("GET /api/me failed:", err);
      setErrorMsg("Network error loading profile");
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openEdit() {
    // reset form from latest `me` before opening
    if (me) {
      setForm({
        social_facebook: me.social_facebook || "",
        social_x: me.social_x || "",
        social_linkedin: me.social_linkedin || "",
        social_instagram: me.social_instagram || "",
        first_name: me.first_name || "",
        last_name: me.last_name || "",
        phone: me.phone || "",
        bio: me.bio || "",
        country: me.country || "",
        city_state: me.city_state || "",
      });
    }
    openModal();
  }

  async function handleSave(e?: React.MouseEvent) {
    e?.preventDefault();

    const token = getToken();
    if (!token) {
      setErrorMsg("You are not logged in");
      return;
    }

    if (!me) {
      setErrorMsg("Profile not loaded");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      // Send only changed fields
      const patchBody: Record<string, string> = {};
      const pairs: Array<[keyof typeof form, keyof MeResponse]> = [
        ["first_name", "first_name"],
        ["last_name", "last_name"],
        ["phone", "phone"],
        ["bio", "bio"],
        ["country", "country"],
        ["city_state", "city_state"],
        ["social_facebook", "social_facebook"],
        ["social_x", "social_x"],
        ["social_linkedin", "social_linkedin"],
        ["social_instagram", "social_instagram"],
      ];

      for (const [fKey, meKey] of pairs) {
        const newVal = (form[fKey] || "").trim();
        const oldVal = ((me as any)[meKey] || "").toString().trim();
        if (newVal !== oldVal) patchBody[fKey] = newVal;
      }

      if (Object.keys(patchBody).length === 0) {
        closeModal();
        return;
      }

      const res = await fetch(`${API_BASE}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patchBody),
      });

      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        setMe(null);
        setErrorMsg("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("PATCH /api/me failed:", res.status, txt);
        setErrorMsg(`Failed to save changes (${res.status})`);
        return;
      }

      const updated = (await res.json()) as MeResponse;
      setMe(updated);

      // sync form
      setForm({
        social_facebook: updated.social_facebook || "",
        social_x: updated.social_x || "",
        social_linkedin: updated.social_linkedin || "",
        social_instagram: updated.social_instagram || "",
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        phone: updated.phone || "",
        bio: updated.bio || "",
        country: updated.country || "",
        city_state: updated.city_state || "",
      });

      closeModal();
    } catch (err) {
      console.error("Save profile failed:", err);
      setErrorMsg("Network error saving profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "…" : me?.first_name || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "…" : me?.last_name || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "…" : displayEmail}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "…" : me?.phone || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {loading ? "…" : me?.bio || "—"}
              </p>
            </div>
          </div>

          {errorMsg && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
          )}
        </div>

        <button
          onClick={openEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          disabled={loading}
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      value={form.social_facebook}
                      onChange={(e: any) => handleChange("social_facebook", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input
                      type="text"
                      value={form.social_x}
                      onChange={(e: any) => handleChange("social_x", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      value={form.social_linkedin}
                      onChange={(e: any) => handleChange("social_linkedin", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input
                      type="text"
                      value={form.social_instagram}
                      onChange={(e: any) => handleChange("social_instagram", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      value={form.first_name}
                      onChange={(e: any) => handleChange("first_name", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      value={form.last_name}
                      onChange={(e: any) => handleChange("last_name", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" value={me?.email || ""} disabled />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={form.phone}
                      onChange={(e: any) => handleChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input
                      type="text"
                      value={form.bio}
                      onChange={(e: any) => handleChange("bio", e.target.value)}
                    />
                  </div>

                  {/* optional */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>City/State</Label>
                    <Input
                      type="text"
                      value={form.city_state}
                      onChange={(e: any) => handleChange("city_state", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Country</Label>
                    <Input
                      type="text"
                      value={form.country}
                      onChange={(e: any) => handleChange("country", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="px-2 mt-3 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={saving}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
