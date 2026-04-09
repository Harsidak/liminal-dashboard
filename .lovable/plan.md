

# Liminal — Futuristic Financial Dashboard

## Overview
A mobile-first, dark-mode financial dashboard with glassmorphism design, neon glow accents, and two main screens: Dashboard and AI Insights.

## Design System
- **Background**: Deep gradient from dark violet (#2A1056) to near-black (#0D0518)
- **Cards**: Semi-transparent white/blue panels with `backdrop-blur-xl`, border opacity
- **Glow effects**: Purple/blue box-shadows on primary cards and buttons
- **Typography**: Inter font, white for primary values, gray-400/500 for secondary
- **Accent colors**: Vibrant blue (#6366f1) and purple (#a855f7) for glows and highlights

## Screen 1: Main Dashboard (`/`)
- **Header**: Avatar left, "Account: Liminal Pro" center, bell icon right
- **Balance Card**: Large glassmorphic card with glowing shadow showing "$12,450.89" total portfolio value, plus 4 circular quick-action buttons (Deposit, Withdraw, Risk Sandbox, AI X-Ray)
- **Your Assets**: 3 asset cards (Reliance Industries, Tata Motors, HDFC Bank) with price and green/red % change, horizontally scrollable
- **Stress Test Banner**: Promo card "Simulate Market Crash" with glowing "Run FDT" button

## Screen 2: AI Insights (`/ai-insights`)
- **Toggle tabs**: "Performance" / "Loss Probability"
- **Chart area**: Stylized bar/line chart with glowing purple/blue bars built with pure CSS
- **Value at Risk Slider**: Range slider for risk tolerance with custom styling
- **Recent AI Explanations**: List of past stock events with plain-English explanations

## Navigation
- Sticky bottom floating nav bar with blur background, 4 icons: Home, Sandbox, AI Insights, Profile
- Smooth page transitions between screens

## Additional Pages (stub)
- Sandbox and Profile as minimal placeholder pages

## Technical Notes
- Built with React + Vite + Tailwind (project stack), not Next.js
- Shadcn UI components (slider, tabs, buttons) customized with glassmorphism styles
- Custom CSS for glow effects and gradient background
- All interactions have smooth transitions (hover, active states)
- Mobile container: `max-w-md mx-auto min-h-screen`

