# 3D Models Directory

This folder contains 3D model files (.glb format) for product visualization.

## File Structure

```
3d/
├── bottles/
│   ├── base.glb           # Generic bottle base model
│   ├── BTL-001.glb        # Specific product models
│   └── ...
└── caps/
    ├── cap.glb            # Generic cap model
    ├── CAP-001.glb        # Specific product models
    └── ...
```

## Model Specifications

- **Format**: GLB (GL Transmission Format Binary)
- **Size**: < 500KB per model (optimized)
- **Polygon Count**: < 10,000 triangles recommended
- **UV Mapping**: Required for texture/color application
- **Pivot Point**: Bottom center for bottles, top center for caps
- **Scale**: Real-world units (mm)

## Color Application

Models should have proper UV mapping to support dynamic color changes:
- Material should accept `color` property
- Use MeshStandardMaterial or compatible
- Roughness/metalness maps optional

## Loading from API

In production, models will be loaded from API URLs:

```typescript
const bottleModel = await fetch(`/api/products/${productId}/model`);
const capModel = await fetch(`/api/caps/${capId}/model`);
```

## Optimization Tools

- [glTF-Transform](https://gltf-transform.donmccurdy.com/) - Optimize GLB files
- [Blender](https://www.blender.org/) - 3D modeling and export
- [gltf.report](https://gltf.report/) - Analyze model performance
