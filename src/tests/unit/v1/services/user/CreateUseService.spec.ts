import { CreateUserService } from "../../../../../application/services/user/CreateUseService";
import { usersRepository } from "../../../../../domain/repositories/UserRepository";
import { hash } from "bcryptjs";

jest.mock("../../../../../domain/repositories/UserRepository", () => ({
  usersRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("CreateUserService", () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    createUserService = new CreateUserService();
  });

  it("should throw an error if email is missing", async () => {
    await expect(
      createUserService.execute({
        full_name: "John Doe",
        email: "",
        password: "password123",
      })
    ).rejects.toThrow("Campo vazio: email");
  });

  it("should throw an error if email is invalid", async () => {
    await expect(
      createUserService.execute({
        full_name: "John Doe",
        email: "invalidEmail",
        password: "password123",
      })
    ).rejects.toThrow("E-mail inválido.");
  });

  it("should throw an error if full_name is missing", async () => {
    await expect(
      createUserService.execute({
        full_name: "",
        email: "user@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Campo vazio: nome completo");
  });

  it("should throw an error if password is missing", async () => {
    await expect(
      createUserService.execute({
        full_name: "John Doe",
        email: "user@example.com",
        password: "",
      })
    ).rejects.toThrow("Campo vazio: senha");
  });

  it("should throw an error if user already exists", async () => {
    const mockExistingUser = {
      email: "user@example.com",
      full_name: "John Doe",
      password: "hashedPassword",
    };

    (usersRepository.findOne as jest.Mock).mockResolvedValue(mockExistingUser);

    await expect(
      createUserService.execute({
        full_name: "John Doe",
        email: "user@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Usuário já existe");
  });

  it("should create a new user if all fields are valid", async () => {
    const mockNewUser = {
      full_name: "John Doe",
      email: "user@example.com",
      password: "hashedPassword",
      createdAt: new Date(),
      deletedAt: null,
    };

    (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue("hashedPassword");
    (usersRepository.create as jest.Mock).mockReturnValue(mockNewUser);
    (usersRepository.save as jest.Mock).mockResolvedValue(mockNewUser);

    const result = await createUserService.execute({
      full_name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      full_name: "John Doe",
      email: "user@example.com",
      createdAt: mockNewUser.createdAt,
      deletedAt: mockNewUser.deletedAt,
    });
    expect(hash).toHaveBeenCalledWith("password123", 8);
    expect(usersRepository.save).toHaveBeenCalledWith(mockNewUser);
  });
});
