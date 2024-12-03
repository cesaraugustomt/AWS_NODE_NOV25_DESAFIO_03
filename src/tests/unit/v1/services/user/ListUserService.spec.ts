import { ListUserService } from "../../../../../application/services/user/ListUserService";
import { AppDataSource } from "../../../../../infra/data-source";
import { ListUserParams } from "../../../../../application/params/ListUserParams.type";

jest.mock("../../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("ListUserService", () => {
  let listUserService: ListUserService;
  let mockRepository: any;

  beforeEach(() => {
    listUserService = new ListUserService();
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a paginated list of users", async () => {
    const mockUsers = [
      { id: "1", full_name: "User One", email: "user1@example.com" },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params = { page: 1, pageSize: 10 };
    const result = await listUserService.execute(params);

    expect(result).toEqual({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    expect(mockRepository.getManyAndCount).toHaveBeenCalledTimes(1);
  });

  it("should filter users by name", async () => {
    const mockUsers = [
      { id: "1", full_name: "User One", email: "user1@example.com" },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params = { name: "User One", page: 1, pageSize: 10 };
    const result = await listUserService.execute(params);

    expect(mockRepository.andWhere).toHaveBeenCalledWith(
      "user.full_name LIKE :name",
      { name: "%User One%" }
    );
    expect(result.users).toEqual(mockUsers);
  });

  it("should filter users by email", async () => {
    const mockUsers = [
      { id: "1", full_name: "User One", email: "user1@example.com" },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params = { email: "user1@example.com", page: 1, pageSize: 10 };
    const result = await listUserService.execute(params);

    expect(mockRepository.andWhere).toHaveBeenCalledWith(
      "user.email LIKE :email",
      { email: "%user1@example.com%" }
    );
    expect(result.users).toEqual(mockUsers);
  });

  it("should filter users by deleted status", async () => {
    const mockUsers = [
      {
        id: "1",
        full_name: "User One",
        email: "user1@example.com",
        deletedAt: new Date(),
      },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params = { isDeleted: true, page: 1, pageSize: 10 };
    const result = await listUserService.execute(params);

    expect(mockRepository.andWhere).toHaveBeenCalledWith(
      "user.deletedAt IS NOT NULL"
    );
    expect(result.users).toEqual(mockUsers);
  });

  it("should filter users by not deleted status", async () => {
    const mockUsers = [
      {
        id: "1",
        full_name: "User One",
        email: "user1@example.com",
        deletedAt: null,
      },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params = { isDeleted: false, page: 1, pageSize: 10 };
    const result = await listUserService.execute(params);

    expect(mockRepository.andWhere).toHaveBeenCalledWith(
      "user.deletedAt IS NULL"
    );
    expect(result.users).toEqual(mockUsers);
  });

  it("should apply sorting based on orderBy and orderDirection", async () => {
    const mockUsers = [
      { id: "1", full_name: "User One", email: "user1@example.com" },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params: ListUserParams = {
      orderBy: "full_name",
      orderDirection: "ASC",
      page: 1,
      pageSize: 10,
    };

    await listUserService.execute(params);

    expect(mockRepository.addOrderBy).toHaveBeenCalledWith(
      "user.full_name",
      "ASC"
    );
  });

  it("should sanitize the password before returning users", async () => {
    const mockUsers = [
      {
        id: "1",
        full_name: "User One",
        email: "user1@example.com",
        password: "hashedPassword",
      },
    ];
    mockRepository.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const params = { page: 1, pageSize: 10 };
    const result = await listUserService.execute(params);

    expect(result.users[0]).not.toHaveProperty("password");
  });
});
