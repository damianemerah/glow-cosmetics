interface ProductDescriptionProps {
  description: string | null;
}

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  if (!description) {
    return null;
  }

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 font-montserrat">
        Product Description
      </h2>
      <div
        className="prose max-w-none text-gray-700 p-6 bg-gray-50 rounded-lg"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}
