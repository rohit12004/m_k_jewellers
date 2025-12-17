'use client'

const VariantSelector = ({ label, options, selected, onChange }) => {
    return (
        <div>
            <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                {label}
            </p>
            <div className="flex flex-wrap gap-3">
                {options.map((option) => (
                    <label
                        key={option}
                        onClick={() => onChange(option)}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="relative flex items-center justify-center">
                            {/* Radio button outer circle */}
                            <div className={`
                                w-5 h-5 rounded-full border-2 transition-all
                                ${option === selected
                                    ? 'border-primary'
                                    : 'border-gray-400 dark:border-gray-500 group-hover:border-primary/50'
                                }
                            `}>
                                {/* Radio button inner dot */}
                                {option === selected && (
                                    <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-primary" />
                                )}
                            </div>
                        </div>
                        <span
                            className={`
                                text-sm font-medium transition-colors
                                ${option === selected
                                    ? 'text-gray-900 dark:text-gray-100'
                                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                                }
                            `}
                        >
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    )
}

export default VariantSelector

