"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import {
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@/constants/ui/index";

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

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
    if (pendingBookings.length === 1 && bookingCartRef.current) {
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
    if (
      !userDetails.firstName ||
      !userDetails.lastName ||
      !userDetails.email ||
      !userDetails.phone ||
      userDetails.phone.length < 5
    ) {
      toast.warning("Please fill in all your contact details.");
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
      const [hoursStr, minutesStr] = booking.time.split(":");
      const period = booking.time.includes("PM") ? "PM" : "AM";
      let hours = parseInt(hoursStr);

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      const bookingTime = new Date(booking.date);
      bookingTime.setHours(hours, parseInt(minutesStr) || 0, 0, 0);

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
        <section className="bg-secondary py-16">
          <h1 className="text-4xl font-bold mb-4 font-montserrat container">
            Book Your Appointment(s)
          </h1>
        </section>

        {/* Booking Form and Services Section */}
        <section className="py-16 bg-white">
          <div className="px-4 sm:px-8 md:px-16 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-8">
            {/* Booking Form Column */}
            <div className="flex flex-col gap-8">
              {/* User Details Card (Now potentially editable) */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-montserrat">
                    Your Details
                  </CardTitle>
                  <CardDescription>
                    Please confirm or update your contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={userDetails.firstName}
                        onChange={handleUserDetailChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={userDetails.lastName}
                        onChange={handleUserDetailChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
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
                        }}
                        containerClass="w-full"
                        inputClass="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Selection Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-montserrat">
                    Select Appointment Slot
                  </CardTitle>
                  <CardDescription>
                    Choose a service, date, and time, then add it to your
                    booking request below.
                  </CardDescription>
                </CardHeader>
                {/* Remove form tag here */}
                <CardContent className="space-y-6">
                  {/* Service Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      value={currentSelection.serviceId} // Controlled component
                      onValueChange={(value) =>
                        handleSelectChange("serviceId", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatZAR(service.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative z-10">
                      {" "}
                      {/* Adjusted z-index */}
                      <Label>Preferred Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                            disabled={(d) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              // Disable past dates and Sundays
                              return d < today || d.getDay() === 0;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select
                        value={currentSelection.time} // Controlled component
                        onValueChange={(value) =>
                          handleSelectChange("time", value)
                        }
                        required
                        disabled={!date || !currentSelection.serviceId} // Disable if no date/service
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {date ? (
                            getTimeSlotsForDay(date).map((time: string) => {
                              const isBooked =
                                currentDateBookedTimes.includes(time);
                              const isInCart =
                                cartTimesForSelectedDate.includes(time);
                              const isPastTime =
                                date &&
                                new Date().toDateString() ===
                                  date.toDateString() &&
                                (() => {
                                  // IIFE for cleaner logic
                                  const [hoursStr, minutesStr] =
                                    time.split(":");
                                  const period = time.includes("PM")
                                    ? "PM"
                                    : "AM";
                                  let hours = parseInt(hoursStr);
                                  if (period === "PM" && hours !== 12)
                                    hours += 12;
                                  if (period === "AM" && hours === 12)
                                    hours = 0; // Midnight case

                                  const now = new Date();
                                  const slotTime = new Date(date);
                                  slotTime.setHours(
                                    hours,
                                    parseInt(minutesStr) || 0,
                                    0,
                                    0
                                  );

                                  return now > slotTime;
                                })();

                              return (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  disabled={
                                    isBooked ||
                                    isInCart ||
                                    isPastTime ||
                                    slotsLoading
                                  }
                                >
                                  {time}
                                  {isBooked && " (Booked)"}
                                  {isInCart && " (In Request)"}
                                  {isPastTime && " (Past)"}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <SelectItem value="" disabled>
                              Select date first
                            </SelectItem>
                          )}
                          {slotsLoading && date && (
                            <SelectItem value="loading" disabled>
                              Loading slots...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    <Label htmlFor="special_requests">
                      Special Request (Optional)
                    </Label>
                    <Textarea
                      id="special_requests"
                      name="special_requests"
                      value={currentSelection.special_requests}
                      onChange={handleTextAreaChange}
                      placeholder="Enter any special requests for this specific appointment"
                      rows={3} // Reduced rows maybe
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  {/* --- Changed Button --- */}
                  <Button
                    type="button" // Change type to button
                    onClick={handleAddBooking} // Call add handler
                    className="w-full"
                    disabled={
                      slotsLoading ||
                      !date ||
                      !currentSelection.serviceId ||
                      !currentSelection.time
                    } // Disable if loading or fields missing
                  >
                    Add to Booking Request
                  </Button>
                  {/* --- --- */}
                </CardFooter>
                {/* Removed form tag here */}
              </Card>

              {/* --- Booking Cart Section --- */}
              {pendingBookings.length > 0 && (
                <Card ref={bookingCartRef}>
                  <CardHeader>
                    <CardTitle className="font-montserrat">
                      Your Booking Request
                    </CardTitle>
                    <CardDescription>
                      Review your selections below before submitting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingBookings.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="border p-4 rounded-md space-y-2 relative"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveBooking(booking.id)}
                          aria-label="Remove booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <p className="font-semibold">{booking.service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {format(booking.date, "PPP")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Time: {booking.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatZAR(booking.service.price)}
                        </p>
                        {booking.special_requests && (
                          <p className="text-sm text-muted-foreground italic">
                            Request: {booking.special_requests}
                          </p>
                        )}
                        {/* Add a separator between items, but not after the last one */}
                        {index < pendingBookings.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    ))}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Estimated Price:</span>
                      <span>{formatZAR(totalCartPrice)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={handleFinalSubmit}
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled={isSubmitting || slotsLoading}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : `Submit ${pendingBookings.length} Booking(s)`}
                    </Button>
                  </CardFooter>
                </Card>
              )}
              {/* --- --- */}
            </div>

            {/* Service Details Column (keep mostly as is) */}
            <Card className="md:sticky top-24 self-start">
              {" "}
              {/* Make sticky */}
              <CardHeader>
                <CardTitle className="font-montserrat">Our Services</CardTitle>
                <CardDescription>
                  Click a service below to select it in the form.
                </CardDescription>{" "}
                {/* Added hint */}
              </CardHeader>
              <CardContent>
                {/* Make services clickable to select them */}
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {" "}
                  {/* Added scroll */}
                  {services.map((service) => (
                    <button // Change div to button for accessibility/semantics
                      key={service.id}
                      type="button" // Prevent form submission if accidentally nested
                      onClick={() =>
                        handleSelectChange("serviceId", service.id)
                      } // Select service on click
                      className={cn(
                        "w-full text-left p-4 rounded-lg border relative transition-colors hover:bg-muted/50", // Added hover state
                        currentSelection.serviceId === service.id && // Highlight based on current selection
                          "border-primary bg-primary/10 ring-1 ring-primary"
                      )}
                    >
                      {currentSelection.serviceId === service.id && (
                        <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Selected
                        </span>
                      )}

                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                      {/* <br /> // Remove extra breaks for cleaner look */}
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.details}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        {formatZAR(service.price)}
                      </p>
                    </button> // Close button tag
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 font-montserrat">
                  Booking Information
                </h2>
                <ul className="space-y-4">
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <Clock className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 8:00 AM - 6:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <Phone className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Contact Information</p>
                      <p>Phone: +27781470504</p>
                      <p>Email: sylvia_emerah@yahoo.com</p>
                    </div>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <Info className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Cancellation Policy </p>
                      <p>
                        Please provide at least 24 hours notice for
                        cancellations or rescheduling to avoid a cancellation
                        fee.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4 font-montserrat">
                  What to Expect
                </h2>
                <ul className="space-y-4">
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Consultation</p>
                      <p>
                        All new clients receive a complimentary consultation to
                        discuss your goals and create a personalized treatment
                        plan.
                      </p>
                    </div>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Arrival</p>
                      <p>
                        Please arrive 10-15 minutes before your scheduled
                        appointment to complete any necessary paperwork.
                      </p>
                    </div>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Payment</p>
                      <p>We accept all major credit cards and cash.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
