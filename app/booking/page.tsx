"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  Loader2,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  Button,
  Calendar,
  Card,
  CardContent,
  Input,
  Textarea,
  Label,
  Separator,
} from "@/constants/ui/index";
import PageHero from "@/components/common/page-hero";

import { cn } from "@/lib/utils";
import { services, getTimeSlotsForDay } from "@/constants/data";
import { createBooking } from "@/actions/bookingAction";
import { toast } from "sonner";
import { useUserStore } from "@/store/authStore";
import { useBookingStore } from "@/app/store/bookingStore";
import { BookingStatus, Service } from "@/types/index";
import { Clock, Phone, Info, CheckCircle } from "lucide-react";
import { DepositPopup } from "@/components/DepositPopup";
import { customAlphabet } from "nanoid";
import PhoneInput from "react-phone-input-2";
import { formatZAR } from "@/utils";

const nanoid = customAlphabet("0123456789", 6);

interface PendingBooking {
  id: string;
  service: Service;
  date: Date;
  time: string;
  special_requests: string;
}

// Bookings open from tomorrow; the studio is closed on Sundays.
function isDateUnavailable(d: Date) {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d < tomorrow || d.getDay() === 0;
}

function getFirstBookableDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  do {
    d.setDate(d.getDate() + 1);
  } while (isDateUnavailable(d));
  return d;
}

function parseSlotTime(date: Date, time: string) {
  const [hoursStr, minutesStr] = time.split(":");
  const period = time.includes("PM") ? "PM" : "AM";
  let hours = parseInt(hoursStr);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const slotTime = new Date(date);
  slotTime.setHours(hours, parseInt(minutesStr) || 0, 0, 0);
  return slotTime;
}

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(getFirstBookableDate);
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);
  const {
    bookedSlots,
    isLoading: slotsLoading,
    fetchSlotsForDate,
  } = useBookingStore();

  const [currentSelection, setCurrentSelection] = useState<{
    serviceId: string;
    time: string;
    special_requests: string;
  }>({
    serviceId: "",
    time: "",
    special_requests: "",
  });

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the deposit popup (might need adjustment for multiple bookings)
  const [openDepositPopup, setOpenDepositPopup] = useState(false);
  const [lastCreatedBookingId, setLastCreatedBookingId] = useState<
    string | null
  >(null);

  const bookingCartRef = useRef<HTMLDivElement>(null);

  // Memoize fetched booked slots for the selected date
  const currentDateBookedTimes = useMemo(() => {
    if (!date) return [];
    const slotsForDate = bookedSlots.get(date.toDateString()) || [];
    return slotsForDate.map((slotDate) => format(slotDate, "hh:mm a"));
  }, [date, bookedSlots]);

  // Memoize times already added to the cart for the selected date
  const cartTimesForSelectedDate = useMemo(() => {
    if (!date) return [];
    return pendingBookings
      .filter((b) => b.date.toDateString() === date.toDateString())
      .map((b) => b.time);
  }, [pendingBookings, date]);

  useEffect(() => {
    if (user) {
      setUserDetails({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } else {
      setUserDetails({ firstName: "", lastName: "", email: "", phone: "" });
    }
  }, [user]);

  useEffect(() => {
    if (date) {
      fetchSlotsForDate(date);
    }
  }, [date, fetchSlotsForDate]);

  useEffect(() => {
    // On small screens the summary sits below the form, so bring it into view.
    const isStacked = window.matchMedia("(max-width: 1023px)").matches;
    if (isStacked && pendingBookings.length === 1 && bookingCartRef.current) {
      bookingCartRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [pendingBookings.length]);

  const handleUserDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const phoneValue = value.startsWith("+") ? value : `+${value}`;
    setUserDetails((prev) => ({ ...prev, phone: phoneValue }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSelection((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentSelection((prev) => ({ ...prev, [name]: value }));
    // Reset time when service changes, as duration/availability might differ (optional)
    if (name === "serviceId") {
      setCurrentSelection((prev) => ({ ...prev, time: "" }));
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    // Reset time when date changes
    setCurrentSelection((prev) => ({ ...prev, time: "" }));
  };
  // --- ---

  const handleAddBooking = () => {
    if (!date) {
      toast.warning("Please select a date.");
      return;
    }
    if (!currentSelection.serviceId) {
      toast.warning("Please select a service.");
      return;
    }
    if (!currentSelection.time) {
      toast.warning("Please select a time.");
      return;
    }

    const selectedService = services.find(
      (s) => s.id === currentSelection.serviceId
    );
    if (!selectedService) {
      toast.warning("Selected service not found.");
      return;
    }

    const isAlreadyInCart = pendingBookings.some(
      (b) =>
        b.date.toDateString() === date.toDateString() &&
        b.time === currentSelection.time
    );
    if (isAlreadyInCart) {
      toast.warning("This time slot is already in your booking request.");
      return;
    }

    const newBookingItem: PendingBooking = {
      id: `temp-${nanoid()}`,
      service: selectedService,
      date: new Date(date),
      time: currentSelection.time,
      special_requests: currentSelection.special_requests,
    };

    setPendingBookings((prev) => [...prev, newBookingItem]);

    setCurrentSelection({
      serviceId: "",
      time: "",
      special_requests: "",
    });

    toast.success(`${selectedService.name} added to your booking request.`);
  };

  const handleRemoveBooking = (idToRemove: string) => {
    setPendingBookings((prev) => prev.filter((b) => b.id !== idToRemove));
    toast.info("Booking removed from your request.");
  };

  const handleFinalSubmit = async () => {
    if (pendingBookings.length === 0) {
      toast.warning("Please add at least one booking to your request.");
      return;
    }
    if (!user) {
      setShowModal(true);
      toast.info("Please log in or sign up to complete your booking.");
      return;
    }
    if (
      !userDetails.firstName ||
      !userDetails.lastName ||
      !userDetails.email ||
      !userDetails.phone ||
      userDetails.phone.length < 5
    ) {
      toast.warning(
        "Please ensure your contact details (First Name, Last Name, Email, Phone) are complete before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    const bookingPromises = [];
    const createdBookingIds: string[] = [];
    let hasError = false;

    const uniqueBookingId = `GLOW-${nanoid()}`;

    for (const booking of pendingBookings) {
      const bookingTime = parseSlotTime(booking.date, booking.time);

      const bookingData = {
        user_id: user.user_id,
        service_id: booking.service.id,
        service_name: booking.service.name,
        service_price: booking.service.price,
        first_name: userDetails.firstName,
        last_name: userDetails.lastName,
        email: userDetails.email,
        phone: userDetails.phone,
        special_requests: booking.special_requests,
        booking_time: bookingTime.toISOString(),
        status: "pending" as BookingStatus,
        booking_id: uniqueBookingId,
      };

      // Add the promise to the array
      bookingPromises.push(createBooking(bookingData));
    }

    try {
      // Execute all booking creations
      const results = await Promise.all(bookingPromises);

      // Check results for errors
      results.forEach((result) => {
        if (!result.success) {
          console.error("Booking creation error:", result.error);
          toast.warning(
            `Failed to create a booking: ${result.error}. Please try again or contact us.`
          );
          hasError = true;
        } else if (result.booking) {
          createdBookingIds.push(result.booking.booking_id);
          const bookedDate = pendingBookings.find(
            (pb) => pb.service.id === result.booking?.service_id
          )?.date;
          if (bookedDate) {
            fetchSlotsForDate(bookedDate);
          }
        }
      });

      if (!hasError) {
        toast.success(
          `${pendingBookings.length} booking request(s) submitted successfully! Proceed to confirm your booking.`
        );
        setPendingBookings([]);

        if (createdBookingIds.length > 0) {
          setLastCreatedBookingId(
            createdBookingIds[createdBookingIds.length - 1]
          );
          setOpenDepositPopup(true);
        }
      } else {
        toast.warning(
          "Some booking requests could not be submitted. Please review any error messages."
        );
      }
    } catch (error) {
      console.error("Error submitting bookings:", error);
      toast.warning(
        "An unexpected error occurred while submitting bookings. Please try again."
      );
      hasError = true;
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- ---

  const getSlotStatus = (time: string): string | null => {
    if (!date) return null;
    if (currentDateBookedTimes.includes(time)) return "Booked";
    if (cartTimesForSelectedDate.includes(time)) return "Added";
    if (new Date() > parseSlotTime(date, time)) return "Past";
    return null;
  };

  // Calculate total price for the cart
  const totalCartPrice = useMemo(() => {
    return pendingBookings.reduce(
      (sum, booking) => sum + booking.service.price,
      0
    );
  }, [pendingBookings]);

  return (
    <>
      <DepositPopup
        open={openDepositPopup}
        onOpenChange={setOpenDepositPopup}
        bookingId={lastCreatedBookingId}
      />
      <div className="flex flex-col min-h-screen">
        <PageHero
          eyebrow="Reserve Your Visit"
          title="Book an Appointment"
          description="Choose your treatment, pick a time that suits you, and we'll take care of the rest."
          image="/images/consultation.jpg"
        />

        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
            <div className="flex flex-col gap-8">
              {/* Step 1: Treatment */}
              <BookingStep
                step={1}
                title="Choose your treatment"
                description="Select a service. You can add more than one appointment to a single request."
              >
                <div
                  role="radiogroup"
                  aria-label="Service"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {services.map((service) => {
                    const isSelected =
                      currentSelection.serviceId === service.id;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() =>
                          handleSelectChange("serviceId", service.id)
                        }
                        className={cn(
                          "group flex gap-4 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected &&
                            "border-primary bg-accent/60 ring-1 ring-primary"
                        )}
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {service.image && (
                            <Image
                              src={service.image}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {service.category}
                          </span>
                          <span className="mt-0.5 font-heading text-lg leading-tight">
                            {service.name}
                          </span>
                          <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {service.description}
                          </span>
                          <span className="mt-auto pt-2 text-sm font-semibold">
                            {formatZAR(service.price)}
                          </span>
                        </div>
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </BookingStep>

              {/* Step 2: Date & time */}
              <BookingStep
                step={2}
                title="Pick a date & time"
                description="We're open Monday to Saturday. Bookings open from tomorrow."
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] gap-6 md:gap-8">
                  <div className="rounded-xl border bg-card p-2 self-start justify-self-center md:justify-self-start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      disabled={isDateUnavailable}
                      classNames={{
                        head_cell:
                          "text-muted-foreground w-10 font-medium text-[0.75rem]",
                        day: "h-10 w-10 p-0 font-normal rounded-full hover:bg-accent aria-selected:opacity-100",
                        cell: "relative p-0 text-center text-sm",
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-3 text-sm font-medium">
                      {date
                        ? `Available times · ${format(date, "EEEE, d MMMM")}`
                        : "Select a date to see available times"}
                    </p>
                    {!currentSelection.serviceId && (
                      <p className="mb-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        Choose a treatment first to select a time.
                      </p>
                    )}
                    {date && (
                      <div
                        role="radiogroup"
                        aria-label="Time"
                        className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3 xl:grid-cols-4"
                      >
                        {getTimeSlotsForDay(date).map((time: string) => {
                          const status = getSlotStatus(time);
                          const isSelected = currentSelection.time === time;
                          const isDisabled =
                            !!status ||
                            slotsLoading ||
                            !currentSelection.serviceId;
                          return (
                            <button
                              key={time}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              disabled={isDisabled}
                              onClick={() => handleSelectChange("time", time)}
                              className={cn(
                                "flex h-12 flex-col items-center justify-center rounded-full border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                                  : "bg-card hover:border-primary/50 hover:bg-accent/50",
                                isDisabled &&
                                  !isSelected &&
                                  "cursor-not-allowed bg-muted/40 text-muted-foreground/60 hover:border-border hover:bg-muted/40"
                              )}
                            >
                              <span className={cn(status && "line-through")}>
                                {time}
                              </span>
                              {status && (
                                <span className="text-[10px] leading-none no-underline">
                                  {status}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {slotsLoading && (
                      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Checking availability…
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="special_requests">
                    Special request{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="special_requests"
                    name="special_requests"
                    value={currentSelection.special_requests}
                    onChange={handleTextAreaChange}
                    placeholder="Anything we should know for this appointment?"
                    rows={3}
                  />
                </div>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleAddBooking}
                  className="mt-6 w-full sm:w-auto"
                  disabled={
                    slotsLoading ||
                    !date ||
                    !currentSelection.serviceId ||
                    !currentSelection.time
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add to Booking Request
                </Button>
              </BookingStep>

              {/* Step 3: Details */}
              <BookingStep
                step={3}
                title="Your details"
                description="We'll use these to confirm your appointment."
                action={
                  !user && (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => setShowModal(true)}
                    >
                      Already a client? Log in
                    </Button>
                  )
                }
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      value={userDetails.firstName}
                      onChange={handleUserDetailChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      value={userDetails.lastName}
                      onChange={handleUserDetailChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={userDetails.email}
                      onChange={handleUserDetailChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <PhoneInput
                      country={"za"}
                      value={userDetails.phone || ""}
                      onChange={handlePhoneChange}
                      inputProps={{
                        id: "phone",
                        name: "phone",
                        required: true,
                        autoComplete: "tel",
                      }}
                      containerClass="w-full"
                    />
                  </div>
                </div>
              </BookingStep>
            </div>

            {/* Booking summary */}
            <aside
              ref={bookingCartRef}
              className="lg:sticky lg:top-28 scroll-mt-28"
            >
              <Card className="overflow-hidden">
                <div className="bg-primary px-6 py-5 text-primary-foreground">
                  <p className="eyebrow text-highlight">Summary</p>
                  <h2 className="mt-2 text-2xl font-medium">Your booking</h2>
                </div>
                <CardContent className="p-6">
                  {pendingBookings.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <p className="font-medium">No appointments yet</p>
                      <p className="mt-1 max-w-[16rem] text-sm text-muted-foreground">
                        Choose a treatment and time, then add it to your
                        request.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {pendingBookings.map((booking) => (
                        <li
                          key={booking.id}
                          className="flex gap-3 py-4 first:pt-0"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {booking.service.image && (
                              <Image
                                src={booking.service.image}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-tight">
                              {booking.service.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {format(booking.date, "EEE, d MMM")} ·{" "}
                              {booking.time}
                            </p>
                            {booking.special_requests && (
                              <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
                                “{booking.special_requests}”
                              </p>
                            )}
                            <p className="mt-1 text-sm font-semibold">
                              {formatZAR(booking.service.price)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemoveBooking(booking.id)}
                            aria-label={`Remove ${booking.service.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Separator className="my-4" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Estimated total
                    </span>
                    <span className="font-heading text-2xl">
                      {formatZAR(totalCartPrice)}
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    onClick={handleFinalSubmit}
                    className="mt-5 w-full"
                    disabled={
                      isSubmitting ||
                      slotsLoading ||
                      pendingBookings.length === 0
                    }
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting
                      ? "Submitting…"
                      : pendingBookings.length > 1
                        ? `Request ${pendingBookings.length} Appointments`
                        : "Request Appointment"}
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    You&apos;ll be asked to pay a deposit to confirm your
                    booking.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        {/* Information Section */}
        <section className="py-16 md:py-20 bg-secondary/60">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoCard title="Booking Information">
                <InfoItem icon={Clock} title="Business Hours">
                  <p>Monday – Friday: 9:00 AM – 6:00 PM</p>
                  <p>Saturday: 8:00 AM – 6:00 PM</p>
                  <p>Sunday: Closed</p>
                </InfoItem>
                <InfoItem icon={Phone} title="Contact">
                  <p>
                    <a href="tel:+27781470504" className="hover:text-primary">
                      +27 78 147 0504
                    </a>
                  </p>
                  <p>
                    <a
                      href="mailto:sylvia_emerah@yahoo.com"
                      className="hover:text-primary"
                    >
                      sylvia_emerah@yahoo.com
                    </a>
                  </p>
                </InfoItem>
                <InfoItem icon={Info} title="Cancellation Policy">
                  <p>
                    Please provide at least 24 hours notice for cancellations
                    or rescheduling to avoid a cancellation fee.
                  </p>
                </InfoItem>
              </InfoCard>
              <InfoCard title="What to Expect">
                <InfoItem icon={CheckCircle} title="Consultation">
                  <p>
                    All new clients receive a complimentary consultation to
                    discuss your goals and create a personalised treatment
                    plan.
                  </p>
                </InfoItem>
                <InfoItem icon={CheckCircle} title="Arrival">
                  <p>
                    Please arrive 10–15 minutes before your scheduled
                    appointment to complete any necessary paperwork.
                  </p>
                </InfoItem>
                <InfoItem icon={CheckCircle} title="Payment">
                  <p>We accept all major credit cards and cash.</p>
                </InfoItem>
              </InfoCard>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function BookingStep({
  step,
  title,
  description,
  action,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-highlight font-heading text-base text-primary">
            {step}
          </span>
          <div>
            <h2 className="text-2xl font-medium leading-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
      <h2 className="mb-6 text-2xl font-medium">{title}</h2>
      <ul className="space-y-5">{children}</ul>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="text-sm leading-relaxed text-muted-foreground">
        <p className="mb-0.5 font-semibold text-foreground">{title}</p>
        {children}
      </div>
    </li>
  );
}
