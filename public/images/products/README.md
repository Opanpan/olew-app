# Product Images

## Adding Product Images

1. **Place images** in the appropriate subfolder:
   - Bottles: `public/images/products/bottles/`
   - Caps: `public/images/products/caps/`

2. **Naming convention**: Use the product ID from your data
   ```
   BTL-001.webp        # Main image
   BTL-001-2.webp      # Additional view
   BTL-001-3.webp      # Additional view
   CAP-001.webp        # Main image
   CAP-001-2.webp      # Additional view
   ```

3. **Update product data** in `src/data/products.ts`:
   ```typescript
   {
     id: 'BTL-001',
     name: 'Elegant Glass Dropper 30ml',
     // ... other fields
     image: '/images/products/bottles/BTL-001.webp',
   }
   ```

4. **Update detail pages** to use real images:
   In `src/app/[lang]/bottles/[id]/page.tsx`:
   ```typescript
   const images = product.image ? [
     product.image,
     product.image.replace('.webp', '-2.webp'),
     product.image.replace('.webp', '-3.webp'),
   ] : [
     // fallback placeholder images
   ];
   ```

## Image Specifications

- **Format**: WebP (preferred) or JPEG/PNG
- **Dimensions**: 800×800px minimum (square aspect ratio)
- **File size**: < 200KB per image (optimize before uploading)
- **Background**: White or transparent
- **Quality**: High resolution for zoom feature

## Optimization Tools

- [TinyPNG](https://tinypng.com/) - Online compression
- [Squoosh](https://squoosh.app/) - WebP conversion
- [ImageOptim](https://imageoptim.com/) - Mac app
- CLI: `npm install -g imagemin-cli imagemin-webp`

## Batch Convert to WebP

```bash
# Install imagemin-cli
npm install -g imagemin-cli imagemin-webp

# Convert all JPG/PNG to WebP
imagemin public/images/products/bottles/*.{jpg,png} --plugin=webp --out-dir=public/images/products/bottles/
```
