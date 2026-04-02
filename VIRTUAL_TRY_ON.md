# 🔮 Virtual Try-On — Implementation Documentation

> A fully client-side, browser-based feature using **Fabric.js** that allows customers to virtually overlay jewelry on their own photos — zero AI or backend inference required.

---

## 📁 Files Involved

| File | Role |
|---|---|
| `components/Application/Website/VirtualTryOn.jsx` | Main try-on modal component (Fabric.js canvas) |
| `components/Application/Website/ProductDetails.jsx` | Renders the "Virtual Try-On" button & passes `productImgUrl` |
| `app/(root)/(admin)/admin/product/add/page.jsx` | Admin uploads try-on image when creating a product |
| `app/(root)/(admin)/admin/product/edit/[id]/page.jsx` | Admin updates try-on image when editing a product |
| `app/api/product/create/route.js` | Saves `tryOnImage` URL to DB on product create |
| `app/api/product/update/route.js` | Saves `tryOnImage` URL to DB on product update |

---

## 🗂️ Architecture Overview

```
Admin Panel (Product Add/Edit)
    └─► Uploads a PNG with transparent background via MediaModal picker
    └─► Saves URL as `tryOnImage` field in the database

Product Details Page
    └─► Checks if product.tryOnImage exists
    └─► If YES → renders "Virtual Try-On" button
    └─► On click → opens <VirtualTryOn> modal with productImgUrl

VirtualTryOn.jsx  (Fabric.js Canvas)
    └─► User uploads photo OR captures from webcam
    └─► Photo placed as background layer (cover-fit)
    └─► Jewelry image placed on top with drop shadow
    └─► User drags, scales, rotates, duplicates the jewelry
    └─► Downloads final composited image as PNG
```

---

## 📌 Step 1 — Admin Uploads the Try-On Image

**Files:** `admin/product/add/page.jsx` & `admin/product/edit/[id]/page.jsx`

- Admin selects a **single image** (a product cutout on a **transparent PNG background**) via the `MediaModal` picker.
- State is tracked with:
  ```js
  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [selectedTryOnMedia, setSelectedTryOnMedia] = useState([])
  ```
- On form submit, the selected media URL is extracted and assigned:
  ```js
  if (selectedTryOnMedia.length > 0) {
    const tryOnSrc = selectedTryOnMedia[0].url || selectedTryOnMedia[0].secure_url
    values.tryOnImage = typeof tryOnSrc === 'string' ? tryOnSrc : null
  } else {
    values.tryOnImage = null
  }
  ```
- On the **edit page**, if a product already has a `tryOnImage`, it is pre-loaded:
  ```js
  if (p.tryOnImage) {
    setSelectedTryOnMedia([{ url: p.tryOnImage, id: 'existing' }])
  }
  ```
- The API routes (`/api/product/create` and `/api/product/update`) include `tryOnImage: true` in their Prisma select and persist the value.

---

## 📌 Step 2 — Button Appears on the Product Page

**File:** `components/Application/Website/ProductDetails.jsx`

The button is **conditionally rendered** — it only shows if the admin uploaded a `tryOnImage`:

```jsx
{product.tryOnImage && (
    <div className="mt-4 flex justify-center">
        <Button
            variant="outline"
            className="w-full md:w-3/4 py-6 border-blue-500 text-blue-600 ..."
            onClick={() => setTryOnOpen(true)}
        >
            <ScanFace className="w-5 h-5" />
            <span>Virtual Try-On</span>
        </Button>
    </div>
)}
```

The modal is placed at the bottom of the component:

```jsx
<VirtualTryOn
    isOpen={tryOnOpen}
    onClose={setTryOnOpen}
    productImgUrl={product.tryOnImage}
/>
```

---

## 📌 Step 3 — The VirtualTryOn Modal

**File:** `components/Application/Website/VirtualTryOn.jsx`

### Layout

The modal is a full-screen `Dialog` (Shadcn UI) split into two areas:

| Area | Width | Contents |
|---|---|---|
| **Left — Canvas** | 70% | Fabric.js interactive canvas (800×620 px) |
| **Right — Controls** | 30% | Jewelry + photo adjustment tools |

---

### Canvas Initialization

A **callback ref** is used instead of a regular `useRef`. This is required because the canvas lives inside a Dialog/Portal which mounts asynchronously:

```jsx
const canvasRef = useCallback((node) => {
    if (node !== null) {
        if (!fabricCanvasRef.current) {
            const canvas = new Canvas(node, {
                width: 800,
                height: 620,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
            })
            fabricCanvasRef.current = canvas
        }
    }
}, [productImgUrl])
```

On dialog close → canvas is disposed cleanly:

```js
useEffect(() => {
    return () => {
        if (!isOpen && fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose()
            fabricCanvasRef.current = null
            setUserImgUrl(null)
            setJewelryObj(null)
            stopCamera()
        }
    }
}, [isOpen])
```

---

### User Photo Input — Two Modes

#### 📷 Mode 1: Webcam Capture

```js
const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
    setStream(mediaStream)
    setIsCameraActive(true)
    videoRef.current.srcObject = mediaStream
}

const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    stopCamera()
    loadUserImageToCanvas(dataUrl)
}
```

#### 📁 Mode 2: File Upload

```js
const handleUserImageUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (f) => loadUserImageToCanvas(f.target.result)
    reader.readAsDataURL(file)
}
```

---

### Image Compositing Logic

**`loadUserImageToCanvas(dataUrl)`** — called after either camera capture or file upload:

```js
const img = await FabricImage.fromURL(dataUrl)

// "Cover" fill — no white letterboxing
const scaleX = canvas.getWidth() / img.width
const scaleY = canvas.getHeight() / img.height
const scale = Math.max(scaleX, scaleY)

img.set({
    scaleX: scale,
    scaleY: scale,
    selectable: true,      // User can drag to align
    hasControls: false,    // No resize handles on the photo
    name: 'userBackground'
})

canvas.add(img)
canvas.centerObject(img)
canvas.sendObjectToBack(img)  // Always stays behind jewelry
```

**`addJewelryToCanvas()`** — loads the product PNG on top with a drop shadow:

```js
const img = await FabricImage.fromURL(productImgUrl, { crossOrigin: 'anonymous' })
const initialScale = (canvas.getWidth() * 0.5) / img.width

img.set({
    scaleX: initialScale,
    scaleY: initialScale,
    name: 'jewelry',
    cornerColor: '#6366f1',
    shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 15, offsetX: 5, offsetY: 5 })
})

canvas.add(img)
canvas.centerObject(img)
canvas.setActiveObject(img)
```

---

### Jewelry Controls (Right Panel)

| Control | Implementation |
|---|---|
| **Zoom In** | `obj.scaleX * 1.1`, `obj.scaleY * 1.1` |
| **Zoom Out** | `obj.scaleX * 0.9`, `obj.scaleY * 0.9` |
| **Rotate Clockwise** | `obj.angle + 15` |
| **Rotate Counter-Clockwise** | `obj.angle - 15` |
| **Duplicate** | `activeObj.clone()` → offset by 20px (useful for earring pairs) |
| **Delete** | `canvas.remove(activeObj)` |
| **Photo Zoom In** | Scales the background `FabricImage` by `* 1.1` |
| **Photo Zoom Out** | Scales the background `FabricImage` by `* 0.9` |
| **New Photo** | `canvas.clear()` → resets all state |
| **Save High-Res Photo** | `canvas.toDataURL({ format: 'png', quality: 1 })` → `<a>` download |

---

## 🔑 Key Design Decisions

| Decision | Reason |
|---|---|
| **No AI / No backend** | Fully offline — runs entirely in the browser via Fabric.js |
| **PNG with transparent BG for tryOnImage** | The product cutout blends naturally on top of any user photo |
| **Callback ref for canvas** | Dialog (Portal) mounts async — regular `useRef` would miss the node |
| **"Cover" fit for user photo** | Fills canvas fully with no white bars, regardless of image aspect ratio |
| **Duplicate button** | Specifically designed for earrings — duplicate one earring image to simulate both ears |
| **Independent background zoom** | User can reposition/zoom their photo without affecting the jewelry overlay |
| **No resize handles on background photo** | Prevents accidental resizing; only the jewelry is fully transformable |

---

## 📦 Dependencies Used

| Package | Purpose |
|---|---|
| `fabric` | Interactive canvas — image layering, drag, scale, rotate, clone, export |
| `lucide-react` | Icons (Camera, Upload, ZoomIn, ZoomOut, RotateCw, Download, etc.) |
| `@/components/ui/dialog` | Full-screen modal container (Shadcn UI) |
| `@/components/ui/button` | Styled buttons for controls |
| Browser `getUserMedia` API | Webcam access for live camera capture |
| Browser `FileReader` API | Reading uploaded image files as data URLs |

---

## 🖥️ UI States

| State | What is Shown |
|---|---|
| Modal opened, no photo yet | Placeholder with "Open Camera" and "Upload Photo" buttons |
| Camera active | Live `<video>` feed with Capture & Cancel buttons |
| Photo loaded | Canvas shows user photo + jewelry overlay; right panel shows all controls |
| Loading | Spinner overlay with "Refining your look..." message |

---

*Generated: March 2026 — M.K. Jewellers Virtual Try-On Documentation*
