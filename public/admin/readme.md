# Sveltia CMS Quick Notes

`public/admin/config.yml` must include:

```yaml
backend:
  name: github
  repo: adamdjbrett/jcrt.org
  branch: main
  base_url: https://jcrt-auth.adam.workers.dev
  auth_endpoint: auth
```

Cloudflare auth worker secrets:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

GitHub OAuth App callback:

- `https://jcrt-auth.adam.workers.dev/callback`
