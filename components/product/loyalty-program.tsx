import { Button } from "@/components/ui/button";

export default function LoyaltyProgram() {
  return (
    <section className="py-16 bg-green-light">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-4 font-montserrat">
                Join Our Loyalty Program
              </h2>
              <p className="mb-4">
                Become a member of our exclusive loyalty program and enjoy these
                benefits:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>Earn points on every purchase</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>Exclusive member-only discounts</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>Early access to new products</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>Birthday rewards</span>
                </li>
              </ul>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Join Now
              </Button>
            </div>
            <div className="md:w-1/2 bg-green-500 p-8 text-white">
              <h3 className="text-xl font-bold mb-4 font-montserrat">
                How It Works
              </h3>
              <ol className="space-y-4">
                <li className="flex">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-white text-green-500 flex items-center justify-center font-bold mr-3">
                    1
                  </span>
                  <div>
                    <p className="font-semibold">Sign Up</p>
                    <p className="text-sm opacity-90">
                      Create your account in-store or online
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-white text-green-500 flex items-center justify-center font-bold mr-3">
                    2
                  </span>
                  <div>
                    <p className="font-semibold">Earn Points</p>
                    <p className="text-sm opacity-90">
                      Get 1 point for every dollar spent
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-white text-green-500 flex items-center justify-center font-bold mr-3">
                    3
                  </span>
                  <div>
                    <p className="font-semibold">Redeem Rewards</p>
                    <p className="text-sm opacity-90">
                      Use your points for discounts on products and services
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
