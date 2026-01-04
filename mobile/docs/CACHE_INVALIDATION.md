# TanStack Query Cache Invalidation Guide

## Overview

This document explains how to invalidate TanStack Query cache to ensure data stays in sync after mutations (creating, updating, or deleting data).

## When to Invalidate Cache

Invalidate cache after these operations:
- ✅ Order placed successfully
- ✅ Profile updated
- ✅ User logs out
- ✅ Any mutation that affects displayed data

## How to Invalidate Cache

### 1. Import useQueryClient

```javascript
import { useQueryClient } from '@tanstack/react-query';
```

### 2. Get the Query Client Instance

```javascript
const queryClient = useQueryClient();
```

### 3. Invalidate After Mutation

```javascript
// After successful order placement
queryClient.invalidateQueries(['user-orders']);

// Or with specific user ID
queryClient.invalidateQueries(['user-orders', auth?.id]);
```

## Example: Checkout Flow

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function CheckoutScreen() {
    const queryClient = useQueryClient();
    const auth = useSelector((store) => store.authStore.auth);

    const placeOrderMutation = useMutation({
        mutationFn: async (orderData) => {
            const response = await api.post('/api/payment/save-order', orderData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                // ✅ Invalidate orders cache - forces refetch
                queryClient.invalidateQueries(['user-orders', auth?.id]);
                
                // Show success message
                showToast('success', 'Order Placed', 'Your order has been placed successfully!');
                
                // Navigate to order details or account page
                router.push(`/order-details/${data.data.orderId}`);
            }
        },
        onError: (error) => {
            showToast('error', 'Error', 'Failed to place order');
        },
    });

    return (
        // Your checkout UI
    );
}
```

## Current Cache Keys in the App

| Query Key | Data | Location |
|-----------|------|----------|
| `['user-orders', userId]` | User's order history | Account tab |

## Best Practices

1. **Always invalidate after mutations** - Ensures UI stays in sync
2. **Use specific query keys** - Only invalidate what changed
3. **Invalidate in onSuccess** - Only after successful mutation
4. **Consider optimistic updates** - For instant UI feedback (advanced)

## Alternative: Manual Refetch

If you have access to the query's `refetch` function:

```javascript
const { data, refetch } = useQuery({
    queryKey: ['user-orders', auth?.id],
    // ...
});

// Later, manually refetch
await refetch();
```

## When You Implement Checkout

Add this code after successful payment:

```javascript
queryClient.invalidateQueries(['user-orders', auth?.id]);
```

This ensures the new order appears immediately in the Account tab.
