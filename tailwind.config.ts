import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                bg2: "var(--bg2)",
                bg3: "var(--bg3)",
                bg4: "var(--bg4)",
                white: "var(--white)",
                ink: "var(--ink)",
                ink2: "var(--ink2)",
                ink3: "var(--ink3)",
                ink4: "var(--ink4)",
                acc: "var(--acc)",
                acc2: "var(--acc2)",
                grn: "var(--grn)",
                ylw: "var(--ylw)",
                blu: "var(--blu)",
                pur: "var(--pur)",
            },
            fontFamily: {
                serif: ["var(--font-instrument-serif)", "serif"],
                sans: ["var(--font-outfit)", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;
