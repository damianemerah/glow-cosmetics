"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PhoneInput from "react-phone-input-2";
import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  Button,
  Input,
  Checkbox,
  Calendar,
  Popover,
  PopoverTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  DialogFooter,
} from "@/constants/ui/index";

import { ContainedPopoverContent } from "@/components/ui/ContainedPopoverContent";

// Define the form schema
const userDetailsSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  receiveEmails: z.boolean().default(true),
});

export type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

interface UserDetailsFormProps {
  onSubmit: (data: UserDetailsFormData) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export function UserDetailsForm({
  onSubmit,
  onBack,
  isLoading,
}: UserDetailsFormProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // User details form
  const form = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      receiveEmails: true,
      dateOfBirth: undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* First Name / Last Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  country={"za"}
                  value={field.value || ""}
                  // Use field.onChange which updates form state
                  onChange={(phoneValue) => field.onChange(phoneValue)}
                  inputProps={{
                    id: "phone",
                    name: field.name,
                    onBlur: field.onBlur, // Pass onBlur for validation triggers
                  }}
                  containerClass="w-full"
                  inputClass="w-full p-2 border rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth Field */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      role="combobox"
                      aria-expanded={isDatePickerOpen}
                      className={cn(
                        "w-full justify-start text-left font-normal", // Use full width
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select your date of birth</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <ContainedPopoverContent
                  containerSelector=".login-dialog-content"
                  className="w-auto p-0 z-[1000]"
                  align="start"
                  onInteractOutside={(e) => {
                    if (
                      (e.target as HTMLElement)?.closest(
                        '[data-slot="popover-trigger"]'
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Calendar
                    mode="single"
                    captionLayout="dropdown-buttons"
                    selected={field.value}
                    onSelect={(
                      currentValue,
                      _selectedDay,
                      _activeModifiers,
                      e
                    ) => {
                      e?.stopPropagation();
                      field.onChange(currentValue);
                      setIsDatePickerOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                  />
                </ContainedPopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Receive Emails Field */}
        <FormField
          control={form.control}
          name="receiveEmails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                I want to receive emails about promotions and new products
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Terms Links */}
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Footer Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="mb-2 sm:mb-0"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Creating Account" : "Create Account"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
