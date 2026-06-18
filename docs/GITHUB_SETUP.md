# GitHub Setup

This project is ready to be pushed to GitHub.

## Option A - GitHub CLI

Install GitHub CLI:

```powershell
winget install --id GitHub.cli
```

Authenticate:

```powershell
gh auth login
```

Create and push:

```powershell
cd "C:\Users\Deezelll\Desktop\Мобильные игры\01_Idle_Fishing_Village"
gh repo create idle-fishing-village --private --source . --remote origin --push
```

## Option B - GitHub Website

1. Create a new empty repository named `idle-fishing-village`.
2. Do not add README/license/gitignore on the website.
3. Run:

```powershell
cd "C:\Users\Deezelll\Desktop\Мобильные игры\01_Idle_Fishing_Village"
git remote add origin https://github.com/YOUR_USERNAME/idle-fishing-village.git
git push -u origin main
```

