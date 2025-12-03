# WinZone CSS Classes Reference

All styles have been moved to `styles/globals.css` for easy editing. This document provides a quick reference for all available CSS classes.

## Layout & Containers

- `.page-container` - Main page wrapper with background
- `.container-main` - Max-width container with padding
- `.section-spacing` - Standard section padding (py-12 sm:py-16)
- `.section-spacing-lg` - Large section padding (py-16 sm:py-20)

## Headers

- `.header-main` - Main site header
- `.header-admin` - Admin dashboard header (sticky)
- `.header-content` - Header content container (h-20)
- `.header-content-sm` - Small header content (h-14 sm:h-16)

## Cards & Panels

- `.card` - Standard card with backdrop blur
- `.card-dark` - Dark card variant
- `.card-padding` - Standard card padding (p-4 sm:p-6)
- `.card-padding-lg` - Large card padding (p-6 sm:p-8 md:p-12)

## Buttons

### Primary Buttons
- `.btn-primary` - Base primary button (orange)
- `.btn-primary-sm` - Small primary button
- `.btn-primary-md` - Medium primary button
- `.btn-primary-lg` - Large primary button

### Secondary Buttons
- `.btn-secondary` - Base secondary button
- `.btn-secondary-sm` - Small secondary button
- `.btn-secondary-md` - Medium secondary button

### Link Buttons
- `.btn-link` - Text link button
- `.btn-link-sm` - Small link button

## Tabs

- `.tab` - Base tab style
- `.tab-active` - Active tab (orange background)
- `.tab-inactive` - Inactive tab

## Forms

- `.form-input` - Text input field
- `.form-textarea` - Textarea field
- `.form-label` - Form label
- `.form-select` - Select dropdown

## Badges & Status

### Badges
- `.badge` - Base badge
- `.badge-primary` - Orange badge
- `.badge-success` - Green badge
- `.badge-info` - Blue badge
- `.badge-warning` - Yellow badge
- `.badge-error` - Red badge

### Status Badges
- `.status-badge` - Base status badge
- `.status-draft` - Draft status
- `.status-active` - Active status
- `.status-completed` - Completed status
- `.status-pending` - Pending status
- `.status-confirmed` - Confirmed status
- `.status-winner` - Winner status

## Typography

- `.heading-1` - Large heading (text-4xl sm:text-5xl md:text-7xl)
- `.heading-2` - Medium heading (text-2xl sm:text-3xl)
- `.heading-3` - Small heading (text-xl sm:text-2xl)
- `.heading-4` - Extra small heading (text-lg sm:text-xl)
- `.text-body` - Body text (text-base sm:text-lg)
- `.text-body-sm` - Small body text (text-sm sm:text-base)
- `.text-muted` - Muted text (text-xs sm:text-sm text-slate-500)
- `.text-accent` - Accent color text (orange)

## Hero Section

- `.hero-section` - Hero section container
- `.hero-glow` - Background glow effect
- `.hero-badge` - Live badge with pulse
- `.hero-pulse` - Pulsing dot indicator

## Draw Cards

- `.draw-card` - Draw card container
- `.draw-card-image` - Card image container
- `.draw-card-content` - Card content area
- `.draw-card-title` - Card title
- `.draw-card-description` - Card description
- `.draw-card-cta` - Call-to-action text
- `.entry-badge` - Entry fee badge

## Product Cards

- `.product-card` - Product card container
- `.product-card-image` - Product image container
- `.product-card-content` - Product content area
- `.product-card-title` - Product title
- `.product-card-price` - Price badge

## Modals

- `.modal-overlay` - Modal backdrop
- `.modal-container` - Modal container
- `.modal-header` - Modal header section
- `.modal-header-title` - Modal title
- `.modal-header-subtitle` - Modal subtitle
- `.modal-body` - Modal body content
- `.modal-footer` - Modal footer

## Stats & Metrics

- `.stat-card` - Stat card container
- `.stat-label` - Stat label text
- `.stat-value` - Stat value (white)
- `.stat-value-accent` - Stat value (emerald)

## Loading States

- `.loader` - Large loading spinner
- `.loader-sm` - Small loading spinner
- `.loader-center` - Centered loader container

## Empty States

- `.empty-state` - Empty state container
- `.empty-state-icon` - Empty state icon container
- `.empty-state-title` - Empty state title
- `.empty-state-text` - Empty state description

## Step Indicators

- `.step-number` - Step number circle
- `.step-number-text` - Step number text
- `.step-content` - Step content container
- `.step-title` - Step title
- `.step-description` - Step description

## Social Buttons

- `.btn-social` - Base social button
- `.btn-whatsapp` - WhatsApp button (green)
- `.btn-telegram` - Telegram button (blue)

## Utilities

- `.line-clamp-2` - Two-line text clamp
- `.text-truncate` - Text truncation
- `.flex-center` - Centered flex container
- `.flex-between` - Space-between flex container
- `.grid-responsive` - Responsive grid (md:2 cols, lg:3 cols)

## Responsive Text

- `.text-responsive-xs` - Extra small responsive text
- `.text-responsive-sm` - Small responsive text
- `.text-responsive-base` - Base responsive text
- `.text-responsive-lg` - Large responsive text
- `.text-responsive-xl` - Extra large responsive text

## CSS Variables

All brand colors are available as CSS variables:

```css
--winzone-orange: #FF6B35;
--winzone-orange-dark: #E55A2B;
--winzone-orange-light: #FF8C5A;
--winzone-purple: #1a0b2e;
--winzone-purple-light: #2d1b4e;
--winzone-purple-dark: #0d0518;
```

## Editing Styles

To edit any style, simply open `styles/globals.css` and modify the corresponding class. All changes will apply globally across the application.

