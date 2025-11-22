# Chrome Extension Boilerplate

A modern Chrome extension boilerplate built with **Next.js (React)**, **TypeScript**, **Tailwind CSS**, and **Vite**.

## 🚀 Features

- ⚡ **Vite** - Lightning-fast build tool with HMR (Hot Module Replacement)
- ⚛️ **React 18** - Modern React with hooks and latest features
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- 📘 **TypeScript** - Type-safe code with full IntelliSense support
- 🔧 **Chrome Manifest V3** - Latest Chrome extension manifest version
- 🏗️ **Modular Architecture** - Clean separation of concerns following SOLID principles
- 📦 **Ready-to-extend** - Includes popup, background worker, and content script structure

## 📁 Project Structure

```
chrome-extension-boilerplate/
├── public/
│   └── manifest.json          # Chrome extension manifest (Manifest V3)
├── src/
│   ├── popup/                 # Extension popup
│   │   ├── index.html         # Popup HTML entry point
│   │   ├── main.tsx           # Popup React entry point
│   │   ├── Popup.tsx          # Main popup component
│   │   └── styles.css         # Popup styles with Tailwind
│   ├── background/            # Background service worker
│   │   └── background.ts      # Background script logic
│   ├── content/               # Content scripts
│   │   └── content.ts         # Content script for web pages
│   └── shared/                # Shared utilities
│       ├── types.ts           # TypeScript type definitions
│       └── constants.ts       # Shared constants
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Build the extension:**

```bash
npm run build
```

This will create a `dist` folder with the compiled extension.

### Development

For development with hot reload:

```bash
npm run dev
```

This will start the Vite development server. Note that for Chrome extensions, you'll need to manually reload the extension in Chrome after making changes to certain files (like manifest.json or background scripts).

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `dist` folder from this project

### Building for Production

```bash
npm run build
```

The production-ready extension will be in the `dist` folder.

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the extension for production
- `npm run preview` - Preview the production build locally
- `npm run type-check` - Run TypeScript type checking

## 🎨 Customization

### Updating Extension Name and Details

Edit `public/manifest.json`:

```json
{
  "name": "Your Extension Name",
  "description": "Your extension description",
  "version": "1.0.0"
}
```

Also update the constants in `src/shared/constants.ts`:

```typescript
export const APP_NAME = 'Your Extension Name';
export const APP_VERSION = '1.0.0';
```

### Adding Icons

Place your extension icons in the `public/icons/` directory with the following sizes:
- `icon-16.png` (16x16)
- `icon-48.png` (48x48)
- `icon-128.png` (128x128)

### Modifying Popup UI

The popup UI is built with React and Tailwind CSS. Edit `src/popup/Popup.tsx` to customize the interface.

### Adding Background Logic

Edit `src/background/background.ts` to add background service worker logic. This runs in the background and can handle events, manage state, and communicate with popup and content scripts.

### Adding Content Scripts

Edit `src/content/content.ts` to add logic that runs in the context of web pages. Content scripts can interact with the DOM and communicate with the background script.

## 🔧 Chrome API Usage

### Storage API

```typescript
// Save data
chrome.storage.sync.set({ key: 'value' });

// Retrieve data
chrome.storage.sync.get(['key'], (result) => {
  console.log(result.key);
});
```

### Messaging

**From popup to background:**

```typescript
chrome.runtime.sendMessage({ type: 'YOUR_MESSAGE' }, (response) => {
  console.log(response);
});
```

**Listen in background:**

```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'YOUR_MESSAGE') {
    sendResponse({ success: true });
  }
  return true; // Required for async response
});
```

## 📚 Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

MIT License - feel free to use this boilerplate for your projects!

## 🙏 Acknowledgments

Built with modern web technologies to provide a great developer experience for Chrome extension development.

---

Happy coding! 🚀

