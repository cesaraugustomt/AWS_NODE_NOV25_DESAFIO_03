import { DataSource } from "typeorm";
import { CreateOrderService } from "../../../../../application/services/order/CreateOrderService";
import { OrderRepository } from "../../../../../domain/repositories/OrderRepository";
import ClientsRepository from "../../../../../domain/repositories/ClientsRepository";
import { CarsRepository } from "../../../../../domain/repositories/CarsRepository";
import { CreateOrderDTO } from "../../../../../http/dtos/CreateOrder.dto";
import { Client } from "../../../../../domain/entities/Client";
import { Car } from "../../../../../domain/entities/Car";
import { Order } from "../../../../../domain/entities/Order";

jest.mock("../../../../../domain/repositories/OrderRepository");
jest.mock("../../../../../domain/repositories/ClientsRepository");
jest.mock("../../../../../domain/repositories/CarsRepository");

describe("CreateOrderService", () => {
  let createOrderService: CreateOrderService;
  let orderRepositoryMock: jest.Mocked<OrderRepository>;
  let clientRepositoryMock: jest.Mocked<ClientsRepository>;
  let carRepositoryMock: jest.Mocked<CarsRepository>;
  const mockDataSource = {} as DataSource;

  beforeEach(() => {
    orderRepositoryMock = new OrderRepository(
      mockDataSource
    ) as jest.Mocked<OrderRepository>;
    clientRepositoryMock = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      index: jest.fn(),
    } as unknown as jest.Mocked<ClientsRepository>;

    carRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CarsRepository>;

    createOrderService = new CreateOrderService(
      orderRepositoryMock,
      clientRepositoryMock,
      carRepositoryMock
    );
  });

  it("should create an order successfully", async () => {
    const createOrderDTO: CreateOrderDTO = {
      clientId: "1",
      carId: "101",
    };

    const mockClient: Client = {
      id: "1",
      name: "John Doe",
      cpf: "12345678901",
      email: "johndoe@example.com",
      phone: "987654321",
      birthday: new Date("1980-01-01"),
      createdAt: new Date(),
      deletedAt: null,
      orders: [],
    };

    const mockCar: Car = {
      id: "101",
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      status: "ativo",
      km: 15000,
      createdAt: new Date(),
      deletedAt: null,
      items: [],
      orders: [],
    };

    const mockOrder: Order = {
      id: "5001",
      client: mockClient,
      car: mockCar,
      status: "Aberto",
      totalValue: 30000,
      initialDate: new Date(),
      finalDate: null,
      cancellationDate: null,
      cep: null,
      city: null,
      state: null,
    };

    clientRepositoryMock.findById.mockResolvedValue(mockClient);
    carRepositoryMock.findById.mockResolvedValue(mockCar);
    orderRepositoryMock.findOpenOrderByClientId.mockResolvedValue(null);
    carRepositoryMock.save.mockResolvedValue({
      ...mockCar,
      status: "inativo",
    });
    orderRepositoryMock.createOrder.mockResolvedValue(mockOrder);

    const result = await createOrderService.execute(createOrderDTO);

    expect(clientRepositoryMock.findById).toHaveBeenCalledWith("1");
    expect(carRepositoryMock.findById).toHaveBeenCalledWith("101");
    expect(orderRepositoryMock.findOpenOrderByClientId).toHaveBeenCalledWith(
      "1"
    );
    expect(carRepositoryMock.save).toHaveBeenCalledWith({
      ...mockCar,
      status: "inativo",
    });
    expect(orderRepositoryMock.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        client: mockClient,
        car: mockCar,
        status: "Aberto",
        totalValue: 30000,
        initialDate: expect.any(Date),
      })
    );

    expect(result).toEqual(mockOrder);
  });
});
