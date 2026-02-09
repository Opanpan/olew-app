# 3D Model Setup Instructions

## Required Files

Place your 3D model files in this directory:

### For Development (Placeholder Models)
- `base.glb` - Generic bottle model
- `cap.glb` - Generic cap model

### For Production (Product-Specific Models)
- `bottles/BTL-001.glb` - Specific bottle models
- `caps/CAP-001.glb` - Specific cap models

## File Placement

```
public/images/3d/
├── base.glb          ← Place your default bottle model here
├── cap.glb           ← Place your default cap model here
├── bottles/
│   ├── BTL-001.glb
│   ├── BTL-002.glb
│   └── ...
└── caps/
    ├── CAP-001.glb
    ├── CAP-002.glb
    └── ...
```

## Creating GLB Files

### Option 1: Export from Blender

1. Open your 3D model in Blender
2. Select the object
3. File → Export → glTF 2.0 (.glb/.gltf)
4. Settings:
   - Format: **GLB**
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers, UVs, Normals
   - Materials: Export
5. Save to the appropriate folder

### Option 2: Use Online Converters

- [gltf.report](https://gltf.report/) - Analyze and optimize
- [glTF-Transform](https://gltf-transform.donmccurdy.com/) - Optimize GLB files
- [Sketchfab](https://sketchfab.com/) - Download free 3D models

### Option 3: Generate from CAD

If you have CAD files (.obj, .fbx, .stl):
1. Import to Blender
2. Clean up the geometry
3. Add materials/UV maps
4. Export as GLB (see Option 1)

## Model Requirements

### Geometry
- **Polygon Count**: < 10,000 triangles recommended
- **Scale**: Use real-world units (mm)
- **Pivot Point**:
  - Bottles: Bottom center
  - Caps: Top center (for stacking on bottle)
- **Orientation**: Facing +Z axis, +Y up

### Materials
- **Type**: Use PBR materials (MeshStandardMaterial compatible)
- **Color**: Base white/neutral (will be colored dynamically)
- **UV Mapping**: Required for textures
- **Roughness**: 0.3-0.5 for glass/plastic
- **Metalness**: 0-0.3

### Optimization
```bash
# Install gltf-transform CLI
npm install -g @gltf-transform/cli

# Optimize your GLB file
gltf-transform optimize input.glb output.glb \
  --compress \
  --simplify \
  --dedup

# Target file size: < 500KB
```

## Testing Your Models

1. Place your GLB files in this directory
2. Navigate to a product detail page (e.g., `/en/bottles/BTL-001`)
3. Click "View 3D Preview"
4. Test:
   - Model loads correctly
   - Colors apply properly
   - Cap sits on top of bottle (for bottle products)
   - Camera controls work (drag to rotate, scroll to zoom)

## Updating from Placeholder to Real Models

### Current Setup (Placeholder)
```typescript
// src/components/catalog/detail/ProductDetailView.tsx
bottleModelUrl="/images/3d/base.glb"
capModelUrl="/images/3d/cap.glb"
```

### Future Setup (API-driven)
```typescript
// Update to use product-specific models from API
const bottleModelUrl = product.modelUrl || '/images/3d/base.glb';
const capModelUrl = product.capModelUrl || '/images/3d/cap.glb';

// Or fetch from API
const modelUrl = await fetch(`/api/products/${productId}/model-url`);
```

## Troubleshooting

### Model doesn't appear
- Check browser console for errors
- Verify file path is correct
- Ensure GLB file is valid (test with [gltf.report](https://gltf.report/))

### Colors don't apply
- Ensure model has proper UV mapping
- Check material type is MeshStandardMaterial compatible
- Try re-exporting with materials

### Performance issues
- Reduce polygon count (< 10,000 triangles)
- Optimize textures (< 512px)
- Compress GLB file with gltf-transform

### Cap positioning is wrong
- Check pivot point is at top center
- Adjust `bottleHeight` prop in Product3DViewer.tsx
- Scale might need adjustment

## Free 3D Model Resources

- [Sketchfab](https://sketchfab.com/tags/bottle)
- [CGTrader](https://www.cgtrader.com/)
- [TurboSquid](https://www.turbosquid.com/)
- [Poly Haven](https://polyhaven.com/)

## Need Help?

For custom 3D modeling services or questions, contact your development team.
