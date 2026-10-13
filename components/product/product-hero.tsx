import PageHero from "@/components/common/page-hero";

export default function ProductHero() {
  return (
    <PageHero
      eyebrow="The Collection"
      title="Shop Our Products"
      description="Discover our curated collection of premium beauty and wellness products."
      video={{ src: "/videos/makeupkits.mp4", poster: "/images/makeup.jpg" }}
    />
  );
}
