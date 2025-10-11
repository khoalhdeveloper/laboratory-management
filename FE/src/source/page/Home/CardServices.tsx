

interface CardServicesProps {
    title: string;
    description: string;
    icon: string;
    features: string[];
}

function CardServices({ title, description, icon, features }: CardServicesProps) {
    return (
        <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-xl">
                    {icon}
                </span>
                <h3 className="text-xl font-bold">
                    {title.split(' ').map((word, index) => (
                        <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                            {word}
                            {index < title.split(' ').length - 1 && '\u00A0'}
                        </span>
                    ))}
                </h3>
            </div>
            <p className="text-neutral-600 dark:text-gray-300 text-sm mb-4">{description}</p>
            <ul className="space-y-2">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-300 to-violet-400"></span>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CardServices;
