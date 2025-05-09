import Image from "next/image";

export default function LoadingPage() {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-white"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="animate-pulse">
        <Image
          src="/images/glowLogo.png"
          alt="Glow by UgoSylvia Logo"
          width={180}
          height={45}
          className="object-contain"
          priority={true}
        />
      </div>
    </div>
  );
}
