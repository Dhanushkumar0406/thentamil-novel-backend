# 🚀 Backend - எப்படி Run செய்வது

## ✅ PERMANENT FIX - எப்போதும் இதை use பண்ணு!

### Method 1: Safe Start (Recommended) ⭐

```bash
npm run start:safe
```

**இது என்ன செய்யும்:**
- Port 4000 already use-ஆ இருக்கான்னு check பண்ணும்
- Already running இருந்தா warning காட்டும்
- Free-ஆ இருந்தா start பண்ணும்
- **Error வராது!** ✅

---

### Method 2: Stop & Restart

**Stop Backend:**
```bash
npm run stop
```

**Then Start:**
```bash
npm run start:dev
```

---

## 📋 Quick Reference

| Command | Action |
|---------|--------|
| `npm run start:safe` | Check & start safely (No errors!) |
| `npm run start:dev` | Start directly (may error if running) |
| `npm run stop` | Stop backend |
| `npm run start:prod` | Production mode |

---

## ❌ Common Errors & Fixes

### Error: EADDRINUSE :::4000

**பொருள்:** Backend already running!

**Fix:**
```bash
npm run stop
npm run start:dev
```

**Or just use:**
```bash
npm run start:safe
```

---

## 💡 Pro Tips

1. **எப்போதும் `npm run start:safe` use பண்ணு** - No errors!
2. **Ctrl+C** - Backend-ஐ stop பண்ண
3. **Terminal close பண்ணாதே** - Backend run ஆக வேண்டும்

---

## ✅ எப்படி சரியா run ஆகுதுன்னு check பண்றது

**Browser-ல:**
```
http://localhost:4000/health
```

**சரியா run ஆனா:**
```json
{"status":"ok","timestamp":"...","port":"4000"}
```

---

## 🎯 Quick Start Guide

**First Time:**
```bash
cd "d:\NOVELS 2026\thentamil-novel-backend"
npm install
npm run start:safe
```

**Next Times:**
```bash
cd "d:\NOVELS 2026\thentamil-novel-backend"
npm run start:safe
```

**அவ்வளவுதான்!** 🎉
