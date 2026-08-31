# Aiden Competitive Companion

A powerful VS Code extension that acts as a bridge for the [Competitive Companion](https://github.com/jmerle/competitive-companion) browser extension. It automatically parses competitive programming problems, creates solution files from your custom templates, and extracts sample inputs/outputs directly into your workspace.

## 🚀 Features

- **Automatic File Generation:** Instantly creates a source file (e.g., `main.cpp`) from your customized template when you send a problem from your browser.
- **Robust URL Parsing:** Automatically detects problem names from popular platforms like Codeforces, AtCoder, and CSES, with a smart fallback for any other site.
- **Smart I/O Extraction:** Extracts both sample inputs and expected outputs into `input.txt` and `output.txt` for easy local testing.
- **Customizable Split Views:** Automatically arranges your source code, input, and output files in deterministic grid layouts (e.g., source on the left, I/O split on the right).
- **Fixed File Mode:** Option to always overwrite a specific file (like `main.cpp`) instead of dynamically naming files based on the problem URL.
- **Dedicated Sidebar UI:** Manage settings, toggle layouts, and clear I/O files directly from the VS Code Activity Bar.
- **Workspace Initialization:** Easily scaffold a `.vscode/tasks.json` file for building and running your code.

## 📦 Installation & Usage

1. **Install the Extension:** Install via the VS Code Marketplace (or build the `.vsix` manually).
2. **Install Browser Extension:** Install [Competitive Companion](https://github.com/jmerle/competitive-companion) for Chrome or Firefox.
3. **Configure Browser Extension:** Ensure Competitive Companion is configured to send payloads to `http://127.0.0.1:27121` (default).
4. **Open a Workspace:** Open any folder in VS Code.
5. **Send a Problem:** Navigate to a problem on Codeforces, AtCoder, etc., and click the Competitive Companion icon in your browser (or press `Ctrl+Shift+U`).
6. **Code!** The source file, `input.txt`, and `output.txt` will automatically open in your preferred layout.

## ⚙️ Configuration Settings

Configure these settings in your `settings.json` or via the **Aiden CC** Sidebar:

| Setting | Default | Description |
|---------|---------|-------------|
| `aidenCompetitiveCompanion.layout` | `source-input/output` | Determines how files are arranged when a problem is opened (`none`, `source-input`, `source-input-output`, `source-input/output`, `input/output-source`). |
| `aidenCompetitiveCompanion.fixedFileName` | `""` | If set (e.g., `main.cpp`), bypasses dynamic naming and always overwrites this specific file. |
| `aidenCompetitiveCompanion.inputMode` | `first` | Whether to extract only the `first` test case or `all` test cases into `input.txt`. |
| `aidenCompetitiveCompanion.templateDirectory` | `""` | Directory containing your language templates (e.g., `cpp.cpp`). Defaults to `${userHome}/Documents/templates`. |
| `aidenCompetitiveCompanion.languageMap` | *(See package.json)* | Maps language IDs from Competitive Companion to your template filenames and extensions. |
| `aidenCompetitiveCompanion.host` | `127.0.0.1` | Host address for the local server. |
| `aidenCompetitiveCompanion.port` | `27121` | Port for the local server. |

## 🛠️ Sidebar Commands

The **Aiden CC** sidebar provides quick access to common actions:

- **Init Workspace:** Scaffolds a `.vscode/tasks.json` for building/running C++ code.
- **Set Fixed File Name:** Quickly toggle or set a fixed filename (e.g., `main.cpp`).
- **Toggle Input Mode:** Switch between extracting only the first sample or all samples.
- **Toggle Layout:** Cycle through the available split-view layouts.
- **Clear input/output:** Instantly clear the contents of `input.txt` and `output.txt`.

## 📝 Templates

Templates should be placed in your configured `templateDirectory` (default: `Documents/templates`). 
For example, create a `cpp.cpp` file for C++ templates. When a problem is received, the extension will copy this file and open it for you.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#) if you want to contribute.

---
*Happy Coding & Good Luck on your contests! 🚀*
