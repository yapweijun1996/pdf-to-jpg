# PDF to JPG Converter Pro

This project allows you to convert PDF files to high-quality JPG images securely in your browser. All processing happens locally on your device; no files are uploaded to any server.

## Architecture & Workflow

```mermaid
graph TD
    User((User)) -->|1. Drag & Drop PDF| Dropzone[Dropzone Component]
    
    subgraph "Core Logic (Client-Side)"
        Dropzone -->|File Object| Hook[usePdfConverter Hook]
        Hook -->|Init| PDFEngine[PDF.js Worker]
        
        PDFEngine -->|Render Page| Canvas[Offscreen Canvas]
        Canvas -->|toBlob| JPG[JPG Image Blob]
        JPG -->|Store| State[React State]
    end
    
    subgraph "Output"
        State -->|Display| Grid[Image Grid UI]
        State -->|Bundle| Zipper[JSZip Utility]
        Zipper -->|Save .zip| User
    end
```

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`

2. Run the app:
   `npm run dev`
