import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    await connectDB();

    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Login successful",
    });

    // set simple cookie
    response.cookies.set("admin", "true", {
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}