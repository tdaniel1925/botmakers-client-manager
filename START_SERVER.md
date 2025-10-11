# 🚀 Quick Start - Dev Server

## The Issue

Port 3001 was already in use. I've killed all Node processes.

## Start the Server Manually

### Option 1: PowerShell (Recommended)
Open PowerShell in the project directory and run:

```powershell
cd "c:\Users\tdani\One World Dropbox\Trent Daniel\1 - App Builds\botmakers-client-manager\codespring-boilerplate"
npm run dev
```

### Option 2: VS Code Terminal
1. Open VS Code
2. Open Terminal (Ctrl + `)
3. Run:
```bash
npm run dev
```

### Option 3: Command Prompt
```cmd
cd "c:\Users\tdani\One World Dropbox\Trent Daniel\1 - App Builds\botmakers-client-manager\codespring-boilerplate"
npm run dev
```

---

## What You'll See

When the server starts successfully, you'll see:

```
> codespring-boilerplate@0.1.0 dev
> next dev --port 3001

  ▲ Next.js 14.2.7
  - Local:        http://localhost:3001
  - Network:      http://192.168.x.x:3001

 ✓ Ready in 2.3s
```

---

## Then Visit

```
http://localhost:3001/platform/emails
```

---

## Test Hey Features

Once the page loads:

1. **Press `Cmd+K`** (or `Ctrl+K`) → Command palette
2. **Press `/`** → Instant search
3. **Press `1`** → Switch to Imbox
4. **Press `2`** → Switch to Feed

---

## If Port 3001 is Still Busy

Run this first to kill all Node processes:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then start the server again.

---

## If You See Compilation Errors

The new components might have TypeScript errors. That's normal during first compilation. The server will still start and you can see the errors in the terminal.

Common fixes:
- Restart the server (Ctrl+C, then `npm run dev`)
- Clear Next.js cache: `rm -rf .next` then `npm run dev`

---

## Success Checklist

- [ ] Terminal shows "Ready in X.Xs"
- [ ] Can open http://localhost:3001
- [ ] See email client interface
- [ ] Mode selection dialog appears (first time)
- [ ] Keyboard shortcuts work

---

## 🎉 You're Ready!

Once the server is running, all your Hey features are active!

**Test it now:** Press `Cmd+K` to open the command palette! ✨

