import { User } from "../../models/UserSchema.mjs";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateUserAvatar,
} from "../../controllers/userController.mjs";

// Mock response and request objects
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user,
  file: null,
});

describe("User Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return all users without passwords", async () => {
      const mockUsers = [
        {
          _id: "user1",
          name: "John Doe",
          email: "john@example.com",
          isAdmin: false,
        },
        {
          _id: "user2",
          name: "Jane Smith",
          email: "jane@example.com",
          isAdmin: true,
        },
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUsers),
      };
      jest.spyOn(User, "find").mockReturnValue(mockQuery);

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith("-password");
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      const mockQuery = {
        select: jest.fn().mockRejectedValue(error),
      };
      jest.spyOn(User, "find").mockReturnValue(mockQuery);

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch users",
      });
    });
  });

  describe("getUserById", () => {
    it("should return user by id without password", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
      };

      req.params = { id: "user123" };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockQuery.select).toHaveBeenCalledWith("-password");
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "nonexistent" };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "user123" };

      const error = new Error("Database error");
      const mockQuery = {
        select: jest.fn().mockRejectedValue(error),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch user",
      });
    });
  });

  describe("getProfile", () => {
    it("should return current user profile", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false,
      };

      req.user = { id: "user123" };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockQuery.select).toHaveBeenCalledWith("-password");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it("should return 404 if user not found", async () => {
      req.user = { id: "nonexistent" };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should handle database errors", async () => {
      req.user = { id: "user123" };

      const error = new Error("Database error");
      const mockQuery = {
        select: jest.fn().mockRejectedValue(error),
      };
      jest.spyOn(User, "findById").mockReturnValue(mockQuery);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get profile",
        error: error.message,
      });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      req.params = { id: "user123" };
      req.body = updateData;

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findById").mockResolvedValue(mockUser);

      await updateUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.name).toBe(updateData.name);
      expect(mockUser.email).toBe(updateData.email);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "nonexistent" };
      req.body = { name: "Updated Name" };

      jest.spyOn(User, "findById").mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "user123" };
      req.body = { name: "Updated Name" };

      const error = new Error("Database error");
      jest.spyOn(User, "findById").mockRejectedValue(error);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to update user",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      req.params = { id: "user123" };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
      };

      jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(mockUser);

      await deleteUser(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith("user123");
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "nonexistent" };

      jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "user123" };

      const error = new Error("Database error");
      jest.spyOn(User, "findByIdAndDelete").mockRejectedValue(error);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to delete user",
      });
    });
  });

  describe("updateUserAvatar", () => {
    it("should update user avatar successfully", async () => {
      req.params = { id: "user123" };
      req.file = {
        filename: "avatar.jpg",
        path: "/uploads/avatars/avatar.jpg",
      };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        avatar: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findById").mockResolvedValue(mockUser);

      await updateUserAvatar(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.avatar).toContain("avatar.jpg");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Avatar updated successfully",
        data: {
          avatar: mockUser.avatar,
        },
      });
    });

    it("should return error if no file uploaded", async () => {
      req.params = { id: "user123" };
      req.file = null; // No file

      await updateUserAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No image file uploaded",
      });
    });

    it("should return 404 if user not found", async () => {
      req.params = { id: "nonexistent" };
      req.file = { filename: "avatar.jpg" };

      jest.spyOn(User, "findById").mockResolvedValue(null);

      await updateUserAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });
  });
});
