import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { getAuthUser } from "../../lib/server/auth";
import { Project } from "../../models/project";
import { Profile } from "../../models/profile";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  saveFormDataFile,
} from "../../lib/server/cloudinary";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

// GET — Fetch all projects linked to the user's profile
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id }).populate("projects");
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    return NextResponse.json(
      new ApiResponse(200, profile.projects, "Projects fetched successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// POST — Create a new project and link it to the user's profile
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("image") as File | null;
    const screenshotFiles = formData.getAll("screenshots") as File[];
    const technologies = formData.get("technologies") as string | null;
    const liveLink = formData.get("liveLink") as string | null;
    const githubLink = formData.get("githubLink") as string | null;
    const featured = formData.get("featured") as string | null;
    const order = formData.get("order") as string | null;

    if (!title?.trim() || !description?.trim() || !liveLink?.trim()) {
      throw new ApiError(400, "Title, description, and live link are required");
    }

    if (!imageFile || imageFile.size === 0) {
      throw new ApiError(400, "Project image is required");
    }

    const techArray = technologies ? JSON.parse(technologies) : [];
    if (!techArray.length) {
      throw new ApiError(400, "At least one technology is required");
    }

    await ConnectDB();

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) throw new ApiError(404, "Profile not found. Create a profile first.");

    const tempPath = await saveFormDataFile(imageFile);
    const result = await uploadOnCloudinary(tempPath);
    const imageUrl = result?.secure_url || "";

    // Upload screenshots
    const screenshotUrls: string[] = [];
    for (const file of screenshotFiles) {
      if (file && file.size > 0) {
        const tmpPath = await saveFormDataFile(file);
        const res = await uploadOnCloudinary(tmpPath);
        if (res?.secure_url) screenshotUrls.push(res.secure_url);
      }
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      screenshots: screenshotUrls,
      technologies: techArray,
      liveLink: liveLink.trim(),
      githubLink: githubLink?.trim() || "",
      featured: featured === "true",
      order: order ? Number(order) : undefined,
    });

    // Add to profile's projects array
    profile.projects.push(project._id);
    await profile.save();

    return NextResponse.json(
      new ApiResponse(201, project, "Project created successfully"),
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// PUT — Update an existing project by ID (passed in body)
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const formData = await req.formData();
    const _id = formData.get("_id") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("image") as File | null;
    const screenshotFiles = formData.getAll("screenshots") as File[];
    const technologies = formData.get("technologies") as string | null;
    const liveLink = formData.get("liveLink") as string | null;
    const githubLink = formData.get("githubLink") as string | null;
    const featured = formData.get("featured") as string | null;
    const order = formData.get("order") as string | null;

    if (!_id) throw new ApiError(400, "Project ID is required");

    await ConnectDB();

    // Verify the project belongs to the user's profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile || !profile.projects.includes(_id)) {
      throw new ApiError(404, "Project not found in your profile");
    }

    const updateData: Record<string, any> = {};
    if (title?.trim()) updateData.title = title.trim();
    if (description?.trim()) updateData.description = description.trim();
    if (technologies) updateData.technologies = JSON.parse(technologies);
    if (liveLink?.trim()) updateData.liveLink = liveLink.trim();
    if (githubLink !== null) updateData.githubLink = githubLink?.trim() || "";
    if (featured !== null) updateData.featured = featured === "true";
    if (order !== null) updateData.order = order ? Number(order) : undefined;

    if (imageFile && imageFile.size > 0) {
      const existingProject = await Project.findById(_id);
      if (existingProject?.imageUrl) await deleteFromCloudinary(existingProject.imageUrl);
      const tempPath = await saveFormDataFile(imageFile);
      const result = await uploadOnCloudinary(tempPath);
      if (result?.secure_url) updateData.imageUrl = result.secure_url;
    }

    // Handle new screenshots upload
    if (screenshotFiles.length > 0 && screenshotFiles[0]?.size > 0) {
      // Clean up old screenshots
      const existingProject = await Project.findById(_id);
      if (existingProject?.screenshots) {
        for (const url of existingProject.screenshots) {
          await deleteFromCloudinary(url);
        }
      }
      const screenshotUrls: string[] = [];
      for (const file of screenshotFiles) {
        if (file && file.size > 0) {
          const tmpPath = await saveFormDataFile(file);
          const res = await uploadOnCloudinary(tmpPath);
          if (res?.secure_url) screenshotUrls.push(res.secure_url);
        }
      }
      updateData.screenshots = screenshotUrls;
    }

    const project = await Project.findByIdAndUpdate(_id, updateData, { new: true });
    if (!project) throw new ApiError(404, "Project not found");

    return NextResponse.json(
      new ApiResponse(200, project, "Project updated successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// DELETE — Delete a project by ID (passed in body)
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) throw new ApiError(401, "Unauthorized");

    const { _id } = await req.json();
    if (!_id) throw new ApiError(400, "Project ID is required");

    await ConnectDB();

    // Remove from profile's projects array
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $pull: { projects: _id } },
      { new: true }
    );
    if (!profile) throw new ApiError(404, "Profile not found");

    const project = await Project.findByIdAndDelete(_id);
    if (!project) throw new ApiError(404, "Project not found");

    // Clean up Cloudinary assets
    if (project.imageUrl) await deleteFromCloudinary(project.imageUrl);
    if (project.screenshots) {
      for (const url of project.screenshots) {
        await deleteFromCloudinary(url);
      }
    }

    return NextResponse.json(
      new ApiResponse(200, null, "Project deleted successfully"),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
