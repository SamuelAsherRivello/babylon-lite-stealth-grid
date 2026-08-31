// Describe data shapes that cross the module boundary.

/**
 * @typedef {object} ExampleOptions
 * @property {string} name Stable name used by the example operation.
 */

// Keep shared defaults immutable and close to their consumers.

const DEFAULT_OPTIONS = Object.freeze({ name: "example" });

// Expose the smallest API needed by callers.

export class TypeScriptTemplate {
  /**
   * Creates an instance with normalized options.
   *
   * @param {Partial<ExampleOptions>} [options]
   */
  constructor(options = {}) {
    this.options = normalizeOptions(options);
  }

  /**
   * Returns the stable value produced by this example.
   *
   * @returns {string}
   */
  execute() {
    return this.options.name;
  }
}

// Keep validation internal unless callers need it independently.

/**
 * @param {Partial<ExampleOptions>} options
 * @returns {ExampleOptions}
 */
function normalizeOptions(options) {
  const name = String(options.name ?? DEFAULT_OPTIONS.name).trim();
  if (!name) {
    throw new TypeError("name must not be empty");
  }
  return { name };
}
