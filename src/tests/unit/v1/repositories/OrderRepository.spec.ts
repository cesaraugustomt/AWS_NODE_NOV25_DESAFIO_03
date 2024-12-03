import {
  DataSource,
  Repository,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { OrderRepository } from "./../../../../domain/repositories/OrderRepository";
import { Order } from "./../../../../domain/entities/Order";

// Mock do TypeORM
jest.mock("typeorm", () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    getRepository: jest.fn(),
  })),
  Repository: jest.fn(),
  PrimaryGeneratedColumn: jest.fn().mockReturnValue(() => {}),
  CreateDateColumn: jest.fn().mockReturnValue(() => {}),
  DeleteDateColumn: jest.fn().mockReturnValue(() => {}),
  Column: jest.fn().mockReturnValue(() => {}),
  Entity: jest.fn().mockReturnValue(() => {}),
  ManyToOne: jest.fn().mockReturnValue(() => {}),
  OneToMany: jest.fn().mockReturnValue(() => {}),
  JoinColumn: jest.fn().mockReturnValue(() => {}),
}));

describe("OrderRepository", () => {
  let orderRepository: OrderRepository;
  let repositoryMock: jest.Mocked<Repository<Order>>;
  const mockDataSource = { getRepository: jest.fn() };

  beforeEach(() => {
    repositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      getCount: jest.fn(),
    } as unknown as jest.Mocked<Repository<Order>>;

    mockDataSource.getRepository.mockReturnValue(repositoryMock);
    orderRepository = new OrderRepository(
      mockDataSource as unknown as DataSource
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should find an order by id", async () => {
      const mockOrder = new Order();
      mockOrder.id = "1";
      repositoryMock.findOne.mockResolvedValue(mockOrder);

      const result = await orderRepository.findById("1");
      expect(result).toEqual(mockOrder);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["client", "car", "car.items"],
      });
    });

    it("should return null if no order is found", async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      const result = await orderRepository.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("findByClientId", () => {
    it("should find orders by clientId", async () => {
      const mockClient = {
        id: "1",
        name: "User One",
        birthday: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "userone@example.com",
        phone: "9876543210",
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      };

      const mockOrder = new Order();
      mockOrder.client = mockClient;
      repositoryMock.find.mockResolvedValue([mockOrder]);

      const result = await orderRepository.findByClientId("1");
      expect(result).toEqual([mockOrder]);
      expect(repositoryMock.find).toHaveBeenCalledWith({
        where: { client: { id: "1" } },
        relations: ["client", "car"],
      });
    });
  });
});
