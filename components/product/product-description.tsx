import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductAdditionalDetails } from "@/types";
import HtmlDescription from "@/components/common/html-description";

const tabTrigger =
  "-mb-px flex-none rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 font-heading text-xl font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

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
    <div className="mb-16 mt-12 md:mt-20">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
          {hasDescription && (
            <TabsTrigger value="description" className={tabTrigger}>
              Description
            </TabsTrigger>
          )}
          {hasDetails && (
            <TabsTrigger value="details" className={tabTrigger}>
              Details
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
            <dl className="max-w-3xl space-y-3 rounded-xl border bg-card p-4 md:p-6">
              {additionalDetails.map(({ key, value }, index) => (
                <div
                  key={key}
                  className={`grid grid-cols-2 gap-4 text-sm items-center pt-4 ${index !== 0 && "border-t border-border"}`}
                >
                  <dt className="font-medium text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
