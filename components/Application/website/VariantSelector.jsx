'use client'

const VariantSelector = ({ label, options, selected, onChange }) => {
    return (
        <div>
            <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                {label}: <span className="text-primary">{selected || 'Select'}</span>
            </p>
            <div className="flex flex-wrap gap-3">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        className={`
                            px-4 py-2 rounded-lg border-2 transition-all font-medium
                            ${option === selected
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                            }
                        `}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default VariantSelector
