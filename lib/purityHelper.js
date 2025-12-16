/**
 * Get purity options based on category name
 * @param {string} categoryName - Category name (e.g., "Gold", "Silver", "Diamond")
 * @returns {Array} Array of purity options
 */
export function getPurityOptions(categoryName) {
    const purityMap = {
        'Gold': [
            { label: '18K', value: '18K' },
            { label: '22K', value: '22K' },
            { label: '24K', value: '24K' },
        ],
        'Silver': [
            { label: '92.5 (Sterling)', value: '92.5' },
            { label: '99.9 (Pure)', value: '99.9' },
        ],
        'Diamond': [
            { label: 'Standard', value: 'Standard' },
        ]
    }

    // Return options for the given category, or empty array if not found
    return purityMap[categoryName] || []
}

/**
 * Get default purity based on category
 * @param {string} categoryName - Category name
 * @returns {string} Default purity value
 */
export function getDefaultPurity(categoryName) {
    const defaults = {
        'Gold': '22K',      // Most common in India
        'Silver': '92.5',   // Sterling silver
        'Diamond': 'Standard'
    }

    return defaults[categoryName] || ''
}
