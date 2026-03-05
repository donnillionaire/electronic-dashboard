import { useMemo, useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";

import Button from "../../components/ui/button/Button";
import Modal from "../../components/modal/Modal";
import ListingStepperForm from "../../components/form/form-elements/ListingFormInputs";

type ListingType = "property" | "land";



export default function Home() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [listingType, setListingType] = useState<ListingType>("property");

  const initialValue = (listingType === "land"
    ? {
      listingType: "land",
      category: "land",
      subcategory: "plot",
      location: {
        address: "",
        neighborhood: "",
        city: "Nairobi",
        coordinates: { lat: -1.2833, lng: 36.8167 },
      },
      amenities: [] as string[],
      images: [] as string[],
      landDetails: {
        landSize: 0,
        landUnit: "acres",
        tenure: "unknown",
        zoning: "unknown",
        titleDeed: false,
        roadAccess: "unknown",
        waterOnSite: false,
        electricityOnSite: false,
        fenced: false,
      },
      leaseTerms: {
        depositMonths: 0,
        agencyFeePct: 0,
        serviceCharge: 0,
        includesUtilities: false,
      },
    }
    : {
      listingType: "property",
      category: "apartment",
      subcategory: "maisonette",
      bedrooms: 1,
      bathrooms: 1,
      sqft: 0,
      furnishing: "unfurnished",
      parking: 0,
      location: {
        address: "",
        neighborhood: "",
        city: "Nairobi",
        coordinates: { lat: -1.2833, lng: 36.8167 },
      },
      amenities: [] as string[],
      images: [] as string[],
      leaseTerms: {
        depositMonths: 1,
        agencyFeePct: 0,
        serviceCharge: 0,
        includesUtilities: false,
      },
    }) satisfies Partial<any>;

  const openAdd = () => {
    setListingType("property"); // default when opening, change if you want
    setIsAddOpen(true);
  };

  return (
    <>
      <PageMeta title="Dashboard" description="Jambo homes" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h1>

        <Button size="sm" variant="primary" onClick={openAdd}>
          + Add New Listing
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>
{/* 
        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>

      {/* ✅ Add listing modal with type switch */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        className="max-w-[980px]"
      >
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain p-6 lg:p-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Listing
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose what you’re listing; the form will adapt.
              </p>
            </div>

 
          </div>

      

          <ListingStepperForm
            initialValue={initialValue as any}
            onSaved={() => setIsAddOpen(false)}
          />

        </div>
      </Modal>
    </>
  );
}
