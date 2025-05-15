import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/index";

export interface HomeCategoriesProps {
  categories: Category[];
}

export default function HomeCategories({ categories }: HomeCategoriesProps) {
  const pinnedCategories = categories
    .filter((cat) => cat.pinned === true && cat.images && cat.images.length > 0)
    .slice(0, 7);

  const groupedCat = pinnedCategories.reduce(
    (acc, cat) => {
      const key = cat.name[0]; // group by first letter
      acc[key] = acc[key] || [];
      acc[key].push(cat);
      return acc;
    },
    {} as Record<string, typeof pinnedCategories>
  );

  const flattenedGroupedCat = Object.values(groupedCat).flat();

  return (
    flattenedGroupedCat.length > 0 && (
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl uppercase font-bold mb-10 md:mb-12 md:text-start text-center font-montserrat text-secondary-foreground">
            Explore By Category
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-7 md:gap-6 gap-4">
            {flattenedGroupedCat.map((category, i) => (
              <Link
                href={`/products/c/${category.slug}`}
                key={category.id}
                className={`group flex flex-col items-center text-center ${i === 6 ? "hidden md:block" : ""}`}
              >
                <div
                  className="
                  relative
                  w-24 h-24
                  md:w-28 md:h-28
                  lg:w-34 lg:h-34
                  xl:w-40 xl:h-40
                  rounded-full overflow-hidden
                  border-2 border-transparent
                  group-hover:border-primary
                  transition-colors duration-300
                "
                >
                  <Image
                    src={
                      category.images?.[0] ?? "/images/placeholder-category.svg"
                    }
                    alt={category.name}
                    fill
                    className="
                    object-cover object-center
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                    sizes="
                    (max-width: 640px) 30vw,
                    (max-width: 1024px) 20vw,
                    (max-width: 1280px) 15vw,
                    10vw
                  "
                  />
                </div>

                {/* label underneath */}
                <span className="mt-2 text-sm md:text-base font-medium text-secondary-foreground">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  );
}
