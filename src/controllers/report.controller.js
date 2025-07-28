import asyncHandler from '../utils/asyncHandler.js';
import { Report } from '../models/report.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadMultipleFilesToS3 } from '../utils/s3uploads.js';

// Health check
const healthCheck = async (req, res) => {
    return res.status(201).json(
        new ApiResponse(200, "Server is running")
    );
}

// Create new pothole report
const createReport = asyncHandler(async (req, res) => {

    const { description, latitude, longitude } = req.body;

    // Validate required fields
    if (
        !description?.trim() ||
        !latitude?.trim() ||
        !longitude?.trim()
    ) {
        throw new ApiError(400, "Please provide all required fields");
    }

    // Check file upload
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }

    if (req.files.length > 5) {
        throw new ApiError(400, "Maximum 5 images are allowed");
    }

    // Upload all files to S3
    const  uploadedImages = await uploadMultipleFilesToS3(req.files)

    if (!uploadedImages) {
            throw new ApiError(500, "File upload failed in s3");
        }

    // Create the report
    const newReport = await Report.create({
        reporter: req.user?._id,
        description,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        },
        image: uploadedImages,
        status: 'pending', // default
    });

    return res.status(201).json(
        new ApiResponse(201, newReport, "Pothole report submitted successfully")
    );
});

export {
    healthCheck,
    createReport
}