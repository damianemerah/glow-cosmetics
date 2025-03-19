"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { services, timeSlots } from "@/constants/data";
import { createBooking } from "../../actions/bookingAction";
import { toast } from "sonner";
import { useUserStore } from "@/store/authStore";
import { useBookingStore } from "@/app/store/bookingStore";
import { BookingStatus } from "@/types/dashboard";
import { Clock, Phone, Info, CheckCircle } from "lucide-react";
import { DepositPopup } from "@/components/DepositPopup";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789", 5);

export default function BookingPage() {
  const [date, setDate] = useState<Date>(new Date());
  const user = useUserStore((state) => state.user);
  const { bookedSlots, isLoading, fetchSlotsForDate } = useBookingStore();
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    service: "",
    time: "",
    special_requests: "",
    servicePrice: 0,
  });
  const [openDepositPopup, setOpenDepositPopup] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Get booked slots for the currently selected date
  const currentDateBookings = date
    ? bookedSlots.get(date.toDateString()) || []
    : [];

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Fetch booked slots when the component mounts or date changes
  useEffect(() => {
    if (date) {
      fetchSlotsForDate(date);
    }
  }, [date, fetchSlotsForDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const selectedService = services.find((service) => service.id === value);
      return {
        ...prev,
        [name]: value,
        servicePrice: selectedService ? selectedService.price : 0,
      };
    });
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!date) {
        toast.error("Please select a date");
        return;
      }
      // if (!user) {
      //   toast.error("Please login to book an appointment");
      //   return;
      // }
      if (!formData.service) {
        toast.error("Please select a service");
        return;
      }
      if (!formData.time) {
        toast.error("Please select a time");
        return;
      }

      const [hours, minutes] = formData.time.split(":");
      const isPM = formData.time.toLowerCase().includes("pm");
      const timeHours =
        parseInt(hours) + (isPM && parseInt(hours) !== 12 ? 12 : 0);

      const bookingTime = new Date(date);
      bookingTime.setHours(timeHours);
      bookingTime.setMinutes(parseInt(minutes) || 0);
      bookingTime.setSeconds(0);
      bookingTime.setMilliseconds(0);
      const booking_id = nanoid();

      const bookingData = {
        user_id: user?.user_id,
        service_id: formData.service,
        service_name: services.find(
          (service) => service.id === formData.service
        )?.name,
        service_price: formData.servicePrice,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.special_requests,
        booking_time: bookingTime.toISOString(),
        status: "pending" as BookingStatus,
        booking_id: `GLOW-${booking_id}`,
      };
      const { error, booking } = await createBooking(bookingData);
      setBookingId(booking?.booking_id);
      setOpenDepositPopup(true);

      if (error) {
        throw new Error(error.message);
      }

      fetchSlotsForDate(date);

      // toast.success(
      //   "Booking request submitted! We'll contact you to confirm your appointment."
      // );
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };


  return (
    <>
      <DepositPopup
        open={openDepositPopup}
        onOpenChange={setOpenDepositPopup}
        bookingId={bookingId}
      />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="bg-secondary py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 font-montserrat">
              Book Your Appointment
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Schedule your beauty and wellness services with our experienced
              professionals.
            </p>
          </div>
        </section>

        {/* Booking Form and Services Section */}
        <section className="py-16 bg-white">
          <div className="px-4 sm:px-8 md:px-16 mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat">
                  Appointment Request
                </CardTitle>
                <CardDescription>
                  Fill out the form below to request an appointment. We&apos;ll
                  contact you to confirm.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
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
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange("service", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - R{service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative z-50">
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
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today || date.getDay() === 0;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select
                        onValueChange={(value) =>
                          handleSelectChange("time", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => {
                            const isPastTime =
                              date &&
                              new Date().toDateString() ===
                                date.toDateString() &&
                              new Date().getHours() >
                                parseInt(time.split(":")[0]) +
                                  (time.includes("PM") &&
                                  parseInt(time.split(":")[0]) !== 12
                                    ? 12
                                    : 0) &&
                              new Date().getMinutes() > 0;

                            return (
                              <SelectItem
                                key={time}
                                value={time}
                                disabled={
                                  currentDateBookings.some(
                                    (bookedSlot) =>
                                      format(bookedSlot, "h:mm a") === time
                                  ) || isPastTime
                                }
                              >
                                {time}
                                {isLoading && time === "Loading..."}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special_requests">Special Request</Label>
                    <Textarea
                      id="special_requests"
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleTextAreaChange}
                      placeholder="Enter your special requests or notes here"
                      rows={5}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={isLoading}
                  >
                    Request Appointment
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat">Our Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "p-4 rounded-lg border relative",
                        formData.service === service.id &&
                          "border-primary bg-primary/10"
                      )}
                    >
                      {formData.service === service.id && (
                        <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Selected
                        </span>
                      )}

                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <br />
                      <p className="text-sm text-muted-foreground">
                        {service.details}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        R{service.price}
                      </p>
                    </div>
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
                      <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                      <p>Saturday: 10:00 AM - 3:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <Phone className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Contact Information</p>
                      <p>Phone: (555) 123-4567</p>
                      <p>Email: info@abaesthetics.com</p>
                    </div>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-1">
                    <Info className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">Cancellation Policy</p>
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
                      <p>
                        We accept all major credit cards, cash, and offer
                        financing options through Cherry.
                      </p>
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
