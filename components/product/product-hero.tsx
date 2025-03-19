import Image from "next/image";

export default function ProductHero() {
  return (
    <section className="relative h-[400px] bg-secondary">
      <div className="absolute inset-0">
        <Image
          src="/images/pic6.jpg"
          alt="Beauty products"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
            Shop Our Products
          </h1>
          <p className="text-xl md:text-2xl">
            Discover our curated collection of premium beauty and wellness
            products.
          </p>
        </div>
      </div>
    </section>
  );
}
