import { DeleteUserService } from "../../../../../application/services/user/DeleteUserService";
import { AppDataSource } from "../../../../../infra/data-source";

jest.mock("../../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("DeleteUserService", () => {
  let deleteUserService: DeleteUserService;
  let mockRepository: any;

  beforeEach(() => {
    deleteUserService = new DeleteUserService();
    mockRepository = {
      findOne: jest.fn(),
      softDelete: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if user not found", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      deleteUserService.execute({ id: "non-existing-id" })
    ).rejects.toThrow("ID do Usuário não encontrado");
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: "non-existing-id" },
      withDeleted: true,
    });
  });

  it("should throw an error if user is already deleted", async () => {
    const mockUser = { id: "1", deletedAt: new Date() };
    mockRepository.findOne.mockResolvedValue(mockUser);

    await expect(deleteUserService.execute({ id: "1" })).rejects.toThrow(
      "Usuário já foi excluído"
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: "1" },
      withDeleted: true,
    });
  });

  it("should successfully delete the user", async () => {
    const mockUser = { id: "1", deletedAt: null };
    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await deleteUserService.execute({ id: "1" });

    expect(result).toEqual({ message: "Usuário excluído com sucesso!" });
    expect(mockRepository.softDelete).toHaveBeenCalledWith("1");
  });
});
