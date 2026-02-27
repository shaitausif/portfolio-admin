import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { getAuthUser } from "../../lib/server/auth";
import { Experience } from "../../models/experience";
import { Profile } from "../../models/profile";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  saveFormDataFile,
} from "../../lib/server/cloudinary";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

// GET — Fetch all experience entries (optionally linked to user's profile)
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id }).populate("experience");
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    return NextResponse.json(
      new ApiResponse(200, profile.experience, "Experience fetched successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// POST — Create a new experience entry and link it to user's profile
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const jobTitle = formData.get("jobTitle") as string | null;
    const company = formData.get("company") as string | null;
    const companyLogoFile = formData.get("companyLogo") as File | null;
    const location = formData.get("location") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;
    const description = formData.get("description") as string | null;
    const technologies = formData.get("technologies") as string | null;
    const isCurrentRole = formData.get("isCurrentRole") as string | null;
    const mediaFile = formData.get("media") as File | null;

    if (!jobTitle?.trim() || !company?.trim() || !location?.trim() || !startDate) {
      throw new ApiError(400, "Job title, company, location, and start date are required");
    }

    const descriptionArray = description ? JSON.parse(description) : [];
    if (!descriptionArray.length) {
      throw new ApiError(400, "At least one description bullet point is required");
    }

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    let companyLogoUrl = "";
    if (companyLogoFile && companyLogoFile.size > 0) {
      const tempPath = await saveFormDataFile(companyLogoFile);
      const result = await uploadOnCloudinary(tempPath);
      companyLogoUrl = result?.secure_url || "";
    }

    let mediaUrl = "";
    if (mediaFile && mediaFile.size > 0) {
      const tempPath = await saveFormDataFile(mediaFile);
      const result = await uploadOnCloudinary(tempPath);
      mediaUrl = result?.secure_url || "";
    }

    const experience = await Experience.create({
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      companyLogo: companyLogoUrl,
      location: location.trim(),
      startDate,
      endDate: endDate || null,
      description: descriptionArray,
      technologies: technologies ? JSON.parse(technologies) : [],
      isCurrentRole: isCurrentRole === "true",
      media: mediaUrl,
    });

    // Add to profile's experience array
    profile.experience.push(experience._id);
    await profile.save();

    return NextResponse.json(
      new ApiResponse(201, experience, "Experience created successfully"),
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// PUT — Update an existing experience entry by ID (passed in body)
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const _id = formData.get("_id") as string | null;
    const jobTitle = formData.get("jobTitle") as string | null;
    const company = formData.get("company") as string | null;
    const companyLogoFile = formData.get("companyLogo") as File | null;
    const location = formData.get("location") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;
    const description = formData.get("description") as string | null;
    const technologies = formData.get("technologies") as string | null;
    const isCurrentRole = formData.get("isCurrentRole") as string | null;
    const mediaFile = formData.get("media") as File | null;

    if (!_id) throw new ApiError(400, "Experience ID is required");

    await ConnectDB();

    // Verify the experience belongs to the user's profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile || !profile.experience.includes(_id)) {
      throw new ApiError(404, "Experience not found in your profile");
    }

    const updateData: Record<string, any> = {};
    if (jobTitle?.trim()) updateData.jobTitle = jobTitle.trim();
    if (company?.trim()) updateData.company = company.trim();
    if (location?.trim()) updateData.location = location.trim();
    if (startDate) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate || null;
    if (description) updateData.description = JSON.parse(description);
    if (technologies) updateData.technologies = JSON.parse(technologies);
    if (isCurrentRole !== null) updateData.isCurrentRole = isCurrentRole === "true";

    if (companyLogoFile && companyLogoFile.size > 0) {
      const existingExp = await Experience.findById(_id);
      if (existingExp?.companyLogo) await deleteFromCloudinary(existingExp.companyLogo);
      const tempPath = await saveFormDataFile(companyLogoFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.companyLogo = result.secure_url;
    }

    if (mediaFile && mediaFile.size > 0) {
      const existingExp = await Experience.findById(_id);
      if (existingExp?.media) await deleteFromCloudinary(existingExp.media);
      const tempPath = await saveFormDataFile(mediaFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.media = result.secure_url;
    }

    const experience = await Experience.findByIdAndUpdate(_id, updateData, { new: true });

    if (!experience) throw new ApiError(404, "Experience not found");

    return NextResponse.json(
      new ApiResponse(200, experience, "Experience updated successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// DELETE — Delete an experience entry by ID (passed in body)
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const { _id } = await req.json();

    if (!_id) throw new ApiError(400, "Experience ID is required");

    await ConnectDB();

    // Remove from profile's experience array
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $pull: { experience: _id } },
      { new: true }
    );

    if (!profile) throw new ApiError(404, "Profile not found");

    const experience = await Experience.findByIdAndDelete(_id);

    if (!experience) throw new ApiError(404, "Experience not found");

    // Clean up Cloudinary assets
    if (experience.media) await deleteFromCloudinary(experience.media);
    if (experience.companyLogo) await deleteFromCloudinary(experience.companyLogo);

    return NextResponse.json(
      new ApiResponse(200, null, "Experience deleted successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
