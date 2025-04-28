// import Image from "next/image";

export default function ProductHero() {
  return (
    <section className="relative h-[400px] bg-secondary overflow-hidden">
      <div className="absolute inset-0">
        <video
          src="/videos/makeupkits.mp4"
          poster="/images/pic6.jpg"
          autoPlay
          loop
          muted
          playsInline // Important for mobile browsers (especially iOS)
          // Styling to cover the container, mimicking the Image behavior
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Fallback text for browsers that don't support the video tag */}
          Your browser does not support the video tag.
        </video>
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
