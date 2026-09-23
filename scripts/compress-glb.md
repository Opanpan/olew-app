# Compressing product 3D models

Models exported from Blender arrive with full-resolution PBR texture sets baked
in — 2048×2048 PNGs for base colour, normal and roughness. The pot assembly's
five parts totalled **8.2 MB**, and the hero downloads all five before it can
show anything.

Two things make that cost avoidable:

- Both viewers replace every material with a flat `MeshStandardMaterial`
  (`Product3DViewer`, and `BottleCapPreview` in the admin), so those textures are
  never sampled. They are pure download and decode cost, plus ~22 MB of GPU
  memory *per texture* at 2048².
- The meshes themselves are tiny — the Body is ~2,100 vertices.

So the win is in the textures, not the geometry. Geometry compression (Draco)
still pays for the denser parts, and the app already decodes it.

## Run it

```bash
npx --yes @gltf-transform/cli@4 optimize in.glb out.glb \
  --texture-compress webp \
  --texture-size 512 \
  --compress draco
```

Result on the pot assembly:

| Part            | Before | After |
|-----------------|-------:|------:|
| Body            |  2.4 M |  45 K |
| Plug            |  4.5 M |  74 K |
| Inner Pot       | 1021 K |  81 K |
| Inner Cap       |  274 K |  34 K |
| Outer Cap       |  115 K |  10 K |
| **Total**       | **8.2 M** | **241 K** |

Dropping `--compress draco` gives 1016 K instead of 241 K, so Draco is worth
keeping even though the meshes are small.

## Decoding

`useGLTF` is called with `DRACO_DECODER_PATH` (`/draco/`), served from
`public/draco/`. drei otherwise pulls the decoder from Google's gstatic CDN,
which puts a third-party request on the home page's critical path. Those files
are copied from `three/examples/jsm/libs/draco/gltf/` and should be refreshed if
`three` is upgraded across a Draco version bump.

## Where to apply it

Compress before uploading through the admin panel (Products → 3D & Links → 3D
File). Nothing in the app rewrites an already-uploaded model, so existing
products keep whatever was uploaded until they are replaced.
