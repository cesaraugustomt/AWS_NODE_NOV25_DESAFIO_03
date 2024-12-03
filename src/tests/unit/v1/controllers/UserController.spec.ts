import { Request, Response } from "express";
import { CreateUserService } from "../../../../application/services/user/CreateUseService";
const UserController = require("../../../../http/controller/UserController");

jest.mock("../../../../application/services/user/CreateUseService");

describe("UserController", () => {
  describe("create", () => {
    it("should create a user and return the user data", async () => {
      const mockUser = {
        id: "1",
        full_name: "John Doe",
        email: "john.doe@example.com",
        password: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const createUserServiceMock = CreateUserService as jest.MockedClass<
        typeof CreateUserService
      >;
      createUserServiceMock.prototype.execute.mockResolvedValue(mockUser);

      const mockRequest = {
        body: {
          full_name: "John Doe",
          email: "john.doe@example.com",
          password: "password123",
        },
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.create(mockRequest, mockResponse);

      expect(createUserServiceMock.prototype.execute).toHaveBeenCalledWith({
        full_name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return an error if user creation fails", async () => {
      const createUserServiceMock = CreateUserService as jest.MockedClass<
        typeof CreateUserService
      >;
      createUserServiceMock.prototype.execute.mockRejectedValue(
        new Error("Failed to create user")
      );

      const mockRequest = {
        body: {
          full_name: "John Doe",
          email: "john.doe@example.com",
          password: "password123",
        },
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await UserController.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to create user",
      });
    });
  });
});
