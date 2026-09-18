/**
 * Pot assembly slot vocabulary — the storefront mirror of the admin panel's
 * `src/features/products/slots.ts`. Keep the two in sync.
 *
 * A Pot is built from five stacked layers. Slot 1 (Body) is the Pot product
 * *itself* — it is the base model, not something the customer attaches — so only
 * slots 2–5 are selectable compatibility options:
 *
 *     5  Outer Cap   ▲ top
 *     4  Plug
 *     3  Inner Cap
 *     2  Inner Pot
 *     1  Body        ▼ bottom   ← the Pot product itself
 *
 * A Bottle keeps its single generic Cap slot, which is also the fallback for any
 * compatible item whose type isn't recognised — so legacy links stay visible
 * instead of disappearing, and plain Bottle+Cap behaviour is unchanged.
 *
 * The API does NOT return a slot on the compatibility row (the `role` field on
 * `CompatibleProduct` is advisory and always absent in practice), so a linked
 * item's slot is derived from its own product type name. `typeName` must match
 * the product types seeded on the backend.
 */

export const ASSEMBLY_SLOTS = ['outer_cap', 'plug', 'inner_cap', 'inner_pot', 'cap'] as const;
export type AssemblySlot = typeof ASSEMBLY_SLOTS[number];

export interface SlotDef {
  key: AssemblySlot;
  /** Lowercased product-type `name_en` that maps a linked product into this slot. */
  typeName: string;
  /** Key into `dict.catalog.compare.role_*` for the display label. */
  dictKey: 'role_outer_cap' | 'role_plug' | 'role_inner_cap' | 'role_inner_pot' | 'role_cap';
  /** 1 = bottom of the stack … 5 = top. Drives render order and UI ordering. */
  stack: number;
}

/** Attachable pot slots, TOP of the stack first — the order the UI renders them. */
export const POT_SLOTS: SlotDef[] = [
  { key: 'outer_cap', typeName: 'outer cap', dictKey: 'role_outer_cap', stack: 5 },
  { key: 'plug',      typeName: 'plug',      dictKey: 'role_plug',      stack: 4 },
  { key: 'inner_cap', typeName: 'inner cap', dictKey: 'role_inner_cap', stack: 3 },
  { key: 'inner_pot', typeName: 'inner pot', dictKey: 'role_inner_pot', stack: 2 },
];

/** The Bottle + Cap slot, and the fallback bucket for unrecognised types. */
export const CAP_SLOT: SlotDef = { key: 'cap', typeName: 'cap', dictKey: 'role_cap', stack: 2 };

export const ALL_SLOTS: SlotDef[] = [...POT_SLOTS, CAP_SLOT];

export const SLOT_BY_KEY: Record<AssemblySlot, SlotDef> = Object.fromEntries(
  ALL_SLOTS.map((s) => [s.key, s])
) as Record<AssemblySlot, SlotDef>;

/** Slots ordered bottom-of-the-stack first — the order layers must be rendered in. */
export const SLOTS_BOTTOM_UP: SlotDef[] = [...ALL_SLOTS].sort((a, b) => a.stack - b.stack);

/** Slots ordered top-of-the-stack first — the order UI sections are listed in. */
export const SLOTS_TOP_DOWN: SlotDef[] = [...ALL_SLOTS].sort((a, b) => b.stack - a.stack);

/**
 * Build a `Record<AssemblySlot, T>` with every slot present — avoids undefined
 * buckets. For immutable values (null, a string, a number) only: every key gets
 * the *same* reference, so use `slotRecordOf` when the value is mutable.
 */
export function emptyBySlot<T>(value: T): Record<AssemblySlot, T> {
  return Object.fromEntries(ALL_SLOTS.map((s) => [s.key, value])) as Record<AssemblySlot, T>;
}

/** Like `emptyBySlot`, but builds a fresh value per slot — use for arrays/objects. */
export function slotRecordOf<T>(make: () => T): Record<AssemblySlot, T> {
  return Object.fromEntries(ALL_SLOTS.map((s) => [s.key, make()])) as Record<AssemblySlot, T>;
}

/**
 * Derive a compatible item's slot from its own product type name.
 * Anything unrecognised falls back to `cap`, which keeps legacy links visible.
 */
export function classifyByTypeName(typeName: string | undefined): AssemblySlot {
  const n = (typeName ?? '').trim().toLowerCase();
  return POT_SLOTS.find((s) => s.typeName === n)?.key ?? 'cap';
}

/**
 * Admin-configured placement of one linked part. Scale and X/Z are fixed per
 * model pairing; `mid` is the vertical "0" position a customer lifts from.
 * A missing min/max counts as 0 so the default matches the admin's Combined Preview.
 */
export function layerPlacement(item: {
  scale?: number;
  position?: { x: number; z: number };
  min_position_vertical?: number | null;
  max_position_vertical?: number | null;
} | null) {
  const rawMin = typeof item?.min_position_vertical === 'number' ? item.min_position_vertical : 0;
  const rawMax = typeof item?.max_position_vertical === 'number' ? item.max_position_vertical : 0;
  return {
    scale: item?.scale ?? 1,
    offsetX: item?.position?.x ?? 0,
    offsetZ: item?.position?.z ?? 0,
    mid: (rawMin + rawMax) / 2,
  };
}
