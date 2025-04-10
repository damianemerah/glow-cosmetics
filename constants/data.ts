import type { BeautyTip, Service } from "@/types/dashboard";

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
    id: "semi-permanent-makeup",
    name: "Semi Permanent Makeup",
    description:
      "Enhance your natural beauty with our semi permanent makeup service.",
    price: 900,
    image: "/images/pic6.jpg",
    details:
      "Our semi permanent makeup service is designed to subtly define your features. Using advanced techniques and high-quality pigments, we create natural, long-lasting results that enhance your overall look.",
    category: "makeup",
  },
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
    id: "consultation",
    name: "Consultation",
    description:
      "Book a one-on-one consultation session with our beauty and wellness experts.",
    price: 200,
    image: "/images/consultation.jpg",
    details:
      "Our consultation service provides personalized advice on beauty and wellness. In this session, you can discuss your goals, ask questions about our services, and receive tailored recommendations to enhance your natural beauty.",
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

export const timeSlots: string[] = [
  "9:00 AM",
  "10:45 AM",
  "12:30 PM",
  "2:15 PM",
  "4:00 PM",
];
