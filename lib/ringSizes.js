// Ring sizes available for jewelry products (1-33)
export const RING_SIZES = Array.from({ length: 33 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString()
}))
