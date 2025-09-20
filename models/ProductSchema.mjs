import mongoose from "mongoose";

// Define the schema
const productSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

// // Check if the model already exists before defining it
export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
