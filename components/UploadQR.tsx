"use client";

import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UploadQRProps {
  onQRScanned: (scannedData: { username: string; walletAddress: string }) => void;
  onCancel: () => void;
}

export default function UploadQR({ onQRScanned, onCancel }: UploadQRProps) {
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError("");
    setIsScanning(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      scanQRCodeFromImage(file);
    };
    reader.readAsDataURL(file);
  };

  const scanQRCodeFromImage = async (file: File) => {
    try {
      const html5QrCode = new Html5Qrcode("qr-upload-preview");
      
      // Scan the image file
      const decodedText = await html5QrCode.scanFile(file, true);
      
      try {
        const parsedData = JSON.parse(decodedText);
        console.log("📸 Uploaded QR Data:", parsedData);

        if (parsedData.username && parsedData.walletAddress) {
          onQRScanned({
            username: parsedData.username.replace("@", ""),
            walletAddress: parsedData.walletAddress,
          });
        } else {
          setError("Invalid QR code format - missing username or wallet address");
        }
      } catch (parseError) {
        console.error("QR parse error:", parseError);
        setError("Could not read QR data - invalid format");
      }
    } catch (scanError) {
      console.error("QR scan error:", scanError);
      setError("Failed to scan QR code from image. Please try another image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add("border-emerald-500", "bg-emerald-50");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-emerald-500", "bg-emerald-50");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-emerald-500", "bg-emerald-50");
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Create a synthetic event for the file input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        if (fileInputRef.current) {
          fileInputRef.current.files = dataTransfer.files;
          handleFileSelect({ target: { files: dataTransfer.files } } as any);
        }
      } else {
        setError("Please drop an image file");
      }
    }
  };

  const resetUpload = () => {
    setPreviewImage(null);
    setError("");
    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-lg w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">Upload QR Code</h3>
        <p className="text-emerald-600 text-sm">Upload an image containing a QR code</p>
      </div>

      {/* Upload Area */}
      <div className="w-full mb-6">
        {!previewImage ? (
          <div
            className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-12 h-12 text-emerald-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-emerald-700 font-medium mb-2">Click to upload or drag and drop</p>
            <p className="text-emerald-500 text-sm">PNG, JPG, JPEG up to 5MB</p>
          </div>
        ) : (
          <div className="relative">
            <div id="qr-upload-preview" className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-200">
              <img 
                src={previewImage} 
                alt="QR Code Preview" 
                className="max-w-full max-h-full object-contain"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <div className="text-white text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Scanning QR Code...</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={resetUpload}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Handling */}
      {error && (
        <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="w-full mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
        <h4 className="font-semibold text-emerald-800 text-sm mb-2">How to use:</h4>
        <ul className="text-emerald-600 text-xs space-y-1">
          <li>• Take a screenshot or photo of a payment QR code</li>
          <li>• Upload the image here</li>
          <li>• We'll automatically scan and populate recipient details</li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button 
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        {previewImage && !isScanning && (
          <button 
            onClick={resetUpload}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Upload New
          </button>
        )}
      </div>
    </div>
  );
}