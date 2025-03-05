import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
  const categories = [
    { id: "lip-gloss", name: "Lip Gloss" },
    { id: "skin-care", name: "Skin Care" },
    { id: "supplements", name: "Supplements" },
    { id: "all", name: "All Products" },
  ]

  const products = [
    {
      id: 1,
      name: "Hydrating Lip Gloss",
      description: "A nourishing lip gloss that hydrates and adds a subtle shine.",
      price: 24.99,
      category: "lip-gloss",
      image: "/placeholder.svg?height=300&width=300",
      bestseller: true,
    },
    {
      id: 2,
      name: "Plumping Lip Gloss",
      description: "Enhance your lips with this plumping formula for a fuller appearance.",
      price: 29.99,
      category: "lip-gloss",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "Vitamin C Serum",
      description: "Brighten and protect your skin with this powerful antioxidant serum.",
      price: 49.99,
      category: "skin-care",
      image: "/placeholder.svg?height=300&width=300",
      bestseller: true,
    },
    {
      id: 4,
      name: "Hyaluronic Acid Moisturizer",
      description: "Deeply hydrate your skin with this moisture-locking formula.",
      price: 39.99,
      category: "skin-care",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 5,
      name: "Retinol Night Cream",
      description: "Reduce fine lines and wrinkles while you sleep with this potent night cream.",
      price: 54.99,
      category: "skin-care",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 6,
      name: "Collagen Supplements",
      description: "Support skin elasticity and joint health with our premium collagen formula.",
      price: 39.99,
      category: "supplements",
      image: "/placeholder.svg?height=300&width=300",
      bestseller: true,
    },
    {
      id: 7,
      name: "Biotin Hair & Nail Support",
      description: "Strengthen hair and nails with our biotin-rich supplement.",
      price: 34.99,
      category: "supplements",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 8,
      name: "Vitamin E Oil",
      description: "Nourish and protect your skin with this antioxidant-rich oil.",
      price: 19.99,
      category: "skin-care",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Beauty products"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">Shop Our Products</h1>
            <p className="text-xl md:text-2xl">
              Discover our curated collection of premium beauty and wellness products.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-sm md:text-base">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products
                    .filter((product) => category.id === "all" || product.category === category.id)
                    .map((product) => (
                      <Card key={product.id} className="overflow-hidden border-none shadow-md">
                        <div className="relative h-64">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {product.bestseller && (
                            <Badge className="absolute top-2 right-2 bg-green-500">Bestseller</Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1 font-montserrat">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <p className="text-green-500 font-bold">${product.price.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button className="w-full bg-green-500 hover:bg-green-600">Add to Cart</Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-4 font-montserrat">Join Our Loyalty Program</h2>
                <p className="mb-4">Become a member of our exclusive loyalty program and enjoy these benefits:</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Birthday rewards</span>
                  </li>
                </ul>
                <Button className="w-full bg-green-500 hover:bg-green-600">Join Now</Button>
              </div>
              <div className="md:w-1/2 bg-green-500 p-8 text-white">
                <h3 className="text-xl font-bold mb-4 font-montserrat">How It Works</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white text-green-500 flex items-center justify-center font-bold mr-3">
                      1
                    </span>
                    <div>
                      <p className="font-semibold">Sign Up</p>
                      <p className="text-sm opacity-90">Create your account in-store or online</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white text-green-500 flex items-center justify-center font-bold mr-3">
                      2
                    </span>
                    <div>
                      <p className="font-semibold">Earn Points</p>
                      <p className="text-sm opacity-90">Get 1 point for every dollar spent</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white text-green-500 flex items-center justify-center font-bold mr-3">
                      3
                    </span>
                    <div>
                      <p className="font-semibold">Redeem Rewards</p>
                      <p className="text-sm opacity-90">Use your points for discounts on products and services</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#5a6b47] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">Have questions about our products?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Our beauty experts are here to help you find the perfect products for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-[#5a6b47] hover:bg-gray-100">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/booking">Book a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

