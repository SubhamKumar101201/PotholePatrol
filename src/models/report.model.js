import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reportSchema = new Schema({

    images: {
        type: [
            {
                publicId: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
        required: true
    },
    repairedImage: {
        type: {
            publicId: String,
            url: String
        }
    },
    location: {
        type: [
            {
                latitude: {
                    type: String,
                    required: true,
                    trim: true
                },
                longitude: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        lowercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "assigned", "repaired"],
        default: "pending",
        lowercase: true,
        required: true,
        trim: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId, // 👷 The worker to whom the pothole is assigned
        ref: "User"
    },
    assignedBy: {
        type: Schema.Types.ObjectId, // 🛠️ The admin who assigned the pothole
        ref: "User"
    },
    description: {
        type: String,
        lowercase: true,
        required: true,
        trim: true
    },
    reporter: {
        type: Schema.Types.ObjectId, // The one who report the pothole
        ref: "User",
        required: true
    }

}, {

    timestamps: true

});

function arrayLimit(val) {
    return val.length <= 5;
}

reportSchema.plugin(mongooseAggregatePaginate);

export const Report = mongoose.model("Report", reportSchema);