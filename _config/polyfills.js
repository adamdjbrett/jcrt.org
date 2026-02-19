// Ensure `globalThis.File` exists before any dependencies that expect it are evaluated.
// Some transitive deps (e.g. undici) assume a web-like runtime; Node <20 may not provide `File`.
if (typeof globalThis.File === "undefined") {
	globalThis.File = class File {};
}

