import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/constants/ui/index";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function BookingPage({ bookingId }: { bookingId: string }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-green-100">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold font-montserrat">
            Booking Confirmed!
          </CardTitle>
          <CardDescription>
            Your booking (ID: {bookingId}) has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Thank you for your deposit payment. Your appointment has been
            secured with Glow by Sylvia.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            A confirmation email has been sent to your registered email address
            with all the details.
          </p>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>
                  Arrive 10 minutes before your scheduled appointment time
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Bring a form of ID for verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>
                  The remaining balance will be due at the time of your
                  appointment
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">View My Bookings</Link>
          </Button>
          <Button asChild className="bg-green-500 hover:bg-green-600">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
