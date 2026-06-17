/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.html"],
  theme: {
    extend: {
      colors: {
        "outline-variant": "#cfc4c5",
        "surface-tint": "#5e5e5e",
        "surface-bright": "#f9f9f9",
        "primary-container": "#1b1b1b",
        "inverse-primary": "#c6c6c6",
        "surface-white": "#FFFFFF",
        "secondary-fixed": "#e2e2e2",
        "error": "#ba1a1a",
        "on-error-container": "#93000a",
        "primary-fixed-dim": "#c6c6c6",
        "error-container": "#ffdad6",
        "background-canvas": "#F5F5F5",
        "surface-container-highest": "#e2e2e2",
        "surface": "#f9f9f9",
        "surface-variant": "#e2e2e2",
        "tertiary-fixed": "#e2e2e2",
        "on-secondary-container": "#5f6161",
        "surface-container-lowest": "#ffffff",
        "on-secondary-fixed-variant": "#454747",
        "primary-fixed": "#e2e2e2",
        "on-primary-fixed": "#1b1b1b",
        "tertiary-container": "#1b1b1b",
        "on-tertiary": "#ffffff",
        "on-background": "#1b1b1b",
        "secondary": "#5d5f5f",
        "on-tertiary-container": "#848484",
        "secondary-fixed-dim": "#c6c6c7",
        "on-surface": "#1b1b1b",
        "tertiary": "#000000",
        "on-primary": "#ffffff",
        "on-surface-variant": "#4c4546",
        "surface-dim": "#dadada",
        "surface-container-high": "#e8e8e8",
        "on-primary-container": "#848484",
        "text-main": "#000000",
        "primary": "#000000",
        "background": "#f9f9f9",
        "on-primary-fixed-variant": "#474747",
        "tertiary-fixed-dim": "#c6c6c6",
        "on-secondary": "#ffffff",
        "outline": "#7e7576",
        "secondary-container": "#dcdddd",
        "on-secondary-fixed": "#1a1c1c",
        "surface-container": "#eeeeee",
        "inverse-surface": "#303030",
        "on-tertiary-fixed": "#1b1b1b",
        "surface-container-low": "#f3f3f3",
        "on-tertiary-fixed-variant": "#474747",
        "on-error": "#ffffff",
        "inverse-on-surface": "#f1f1f1"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "section-gap": "160px",
        "container-max": "1280px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        "unit": "8px",
        "gutter": "24px"
      },
      fontFamily: {
        "button-text": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-display-mobile": ["Inter", "sans-serif"],
        "headline-display": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"]
      },
      fontSize: {
        "button-text": ["16px", { "lineHeight": "20px", "fontWeight": "600" }],
        "body-lg": ["20px", { "lineHeight": "32px", "fontWeight": "400" }],
        "headline-lg": ["72px", { "lineHeight": "76px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.1em", "fontWeight": "700" }],
        "headline-md": ["40px", { "lineHeight": "44px", "fontWeight": "700" }],
        "headline-display-mobile": ["48px", { "lineHeight": "52px", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "headline-display": ["120px", { "lineHeight": "110px", "letterSpacing": "-0.04em", "fontWeight": "800" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "700" }]
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }
    }
  }
}
