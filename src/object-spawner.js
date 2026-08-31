export function createObjectSpawner({ type, position, createObject, disposeObject = (object) => object?.dispose?.() }) {
  if (typeof type !== "string" || typeof createObject !== "function") throw new TypeError("type and createObject are required");
  let initialized = false;
  let object = null;
  return {
    type,
    get objects() { return object ? [object] : []; },
    initialize() {
      if (initialized) return 0;
      initialized = true;
      object = createObject({ ...position });
      return object ? 1 : 0;
    },
    update() { return 0; },
    remove(value) { if (value !== object) return false; object = null; disposeObject(value); return true; },
    dispose() { if (object) disposeObject(object); object = null; },
  };
}
