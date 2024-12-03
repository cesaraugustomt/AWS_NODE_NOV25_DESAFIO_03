import { Repository } from "typeorm";
import { SelectUserByIdService } from "../../../../../application/services/user/SelectUserByIdService";
import User from "../../../../../domain/entities/User";
import { AppDataSource } from "../../../../../infra/data-source";

jest.mock("../../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("SelectUserByIdService", () => {
  let selectUserByIdService: SelectUserByIdService;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository
    );

    selectUserByIdService = new SelectUserByIdService();
  });

  it("should return a user when found by ID", async () => {
    const userId = "123";
    const mockUser: User = {
      id: userId,
      full_name: "John Doe",
      email: "johndoe@example.com",
      password: "hashedpassword",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const result = await selectUserByIdService.execute({ id: userId });

    expect(result).toBe(mockUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
      withDeleted: true,
    });
  });

  it("should throw an error when user is not found", async () => {
    const userId = "123";

    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(selectUserByIdService.execute({ id: userId })).rejects.toThrow(
      "Usuário não encontrado"
    );
  });
});
