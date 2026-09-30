# ⚡ HappyDev - Offline Developer Utilities Suite

<div align="center">
  <img src="public/logo.svg" width="96" height="96" alt="HappyDev Logo" />
  <h2>A Modern, 100% Offline DevToys Alternative for Developers</h2>
  <p>
    <strong>HappyDev</strong> is a versatile utility suite for developers that provides over 30+ essential tools in a single, high-performance desktop application.
  </p>
</div>

---

## 📖 Introduction

HappyDev is a comprehensive developer toolbox created as a modern, lightweight, and cross-platform alternative to DevToys. It bundles **38 offline developer utilities** into a unified, responsive interface that helps engineers eliminate repetitive daily friction. Whether you need to format structured data, convert formats, generate cryptographic keys, inspect tokens, or calculate network permissions, HappyDev executes everything instantaneously without sending any data over the internet.

---

## 🚀 Download Releases

You can download the latest pre-compiled installers and portable binaries directly from the official GitHub Releases page:

👉 **[Download Latest Version from GitHub Releases](https://github.com/xcoj027/happy-dev-releases/releases/latest)**

### Automated Builds on Main Branch
The repository is configured with an automated continuous deployment pipeline powered by GitHub Actions. Every push to the `main` branch automatically triggers a multi-platform compilation matrix that builds and publishes updated installers for all supported operating systems:

- **macOS (Apple Silicon & Intel)**: Download the `.dmg` installer or the standalone `.zip` archive.
- **Windows (x64 & ARM64)**: Download the standard `.exe` setup installer or the portable executable.
- **Linux (x64)**: Download the universal `.AppImage` package or the Debian `.deb` installer.

---

## ✨ Key Highlights

- **Over 30+ Built-in Utilities**: HappyDev includes 38 specialized developer tools covering conversions, cryptography, formatting, encoders, datetime calculations, and frontend generators.
- **A Modern DevToys Alternative**: This application provides a cohesive, zero-latency desktop environment tailored for macOS, Windows, and Linux developers.
- **100% Offline and Private**: All data processing runs entirely on your local machine with zero telemetry or remote API calls, ensuring your private keys and sensitive code never leave your computer.
- **Public Release Packages**: Installers are published from the private source repository to a separate public downloads repository.
- **Instant Command Palette**: Users can press `Cmd + K` on macOS or `Ctrl + K` on Windows and Linux to quickly search and launch any utility from anywhere in the app.
- **Polished User Interface**: The application features a borderless visual architecture with soft slate-charcoal themes and smooth dark/light mode switching.

---

## 🛠️ Complete Catalog of Developer Utilities

### 1. Converters
- **JSON ⇄ YAML Converter**: It performs bi-directional translation between JSON and YAML formats with real-time syntax validation and indentation formatting.
- **JSON ⇄ CSV / TSV Converter**: It translates flat and nested JSON arrays into tabular CSV or TSV spreadsheets and parses spreadsheets back into JSON structures.
- **Number Base Converter**: It converts numeric values across Binary, Octal, Decimal, and Hexadecimal representations with arbitrary BigInt precision.
- **JSON ⇄ TypeScript Converter**: It generates clean TypeScript interfaces and type definitions from JSON payloads and converts TypeScript models back into mock JSON objects.
- **String Case Converter**: It transforms raw text into standard programming casings including camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE.
- **cURL to Code Converter**: It parses shell cURL commands and exports clean executable code for JavaScript Fetch, Axios, Python, Go, and PHP.

### 2. Encoders & Decoders
- **Base64 Text and File Converter**: It encodes and decodes plain strings, files, and images to standard and URL-safe Base64 formats.
- **URL Encoder & Query Inspector**: It safely percent-encodes URLs and provides an interactive visual table for inspecting query parameters.
- **HTML Entity Encoder**: It escapes and unescapes reserved HTML characters and XML entities to safeguard web payloads.
- **Gzip & Deflate Streamer**: It compresses and decompresses text streams using native browser compression algorithms while displaying byte-saving statistics.

### 3. Cryptography & Security
- **Hash and HMAC Generator**: It computes MD5, SHA-1, SHA-256, SHA-384, SHA-512, and RIPEMD-160 cryptographic hashes with optional HMAC secret keys.
- **AES Encryption & Decryption**: It encrypts and decrypts confidential data using AES-256-CBC and AES-256-GCM algorithms with customizable passphrases.
- **JWT Debugger & Inspector**: It decodes JSON Web Tokens offline to inspect headers, payload claims, signature validity, and real-time expiration timers.
- **Secure Password Generator**: It produces cryptographically secure passwords and random API secrets with real-time Shannon entropy scoring.
- **UUID / NanoID / ULID Generator**: It generates batches of random UUID v4, timestamp-ordered UUID v7, NanoID, and ULID identifiers.

### 4. Formatters & Minifiers
- **JSON Formatter & Key Sorter**: It formats, minifies, sorts object keys alphabetically, and evaluates dynamic JSONPath queries.
- **XML Formatter & Minifier**: It beautifies and folds XML and SOAP documents with customizable indentation levels.
- **YAML Formatter & Validator**: It indents, structures, and validates YAML syntax to prevent configuration errors.
- **SQL Formatter & Beautifier**: It beautifies queries for PostgreSQL, MySQL, SQLite, and T-SQL dialects with customizable keyword capitalization.
- **Code Minifier**: It strips comments and extra whitespace from HTML, CSS, and JavaScript files to reduce payload size.

### 5. Date, Time & Cron
- **Unix Timestamp Converter**: It translates between Unix epoch timestamps and human-readable date formats with support for seconds, milliseconds, and microseconds.
- **World Clock & Timezone Planner**: It provides an interactive 24-hour visual slider to compare working hours across global engineering hubs.
- **Cron Expression Parser**: It translates complex cron schedules into clear human-readable sentences and calculates upcoming execution times.

### 6. Text, Regex & Diff
- **Text & Code Diff Checker**: It highlights line-by-line and word-level modifications between two text buffers using side-by-side or unified views.
- **Regex Tester & Matcher**: It evaluates regular expressions in real time with configurable flags (`g`, `i`, `m`, `s`) and displays captured group breakdowns.
- **Markdown Live Preview**: It offers a split-pane GitHub Flavored Markdown editor with live preview rendering and HTML export options.
- **Text Inspector & Zero-Width Detector**: It counts words, characters, and byte sizes while detecting invisible Unicode characters that may cause hidden bugs.
- **String Escaper & Unescaper**: It escapes and unescapes quotes, tabs, and control characters for JSON, Java, C#, and SQL strings.

### 7. Generators
- **Offline QR Code Generator**: It generates customizable QR codes for URLs, WiFi credentials, vCards, emails, and plain text with SVG and PNG downloads.
- **Random Data & Secret Generator**: It produces cryptographically secure random integers, hex strings, IPv4/IPv6 addresses, MAC addresses, and random colors.
- **Lorem Ipsum Generator**: It creates custom dummy placeholder text by paragraph, sentence, or word counts.

### 8. Web & Network Utilities
- **HTTP Status Code Reference**: It serves as an offline encyclopedia for standard 1xx through 5xx HTTP status codes and headers.
- **UNIX Chmod Calculator**: It calculates octal numbers and symbolic strings for UNIX file permissions through an interactive checkbox grid.
- **User-Agent Parser**: It decodes browser versions, operating systems, hardware platforms, and rendering engines from User-Agent strings.
- **Meta Tags & Social Previewer**: It simulates how social media platforms and search engines will render OpenGraph, Twitter, and Google search metadata.

### 9. Frontend & Visual Design
- **CSS Box Shadow Generator**: It creates multi-layer smooth box shadows and glassmorphism styling with one-click CSS rule export.
- **CSS Flexbox & Grid Playground**: It allows developers to test layout behaviors interactively and inspect the resulting CSS rules.
- **SVG to JSX & Data URI Converter**: It cleans raw SVG vector files and converts them into optimized React TypeScript JSX components or CSS Data URIs.

---

## 💻 Local Development Setup

Follow these steps to run and build the application from source code on your local workstation:

### Prerequisites
- Node.js version 20 or higher is required.
- The npm package manager must be available in your shell environment.

### Cloning and Installation
```bash
# Clone the repository to your local computer
git clone https://github.com/xcoj027/happy-dev.git
cd happy-dev

# Install all project dependencies
npm install
```

### Running the Live Development Environment
```bash
# Start the Vite development server and launch the Electron desktop window
npm run dev
```

### Compiling Production Assets
```bash
# Verify TypeScript types and compile the client and Electron bundles
npm run build

# Package the application for your local operating system architecture
npm run pack
```

### Generating Distributable Installers
The app displays the last six characters of Git `HEAD` as its version (for example, `2ce532`). Installer filenames and GitHub release titles use the same value. Numeric package metadata is retained for platform compatibility; rebuilding the same commit keeps the same displayed version. Build from a Git checkout so the commit can be resolved.

```bash
# Build macOS installers (.dmg)
npm run dist:mac

# Build Windows installers (.exe, portable)
npm run dist:win

# Build Linux package (.AppImage)
npm run dist:linux
```

---

## 🤖 Continuous Integration and Deployment

The repository includes an automated GitHub Actions workflow defined in [`.github/workflows/build.yml`](.github/workflows/build.yml):
- The workflow automatically runs on every push to the `main` branch, on version tags (`v*`), and on manual workflow dispatch triggers.
- It builds binaries concurrently across three operating system runners: `macos-latest`, `windows-latest`, and `ubuntu-latest`.
- Each release contains one universal macOS `.dmg` (Intel and Apple Silicon), one Windows x64 setup `.exe`, and one Linux x64 `.AppImage`, plus a checksum file. ZIP archives, portable Windows builds, and Debian packages are not generated.
- When commits are pushed to the `main` branch, the release step publishes the `latest` assets to the public [`happy-dev-releases`](https://github.com/xcoj027/happy-dev-releases/releases/latest) repository.
- Version tags (`v*`) publish matching versioned releases to the same public repository.

### Release Repository Configuration

The private source repository requires a `RELEASE_TOKEN` Actions secret containing a fine-grained GitHub personal access token. Grant that token **Contents: read and write** access to `xcoj027/happy-dev-releases`.

The workflow uses `xcoj027/happy-dev-releases` by default. To publish elsewhere, set the `RELEASE_REPOSITORY` Actions variable to the target repository in `owner/name` format.

### macOS Signing and Notarization

Public macOS distribution requires a **Developer ID Application** certificate and Apple notarization to pass Gatekeeper with normal security settings. Signing is opt-in; builds remain unsigned until the setup below is complete.

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/enroll/).
2. Follow Apple's [Developer ID certificate instructions](https://developer.apple.com/help/account/certificates/create-developer-id-certificates/) to create a **Developer ID Application** certificate. Install it on your Mac with its private key. In Keychain Access, export the certificate and private key together as a password-protected `.p12` file.
3. Base64-encode the `.p12` file (`base64 -i /path/to/certificate.p12 | pbcopy`) and save it as the source repository's `MAC_CSC_LINK` GitHub Actions secret. Save its export password as `MAC_CSC_KEY_PASSWORD`. Keep the certificate, private key, and passwords out of source control and chat.
4. Add `APPLE_ID` (your Apple account email), `APPLE_TEAM_ID` (your Developer Program membership Team ID), and `APPLE_APP_SPECIFIC_PASSWORD` (an [app-specific password](https://support.apple.com/en-us/102654) generated for your Apple account) as Actions secrets.
5. Set the Actions variable `MACOS_SIGNING_ENABLED` to `true`, then run **Build and Release**.

The macOS release build requires signing, enables Hardened Runtime, and uses electron-builder's built-in notarization and ticket stapling. It verifies the app signature, stapled ticket, and Gatekeeper assessment before uploading artifacts. Pull requests continue to build without signing credentials. An enabled signing build fails if credentials or verification are missing; it does not silently publish an unsigned app.

---

## 👨‍💻 Credits

HappyDev is designed, developed, and maintained with care by **TNQSW**.

### Trademark & Attribution Notice
Any fork, derivative work, distribution, or modification of this project must retain the original **TNQ** trademark, explicit author credit to **TNQSW**, and link back to the official repository at [https://github.com/xcoj027/happy-dev](https://github.com/xcoj027/happy-dev).

---

## 📄 License

This project is licensed as open-source software under the terms of the [MIT License (with Trademark Notice)](LICENSE).
