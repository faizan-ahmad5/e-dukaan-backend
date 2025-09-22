import { Product } from "../../models/ProductSchema.mjs";
import {
  createProduct,
  getProducts,
  getProductById, // Fixed import name
  updateProduct,
  deleteProduct,
} from "../../controllers/productController.mjs";

// Mock response and request objects
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
});

describe("Product Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create a new product successfully", async () => {
      const productData = {
        title: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: "Electronics",
        brand: "Test Brand",
        image: "test-image.jpg",
        inventory: { inStock: true, quantity: 10 },
      };

      req.body = productData;

      const mockProduct = {
        _id: "product123",
        ...productData,
        save: jest.fn().mockResolvedValue({
          _id: "product123",
          ...productData,
        }),
      };

      jest.spyOn(Product.prototype, "save").mockResolvedValue(mockProduct);

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product created successfully",
          data: expect.objectContaining({
            title: productData.title,
            price: productData.price,
          }),
        })
      );
    });

    it("should handle missing required fields", async () => {
      req.body = {
        // Missing required fields like title, price, etc.
        description: "Test Description",
      };

      const error = new Error("Validation error");
      jest.spyOn(Product.prototype, "save").mockRejectedValue(error);

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to create product",
        })
      );
    });

    it("should handle image array and single image", async () => {
      const productData = {
        title: "Test Product",
        price: 99.99,
        image: "main-image.jpg",
        images: ["image1.jpg", "image2.jpg"],
        category: "Electronics",
        brand: "Test Brand",
      };

      req.body = productData;

      const mockProduct = {
        _id: "product123",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Product.prototype, "save").mockResolvedValue(mockProduct);

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getProducts", () => {
    it("should return paginated products", async () => {
      req.query = { page: "1", limit: "10" };

      const mockProducts = [
        { _id: "product1", title: "Product 1", price: 10.99 },
        { _id: "product2", title: "Product 2", price: 20.99 },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockProducts),
      };

      jest.spyOn(Product, "find").mockReturnValue(mockQuery);
      jest.spyOn(Product, "countDocuments").mockResolvedValue(20);

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(Product.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProducts,
          pagination: expect.objectContaining({
            currentPage: 1,
            totalPages: 2,
            totalItems: 20,
          }),
        })
      );
    });

    it("should handle search queries", async () => {
      req.query = { search: "laptop", category: "Electronics" };

      const mockProducts = [
        { _id: "product1", title: "Gaming Laptop", category: "Electronics" },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockProducts),
      };

      jest.spyOn(Product, "find").mockReturnValue(mockQuery);
      jest.spyOn(Product, "countDocuments").mockResolvedValue(1);

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          category: "Electronics",
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProducts,
        })
      );
    });

    it("should handle price range filters", async () => {
      req.query = { minPrice: "10", maxPrice: "50" };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(Product, "find").mockReturnValue(mockQuery);
      jest.spyOn(Product, "countDocuments").mockResolvedValue(0);

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          price: { $gte: 10, $lte: 50 },
        })
      );
    });

    it("should handle database errors", async () => {
      req.query = {};

      const error = new Error("Database error");
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(error),
      };

      jest.spyOn(Product, "find").mockReturnValue(mockQuery);

      await getProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to fetch products",
        })
      );
    });
  });

  describe("getProductById", () => {
    it("should return single product by id", async () => {
      const productId = "507f1f77bcf86cd799439011";
      req.params = { id: productId };

      const mockProduct = {
        _id: productId,
        title: "Test Product",
        price: 99.99,
        rating: 4.5,
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockProduct),
      };
      jest.spyOn(Product, "findById").mockReturnValue(mockQuery);

      await getProductById(req, res);

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProduct,
        })
      );
    });

    it("should return 404 for invalid ObjectId", async () => {
      req.params = { id: "invalid-id" };

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid product ID format",
        })
      );
    });

    it("should return 404 for non-existent product", async () => {
      const productId = "507f1f77bcf86cd799439011";
      req.params = { id: productId };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(Product, "findById").mockReturnValue(mockQuery);

      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Product not found",
        })
      );
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const productId = "507f1f77bcf86cd799439011";
      const updateData = {
        title: "Updated Product",
        price: 149.99,
      };

      req.params = { id: productId };
      req.body = updateData;

      const updatedProduct = {
        _id: productId,
        ...updateData,
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(updatedProduct),
      };
      jest.spyOn(Product, "findByIdAndUpdate").mockReturnValue(mockQuery);

      await updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateData,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        })
      );
    });

    it("should return error for invalid ObjectId", async () => {
      req.params = { id: "invalid-id" };
      req.body = { title: "Updated Product" };

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid product ID format",
        })
      );
    });

    it("should return 404 for non-existent product", async () => {
      const productId = "507f1f77bcf86cd799439011";
      req.params = { id: productId };
      req.body = { title: "Updated Product" };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(Product, "findByIdAndUpdate").mockReturnValue(mockQuery);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Product not found",
        })
      );
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const productId = "507f1f77bcf86cd799439011";
      req.params = { id: productId };

      const deletedProduct = {
        _id: productId,
        title: "Deleted Product",
      };

      jest
        .spyOn(Product, "findByIdAndDelete")
        .mockResolvedValue(deletedProduct);

      await deleteProduct(req, res);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(productId);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product deleted successfully",
        })
      );
    });

    it("should return error for invalid ObjectId", async () => {
      req.params = { id: "invalid-id" };

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid product ID format",
        })
      );
    });

    it("should return 404 for non-existent product", async () => {
      const productId = "507f1f77bcf86cd799439011";
      req.params = { id: productId };

      jest.spyOn(Product, "findByIdAndDelete").mockResolvedValue(null);

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Product not found",
        })
      );
    });
  });
});
