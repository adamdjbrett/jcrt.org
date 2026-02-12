/**
 * Sveltia/Decap CMS OAuth Proxy for Cloudflare Workers
 * Optimized for JCRT Project
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Redirect to GitHub login
    if (url.pathname === "/auth") {
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=repo,user`;
      return Response.redirect(githubAuthUrl, 302);
    }

    // 2. Callback from GitHub
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      
      if (!code) {
        return new Response("Error: No code provided from GitHub", { status: 400 });
      }

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

      /**
       * Securely send the token back to the CMS window.
       * We use "*" for postMessage to ensure it reaches the opener window,
       * but the sensitive data is only sent after the GitHub handshake.
       */
      const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Authorizing...</title></head>
        <body>
          <script>
            (function() {
              const result = ${JSON.stringify(result)};
              const message = result.error ? 
                "authorization:github:error:" + (result.error_description || result.error) : 
                "authorization:github:success:" + JSON.stringify(result);
              
              if (window.opener) {
                window.opener.postMessage(message, "*");
              } else {
                document.body.innerHTML = "Authorization finished. You can close this window.";
              }
            })();
          </script>
        </body>
        </html>
      `;

      return new Response(html, { 
        headers: { "content-type": "text/html;charset=UTF-8" } 
      });
    }

    // Default response
    return new Response("Auth Proxy is active.", { status: 200 });
  },
};