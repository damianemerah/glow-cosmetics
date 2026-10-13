import BookingPage from "../confirmed/BookingPage";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    return null;
  }

  return <BookingPage bookingId={bookingId} />;
}
