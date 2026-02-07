# HotGhost Design System

## Theme: Terminal Hacker / Matrix

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0a` | Main background |
| `--bg-secondary` | `#0d0d0d` | Cards, secondary surfaces |
| `--color-primary` | `#00FF41` | Primary green neon |
| `--color-secondary` | `#0d3d0d` | Dark green |
| `--color-text` | `#00FF41` | Bright text |
| `--color-text-dim` | `#1a5c1a` | Dimmed text |
| `--color-border` | `rgba(0, 255, 65, 0.3)` | Borders |
| `--color-border-hover` | `rgba(0, 255, 65, 0.6)` | Hover borders |
| `--color-glow` | `rgba(0, 255, 65, 0.4)` | Glow effects |

### Typography

- **Font Family:** JetBrains Mono (monospace)
- **Font Sizes:**
  - `--font-size-xs`: 12px
  - `--font-size-sm`: 14px
  - `--font-size-md`: 16px
  - `--font-size-lg`: 20px
  - `--font-size-xl`: 24px
  - `--font-size-2xl`: 32px

### Spacing

Base unit: 8px

- `--space-1`: 8px
- `--space-2`: 16px
- `--space-3`: 24px
- `--space-4`: 32px
- `--space-5`: 40px
- `--space-6`: 48px

### Components

#### Buttons
- Border: 1px solid `--color-border`
- Background: transparent (primary has `--color-secondary`)
- Hover: border glow effect
- Padding: 8px 16px

#### Inputs
- Background: transparent
- Border: 1px solid `--color-border`
- Focus: border-color `--color-primary`

#### Cards
- Background: `--bg-secondary`
- Border: 1px solid `--color-border`
- Padding: 24px

### Patterns

- No shadows, use border glow instead
- All text in monospace
- Terminal-style prefixes (`>`, `[`, `]`)
- Subtle animations (pulse, glow)
