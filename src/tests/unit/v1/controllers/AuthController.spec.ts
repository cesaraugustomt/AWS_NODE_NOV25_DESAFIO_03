import { Request, Response } from "express";
import { AuthService } from "./../../../../application/services/auth/LoginService";
const AuthController = require("../../../../http/controller/AuthController");

jest.mock("../../../../application/services/auth/LoginService");

describe("AuthController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return a token when authentication is successful", async () => {
    const mockToken = { token: "validToken" };
    (AuthService.prototype.execute as jest.Mock).mockResolvedValue(mockToken);

    req.body = {
      email: "user@example.com",
      password: "password123",
    };

    await AuthController.create(req as Request, res as Response);

    expect(AuthService.prototype.execute).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(res.json).toHaveBeenCalledWith(mockToken);
  });

  it("should return a 400 error if authentication fails", async () => {
    const mockError = new Error("Invalid credentials");
    (AuthService.prototype.execute as jest.Mock).mockRejectedValue(mockError);

    req.body = {
      email: "user@example.com",
      password: "wrongPassword",
    };

    await AuthController.create(req as Request, res as Response);

    expect(AuthService.prototype.execute).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "wrongPassword",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  it("should return a 400 error if an unexpected error occurs", async () => {
    (AuthService.prototype.execute as jest.Mock).mockRejectedValue(null);

    req.body = {
      email: "user@example.com",
      password: "password123",
    };

    await AuthController.create(req as Request, res as Response);

    expect(AuthService.prototype.execute).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Um erro inesperado aconteceu.",
    });
  });
});
