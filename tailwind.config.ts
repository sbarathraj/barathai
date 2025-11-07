import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gradient-move': {
					'0%, 100%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					}
				},
				'gradient-text': {
					'0%, 100%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					}
				},
				'fade-in-slide-down': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float-slow': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(-20px) rotate(180deg)'
					}
				},
				'float-medium': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(-15px) rotate(-180deg)'
					}
				},
				'boxie1': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-10px) translateX(5px) rotate(120deg)'
					},
					'66%': {
						transform: 'translateY(5px) translateX(-5px) rotate(240deg)'
					}
				},
				'boxie2': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) rotate(0deg)'
					},
					'25%': {
						transform: 'translateY(8px) translateX(-8px) rotate(90deg)'
					},
					'50%': {
						transform: 'translateY(-5px) translateX(8px) rotate(180deg)'
					},
					'75%': {
						transform: 'translateY(5px) translateX(-3px) rotate(270deg)'
					}
				},
				'boxie3': {
					'0%, 100%': {
						transform: 'translateY(0px) translateX(0px) rotate(0deg)'
					},
					'40%': {
						transform: 'translateY(-12px) translateX(6px) rotate(144deg)'
					},
					'80%': {
						transform: 'translateY(8px) translateX(-6px) rotate(288deg)'
					}
				},
				'particle-float': {
					'0%': {
						transform: 'translateY(100vh) translateX(-50px) rotate(0deg)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'90%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(-100px) translateX(50px) rotate(360deg)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-move': 'gradient-move 6s ease infinite',
				'gradient-text': 'gradient-text 8s ease infinite',
				'fade-in-slide-down': 'fade-in-slide-down 0.6s ease-out',
				'fade-in-slide-up': 'fade-in-slide-up 0.6s ease-out',
				'float-slow': 'float-slow 6s ease-in-out infinite',
				'float-medium': 'float-medium 4s ease-in-out infinite',
				'boxie1': 'boxie1 8s ease-in-out infinite',
				'boxie2': 'boxie2 6s ease-in-out infinite',
				'boxie3': 'boxie3 10s ease-in-out infinite',
				'particle-float': 'particle-float 15s linear infinite'
			},
			animationDelay: {
				'1200': '1200ms',
				'1400': '1400ms'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
