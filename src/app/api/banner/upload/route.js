import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Banner from "@/models/Banner";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { error: "No Image Uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "banner" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    // SAVE BOTH URL AND PUBLIC_ID
    const banner = await Banner.create({
      imageUrl: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });

    return NextResponse.json({
      success: true,
      banner,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upload Failed" },
      { status: 500 }
    );
  }
}