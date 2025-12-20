import { isAuthenticated } from "@/lib/authentication";
import { response, catchError } from "@/lib/helperFunction";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        // ✅ Authentication
        const auth = await isAuthenticated("admin");
        if (!auth.isAuth) {
            return response(false, 403, "Unauthorized.");
        }

        const { id } = await params;

        if (!id) {
            return response(false, 400, 'Order ID is required');
        }

        // Fetch order with full details
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        address: true
                    }
                },
                products: {
                    select: {
                        id: true,
                        productId: true,
                        variantId: true,
                        name: true,
                        weight: true,
                        purity: true,
                        size: true,
                        length: true,
                        color: true,
                        qty: true,
                        unitPrice: true,
                        totalPrice: true,
                        metalRate: true,
                        category: true,
                        subcategory: true,
                        media: true
                    }
                }
            }
        });

        if (!order) {
            return response(false, 404, 'Order not found');
        }

        // Return order details
        return response(true, 200, 'Order details fetched successfully', order);

    } catch (error) {
        console.error('Get order details error:', error);
        return catchError(error);
    }
}

export async function PATCH(request, { params }) {
    try {
        // ✅ Authentication
        const auth = await isAuthenticated("admin");
        if (!auth.isAuth) {
            return response(false, 403, "Unauthorized.");
        }

        const { id } = await params;
        const body = await request.json();
        const { orderStatus } = body;

        if (!id) {
            return response(false, 400, 'Order ID is required');
        }

        if (!orderStatus) {
            return response(false, 400, 'Order status is required');
        }

        // Validate order status enum
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(orderStatus)) {
            return response(false, 400, 'Invalid order status');
        }

        // Check if order exists
        const existingOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!existingOrder) {
            return response(false, 404, 'Order not found');
        }

        // Update order status
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { orderStatus },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        return response(true, 200, 'Order status updated successfully', updatedOrder);

    } catch (error) {
        console.error('Update order status error:', error);
        return catchError(error);
    }
}
