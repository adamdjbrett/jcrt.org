/**
 * Sveltia/Decap CMS OAuth Proxy for Cloudflare Workers
 * NO NETLIFY REQUIRED
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Redirect to GitHub login
    if (url.pathname === "/auth") {
      return Response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user`,
        302
      );
    }

    // 2. Callback from GitHub
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const result = await response.json();
      
      // Post-message back to the CMS window
      return new Response(
        `<html><body><script>
        (function() {
          function recieveMessage(e) {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(result)}',
              e.origin
            );
          }
          window.addEventListener("message", recieveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })()
        </script></body></html>`,
        { headers: { "content-type": "text/html" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};