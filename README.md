# Stegify

Stegify is a browser-only image steganography toolkit built with React, TypeScript, Vite, and Tailwind CSS. It hides secret text or files inside PNG images using LSB steganography, with optional AES-256 encryption.

## Features

- Encode text or files into PNG cover images
- Decode hidden payloads from Stegify-encoded images
- Optional passphrase encryption before embedding
- Local-only processing with no uploads or server calls
- Capacity feedback before encoding
- Responsive UI for small, medium, and large screens
- Sticky navbar with corrected spacing so hero content and section anchors remain visible

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Usage Notes

Use PNG files for encoded output. Social platforms and lossy image formats can recompress images and destroy hidden data, so share encoded images through direct file transfer, email attachment, cloud storage, or file-preserving messengers.

All encoding and decoding happens in the browser. Files never leave the device.
