import PageHeader from "@/components/admin/page-header";
import ClientList from "@/components/admin/client-list";
import { getClients } from "@/actions/clientActions";

type ClientsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ITEMS_PER_PAGE = 10;

export default async function ClientsPage({
  searchParams: searchParamsPromise,
}: ClientsPageProps) {
  const searchParams = await searchParamsPromise;

  const currentPage = Number(searchParams?.page || "1");

  const result = await getClients(currentPage, ITEMS_PER_PAGE);

  const initialClients = result.success ? result.clients || [] : [];
  const initialTotalPages = result.success ? result.totalPages || 1 : 1;

  if (!result.success) {
    console.error("Error fetching clients:", result.error);
    // You could display an error message here
  }

  return (
    <div>
      <PageHeader title="Clients" description="Manage your client database" />

      <ClientList
        initialClients={initialClients}
        initialTotalPages={initialTotalPages}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}
