/**
 * Cart Limits — Anti-Bot Protection
 * 
 * Adjust these values to control cart behavior.
 * These constants are enforced at both the Redux layer AND the UI layer.
 */

/** Maximum number of unique product variants allowed in the cart at once */
export const MAX_UNIQUE_ITEMS = 10;

/** Maximum quantity per single item/variant */
export const MAX_QTY_PER_ITEM = 5;

/** Minimum milliseconds required between two "Add to Cart" actions (throttle) */
export const ADD_TO_CART_COOLDOWN_MS = 2000;
