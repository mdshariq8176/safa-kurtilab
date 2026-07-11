// Safa Kurtilab 3PL Logistics Integration Mock (Shiprocket / Delhivery B2B)

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShiprocketOrderPayload {
  orderId: string;
  customerDetails: CustomerDetails;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }>;
}

export interface ShiprocketResponse {
  success: boolean;
  trackingId: string;
  courierName: string;
  labelUrl: string;
  manifestUrl: string;
  pickupDate: string;
  estimatedDelivery: string;
}

/**
 * Simulates requesting a 3PL pickup through Shiprocket B2B API nodes.
 * Allocates courier partner (Delhivery/BlueDart) and generates live tracking numbers.
 */
export async function bookShiprocketPickup(
  orderId: string,
  customerDetails: CustomerDetails,
  items: Array<{ title: string; quantity: number; price: number; size: string; color: string }>
): Promise<ShiprocketResponse> {
  console.log(`[Shiprocket B2B API] Initializing shipment booking for Order ID: ${orderId}...`);
  console.log(`[Shiprocket B2B API] Destination Pin: ${customerDetails.pincode} (${customerDetails.city}, ${customerDetails.state})`);
  console.log(`[Shiprocket B2B API] Packing ${items.reduce((sum, i) => sum + i.quantity, 0)} garments.`);

  // 1. Simulate remote HTTP request latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 2. Generate mock tracking references
  const trackingNumber = `SR${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const couriers = ['Delhivery B2B Premium', 'BlueDart Express Air', 'Xpressbees Surface', 'DTDC Air'];
  // Allocate courier based on pin code routing rules
  const courier = couriers[Math.floor(Math.random() * couriers.length)];

  // 3. Construct manifest PDFs
  const mockLabelId = Math.floor(200000 + Math.random() * 800000);
  const labelUrl = `https://shiprocket.co/labels/manifest_${mockLabelId}.pdf`;
  const manifestUrl = `https://shiprocket.co/manifests/pickup_${mockLabelId}.pdf`;

  // 4. Calculate calendar dates
  const today = new Date();
  const pickup = new Date(today);
  pickup.setDate(today.getDate() + 1); // Pick up next business day
  const delivery = new Date(today);
  delivery.setDate(today.getDate() + 4); // Delivery within 4 days

  const response: ShiprocketResponse = {
    success: true,
    trackingId: trackingNumber,
    courierName: courier,
    labelUrl,
    manifestUrl,
    pickupDate: pickup.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    estimatedDelivery: delivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  };

  console.log(`[Shiprocket B2B API] Shipment booked successfully. Assigned: ${courier} | Tracking: ${trackingNumber}`);
  return response;
}
