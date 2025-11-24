# JCRT.ORG

Develop by Adam Dj Brett

### Need Help or Have Project ?? Contact Me
+ adamdjbrett.com
+ info@adamdjbrett.com

### Sveltia CMS Setup

Create Oauth Apps https://github.com/settings/developers , New OAuth App.

Next you ned to create personal access token - token clasic
https://github.com/settings/tokens

### ENV

Now you can insert Env configuration on your host.

### Server

Now you need to update your `wrangler.toml` on your server repo and add your `workers` 

Example:
```
name = 'authsveltia'
main = "src/index.js"
compatibility_date = "2025-11-23"
```
