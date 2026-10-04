import mongoose, { Schema } from "mongoose";

const newsEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, enum: ["News", "Event", "Achievement"], required: true },
    date: { type: Date, required: true },
    image: { type: String },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

newsEventSchema.method("toJSON", function () {
  const { _id, __v, ...document } = this.toObject();
  return { ...document, id: _id };
});

export const NewsEvent = mongoose.model("NewsEvent", newsEventSchema);
