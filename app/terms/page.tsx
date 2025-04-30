import { Loader2 } from "lucide-react";
import TermsPage from "./TermsPage";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for our application",
};

export default function TermsOfService() {
  return (
    <div className=" mx-auto py-6 px-4 md:px-16 flex justify-center items-center">
      <Suspense
        fallback={
          <div className="flex justify-center items-center">
            <Loader2 />
          </div>
        }
      >
        <TermsPage />
      </Suspense>
    </div>
  );
}
