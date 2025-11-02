const mongoose = require("mongoose");
const shortid = require("shortid");

const noteItemSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserStudyPad",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    link: {
      url: String,
      label: String,
    },
    parentId: {
      type: String,
      default: null,
      index: true,
    },
    children: [
      {
        type: String,
        ref: "NoteItem",
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    urgency: {
      type: Number,
      enum: [1, 2, 3],
      default: 3,
      index: true,
    },
  },
  {
    timestamps: true,
  },
  {
    collection: "studyPadUsers",
  }
);

// Index for efficient querying by user and parent
noteItemSchema.index({ userId: 1, parentId: 1 });

// Virtual for nested children population
noteItemSchema.virtual("childItems", {
  ref: "NoteItem",
  localField: "_id",
  foreignField: "parentId",
});

// Ensure virtuals are included in JSON
noteItemSchema.set("toJSON", { virtuals: true });
noteItemSchema.set("toObject", { virtuals: true });

const NoteItem = mongoose.model("NoteItem", noteItemSchema);

module.exports = NoteItem;
