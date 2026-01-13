'use client'

const PriceBreakdown = ({ pricing }) => {
    if (!pricing) return null

    return (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                Price Breakdown
            </h3>
            <div className="space-y-2">
                {pricing.metalCost && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Metal Cost</span>
                        <span className="font-medium">₹{pricing.metalCost.toLocaleString('en-IN')}</span>
                    </div>
                ))}

                {pricing.labourCharge && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Labour Charges</span>
                        <span className="font-medium">₹{pricing.labourCharge.toLocaleString('en-IN')}</span>
                    </div>
                )}

                {pricing.hallmarkCharges && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Hallmark Charges</span>
                        <span className="font-medium">₹{pricing.hallmarkCharges.toLocaleString('en-IN')}</span>
                    </div>
                )}

                {pricing.gst && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">GST</span>
                        <span className="font-medium">₹{pricing.gst.toLocaleString('en-IN')}</span>
                    </div>
                )}

                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-base">
                        <span className="text-gray-800 dark:text-gray-200">Total Price</span>
                        <span className="text-primary">₹{pricing.finalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PriceBreakdown
