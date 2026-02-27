import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { getAuthUser } from "../../lib/server/auth";
import { Profile } from "../../models/profile";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  saveFormDataFile,
} from "../../lib/server/cloudinary";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

// GET — Fetch the authenticated user's profile (populated)
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id })
      .populate("skills")
      .populate("projects")
      .populate("experience")
      .populate("education");

    if (!profile) throw new ApiError(404, "Profile not found");

    return NextResponse.json(
      new ApiResponse(200, profile, "Profile fetched successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// POST — Create a new profile for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const role = formData.get("role") as string | null;
    const bio = formData.get("bio") as string | null;
    const typewriterStrings = formData.get("typewriterStrings") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const address = formData.get("address") as string | null;
    const socialLinks = formData.get("socialLinks") as string | null;
    const photoFile = formData.get("photo") as File | null;
    const heroImageFile = formData.get("heroImage") as File | null;
    const resumeFile = formData.get("resume") as File | null;

    if (!name?.trim() || !role?.trim() || !bio?.trim() || !email?.trim()) {
      throw new ApiError(400, "Name, role, bio, and email are required");
    }

    const parsedTypewriterStrings = typewriterStrings ? JSON.parse(typewriterStrings) : [];
    if (!parsedTypewriterStrings.length) {
      throw new ApiError(400, "At least one typewriter string is required");
    }

    await ConnectDB();

    // Check if profile already exists for this user
    const existingProfile = await Profile.findOne({ userId: user._id });
    if (existingProfile) {
      throw new ApiError(409, "Profile already exists. Use PUT to update.");
    }

    let photoUrl = "";
    let heroImageUrl = "";
    let resumeUrl = "";

    if (photoFile && photoFile.size > 0) {
      const tempPath = await saveFormDataFile(photoFile);
      const result = await uploadOnCloudinary(tempPath);
      photoUrl = result?.secure_url || "";
    }

    if (heroImageFile && heroImageFile.size > 0) {
      const tempPath = await saveFormDataFile(heroImageFile);
      const result = await uploadOnCloudinary(tempPath);
      heroImageUrl = result?.secure_url || "";
    }

    if (resumeFile && resumeFile.size > 0) {
      const tempPath = await saveFormDataFile(resumeFile);
      const result = await uploadOnCloudinary(tempPath);
      resumeUrl = result?.secure_url || "";
    }

    const profile = await Profile.create({
      userId: user._id,
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      typewriterStrings: parsedTypewriterStrings,
      email: email.trim(),
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      photo: photoUrl,
      heroImage: heroImageUrl,
      resume: resumeUrl,
    });

    return NextResponse.json(
      new ApiResponse(201, profile, "Profile created successfully"),
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// PUT — Update the authenticated user's profile
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const role = formData.get("role") as string | null;
    const bio = formData.get("bio") as string | null;
    const typewriterStrings = formData.get("typewriterStrings") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const address = formData.get("address") as string | null;
    const socialLinks = formData.get("socialLinks") as string | null;
    const photoFile = formData.get("photo") as File | null;
    const heroImageFile = formData.get("heroImage") as File | null;
    const resumeFile = formData.get("resume") as File | null;

    await ConnectDB();

    const existingProfile = await Profile.findOne({ userId: user._id });
    if (!existingProfile) throw new ApiError(404, "Profile not found");

    const updateData: Record<string, any> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (role?.trim()) updateData.role = role.trim();
    if (bio?.trim()) updateData.bio = bio.trim();
    if (typewriterStrings) updateData.typewriterStrings = JSON.parse(typewriterStrings);
    if (email?.trim()) updateData.email = email.trim();
    if (phone !== null) updateData.phone = phone?.trim() || "";
    if (address !== null) updateData.address = address?.trim() || "";
    if (socialLinks) updateData.socialLinks = JSON.parse(socialLinks);

    if (photoFile && photoFile.size > 0) {
      if (existingProfile.photo) await deleteFromCloudinary(existingProfile.photo);
      const tempPath = await saveFormDataFile(photoFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.photo = result.secure_url;
    }

    if (heroImageFile && heroImageFile.size > 0) {
      if (existingProfile.heroImage) await deleteFromCloudinary(existingProfile.heroImage);
      const tempPath = await saveFormDataFile(heroImageFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.heroImage = result.secure_url;
    }

    if (resumeFile && resumeFile.size > 0) {
      if (existingProfile.resume) await deleteFromCloudinary(existingProfile.resume);
      const tempPath = await saveFormDataFile(resumeFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.resume = result.secure_url;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      updateData,
      { new: true }
    )
      .populate("skills")
      .populate("projects")
      .populate("experience")
      .populate("education");

    if (!profile) throw new ApiError(404, "Profile not found");

    return NextResponse.json(
      new ApiResponse(200, profile, "Profile updated successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// DELETE — Delete the authenticated user's profile
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    await ConnectDB();

    const profile = await Profile.findOneAndDelete({ userId: user._id });

    if (!profile) throw new ApiError(404, "Profile not found");

    // Clean up Cloudinary assets
    if (profile.photo) await deleteFromCloudinary(profile.photo);
    if (profile.heroImage) await deleteFromCloudinary(profile.heroImage);
    if (profile.resume) await deleteFromCloudinary(profile.resume);

    return NextResponse.json(
      new ApiResponse(200, null, "Profile deleted successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
