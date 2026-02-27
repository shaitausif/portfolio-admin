import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { getAuthUser } from "../../lib/server/auth";
import { Skill } from "../../models/skill";
import { Profile } from "../../models/profile";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  saveFormDataFile,
} from "../../lib/server/cloudinary";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

// GET — Fetch all skills linked to the user's profile
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id }).populate("skills");
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    return NextResponse.json(
      new ApiResponse(200, profile.skills, "Skills fetched successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// POST — Create a new skill and link it to the user's profile
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const level = formData.get("level") as string | null;
    const logoFile = formData.get("logo") as File | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;

    if (!name?.trim() || level === null || level === "") {
      throw new ApiError(400, "Name and level are required");
    }

    const parsedLevel = Number(level);
    if (isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 100) {
      throw new ApiError(400, "Level must be a number between 0 and 100");
    }

    if (!logoFile || logoFile.size === 0) {
      throw new ApiError(400, "Skill logo is required");
    }

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    const tempPath = await saveFormDataFile(logoFile);
    const result = await uploadOnCloudinary(tempPath);
    const logoUrl = result?.secure_url || "";

    const skill = await Skill.create({
      name: name.trim(),
      level: parsedLevel,
      logo: logoUrl,
      category: category?.trim() || "",
      description: description?.trim() || "",
    });

    // Add to profile's skills array
    profile.skills.push(skill._id);
    await profile.save();

    return NextResponse.json(
      new ApiResponse(201, skill, "Skill created successfully"),
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// PUT — Update an existing skill by ID (passed in body)
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const _id = formData.get("_id") as string | null;
    const name = formData.get("name") as string | null;
    const level = formData.get("level") as string | null;
    const logoFile = formData.get("logo") as File | null;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;

    if (!_id) throw new ApiError(400, "Skill ID is required");

    await ConnectDB();

    // Verify the skill belongs to the user's profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile || !profile.skills.includes(_id)) {
      throw new ApiError(404, "Skill not found in your profile");
    }

    const updateData: Record<string, any> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (level !== null && level !== "") {
      const parsedLevel = Number(level);
      if (isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 100) {
        throw new ApiError(400, "Level must be a number between 0 and 100");
      }
      updateData.level = parsedLevel;
    }
    if (category !== null) updateData.category = category?.trim() || "";
    if (description !== null) updateData.description = description?.trim() || "";

    if (logoFile && logoFile.size > 0) {
      const existingSkill = await Skill.findById(_id);
      if (existingSkill?.logo) await deleteFromCloudinary(existingSkill.logo);
      const tempPath = await saveFormDataFile(logoFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.logo = result.secure_url;
    }

    const skill = await Skill.findByIdAndUpdate(_id, updateData, { new: true });
    if (!skill) throw new ApiError(404, "Skill not found");

    return NextResponse.json(
      new ApiResponse(200, skill, "Skill updated successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// DELETE — Delete a skill by ID (passed in body)
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const { _id } = await req.json();

    if (!_id) throw new ApiError(400, "Skill ID is required");

    await ConnectDB();

    // Remove from profile's skills array
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $pull: { skills: _id } },
      { new: true }
    );

    if (!profile) throw new ApiError(404, "Profile not found");

    const skill = await Skill.findByIdAndDelete(_id);

    if (!skill) throw new ApiError(404, "Skill not found");

    // Clean up Cloudinary asset
    if (skill.logo) await deleteFromCloudinary(skill.logo);

    return NextResponse.json(
      new ApiResponse(200, null, "Skill deleted successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
