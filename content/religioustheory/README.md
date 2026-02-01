# religioustheory

## 🌐 Multi-Repo Integration (Git Submodules)

This project uses a Multi-Repo architecture. The content for **Religious Theory** is managed in a separate repository and integrated here as a Git Submodule.

### 🚀 Initial Setup
If you have just cloned this repository, the `content/religioustheory` folder will be empty. To pull the content, run:


```
git submodule update --init --recursive
```

### 🔄 How to Update Content

To fetch the latest updates from the Religious Theory repository into this project:

```
git submodule update --remote --merge
```

### 🛠️ Working with Submodules

Do not manually copy-paste files into content/religioustheory.

If you make changes inside the submodule folder, you must commit and push them within that folder first, then update the main repository's pointer.

The submodule points directly to the upstream repository at https://github.com/adamdjbrett/religioustheory.git.

### Troubleshooting

If the submodule folder is out of sync or showing "Permission Denied" on Windows:

1. Run `git submodule sync`
2. Run `git submodule update --init --force`

