"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
  Label,
} from "@/constants/ui/index";
import { customAlphabet } from "nanoid";
import { supabaseClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { deliveryOptions } from "@/constants/data";
import { formatZAR } from "@/utils";

// Create nanoid generator for order references
const nanoid = customAlphabet("0123456789", 6);

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Order form state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderData, setOrderData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "South Africa",
    payment_method: "bank_transfer",
    delivery_method: "store_pickup",
    status: "pending",
  });

  // Load products when component mounts
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from("products")
          .select("id, name, price, stock_quantity")
          .eq("is_active", true)
          .gt("stock_quantity", 0)
          .order("name");

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.warning("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setOrderData((prev) => ({ ...prev, phone: "+" + value }));
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add an item to the order
  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        product_id: "",
        product_name: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  // Remove an item from the order
  const removeOrderItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update an order item
  const updateOrderItem = (index: number, product_id: string) => {
    const product = products.find((p) => p.id === product_id);
    if (!product) return;

    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        product_id,
        product_name: product.name,
        quantity: prev[index].quantity,
        price: product.price,
      };
      return newItems;
    });
  };

  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        quantity,
      };
      return newItems;
    });
  };

  // Calculate order total
  const calculateTotal = () => {
    const deliveryMethodFee = orderData.delivery_method
      ? deliveryOptions.find(
          (method) => method.id === orderData.delivery_method
        )?.fee || 0
      : 0;
    return (
      orderItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0) + deliveryMethodFee
    );
  };

  // Validate the form
  const validateForm = () => {
    if (!orderData.first_name) {
      toast.warning("First name is required");
      return false;
    }
    if (!orderData.last_name) {
      toast.warning("Last name is required");
      return false;
    }
    if (!orderData.email) {
      toast.warning("Email is required");
      return false;
    }
    if (!orderData.phone) {
      toast.warning("Phone number is required");
      return false;
    }
    if (!orderData.address) {
      toast.warning("Address is required");
      return false;
    }
    if (!orderData.city) {
      toast.warning("City is required");
      return false;
    }
    if (!orderData.state) {
      toast.warning("State is required");
      return false;
    }
    if (!orderData.zipCode) {
      toast.warning("ZIP code is required");
      return false;
    }
    if (orderItems.length === 0) {
      toast.warning("Please add at least one product to the order");
      return false;
    }
    if (orderItems.some((item) => !item.product_id)) {
      toast.warning("Please select a product for all order items");
      return false;
    }

    return true;
  };

  // Create the order
  const createOrder = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Generate reference number
      const reference = `ORD-${nanoid()}`;

      // Create shipping address object
      const shippingAddress = {
        firstName: orderData.first_name,
        lastName: orderData.last_name,
        address: orderData.address,
        apartment: orderData.apartment,
        city: orderData.city,
        state: orderData.state,
        zipCode: orderData.zipCode,
        country: orderData.country,
      };

      // Calculate total
      const totalPrice = calculateTotal();

      // Insert order
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          first_name: orderData.first_name,
          last_name: orderData.last_name,
          email: orderData.email,
          phone: orderData.phone,
          payment_method: orderData.payment_method,
          status: orderData.status,
          shipping_address: shippingAddress,
          payment_reference: reference,
          total_price: totalPrice,
          delivery_method: orderData.delivery_method,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItemsToInsert = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      toast.success(`Order ${reference} created successfully`);
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.warning("Failed to create order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Order</h1>
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          Cancel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
          <span>Loading products...</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={orderData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={orderData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={orderData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <PhoneInput
                      country={"za"}
                      value={orderData.phone || ""}
                      onChange={handlePhoneChange}
                      inputProps={{
                        id: "phone",
                        name: "phone",
                        required: true,
                      }}
                      containerClass="w-full"
                      inputClass="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={orderData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment">
                    Apartment, suite, etc. (optional)
                  </Label>
                  <Input
                    id="apartment"
                    name="apartment"
                    value={orderData.apartment}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={orderData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={orderData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={orderData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={orderData.country}
                    onValueChange={(value) =>
                      handleSelectChange("country", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No items added to this order yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-end gap-2 pb-2 border-b"
                      >
                        <div className="flex-1 space-y-2">
                          <Label>Product</Label>
                          <Select
                            value={item.product_id}
                            onValueChange={(value) =>
                              updateOrderItem(index, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {formatZAR(product.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-24 space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(
                                index,
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div className="w-24 space-y-2">
                          <Label>Price</Label>
                          <Input value={`${formatZAR(item.price)}`} disabled />
                        </div>

                        <div className="w-24 space-y-2">
                          <Label>Subtotal</Label>
                          <Input
                            value={`${formatZAR(item.price * item.quantity)}`}
                            disabled
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addOrderItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={orderData.payment_method}
                    onValueChange={(value) =>
                      handleSelectChange("payment_method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="paystack">
                        Card Payment (Paystack)
                      </SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select
                    value={orderData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Method</Label>
                  <Select
                    value={orderData.delivery_method}
                    onValueChange={(value) =>
                      handleSelectChange("delivery_method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} ({option.fee})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatZAR(calculateTotal())}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={createOrder}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
