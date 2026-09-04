import * as THREE from 'three';

/**
 * Three.js Memory Management & Disposal Utilities
 * Designed to keep total heap and GPU VRAM footprint well under 150–200 MB.
 */

// Global singletons for shared primitive geometries to avoid creating duplicates per floor/element
export const SHARED_GEOMETRIES = {
  box1x1x1: new THREE.BoxGeometry(1, 1, 1),
  plane1x1: new THREE.PlaneGeometry(1, 1),
  sphereSmall: new THREE.SphereGeometry(1, 12, 10),
  cylinderSmall: new THREE.CylinderGeometry(1, 1, 1, 12),
};

/**
 * Safely disposes a Three.js material and its associated map textures.
 */
export function disposeMaterial(mat: THREE.Material | THREE.Material[] | null | undefined) {
  if (!mat) return;
  if (Array.isArray(mat)) {
    mat.forEach((m) => disposeMaterial(m));
    return;
  }

  const m = mat as any;
  // Dispose all potential texture maps
  const textureProps = [
    'map',
    'alphaMap',
    'emissiveMap',
    'bumpMap',
    'normalMap',
    'displacementMap',
    'roughnessMap',
    'metalnessMap',
    'specularMap',
    'envMap',
    'lightMap',
    'aoMap',
  ];

  for (const prop of textureProps) {
    if (m[prop] && typeof m[prop].dispose === 'function') {
      m[prop].dispose();
      m[prop] = null;
    }
  }

  mat.dispose();
}

/**
 * Recursively disposes a Three.js Object3D hierarchy (geometries, materials, textures).
 */
export function disposeNode(node: THREE.Object3D | null | undefined, disposeGeometry = true) {
  if (!node) return;

  node.traverse((child: any) => {
    if (child.isMesh || child.isLine || child.isPoints) {
      if (disposeGeometry && child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        disposeMaterial(child.material);
      }
    }
  });
}

/**
 * Shared Floor Texture Pool & Manager
 * - Clamps canvas resolution to 512x128 (saving 75% memory compared to 1024/2048)
 * - Disables mipmaps (saving another 33% memory)
 * - Shares single texture instance per floor across multiple faces
 */
class FloorTexturePool {
  private cache = new Map<string, { texture: THREE.CanvasTexture; refCount: number }>();

  public getOrCreate(
    key: string,
    drawFn: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void
  ): THREE.CanvasTexture {
    const existing = this.cache.get(key);
    if (existing) {
      existing.refCount++;
      return existing.texture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (ctx) {
      drawFn(canvas, ctx);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    this.cache.set(key, { texture, refCount: 1 });
    return texture;
  }

  public release(key: string) {
    const item = this.cache.get(key);
    if (!item) return;

    item.refCount--;
    if (item.refCount <= 0) {
      item.texture.dispose();
      this.cache.delete(key);
    }
  }

  public clear() {
    this.cache.forEach((item) => {
      item.texture.dispose();
    });
    this.cache.clear();
  }
}

export const floorTexturePool = new FloorTexturePool();
