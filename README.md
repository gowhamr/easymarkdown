# EasyMarkdown

[![GitHub pages](https://img.shields.io/badge/Deployed_on-GitHub_Pages-blue?logo=github)](https://gowhamr.github.io/easymarkdown/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**EasyMarkdown** (formerly Markflow) is a fast, web-based Markdown editor and converter built with a sleek Material Design interface. It allows users to write or upload Markdown files and instantly convert them into beautifully styled HTML, PDF, or Word documents entirely in the browser.

## ✨ Key Features

* **Live Split-Screen Editor:** Write Markdown on the left and see a real-time, GitHub-style rendered preview on the right. Customize your workspace with a **draggable resizable pane**.
* **Mermaid.js Diagrams:** Native support for rendering flowcharts, sequence diagrams, gantt charts, and more directly from code blocks.
* **Smart Typing:** Auto-closing brackets and quotes, smart list continuation, and keyboard shortcuts (Ctrl+B, Ctrl+I).
* **Auto-Save:** Your work is automatically saved to LocalStorage, so you never lose your progress.
* **Multiple Export Options:** Easily download your rendered document with **dynamic filenames** derived from your top heading:
  * `HTML` (Standalone webpage with embedded styles and copy buttons)
  * `PDF` (Perfectly formatted document via native print dialog)
  * `Word (.docx)` (True Office Open XML format)
* **Drag & Drop Upload:** Instantly upload `.md` files to view and convert them.
* **Code Highlighting:** Built-in syntax highlighting for code snippets with a one-click "Copy Code" button.
* **Accessible & Inclusive:** Built with keyboard navigation (skip links), comprehensive ARIA labels, focus-visible states, and `prefers-reduced-motion` support.
* **Privacy-First:** Fully client-side. No data is ever sent to a server.

## 🚀 Live Demo

**[Experience EasyMarkdown Live](https://gowhamr.github.io/easymarkdown/)**

## 🛠️ Built With

* **HTML5 / CSS3:** Modular, semantic structure and responsive Material Design styling.
* **Vanilla JavaScript (ES6+):** Lightweight DOM manipulation and core logic, split into modular files (`app.js`, `editor.js`, `preview.js`).
* **[Marked.js](https://marked.js.org/):** Fast and robust Markdown parsing.
* **[Highlight.js](https://highlightjs.org/):** Beautiful syntax highlighting.
* **[Mermaid.js](https://mermaid.js.org/):** Diagram and charting tool.
* **[JSZip](https://stuk.github.io/jszip/):** For generating true `.docx` files natively in the browser.

## 💻 Local Development

EasyMarkdown is a static web application with a modular architecture. Setting it up locally requires no build tools or backend servers.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gowhamr/easymarkdown.git
   ```

2. **Navigate to the directory:**
   ```bash
   cd easymarkdown
   ```

3. **Open `index.html`:**
   Simply open the `index.html` file in your preferred web browser, or use a local development server like VS Code Live Server.
   ```bash
   # Using Python 3 (optional)
   python -m http.server 8000
   ```

## 📈 SEO & Performance Optimized

- Passes Core Web Vitals checks.
- Implements `WebApplication` JSON-LD Structured Data.
- Contains Open Graph (`og:`) and Twitter Card metadata.
- Preconnects to external CDNs for lightning-fast loading.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
