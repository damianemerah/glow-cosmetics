import type { BeautyTip, Service } from "@/types/index";

export const beautyTips: BeautyTip[] = [
  {
    title: "Daily Hydration",
    description:
      "Drink at least 8 glasses of water daily for glowing skin and improved overall health.",
    icon: "💧",
  },
  {
    title: "Sun Protection",
    description:
      "Apply SPF 30+ sunscreen daily, even on cloudy days, to prevent premature aging and protect your skin.",
    icon: "☀️",
  },
  {
    title: "Self-Care Routine",
    description:
      "Schedule a monthly wellness session to reduce stress and maintain your beauty inside and out.",
    icon: "✨",
  },
];

export const services: Service[] = [
  {
    id: "microblading",
    name: "Microblading",
    description:
      "Achieve beautifully defined brows with our microblading service.",
    price: 1000,
    image: "/images/microblading.jpg",
    details:
      "Microblading uses a precise hand-drawn technique to create realistic, natural-looking eyebrow hairs. This service is ideal for filling in sparse brows or creating a fuller brow shape.",
    category: "makeup",
  },
  {
    id: "ombrebrows",
    name: "Ombre Brows",
    description: "Get soft-shaded, powdery brows with our ombre brows service.",
    price: 1200,
    image: "/images/ombre-brow.jpg",
    details:
      "Our ombre brows technique uses a shading method to create a soft, filled-in look that mimics the effect of brow makeup. Perfect for clients wanting a defined yet natural look.",
    category: "makeup",
  },
  {
    id: "lip-blush",
    name: "Lip Blush",
    description: "Get a soft, natural tint with our lip blush service.",
    price: 1000,
    image: "/images/lip-blush.jpg",
    details:
      "Our lip blush procedure enhances your natural lip color, providing a subtle, youthful tint that lasts. Enjoy fuller, more defined lips without the need for constant reapplication.",
    category: "makeup",
  },
  {
    id: "eyeliner",
    name: "Eyeliner",
    description: "Define your eyes with our precision eyeliner service.",
    price: 800,
    image: "/images/eyeliner.jpg",
    details:
      "Our eyeliner service offers a flawless, long-lasting application that enhances the natural shape of your eyes. Perfect for those looking for a defined yet natural look.",
    category: "makeup",
  },
  {
    id: "eyelash-extensions",
    name: "Individual Eyelash Extensions",
    description:
      "Achieve fuller, longer lashes with our individual eyelash extensions.",
    price: 800,
    image: "/images/eyelash.jpg",
    details:
      "Our individual eyelash extensions are applied one by one to your natural lashes, creating a customizable look that ranges from subtle enhancement to full glamour.",
    category: "makeup",
  },
  {
    id: "makeup-application",
    name: "Makeup Application",
    description: "Professional makeup application for any occasion.",
    price: 700,
    image: "/images/makeup.jpg",
    details:
      "Whether it's for a wedding, photoshoot, or night out, our professional makeup application service will create a flawless look tailored to your style and preferences.",
    category: "makeup",
  },
  {
    id: "skincare-treatment",
    name: "Skincare Treatment",
    description: "Personalized facial and skincare treatments.",
    price: 600,
    image: "/images/skin-care.jpg",
    details:
      "Our skincare treatments include deep cleansing, exfoliation, and hydration tailored to your skin type, helping you achieve a radiant, healthy complexion.",
    category: "skincare",
  },
  {
    id: "consultation",
    name: "Consultation",
    description:
      "Book a one-on-one consultation session with our beauty and wellness experts.",
    price: 200,
    image: "/images/consultation.jpg",
    details:
      "Our consultation service provides personalized advice on beauty and wellness. In this session, you can discuss your goals, ask questions about our services, and receive tailored recommendations to enhance your natural beauty. Free when you book a service.",
    category: "consultation",
  },
];

export const categories = [
  { id: "makeup", name: "Makeup" },
  { id: "skin-care", name: "Skin Care" },
  { id: "supplements", name: "Supplements" },
  { id: "jewellery", name: "Jewellery" },
  { id: "all", name: "All Products" },
];

export const categoryOptions = [
  { value: "makeup", label: "Makeup" },
  { value: "skin-care", label: "Skin Care" },
  { value: "supplements", label: "Supplements" },
  { value: "jewellery", label: "Jewellery" },
];

export const timeSlots: Record<string, string[]> = {
  weekday: [
    "09:00 AM", // 9:00 AM - 10:45 AM
    "10:45 AM", // 10:45 AM - 12:30 PM
    "12:30 PM", // 12:30 PM - 2:15 PM
    "02:15 PM", // 2:15 PM - 4:00 PM
    "04:00 PM", // 4:00 PM - 5:45 PM
  ],
  weekend: [
    "08:00 AM", // 8:00 AM - 9:45 AM
    "09:45 AM", // 9:45 AM - 11:30 AM
    "11:30 AM", // 11:30 AM - 1:15 PM
    "01:15 PM", // 1:15 PM - 3:00 PM
    "03:00 PM", // 3:00 PM - 4:45 PM
    "04:45 PM", // 4:45 PM - 6:30 PM
  ],
};

export const SLOT_DURATION_MINUTES = 105; // 1 hour and 45 minutes

// Utility function to get slots for a specific day
export function getTimeSlotsForDay(date: Date): string[] {
  const day = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6 ? timeSlots.weekend : timeSlots.weekday;
}

// Updated recipient groups - simplified to only all and inactive
export const clientGroups = [
  { id: "all", name: "All Clients" },
  { id: "inactive", name: "Inactive Clients (90+ days)" },
];

export const templates = [
  {
    id: "offer",
    name: "Special Offer",
    description: "Announce special discounts or promotions to clients",
    subject: "Exclusive Offer from Glow Cosmetics",
    content:
      "<h2>Exclusive Offer for Our Valued Customers</h2><p>Dear {{user.name}},</p><p>We're delighted to present you with an exclusive offer designed especially for our valued customers.</p><div style='background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;'><h3 style='color: #4CAF50; margin-top: 0;'>15% OFF YOUR NEXT PURCHASE</h3><p style='font-size: 18px;'>Enjoy a special 15% discount on your next booking or product purchase.</p><p style='font-weight: bold; letter-spacing: 1px; font-size: 20px; background-color: #f0f0f0; display: inline-block; padding: 8px 16px; border-radius: 4px;'>GLOW15</p><p style='margin-top: 16px; font-size: 14px; color: #666;'>Valid until: June 30, 2024</p></div><p>To redeem this offer, simply use the code above during checkout on our website or present it when visiting our store.</p>",
    channel: "email",
  },
  {
    id: "announcement",
    name: "New Product Announcement",
    description: "Introduce new products or services to your client base",
    subject: "Introducing Our Latest Beauty Collection",
    content:
      "<h2>Introducing Our Latest Products</h2><p>Dear {{user.name}},</p><p>We're excited to announce the arrival of our newest products to the Glow Cosmetics collection. These high-quality additions have been carefully formulated to enhance your beauty routine with premium ingredients and innovative technology.</p><h3>New Summer Collection</h3><p>Our new collection features products that are:</p><ul style='list-style: none; padding-left: 0;'><li style='padding: 8px 0; border-bottom: 1px solid #f0f0f0;'>✓ Cruelty-free and vegan</li><li style='padding: 8px 0; border-bottom: 1px solid #f0f0f0;'>✓ Made with sustainable ingredients</li><li style='padding: 8px 0; border-bottom: 1px solid #f0f0f0;'>✓ Free from harmful chemicals</li><li style='padding: 8px 0;'>✓ Designed for all skin types</li></ul><p>We highly recommend visiting our store to experience these products firsthand and receive personalized recommendations from our beauty experts.</p>",
    channel: "email",
  },
  {
    id: "appointment",
    name: "Appointment Confirmation",
    description: "Confirm appointments with clients",
    subject: "Your Appointment is Confirmed",
    content:
      "<h2>Your Appointment is Confirmed</h2><p>Dear {{user.name}},</p><p>Thank you for booking an appointment with Glow Cosmetics. We're delighted to confirm your upcoming service.</p><div style='background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 24px 0;'><table style='width: 100%; border-collapse: collapse;'><tr><td style='padding: 8px 0; font-weight: bold;'>Service:</td><td style='padding: 8px 0;'>{{booking.name}}</td></tr><tr><td style='padding: 8px 0; font-weight: bold;'>Date:</td><td style='padding: 8px 0;'>{{booking.date}}</td></tr><tr><td style='padding: 8px 0; font-weight: bold;'>Time:</td><td style='padding: 8px 0;'>{{booking.time}}</td></tr><tr><td style='padding: 8px 0; font-weight: bold;'>Booking Reference:</td><td style='padding: 8px 0;'>{{booking.id}}</td></tr></table></div><p>We look forward to welcoming you to our salon. Please arrive 10 minutes before your appointment time to ensure a seamless experience.</p>",
    channel: "email",
  },
];

export const templateVariables = [
  { name: "{{user.name}}", description: "Client's full name" },
  { name: "{{user.firstName}}", description: "Client's first name" },
  { name: "{{user.email}}", description: "Client's email address" },
  { name: "{{user.phone}}", description: "Client's phone number" },
];

// Booking-specific template variables
export const bookingTemplateVariables = [
  { name: "{{booking.id}}", description: "Booking reference ID" },
  { name: "{{booking.date}}", description: "Appointment date" },
  { name: "{{booking.time}}", description: "Appointment time" },
  { name: "{{booking.name}}", description: "Service name" },
  { name: "{{booking.specialRequests}}", description: "Special requests" },
];

export const keys: Record<string, string> = {
  instagram: "https://www.instagram.com/glowbyugosylviacosmetics",
  facebook: "https://www.facebook.com/profile.php?id=100069551504619",
  phone: "+27781470504",
};
