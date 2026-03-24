interface AdoptionHeaderProps {
    stage?: string;
    petName?: string;
}

export default function AdoptionHeader({ stage, petName }: AdoptionHeaderProps) {
    const isRejected = stage === 'Rejected';
    const isCancelled = stage === 'Cancelled';
    const isFailed = isRejected || isCancelled;

    const progressMap: Record<string, number> = {
        "Submitted": 12,
        "Meet & Greet": 31,
        "Requirement": 50,
        "Handover": 69,
        "Completed": 100,
        "Rejected": 100,
        "Cancelled": 100,
    };

    const steps = [
        { label: "Submitted", pos: "left-[12%]" },
        { label: "Meet & Greet", pos: "left-[31%]" },
        { label: "Requirement", pos: "left-[50%]" },
        { label: "Handover", pos: "left-[69%]" },
        { label: "Completed", pos: "left-[88%]" },
    ];

    const progress = stage ? progressMap[stage] : 0;

    const getBarColor = () => {
        if (isRejected) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
        if (isCancelled) return "bg-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.5)]";
        return "bg-[#19E619] shadow-[0_0_10px_rgba(25,230,25,0.5)]";
    };

    return (
        <div className={`w-full max-w-4xl py-6 sm:py-8 px-4 sm:px-6 rounded-xl font-sans transition-colors duration-500 ${isRejected ? 'bg-red-50' : isCancelled ? 'bg-gray-100' : 'bg-[#E8F5E9]'}`}>
            {/* Header Text */}
            <div className="mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-black">
                    Application <br />
                    <span className={isRejected ? "text-red-600" : isCancelled ? "text-gray-600" : "text-black"}>
                        {isFailed ? stage : "Progress"}
                    </span>
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg">
                    {isRejected
                        ? "We're sorry, your application was not approved at this time."
                        : isCancelled
                            ? "This application has been withdrawn."
                            : `Track your adoption journey for ${petName || 'your future pet'}.`}
                </p>
            </div>

            <div className="relative pt-10">
                <div className="absolute top-0 w-full h-10">
                    {steps.map((step) => (
                        <span
                            key={step.label}
                            className={`absolute -translate-x-1/2 text-center leading-tight break-words w-[50px] sm:w-auto text-[8px] sm:text-xs md:text-sm font-semibold transition-colors duration-300 
                            ${step.pos} ${!isFailed && stage && progressMap[stage] >= progressMap[step.label]
                                    ? "text-[#19E619]"
                                    : "text-[#A5D6A7]"
                                }`}
                        >
                            {step.label}
                        </span>
                    ))}
                </div>

                <div className={`w-full rounded-full h-3 overflow-hidden ${isFailed ? 'bg-gray-200' : 'bg-[#C8E6C9]'}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}