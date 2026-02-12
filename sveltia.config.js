/**
 * Sveltia CMS Configuration
 * Place this file in the root directory
 */

export default {
  // 1. Backend Configuration
  backend: {
    name: 'github',
    repo: 'adamdjbrett/jcrt.org',
    branch: 'main',
    // Supaya bisa edit lokal pakai decap-server (npx decap-server)
    local_backend: true,
    // Proxy Auth yang kita buat di Cloudflare tadi
    base_url: 'https://jcrt-auth.adam.workers.dev',
    auth_endpoint: 'auth'
  },

  // 2. Media & Public Folder
  media_folder: 'content/assets/img', // Sesuaikan dengan struktur folder 11ty lo
  public_folder: '/assets/img',

  // 3. Content Collections
  collections: [
    {
      name: 'posts',
      label: 'Editorial Posts',
      folder: 'content/posts', // Folder tempat file .md berada
      create: true,
      slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
      fields: [
        { label: 'Title', name: 'title', widget: 'string' },
        { label: 'Publish Date', name: 'date', widget: 'datetime' },
        { label: 'Description', name: 'description', widget: 'text' },
        { label: 'Body', name: 'body', widget: 'markdown' },
        { label: 'Author', name: 'author', widget: 'string' }
      ]
    },
    {
      name: 'pages',
      label: 'Pages',
      files: [
        {
          label: 'Home Page',
          name: 'home',
          file: 'content/index.md',
          fields: [
            { label: 'Title', name: 'title', widget: 'string' },
            { label: 'Hero Text', name: 'hero_text', widget: 'text' }
          ]
        }
      ]
    }
  ]
};