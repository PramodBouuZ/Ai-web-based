## 2025-05-15 - [Accessibility Baseline for Icon Buttons]
**Learning:** The application uses many icon-only buttons from the `lucide-react` library that lack descriptive ARIA labels and focus indicators, which hinders screen reader and keyboard-only navigation.
**Action:** Always apply `aria-label` and `focus-visible:ring-2` to `Button` components that only contain icons. For focus states, use the primary color `focus-visible:ring-[#25D366]` to match the brand.

## 2025-05-15 - [BantConfirm Branding and Routing]
**Learning:** Transitioning from a generic platform to "BantConfirm" required a new landing page and a shift in routing architecture (root `/` for landing, `/dashboard` for application).
**Action:** Implement landing pages in small, sequential steps to maintain focus and quality. Ensure authenticated users are seamlessly redirected to their workspace.
