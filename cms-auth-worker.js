/**
 * Sveltia/Decap CMS OAuth proxy for GitHub on Cloudflare Workers.
 *
 * Required Worker secrets:
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 */

function html(body) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const clientId = env.GITHUB_CLIENT_ID;
      if (!clientId) {
        return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
      }

      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
      authorizeUrl.searchParams.set("client_id", clientId);
      authorizeUrl.searchParams.set("scope", "repo,user");
      authorizeUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
      return Response.redirect(authorizeUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing OAuth code", { status: 400 });
      }

      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.access_token) {
        return new Response(
          `OAuth exchange failed: ${result?.error_description || result?.error || response.statusText}`,
          { status: 502 },
        );
      }

      const payload = JSON.stringify(result).replace(/</g, "\\u003c");
      return html(`<!doctype html>
<html>
  <body>
    <script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            "authorization:github:success:" + ${JSON.stringify(payload)},
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`);
    }

    return new Response("Not Found", { status: 404 });
  },
};

