import { X, Upload, FileText } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";

type UploadResult = {
  message: string;
  inserted_id: string;
};

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [court, setCourt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { authFetch } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }
    if (!category.trim()) {
      alert("Please select a category.");
      return;
    }
    if (!court.trim()) {
      alert("Please enter a court name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("court_name", court);

    setLoading(true);
    setResult(null);

    try {
      const response = await authFetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const detailText = await response.text().catch(() => "");
        throw new Error(detailText || `Upload failed (${response.status})`);
      }

      const data = (await response.json()) as UploadResult;
      setResult(data);
      await onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Upload Court Judgment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-[#8B0000] bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {file ? (
              <div className="space-y-3">
                <FileText className="w-12 h-12 text-[#8B0000] mx-auto" />
                <div className="text-sm text-gray-700">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div className="text-sm text-gray-600">
                  Drag and drop your PDF file here, or
                </div>
                <label className="inline-block">
                  <span className="bg-[#8B0000] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#6B0000] transition-colors text-sm">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <div className="text-xs text-gray-500">
                  PDF files only (Max 50MB)
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700">Case Category</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setResult(null);
                }}
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              >
                <option value="">Select Category</option>
                <option value="Civil">Civil</option>
                <option value="Criminal">Criminal</option>
                <option value="Constitutional">Constitutional</option>
                <option value="Administrative">Administrative</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Court Name</span>
              <input
                type="text"
                placeholder="e.g., High Court of Karnataka"
                value={court}
                onChange={(e) => {
                  setCourt(e.target.value);
                  setResult(null);
                }}
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              />
            </label>
          </div>

          {result ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <div className="text-sm text-green-700">{result.message}</div>
              <div className="text-xs text-gray-700">
                <span className="font-medium">Case ID:</span>{" "}
                {result.inserted_id}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-[#8B0000] text-white px-6 py-2 rounded-lg hover:bg-[#6B0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Upload & Process"}
          </button>
        </div>
      </div>
    </div>
  );
}
