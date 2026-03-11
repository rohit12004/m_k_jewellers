'use client'

import { HiMinus, HiPlus } from 'react-icons/hi2'

const QuantitySelector = ({ quantity, onChange, min = 1, max = 99 }) => {
    const handleIncrement = () => {
        if (quantity < max) {
            onChange(quantity + 1)
        }
    }

    const handleDecrement = () => {
        if (quantity > min) {
            onChange(quantity - 1)
        }
    }

    return (
        <div>
            <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Quantity</p>
            <div className="flex items-center h-8 sm:h-10 border sm:border-2 border-gray-300 dark:border-gray-600 w-fit rounded-full overflow-hidden">
                <button
                    type="button"
                    className="h-full w-8 sm:w-10 flex justify-center items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDecrement}
                    disabled={quantity <= min}
                >
                    <HiMinus className="text-base sm:text-lg" />
                </button>

                <input
                    type="text"
                    value={quantity}
                    className="w-10 sm:w-14 text-center border-none outline-none bg-transparent font-semibold text-sm sm:text-base"
                    readOnly
                />

                <button
                    type="button"
                    className="h-full w-8 sm:w-10 flex justify-center items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleIncrement}
                    disabled={quantity >= max}
                >
                    <HiPlus className="text-base sm:text-lg" />
                </button>
            </div>
        </div>
    )
}

export default QuantitySelector
