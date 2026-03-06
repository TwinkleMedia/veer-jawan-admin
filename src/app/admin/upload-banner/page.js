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
      const res = await fetch("http://localhost:5000/api/banner");
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

    // STEP 1: Upload image to Cloudinary
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", image);
    cloudinaryForm.append("upload_preset", "veerjavan"); // your preset

    const cloudinaryRes = await fetch(
      "https://api.cloudinary.com/v1_1/dm9dtfpjd/image/upload",
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryData.secure_url) {
      console.error("Cloudinary error:", cloudinaryData);
      alert("Image upload failed");
      setLoading(false);
      return;
    }

    // STEP 2: Save banner to backend
    const res = await fetch("http://localhost:5000/api/banner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
      }),
    });

    if (!res.ok) {
      throw new Error("Banner save failed");
    }

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
  const confirmDelete = confirm("Are you sure you want to delete this banner?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/banner/${id}`, {
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

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-orange-700">
            Upload Banner
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100">

          <form onSubmit={handleSubmit} className="p-8">

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer ${
                dragOver ? "border-orange-500 bg-orange-50" : "border-orange-300"
              }`}
            >

              <p className="text-orange-700 font-semibold">
                Drag & drop your banner
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-3"
              />

            </div>

            {preview && (
              <div className="mt-5">
                <img
                  src={preview}
                  className="w-full h-48 object-cover rounded-xl border"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !image}
              className="w-full mt-6 py-4 rounded-2xl bg-orange-600 text-white"
            >
              {loading ? "Uploading..." : "Upload Banner"}
            </button>

          </form>
        </div>

        <div className="mt-10 bg-white rounded-3xl shadow-xl border p-6">

          <h2 className="text-2xl font-bold text-orange-700 mb-6">
            Uploaded Banners
          </h2>

          {banners.length === 0 ? (
            <p>No banners uploaded yet.</p>
          ) : (

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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>
    </div>
  );
}