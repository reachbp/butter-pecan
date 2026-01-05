# SchoolWatch Source Code Structure

## Directory Organization

### `/components`
Reusable UI components organized by category:
- `/glass` - Glass morphism design system components (GlassCard, GlassButton, etc.)
- `/common` - Common UI components

### `/screens`
Main application screens:
- `/onboarding` - Onboarding flow screens
- `/dashboard` - Application tracking dashboard
- `/analytics` - Crowdsourced analytics hub
- `/comparison` - School comparison features
- `/community` - Community discussion features

### `/navigation`
Navigation configuration and routing

### `/theme`
Design system foundation:
- Colors (Sequoia Glass palette)
- Typography (SF Pro/Inter)
- Spacing (8px grid system)
- Glass effects and animations

### `/services`
API clients and data services:
- Authentication service
- School data service
- Community data aggregation
- Real-time updates (Socket.io)

### `/hooks`
Custom React hooks for shared logic

### `/utils`
Helper functions and utilities

### `/types`
TypeScript type definitions and interfaces

### `/config`
App configuration and constants
