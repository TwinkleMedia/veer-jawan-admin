"use client";

import { useState, useEffect } from "react";

export default function UploadBanner() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [banners, setBanners] = useState([]);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banner`);
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image");
      return;
    }
    setLoading(true);
    try {
      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", image);
      cloudinaryForm.append("upload_preset", "veerjavan");

      const cloudinaryRes = await fetch(
        "https://api.cloudinary.com/v1_1/dm9dtfpjd/image/upload",
        { method: "POST", body: cloudinaryForm }
      );
      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryData.secure_url) {
        alert("Image upload failed");
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: cloudinaryData.secure_url,
          public_id: cloudinaryData.public_id,
        }),
      });

      if (!res.ok) throw new Error("Banner save failed");

      alert("Banner Uploaded Successfully");
      setPreview(null);
      setImage(null);
      fetchBanners();
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
    setLoading(false);
  };

  const deleteBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/banner/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBanners();
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-orange-700">
            🖼️ Upload Banner
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Drag & drop or select an image to upload
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100">
          <form onSubmit={handleSubmit} className="p-5 sm:p-8">

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-colors ${
                dragOver
                  ? "border-orange-500 bg-orange-50"
                  : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/50"
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-3">📁</div>
              <p className="text-orange-700 font-semibold text-sm sm:text-base mb-1">
                Drag & drop your banner here
              </p>
              <p className="text-gray-400 text-xs mb-4">or browse to choose a file</p>

              <label className="inline-block cursor-pointer">
                <span className="px-4 py-2 text-xs sm:text-sm font-bold bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition">
                  Browse File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {image && (
                <p className="mt-3 text-xs text-gray-400 truncate max-w-full px-4">
                  📎 {image.name}
                </p>
              )}
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-5 relative group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 sm:h-52 object-cover rounded-xl border border-orange-100"
                />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setImage(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-md">
                  Preview
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !image}
              className={`w-full mt-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white transition shadow-md ${
                loading || !image
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 shadow-orange-200"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                "🚀 Upload Banner"
              )}
            </button>

          </form>
        </div>

        {/* Banners List */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-orange-100 p-5 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-bold text-orange-700 mb-5 flex items-center gap-2">
            🗂️ Uploaded Banners
            {banners.length > 0 && (
              <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
                {banners.length} total
              </span>
            )}
          </h2>

          {banners.length === 0 ? (
            <div className="text-center py-10 text-gray-300">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">No banners uploaded yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table — hidden on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-50 text-orange-700 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left rounded-tl-xl">Preview</th>
                      <th className="px-4 py-3 text-left">Upload Date</th>
                      <th className="px-4 py-3 text-right rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {banners.map((banner) => (
                      <tr key={banner._id} className="hover:bg-orange-50/30 transition">
                        <td className="px-4 py-3">
                          <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-28 h-14 object-cover rounded-lg border border-orange-100"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(banner.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteBanner(banner._id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition border border-red-100"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards — shown only on mobile */}
              <div className="flex flex-col gap-3 sm:hidden">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/30"
                  >
                    <img
                      src={banner.imageUrl}
                      alt="Banner"
                      className="w-20 h-12 object-cover rounded-lg border border-orange-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">Uploaded</p>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {new Date(banner.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBanner(banner._id)}
                      className="shrink-0 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition border border-red-100"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}