import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductAdditionalDetails } from "@/types";
import HtmlDescription from "@/components/common/html-description";

interface Props {
  description: string | null;
  additionalDetails: ProductAdditionalDetails;
}

export default function ProductDescriptionAndDetails({
  description,
  additionalDetails,
}: Props) {
  const hasDescription =
    !!description && description.trim() && description !== "<p><br></p>";
  const hasDetails = additionalDetails.length > 0;

  if (!hasDescription && !hasDetails) return null;

  const defaultTab = hasDescription ? "description" : "details";

  return (
    <div className="mt-10 md:mt-16 mb-16">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList
          className={`grid w-full mb-5 ${
            hasDescription && hasDetails ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {hasDescription && (
            <TabsTrigger
              value="description"
              className="text-base font-semibold"
            >
              Product Description
            </TabsTrigger>
          )}
          {hasDetails && (
            <TabsTrigger value="details" className="text-base font-semibold">
              Additional Details
            </TabsTrigger>
          )}
        </TabsList>

        {hasDescription && (
          <TabsContent value="description">
            <HtmlDescription description={description || ""} limit={400} />
          </TabsContent>
        )}

        {hasDetails && (
          <TabsContent value="details">
            <div className="p-4 md:p-6 bg-gray-50/50 rounded-lg border space-y-3">
              {additionalDetails.map(({ key, value }, index) => (
                <div
                  key={key}
                  className={`grid grid-cols-2 gap-4 text-sm items-center pt-4 ${index !== 0 && "border-t border-gray-200"}`}
                >
                  <dt className="font-medium text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className="text-gray-800">{value}</dd>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
