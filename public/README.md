# Static Assets Directory

This folder contains all static assets that are publicly accessible via URL paths.

## Folder Structure

```
public/
├── images/
│   ├── products/
│   │   ├── bottles/     # Product images for bottles
│   │   └── caps/        # Product images for caps
│   ├── logos/           # Company logos and branding
│   └── banners/         # Hero banners and promotional images
├── icons/               # Favicons, app icons, etc.
├── fonts/               # Custom web fonts (if any)
└── documents/           # PDFs, brochures, certificates, etc.
```

## Usage

Assets in this folder are accessible from the root URL path. For example:

- `public/images/logos/welo-logo.png` → `/images/logos/welo-logo.png`
- `public/icons/favicon.ico` → `/favicon.ico`

## Image Guidelines

### Product Images
- **Format**: WebP preferred (with JPEG/PNG fallbacks)
- **Bottles**: 800×800px minimum
- **Caps**: 800×800px minimum
- **Naming**: Use product ID (e.g., `BTL-001.webp`, `BTL-001-2.webp`)

### Logos
- **Format**: SVG preferred, PNG with transparent background
- **Sizes**: Multiple sizes (32×32, 64×64, 128×128, 256×256, 512×512)

### Banners
- **Format**: WebP or JPEG
- **Desktop**: 1920×1080px or wider
- **Mobile**: 750×1334px or taller
- **Optimize**: Compress images for web (use tools like ImageOptim, TinyPNG)

## Next.js Image Component

When using images, prefer the Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/images/products/bottles/BTL-001.webp"
  alt="Elegant Glass Dropper 30ml"
  width={800}
  height={800}
  priority={false}
/>
```

## Optimization Tips

1. **Compress images** before uploading (aim for <200KB per image)
2. **Use WebP format** for better compression
3. **Provide alt text** for accessibility
4. **Lazy load** images below the fold
5. **Use responsive images** with srcset/sizes
