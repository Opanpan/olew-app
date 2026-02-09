# How to Enable Real 3D Models

Currently, the 3D viewer uses **placeholder cylinder models** because the GLB files don't exist yet.

## Current Behavior

**Placeholder Models:**
- Bottle: Simple green cylinder (customizable color)
- Cap: Simple cylinder positioned on top (customizable color)
- Works immediately, no GLB files needed
- Good for testing and development

## To Enable Real GLB Models

### Step 1: Add GLB Files

Place your 3D model files in this directory:

```
public/images/3d/
├── base.glb     ← Add your bottle GLB here
└── cap.glb      ← Add your cap GLB here
```

### Step 2: Update the Code

Open: `src/components/catalog/detail/Product3DViewer.tsx`

Find this line (around line 123):
```typescript
const [useRealModels, setUseRealModels] = useState(false);
```

Change `false` to `true`:
```typescript
const [useRealModels, setUseRealModels] = useState(true);
```

### Step 3: Test

1. Restart your dev server
2. Navigate to a bottle detail page
3. Click "View 3D Preview"
4. Your real GLB models should now load!

## Switching Back to Placeholders

If you encounter issues with GLB models, simply change back to:
```typescript
const [useRealModels, setUseRealModels] = useState(false);
```

## Creating GLB Files

See the main [SETUP.md](./SETUP.md) file for detailed instructions on:
- Exporting from Blender
- Converting from other 3D formats
- Optimizing file sizes
- Setting proper materials for color application

## Model Requirements

✅ **Required for proper rendering:**
- GLB format (not GLTF)
- Proper UV mapping for colors
- Material compatible with MeshStandardMaterial
- File size < 500KB (optimized)
- Correct pivot points (bottle: bottom center, cap: top center)

❌ **Common issues:**
- File doesn't exist → Placeholder shown
- Wrong format → Loading error
- No UV mapping → Colors don't apply
- Too large → Performance issues

## Troubleshooting

**Models don't appear:**
1. Check browser console for errors
2. Verify GLB files exist at the correct paths
3. Test files with [gltf.report](https://gltf.report/)
4. Ensure `useRealModels` is set to `true`

**Colors don't apply:**
1. Check material type in your 3D software
2. Ensure proper UV unwrapping
3. Export with materials enabled

**Performance issues:**
1. Reduce polygon count (< 10,000 triangles)
2. Optimize with gltf-transform CLI
3. Compress textures

## Current Implementation

The viewer automatically:
- ✅ Shows placeholder models when GLB files are missing
- ✅ Handles loading errors gracefully
- ✅ Applies custom colors to both real and placeholder models
- ✅ Positions cap on top of bottle correctly
- ✅ Only shows cap when user selects one (bottles only)

This ensures a smooth user experience even during development!
