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
  const uploadedImages = await uploadMultipleFilesToS3(req.files);

  if (!uploadedImages) {
    throw new ApiError(500, "File upload failed in s3");
  }

  // Create the report with GeoJSON point
  const newReport = await Report.create({
    reporter: req.user?._id,
    description,
    location: {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // GeoJSON format [lng, lat]
    },
    image: uploadedImages,
    status: 'pending', // default
  });

  if (!newReport) {
    throw new ApiError(500, "Failed to create report");
  }

  return res.status(201).json(
    new ApiResponse(201, newReport, "Pothole report submitted successfully")
  );
});


const getAllReports = asyncHandler(async (req, res) => {
    const {
        latitude,
        longitude,
        status,                  // User-Worker-Admin
        severity,                 // Worker-Admin
        reporter,                // Admin
        page = 1,
        limit = 10,
    } = req.query;

    const match = {};

    // Both admin and user can filter by status and severity
    if (status) match.status = status;
    if (severity) match.severity = severity;

    if (req.user.role === 'admin') {
        // Admin can filter by all parameters
            match.reporter = reporter;
        }
    
    if(!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude are required");
    }

    match.location = {
      $geoWithin: {
        $centerSphere: [
          [parseFloat(longitude), parseFloat(latitude)],
          10 / 6378.1 // Earth's radius in km
        ]
      }
    };

    // Build aggregation pipeline
    const pipeline = [
        { $match: match },
        {
            $lookup: {
                from: 'users',
                localField: 'reporter',
                foreignField: '_id',
                as: 'reporterDetails'
            }
        },
        { $unwind: '$reporterDetails' },
        {
            $project: {
                description: 1,
                status: 1,
                severity: 1,
                location: 1,
                images: 1,
                createdAt: 1,
                updatedAt: 1,
                reporter: '$reporterDetails.username',
            }
        }
    ];

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const result = await Report.aggregatePaginate(Report.aggregate(pipeline), options);

    if(!result) {
        throw new ApiError(500, "Failed to fetched data");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "All reports fetched successfully")
    );

})

export {
    healthCheck,
    createReport,
    getAllReports
}