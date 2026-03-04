export const TAILWIND_COLORS: Record<string, string> = {
    "slate-50":"#f8fafc","slate-200":"#e2e8f0","slate-600":"#475569","slate-700":"#334155",
    "gray-50":"#f9fafb","gray-100":"#f3f4f6","gray-200":"#e5e7eb","gray-500":"#6b7280","gray-600":"#4b5563","gray-700":"#374151",
    "red-50":"#fef2f2","red-200":"#fecaca","red-600":"#dc2626","red-700":"#b91c1c",
    "orange-50":"#fff7ed","orange-200":"#fed7aa","orange-600":"#ea580c","orange-700":"#c2410c",
    "yellow-50":"#fefce8","yellow-200":"#fef08a","yellow-600":"#ca8a04","yellow-700":"#a16207",
    "green-50":"#f0fdf4","green-200":"#bbf7d0","green-600":"#16a34a","green-700":"#15803d",
    "emerald-50":"#ecfdf5","emerald-200":"#a7f3d0","emerald-600":"#059669","emerald-700":"#047857",
    "teal-50":"#f0fdfa","teal-200":"#99f6e4","teal-600":"#0d9488","teal-700":"#0f766e",
    "blue-50":"#eff6ff","blue-200":"#bfdbfe","blue-600":"#2563eb","blue-700":"#1d4ed8",
    "indigo-50":"#eef2ff","indigo-200":"#c7d2fe","indigo-600":"#4f46e5","indigo-700":"#4338ca",
    "purple-50":"#faf5ff","purple-200":"#e9d5ff","purple-600":"#9333ea","purple-700":"#7e22ce",
    "pink-50":"#fdf2f8","pink-200":"#fbcfe8","pink-600":"#db2777","pink-700":"#be185d",
};

export function parseColorCode(colorCode?: string): React.CSSProperties {
    if (!colorCode) return { backgroundColor: "#f9fafb", color: "#4b5563", borderColor: "#e5e7eb" };
    const style: React.CSSProperties = {};
    for (const cls of colorCode.split(" ")) {
        const bg = cls.match(/^bg-(.+)$/);
        const text = cls.match(/^text-(.+)$/);
        const border = cls.match(/^border-(.+)$/);
        if (bg?.[1] && TAILWIND_COLORS[bg[1]])       style.backgroundColor = TAILWIND_COLORS[bg[1]];
        if (text?.[1] && TAILWIND_COLORS[text[1]])   style.color = TAILWIND_COLORS[text[1]];
        if (border?.[1] && TAILWIND_COLORS[border[1]]) style.borderColor = TAILWIND_COLORS[border[1]];
    }
    return style;
}