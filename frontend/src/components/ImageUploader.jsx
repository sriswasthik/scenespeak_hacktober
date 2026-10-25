import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, X, Sparkles, RefreshCw, ZoomIn, Check } from 'lucide-react';

const PRESET_SAMPLES = [
  {
    id: 'circuit',
    label: 'Electrical Circuit',
    icon: '⚡',
    imagePath: '/samples/circuit.jpg',
    defaultQuestion: 'What is this circuit, and how does it work?'
  },
  {
    id: 'menu',
    label: 'Restaurant Menu',
    icon: '🍕',
    imagePath: '/samples/menu.jpg',
    defaultQuestion: 'Which dishes are vegetarian, and what do they contain?'
  },
  {
    id: 'notes',
    label: 'Study Notes & Diagram',
    icon: '🌿',
    imagePath: '/samples/notes.jpg',
    defaultQuestion: 'Explain this diagram and summarize the main concepts.'
  }
];

export default function ImageUploader({ image, onImageSelected, onClearImage, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream cleanly when component unmounts or camera closes
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCamera = async (mode = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setShowCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please upload a photo instead.');
    }
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `scene-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFileSelected(file);
      closeCamera();
    }, 'image/jpeg', 0.92);
  };

  const closeCamera = () => {
    stopCameraStream();
    setShowCamera(false);
    setCameraError(null);
  };

  const handleFileSelected = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('The selected image is larger than 10MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelected({
        file,
        previewUrl: e.target.result,
        base64: e.target.result.split(',')[1],
        mimeType: file.type,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const loadPresetSample = async (sample) => {
    try {
      const response = await fetch(sample.imagePath);
      const blob = await response.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelected({
          file,
          previewUrl: e.target.result,
          base64: e.target.result.split(',')[1],
          mimeType: 'image/jpeg',
          name: `${sample.label}.jpg`,
          size: (file.size / 1024).toFixed(1) + ' KB',
          suggestedInitialQuestion: sample.defaultQuestion
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* If an image is selected: Show Preview Card */}
      {image ? (
        <div className="relative rounded-2xl overflow-hidden glass-panel border border-indigo-500/30 p-3 shadow-xl glow-blue transition-all">
          <div className="relative aspect-video max-h-[380px] w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src={image.previewUrl}
              alt="Uploaded visual scene"
              className="max-h-[380px] w-full object-contain"
            />
            
            {/* Overlay pill with filename & size */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-slate-300 border border-white/10 flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[160px] sm:max-w-[220px]">{image.name}</span>
              <span className="text-slate-400">({image.size})</span>
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex items-center space-x-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-white/10 backdrop-blur-md transition-colors"
                title="Replace with another image"
              >
                Change
              </button>
              <button
                onClick={onClearImage}
                disabled={isLoading}
                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 backdrop-blur-md transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700/80 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-white mb-1">
            Upload a photo or capture a scene
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Drop an electrical circuit, restaurant menu, book page, or everyday object.
            Supports JPEG, PNG, WebP up to 10MB.
          </p>

          <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Photo</span>
            </button>

            <button
              type="button"
              onClick={() => startCamera('environment')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Use Camera</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
          }
        }}
      />

      {/* Quick Demo Samples Selector */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Try sample scenes for instant demo:</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadPresetSample(sample)}
              disabled={isLoading}
              className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all text-xs group"
            >
              <span className="text-base">{sample.icon}</span>
              <div className="truncate">
                <span className="font-medium text-slate-200 group-hover:text-indigo-300 block truncate">
                  {sample.label}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">1-click demo</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Camera Live Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-4 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-white font-medium text-sm">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Capture Snapshot</span>
              </div>
              <button
                onClick={closeCamera}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-6 text-center text-rose-400 text-sm">
                <p>{cameraError}</p>
                <button
                  onClick={closeCamera}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none rounded-xl" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={switchCamera}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip Camera</span>
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    onClick={closeCamera}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
