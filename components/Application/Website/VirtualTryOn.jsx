'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, FabricImage, Rect, Shadow } from 'fabric'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadCloud, ZoomIn, ZoomOut, RotateCw, RotateCcw, Trash2, Camera, X, Loader2, Copy, Download, Sparkles } from 'lucide-react'
import Image from 'next/image'

const VirtualTryOn = ({ isOpen, onClose, productImgUrl }) => {
  // CSS to hide scrollbars across browsers
  const scrollbarHideStyle = `
    .hidden-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hidden-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  const fabricCanvasRef = useRef(null)
  const videoRef = useRef(null)
  const [userImgUrl, setUserImgUrl] = useState(null)
  const [jewelryObj, setJewelryObj] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState(null)
  const fileInputRef = useRef(null)
  const backgroundRef = useRef(null)

  // Initialize Canvas with Callback Ref for stable mounting in Portals
  const canvasRef = useCallback((node) => {
    if (node !== null) {
      if (fabricCanvasRef.current && fabricCanvasRef.current.getElement() !== node) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }

      if (!fabricCanvasRef.current) {
        // High-definition wide dimensions
        const CANVAS_WIDTH = 800
        const CANVAS_HEIGHT = 620

        node.width = CANVAS_WIDTH
        node.height = CANVAS_HEIGHT

        const canvas = new Canvas(node, {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: '#ffffff',
          preserveObjectStacking: true,
        })
        fabricCanvasRef.current = canvas

        if (productImgUrl) {
          addJewelryToCanvas()
        }
      }
    }
  }, [productImgUrl])

  // Cleanup
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

  // Camera Functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setIsCameraActive(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 200)
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')

    stopCamera()
    loadUserImageToCanvas(dataUrl)
  }

  const loadUserImageToCanvas = async (dataUrl) => {
    try {
      setLoading(true)
      setUserImgUrl(dataUrl)

      const canvas = fabricCanvasRef.current
      if (!canvas) {
        setLoading(false)
        return
      }

      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

      const img = await FabricImage.fromURL(dataUrl)

      // Use 'Cover' logic (Math.max) to fill the canvas and remove white bars
      const scaleX = canvas.getWidth() / img.width
      const scaleY = canvas.getHeight() / img.height
      const scale = Math.max(scaleX, scaleY)

      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: true, // Allow dragging the photo for alignment
        hasControls: false, // Don't show resize handles on photo
        name: 'userBackground'
      })

      // Clean old background
      const objects = canvas.getObjects()
      objects.forEach(obj => {
        if (obj.name === 'userBackground') canvas.remove(obj)
      })

      canvas.add(img)
      canvas.centerObject(img)
      canvas.sendObjectToBack(img)
      backgroundRef.current = img

      if (!jewelryObj) {
        await addJewelryToCanvas()
      } else {
        canvas.bringObjectToFront(jewelryObj)
        canvas.setActiveObject(jewelryObj)
      }

      canvas.requestRenderAll()
    } catch (err) {
      console.error("Error loading image onto canvas:", err)
    } finally {
      setTimeout(() => setLoading(false), 200)
    }
  }

  const handleUserImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (f) => {
      loadUserImageToCanvas(f.target.result)
    }
    reader.readAsDataURL(file)
  }

  const addJewelryToCanvas = async () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !productImgUrl) return

    try {
      const img = await FabricImage.fromURL(productImgUrl, {
        crossOrigin: 'anonymous'
      })

      const initialScale = (fabricCanvasRef.current.getWidth() * 0.5) / img.width

      img.set({
        scaleX: initialScale,
        scaleY: initialScale,
        name: 'jewelry',
        cornerColor: '#6366f1',
        borderColor: '#6366f1',
        transparentCorners: false,
        cornerSize: 10,
        padding: 5,
        shadow: new Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 15,
          offsetX: 5,
          offsetY: 5
        })
      })

      canvas.add(img)
      canvas.centerObject(img)
      img.set({
        top: canvas.getHeight() / 2 - 20
      })

      canvas.setActiveObject(img)
      setJewelryObj(img)
      canvas.requestRenderAll()
    } catch (err) {
      console.error("Error loading jewelry image:", err)
    }
  }

  const handleScale = (factor) => {
    const canvas = fabricCanvasRef.current
    const obj = canvas ? canvas.getActiveObject() : null
    if (!obj || obj.name === 'userBackground') return
    obj.set({
      scaleX: obj.scaleX * factor,
      scaleY: obj.scaleY * factor
    })
    canvas.requestRenderAll()
  }

  const handleDuplicate = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const activeObj = canvas.getActiveObject()
    if (!activeObj || activeObj.name === 'userBackground') return

    activeObj.clone().then((cloned) => {
      cloned.set({
        left: activeObj.left + 20,
        top: activeObj.top + 20,
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.requestRenderAll()
    })
  }

  const handleDelete = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const activeObj = canvas.getActiveObject()
    if (!activeObj || activeObj.name === 'userBackground') return

    canvas.remove(activeObj)
    canvas.requestRenderAll()

    // Check if any jewelry objects remain
    const remainingJewelry = canvas.getObjects().find(obj => obj.name === 'jewelry' || (obj.name !== 'userBackground' && obj.selectable))
    if (!remainingJewelry) {
      setJewelryObj(null)
    }
  }

  const handleDownload = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    // Create a data URL of the canvas
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1
    })

    const link = document.createElement('a')
    link.download = 'my-try-on-look.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBackgroundScale = (factor) => {
    const obj = backgroundRef.current
    if (!obj || !fabricCanvasRef.current) return
    obj.set({
      scaleX: obj.scaleX * factor,
      scaleY: obj.scaleY * factor
    })
    fabricCanvasRef.current.requestRenderAll()
  }

  const handleRotate = (angle) => {
    const obj = jewelryObj
    if (!obj || !fabricCanvasRef.current) return
    obj.set('angle', (obj.angle || 0) + angle)
    fabricCanvasRef.current.requestRenderAll()
  }

  const handleReset = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.clear()
      canvas.set({ backgroundColor: '#ffffffff' })
      setUserImgUrl(null)
      setJewelryObj(null)
      backgroundRef.current = null
      stopCamera()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <style>{scrollbarHideStyle}</style>
      <DialogContent showCloseButton={false} className="max-w-none w-screen h-screen p-0 m-0 overflow-hidden border-none rounded-none flex flex-col bg-slate-50 fixed inset-0 translate-x-0 translate-y-0 sm:max-w-none sm:translate-x-0 sm:translate-y-0 text-slate-900">

        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 z-50 shrink-0 shadow-sm">
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Virtual Try-On</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10 transition-colors">
              <X size={24} className="text-slate-500" />
            </Button>
          </DialogClose>
        </div>

        {/* Main Workspace - No scrolling of the entire page */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/50">

          {/* Left Area (Canvas) - 70% Width */}
          <div className="md:w-[70%] w-full h-full flex items-center justify-center p-4 md:p-10 shrink-0">
            <div className="relative border-2 border-white rounded-[2rem] shadow-2xl bg-white overflow-hidden flex justify-center items-center h-[620px] w-[800px] max-w-full max-h-full">
              <canvas ref={canvasRef} width={800} height={620} className="block" />

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-50 rounded-[1.8rem]">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                  <p className="text-sm font-medium text-slate-700">Refining your look...</p>
                </div>
              )}

              {!userImgUrl && !isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/90 backdrop-blur-sm z-10">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner">
                    <Camera size={32} />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-slate-800">Ready to try it on?</h3>
                  <p className="text-sm text-slate-500 mb-8 font-medium">Upload a photo to see exactly how this jewelry looks on you.</p>

                  <div className="flex flex-col w-full gap-4 max-w-sm">
                    <Button onClick={startCamera} variant="default" className="h-12 text-md font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                      <Camera size={18} className="mr-2" /> Open Camera
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-12 text-md font-semibold rounded-xl border-slate-200">
                      <UploadCloud size={18} className="mr-2" /> Upload Photo
                    </Button>
                  </div>

                  <input type="file" ref={fileInputRef} onChange={handleUserImageUpload} accept="image/*" className="hidden" />
                </div>
              )}

              {!userImgUrl && isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-8 flex gap-6">
                    <Button onClick={capturePhoto} className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-200 shadow-xl" title="Capture Photo">
                      <Camera size={28} />
                    </Button>
                    <Button variant="destructive" onClick={stopCamera} className="rounded-full w-16 h-16 shadow-xl" title="Cancel">
                      <X size={28} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Area (Controls) - 30% Width */}
          <div className="md:w-[30%] w-full h-full bg-slate-50 border-l border-slate-100 flex flex-col items-center justify-center shrink-0 p-6">
            {userImgUrl ? (
              <div className="w-full h-[620px] overflow-y-auto hidden-scrollbar space-y-6">
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">Fine-tune</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Use the tools below to perfect the placement</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 font-bold text-xs uppercase tracking-wider">
                        <Trash2 size={14} className="mr-1.5" /> New Photo
                      </Button>
                    </div>

                    {/* Adjust Jewelry */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest">Jewelry Controls</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 rounded-lg border border-blue-100" onClick={handleDuplicate}>
                            <Copy size={12} className="mr-1" /> Duplicate
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 rounded-lg border border-red-100" onClick={handleDelete}>
                            <Trash2 size={12} className="mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl" onClick={() => handleScale(1.1)}>
                          <ZoomIn size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl" onClick={() => handleScale(0.9)}>
                          <ZoomOut size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl" onClick={() => handleRotate(15)}>
                          <RotateCw size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl" onClick={() => handleRotate(-15)}>
                          <RotateCcw size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* Adjust Photo */}
                    <div className="space-y-3">
                      <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block">Environment</span>
                      <div className="flex gap-3 bg-blue-50/30 p-2 rounded-2xl border border-blue-50">
                        <Button variant="outline" size="sm" className="flex-1 bg-white shadow-sm font-bold text-xs h-10 border-blue-100 rounded-xl" onClick={() => handleBackgroundScale(1.1)}>
                          <ZoomIn size={16} className="mr-2 text-blue-500" /> Photo Zoom In
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-white shadow-sm font-bold text-xs h-10 border-blue-100 rounded-xl" onClick={() => handleBackgroundScale(0.9)}>
                          <ZoomOut size={16} className="mr-2 text-blue-500" /> Photo Zoom Out
                        </Button>
                      </div>
                    </div>

                    {/* Final Actions */}
                    <div className="pt-4 border-t border-slate-50">
                      <Button
                        variant="default"
                        className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl shadow-xl shadow-blue-200 font-black text-md uppercase tracking-wide group"
                        onClick={handleDownload}
                      >
                        <Download size={20} className="mr-3 group-hover:translate-y-0.5 transition-transform" /> Save High-Res Photo
                      </Button>
                      <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100/50">
                        <p className="text-[10px] text-yellow-800 font-bold italic leading-relaxed">
                          <Sparkles size={10} className="inline mr-1.5 text-yellow-600 mb-0.5" />
                          Pro Tip: For items like earrings, zoom into your portrait first. Use "Duplicate" to create pairs, and "Delete" if you change your mind!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-300">
                <div className="w-24 h-24 border-2 border-dashed border-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Image src="/logo.png" alt="M.K. Jewellers" width={40} height={40} className="opacity-10 grayscale" />
                </div>
                <p className="text-sm max-w-[200px] font-medium italic">Your personalized Try-On studio is ready</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VirtualTryOn
