tambahin ini di package json kalau mau pr
"start:cms": "node -r dotenv/config @sveltia/cms start",

		"start:eleventy": "npx @11ty/eleventy --serve",
		"start": "npm-run-all --parallel start:eleventy start:cms",
