import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { getAuthUser } from "../../lib/server/auth";
import { Education } from "../../models/education";
import { Profile } from "../../models/profile";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  saveFormDataFile,
} from "../../lib/server/cloudinary";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

// GET — Fetch all education entries linked to the user's profile
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id }).populate("education");
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    return NextResponse.json(
      new ApiResponse(200, profile.education, "Education fetched successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// POST — Create a new education entry and link it to the user's profile
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const institution = formData.get("institution") as string | null;
    const institutionLogoFile = formData.get("institutionLogo") as File | null;
    const degree = formData.get("degree") as string | null;
    const fieldOfStudy = formData.get("fieldOfStudy") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;
    const grade = formData.get("grade") as string | null;
    const description = formData.get("description") as string | null;

    if (!institution?.trim() || !degree?.trim() || !fieldOfStudy?.trim() || !startDate) {
      throw new ApiError(400, "Institution, degree, field of study, and start date are required");
    }

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    let institutionLogoUrl = "";
    if (institutionLogoFile && institutionLogoFile.size > 0) {
      const tempPath = await saveFormDataFile(institutionLogoFile);
      const result = await uploadOnCloudinary(tempPath);
      institutionLogoUrl = result?.secure_url || "";
    }

    const education = await Education.create({
      institution: institution.trim(),
      institutionLogo: institutionLogoUrl,
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startDate,
      endDate: endDate || null,
      grade: grade?.trim() || "",
      description: description?.trim() || "",
    });

    // Add to profile's education array
    profile.education.push(education._id);
    await profile.save();

    return NextResponse.json(
      new ApiResponse(201, education, "Education created successfully"),
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// PUT — Update an existing education entry by ID (passed in body)
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const _id = formData.get("_id") as string | null;
    const institution = formData.get("institution") as string | null;
    const institutionLogoFile = formData.get("institutionLogo") as File | null;
    const degree = formData.get("degree") as string | null;
    const fieldOfStudy = formData.get("fieldOfStudy") as string | null;
    const startDate = formData.get("startDate") as string | null;
    const endDate = formData.get("endDate") as string | null;
    const grade = formData.get("grade") as string | null;
    const description = formData.get("description") as string | null;

    if (!_id) throw new ApiError(400, "Education ID is required");

    await ConnectDB();

    // Verify the education entry belongs to the user's profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile || !profile.education.includes(_id)) {
      throw new ApiError(404, "Education not found in your profile");
    }

    const updateData: Record<string, any> = {};
    if (institution?.trim()) updateData.institution = institution.trim();
    if (degree?.trim()) updateData.degree = degree.trim();
    if (fieldOfStudy?.trim()) updateData.fieldOfStudy = fieldOfStudy.trim();
    if (startDate) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate || null;
    if (grade !== null) updateData.grade = grade?.trim() || "";
    if (description !== null) updateData.description = description?.trim() || "";

    if (institutionLogoFile && institutionLogoFile.size > 0) {
      const existingEdu = await Education.findById(_id);
      if (existingEdu?.institutionLogo) await deleteFromCloudinary(existingEdu.institutionLogo);
      const tempPath = await saveFormDataFile(institutionLogoFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.institutionLogo = result.secure_url;
    }

    const education = await Education.findByIdAndUpdate(_id, updateData, { new: true });
    if (!education) throw new ApiError(404, "Education not found");

    return NextResponse.json(
      new ApiResponse(200, education, "Education updated successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// DELETE — Delete an education entry by ID (passed in body)
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const { _id } = await req.json();

    if (!_id) throw new ApiError(400, "Education ID is required");

    await ConnectDB();

    // Remove from profile's education array
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $pull: { education: _id } },
      { new: true }
    );

    if (!profile) throw new ApiError(404, "Profile not found");

    const education = await Education.findByIdAndDelete(_id);

    if (!education) throw new ApiError(404, "Education not found");

    // Clean up Cloudinary asset
    if (education.institutionLogo) await deleteFromCloudinary(education.institutionLogo);

    return NextResponse.json(
      new ApiResponse(200, null, "Education deleted successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
