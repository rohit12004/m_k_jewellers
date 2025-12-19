import { response, catchError } from "@/lib/helperFunction";
import { verifyCartPrices } from "@/lib/order.service";

export async function POST(request) {
    try {
        const { cartItems } = await request.json();

        // Calculate fresh prices using current metal rates
        const { verifiedItems } = await verifyCartPrices(cartItems);

        return response(true, 200, 'Prices calculated successfully', {
            items: verifiedItems
        });

    } catch (error) {
        console.error('Cart price calculation error:', error);
        return catchError(error);
    }
}
