// Bootstrap file for older Node runtimes:
// Some transitive deps (via Eleventy) expect `globalThis.File` to exist.
// Node 18.12.x doesn't provide it, so define a minimal stub before loading
// the real config implementation.
if (typeof globalThis.File === "undefined") {
	globalThis.File = class File {};
}

const impl = await import("./eleventy.config.impl.js");

export default impl.default;
export const config = impl.config;
