import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard Variable","Inter","-apple-system","BlinkMacSystemFont","system-ui","sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bg: { primary: "#FFFFFF", secondary: "#F5F7FA", tertiary: "#F1F5F9" },
        brand: { "50":"#EFF6FF","100":"#DBEAFE","200":"#BFDBFE","400":"#60A5FA","500":"#4A90D9","600":"#3B82F6","700":"#2563EB" },
        sleep: { deep:"#2563EB", light:"#60A5FA", rem:"#93C5FD", awake:"#BFDBFE" },
      },
      borderRadius: { sm:"8px", md:"12px", lg:"16px", xl:"16px", "2xl":"20px", full:"9999px" },
      spacing: { safe:"env(safe-area-inset-bottom)" },
      boxShadow: {
        card:"0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover":"0 4px 12px rgba(0,0,0,0.1)",
        "brand-glow":"0 2px 8px rgba(74,144,217,0.1)",
      },
      fontSize: {
        display:["28px",{lineHeight:"1.3",fontWeight:"700"}],
        h1:["22px",{lineHeight:"1.35",fontWeight:"600"}],
        h2:["18px",{lineHeight:"1.4",fontWeight:"600"}],
        "body-lg":["16px",{lineHeight:"1.5",fontWeight:"500"}],
        body:["14px",{lineHeight:"1.5",fontWeight:"400"}],
        caption:["12px",{lineHeight:"1.4",fontWeight:"400"}],
        overline:["11px",{lineHeight:"1.3",fontWeight:"500"}],
      },
    },
  },
  plugins: [],
};

export default config;
