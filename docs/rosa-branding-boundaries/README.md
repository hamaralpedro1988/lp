# Branding boundaries

Brand selection changes only icon decoration and the application canvas/background. The shared system palette controls functional UI.

Fixed across Spatial, McDonald’s and Burger King:
- Ready to start: system background #f0edfa and foreground #6555a9.
- All other status, section, Critical, Pass and Fail tags.
- Primary/secondary/outline buttons, active tabs, radio states, switches and focus.
- Field and control borders.
- Primary and secondary copy. Secondary text uses #625c75 in every brand to retain AA contrast against the strongest approved atmospheric backgrounds.

Adaptive:
- Goal/preparation icon decoration and icon-style avatar fallbacks.
- Application canvas, gradients and background glow.
- The separate presentation desktop remains charcoal.

Changes remove status and body-text dependencies on brand tokens. Outline controls explicitly use the system surface rather than inheriting the page’s brand-adaptive background. The Component Library navigation uses system status colors too.

Validation:
- Brand configuration allowlist restricts overrides to accent/icon decor and canvas/glow.
- Browser comparison checks every rendered tag, button, field, secondary-copy role and response state in Overview, Live, Result and Submission across all three brands.
- Confirms icons/background still change and a runtime brand switch preserves responses.
- Contrast tests include the fixed Ready to start palette.
- Production build and all unit tests pass; lint retains three existing Fast Refresh warnings.
