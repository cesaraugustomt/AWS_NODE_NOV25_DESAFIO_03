import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AuthService } from "../../../../../application/services/auth/LoginService";
import { AppDataSource } from "../../../../../infra/data-source";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it("should throw an error if email format is invalid", async () => {
    const invalidEmail = "invalidEmail";

    await expect(
      authService.execute({ email: invalidEmail, password: "password123" })
    ).rejects.toThrow("E-mail inválido.");
  });

  it("should throw an error if user is not found", async () => {
    const mockRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    await expect(
      authService.execute({
        email: "user@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Email inválido ou usuário não encontrado.");
  });

  it("should throw an error if password does not match", async () => {
    const mockUser = { email: "user@example.com", password: "hashedPassword" };

    const mockRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.execute({
        email: "user@example.com",
        password: "wrongPassword",
      })
    ).rejects.toThrow("Senha incorreta");
  });

  it("should return a token and success message if credentials are valid", async () => {
    const mockUser = {
      id: 1,
      email: "user@example.com",
      password: "hashedPassword",
    };

    const mockRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    (compare as jest.Mock).mockResolvedValue(true);
    (sign as jest.Mock).mockReturnValue("mockToken");

    const result = await authService.execute({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      token: "mockToken",
      message: "Login realizado com sucesso!",
    });
  });
});
