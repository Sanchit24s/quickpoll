const { Schema, model, Types } = require("mongoose");

const optionSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        votes: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

const pollSchema = new Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        options: {
            type: [optionSchema],
            required: true,
            validate: {
                validator: function (options) {
                    return options.length >= 2 && options.length <= 6;
                },
                message: "A poll must have between 2 and 6 options",
            },
        },
        duration: {
            type: Number,
            required: true,
            min: 60000, // 1 minute
            max: 2592000000, // 30 days
        },
        createdBy: {
            type: Types.ObjectId,
            required: true,
            ref: "User",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        totalVotes: {
            type: Number,
            default: 0,
            min: 0,
        },
        shareableId: {
            type: String,
            unique: true,
            required: true,
        },
        creatorIp: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
pollSchema.index({ endTime: 1 });
pollSchema.index({ isActive: 1 });

// to check if poll has expired
pollSchema.virtual("isExpired").get(function () {
    return new Date() > this.endTime;
});

// Set endTime only for new polls
pollSchema.pre("save", function (next) {
    if (this.isNew && !this.endTime) {
        this.endTime = new Date(Date.now() + this.duration);
    }
    next();
});

// to deactivate poll if expired
pollSchema.methods.checkAndDeactivate = async function () {
    if (this.isExpired && this.isActive) {
        this.isActive = false;
        await this.save();
    }
    return this;
};

const pollModel = model("Poll", pollSchema);
module.exports = pollModel;
