export function splitAuthors(authorField) {
	if (!authorField) return [];
	if (Array.isArray(authorField)) return authorField.flatMap(splitAuthors);

	return String(authorField)
		.split(";")
		.map((part) => part.trim())
		.filter(Boolean);
}

export function authorSlug(name) {
	if (!name) return "";
	let value = String(name).trim();
	if (!value) return "";

	// Normalize and strip diacritics.
	value = value.normalize("NFKD");

	// Handle a few common non-diacritic latin characters/ligatures.
	value = value
		.replace(/ß/g, "ss")
		.replace(/Æ/g, "AE")
		.replace(/æ/g, "ae")
		.replace(/Œ/g, "OE")
		.replace(/œ/g, "oe")
		.replace(/Ø/g, "O")
		.replace(/ø/g, "o")
		.replace(/Ð/g, "D")
		.replace(/ð/g, "d")
		.replace(/Þ/g, "Th")
		.replace(/þ/g, "th")
		.replace(/Ł/g, "L")
		.replace(/ł/g, "l");

	value = value.replace(/[\u0300-\u036f]/g, "");
	value = value.toLowerCase();

	// Only keep the 26 english letters; everything else becomes a hyphen.
	value = value.replace(/[^a-z]+/g, "-");
	value = value.replace(/-+/g, "-").replace(/^-|-$/g, "");
	return value;
}

