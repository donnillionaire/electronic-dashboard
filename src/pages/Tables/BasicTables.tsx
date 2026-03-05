import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="dashboard"
        description=""
      />
      <PageBreadcrumb pageTitle="Listings" />
      <div className="space-y-6">
        <ComponentCard title="Listing Table">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
