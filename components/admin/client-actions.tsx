"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { addClient, importClientsFromCsv } from "@/actions/clientActions";
import { toast } from "sonner";
import type { Client } from "@/types/dashboard";

interface ClientActionsProps {
  client?: Client;
}

export default function ClientActions({ client }: ClientActionsProps = {}) {
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [importCsvOpen, setImportCsvOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClient = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await addClient(formData);
      if (result.success) {
        toast.success("Client added successfully");
        setAddClientOpen(false);
      } else {
        toast.error(result.error || "Failed to add client");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportCsv = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await importClientsFromCsv(formData);
      if (result.success) {
        toast.success(`${result.imported} clients imported successfully`);
        setImportCsvOpen(false);
      } else {
        toast.error(result.error || "Failed to import clients");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If a client is provided, render action buttons for that client
  if (client) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          View
        </Button>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
    );
  }

  // Otherwise, render the "Add Client" and "Import CSV" buttons
  return (
    <div className="flex gap-2">
      <Dialog open={importCsvOpen} onOpenChange={setImportCsvOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple clients at once.
            </DialogDescription>
          </DialogHeader>
          <form action={handleImportCsv}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input id="csv-file" name="file" type="file" accept=".csv" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>The CSV file should have the following columns:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Name</li>
                  <li>Phone</li>
                  <li>Email</li>
                  <li>Address (optional)</li>
                  <li>Notes (optional)</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform">
            Add Client
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your database.
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddClient}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="(555) 123-4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Any additional information"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
