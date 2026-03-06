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
      const res = await fetch("/api/banner/list");
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

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);

    const res = await fetch("/api/banner/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server error:", errorText);
      alert("Upload failed. Check server console.");
      return;
    }

    await res.json();

    alert("Banner Uploaded Successfully");

    setPreview(null);
    setImage(null);

    fetchBanners();
  };

  const deleteBanner = async (id) => {
  const confirmDelete = confirm("Are you sure you want to delete this banner?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/banner/delete/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Banner Deleted");
      fetchBanners();
    } else {
      alert("Delete failed");
    }
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-12">

      <div className="w-full max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-orange-500 text-3xl">❁</span>
            <h1 className="text-4xl font-extrabold text-orange-700 tracking-tight font-serif">
              Upload Banner
            </h1>
            <span className="text-green-600 text-3xl">❁</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-16 bg-orange-300" />
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <div className="h-px w-16 bg-orange-300" />
          </div>
        </div>

        {/* Upload Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">

          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-green-600" />

          <form onSubmit={handleSubmit} className="p-8 sm:p-10">

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
                ${dragOver
                  ? "border-orange-500 bg-orange-50"
                  : "border-orange-300 bg-amber-50 hover:border-orange-400 hover:bg-orange-50"
                }`}
            >
              <label className="flex flex-col items-center justify-center gap-3 py-10 px-6 cursor-pointer">

                <p className="text-orange-700 font-semibold text-base">
                  Drag & drop your banner
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-5">
                <p className="text-amber-700 text-xs font-semibold uppercase mb-2">
                  Preview
                </p>
                <img
                  src={preview}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-xl border"
                />
              </div>
            )}

            {/* Upload Button */}
            <button
              type="submit"
              disabled={loading || !image}
              className={`w-full mt-6 py-4 rounded-2xl font-bold transition-all
                ${loading || !image
                  ? "bg-amber-200 text-amber-400 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
            >
              {loading ? "Uploading..." : "Upload Banner"}
            </button>

          </form>
        </div>

        {/* Banner Table */}
    <div className="mt-10 bg-white rounded-3xl shadow-xl border border-orange-100 p-6">

  <h2 className="text-2xl font-bold text-orange-700 mb-6">
    Uploaded Banners
  </h2>

  {banners.length === 0 ? (
    <p className="text-gray-500">No banners uploaded yet.</p>
  ) : (

    <div className="overflow-x-auto">

      <table className="w-full border">

        <thead className="bg-orange-50">
          <tr>
            <th className="p-3 border">Preview</th>
            <th className="p-3 border">Upload Date</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>

          {banners.map((banner) => (

            <tr key={banner._id} className="text-center">

              <td className="p-3 border">
                <img
                  src={banner.imageUrl}
                  className="w-32 h-16 object-cover mx-auto rounded"
                />
              </td>

              <td className="p-3 border">
                {new Date(banner.createdAt).toLocaleDateString()}
              </td>

              <td className="p-3 border">

                <button
                  onClick={() => deleteBanner(banner._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</div>

      </div>

    </div>
  );
}