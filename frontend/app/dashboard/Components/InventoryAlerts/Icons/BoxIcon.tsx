export const BoxIcon = ({
    className
}:{
    className?:string
}) => (
    <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 12V8l-8-4-8 4v4m16 0l-8 4m8-4l-8 4m0 0v8m0-8L4 12m0 0v4"
        />
    </svg>
);