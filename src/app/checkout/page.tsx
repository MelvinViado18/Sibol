import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6EEDC] text-[#3C2A18]">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#D7C29B] border-t-[#2E6C3C]" />
              <p className="mt-4 text-sm font-medium text-[#7A6547]">
                Loading checkout...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}