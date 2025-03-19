import { getClients } from "@/actions/clientActions";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import ClientActions from "@/components/admin/client-actions";
import { Input } from "@/components/ui/input";
import type { Client } from "@/types/dashboard";

export default async function ClientsPage() {
  // Fetch real clients data instead of using mock data
  const clients = await getClients();

  const clientColumns = [
    { key: "name", title: "Name" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "lastVisit", title: "Last Visit" },
    { key: "totalSpent", title: "Total Spent" },
    {
      key: "actions",
      title: "Actions",
      render: (client: Client) => <ClientActions client={client} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Clients" description="Manage your client database" />

      <div className="flex justify-between items-center mb-6">
        <Input placeholder="Search clients..." className="max-w-xs" />

        {/* Use the ClientActions component for adding clients and importing from CSV */}
        <ClientActions />
      </div>

      <DataTable
        columns={clientColumns}
        data={clients}
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">No clients found</p>
            <ClientActions />
          </div>
        }
      />
    </div>
  );
}
