# Quick Start Guide

## 🚀 Get Your Extension Running in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Extension

```bash
npm run build
```

This creates a `dist` folder with your compiled extension.

### Step 3: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist` folder

Your extension is now installed! Click the extension icon in your Chrome toolbar to see the popup.

---

## 🎨 Before You Start

### Add Extension Icons

The manifest references icons that don't exist yet. Create these PNG files in `public/icons/`:
- `icon-16.png` (16×16 pixels)
- `icon-48.png` (48×48 pixels)
- `icon-128.png` (128×128 pixels)

Or temporarily comment out the icon references in `public/manifest.json` until you're ready to add them.

---

## 🔄 Development Workflow

### Making Changes

1. **Run development mode:**
   ```bash
   npm run dev
   ```

2. **After making changes:**
   - For popup UI changes: Just refresh the popup
   - For background script changes: Go to `chrome://extensions/` and click the refresh icon
   - For manifest changes: Reload the entire extension

3. **Rebuild for testing:**
   ```bash
   npm run build
   ```

---

## 📝 What's Included

- ✅ **Popup UI** - Beautiful React-based popup with Tailwind CSS styling
- ✅ **Background Worker** - Service worker for handling events and state
- ✅ **Content Script** - Script that can interact with web pages
- ✅ **Chrome Storage** - Persistent storage example (counter in popup)
- ✅ **Message Passing** - Communication between components
- ✅ **TypeScript** - Full type safety with Chrome API types
- ✅ **Hot Reload** - Fast development with Vite HMR

---

## 🎯 Next Steps

1. **Customize the popup**: Edit `src/popup/Popup.tsx`
2. **Add background logic**: Edit `src/background/background.ts`
3. **Interact with web pages**: Edit `src/content/content.ts`
4. **Update branding**: Change name and description in `public/manifest.json`
5. **Add icons**: Create icon files in `public/icons/`

---

## 🐛 Common Issues

### Icons Not Loading
Create the icon files or temporarily remove icon references from `manifest.json`.

### Extension Not Loading
Make sure you built the extension (`npm run build`) and loaded the `dist` folder, not the project root.

### Changes Not Appearing
Rebuild with `npm run build` and refresh the extension in `chrome://extensions/`.

---

## 📚 Learn More

Check out the full `README.md` for detailed documentation and Chrome API examples.

Happy coding! 🎉

