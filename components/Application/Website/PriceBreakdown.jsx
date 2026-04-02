'use client'

const PriceBreakdown = ({ pricing }) => {
    if (!pricing) return null

    return (
        <div className="mb-10">
            <div className="shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Price Breakdown</h2>
                </div>
                <div className="p-0 sm:p-4">
                    <table className="w-full">
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {pricing.metalCost && (
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Metal Cost
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm text-right">
                                        ₹{pricing.metalCost.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )}

                            {pricing.labourCharge && (
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Labour Charges
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm text-right">
                                        ₹{pricing.labourCharge.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )}

                            {pricing.hallmarkCharges && (
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        Hallmark Charges
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm text-right">
                                        ₹{pricing.hallmarkCharges.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )}

                            {pricing.gst && (
                                <tr>
                                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        GST (3%)
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm text-right">
                                        ₹{pricing.gst.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )}

                            <tr className="bg-primary/5 dark:bg-primary/10">
                                <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 text-base">
                                    Total Price
                                </td>
                                <td className="py-4 px-4 font-bold text-primary text-lg text-right">
                                    ₹{pricing.finalPrice.toLocaleString('en-IN')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default PriceBreakdown
