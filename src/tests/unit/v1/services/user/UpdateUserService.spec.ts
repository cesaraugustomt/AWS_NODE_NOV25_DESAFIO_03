import { UpdateUserService } from "../../../../../application/services/user/UpdateUserService";
import { AppDataSource } from "../../../../../infra/data-source";
import { hash, compare } from "bcryptjs";

jest.mock("../../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("UpdateUserService", () => {
  let updateUserService: UpdateUserService;
  let mockUserRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<any>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository
    );

    updateUserService = new UpdateUserService();
  });

  it("should throw an error if ID is not provided", async () => {
    await expect(
      updateUserService.execute({
        id: "",
        full_name: "User One",
        email: "userone@example.com",
        password: "currentPassword",
        newPassword: "newPassword123",
      })
    ).rejects.toThrow("ID não preenchido");
  });

  it("should throw an error if password is not provided", async () => {
    await expect(
      updateUserService.execute({
        id: "123",
        full_name: "User One",
        email: "userone@example.com",
        password: "",
        newPassword: "newPassword123",
      })
    ).rejects.toThrow("Senha atual não preenchida");
  });

  it("should throw an error if user does not exist", async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      updateUserService.execute({
        id: "123",
        full_name: "User One",
        email: "userone@example.com",
        password: "currentPassword",
        newPassword: "newPassword123",
      })
    ).rejects.toThrow("Usuário não existe");
  });

  it("should throw an error if email is already in use", async () => {
    mockUserRepository.findOne
      .mockResolvedValueOnce({
        id: "123",
        email: "current@example.com",
        password: "hashedPassword",
        deletedAt: null,
      })
      .mockResolvedValueOnce({
        id: "456",
        email: "new@example.com",
        deletedAt: null,
      });

    (compare as jest.Mock).mockResolvedValueOnce(true);

    await expect(
      updateUserService.execute({
        id: "123",
        full_name: "user",
        email: "new@example.com",
        password: "currentPassword",
        newPassword: "newPassword123",
      })
    ).rejects.toThrow("Email já está em uso");
  });

  it("should throw an error if the user is deleted", async () => {
    const deletedUser = {
      id: "123",
      email: "user@example.com",
      password: "hashedPassword",
      deletedAt: new Date(),
    };

    mockUserRepository.findOne.mockResolvedValue(deletedUser);

    await expect(
      updateUserService.execute({
        id: "123",
        full_name: "User One",
        email: "userone@example.com",
        password: "currentPassword",
        newPassword: "newPassword123",
      })
    ).rejects.toThrow("Não é possível atualizar um usuário excluído");
  });

  it("should throw an error if current password is incorrect", async () => {
    mockUserRepository.findOne.mockResolvedValueOnce({
      id: "123",
      email: "current@example.com",
      password: "hashedPassword",
      deletedAt: null,
    });

    (compare as jest.Mock).mockResolvedValueOnce(false);

    await expect(
      updateUserService.execute({
        id: "123",
        full_name: "user",
        email: "current@example.com",
        password: "wrongPassword",
        newPassword: "newPassword123",
      })
    ).rejects.toThrow("Senha atual incorreta");
  });

  it("should successfully update user details", async () => {
    mockUserRepository.findOne
      .mockResolvedValueOnce({
        id: "123",
        email: "current@example.com",
        password: "hashedPassword",
        deletedAt: null, // Simula usuário ativo
      })
      .mockResolvedValueOnce(null);

    (compare as jest.Mock).mockResolvedValueOnce(true);

    const response = await updateUserService.execute({
      id: "123",
      full_name: "New Name",
      email: "new@example.com",
      password: "currentPassword",
      newPassword: "newPassword123",
    });

    expect(response).toEqual({
      message: "Registro atualizado com sucesso",
    });
  });
});
