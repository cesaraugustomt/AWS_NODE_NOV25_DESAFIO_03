import { Request, Response } from "express";
import { CreateOrderService } from "../../../../application/services/order/CreateOrderService";
const OrderController = require("../../../../http/controller/OrderController");

jest.mock("../../../../application/services/order/CreateOrderService");

describe("OrderController", () => {
  describe("create", () => {
    const mockOrder = {
      id: "1",
      carId: "456",
      clientId: "123",
      status: "Aberto",
      cep: "12345-678",
      city: "City Name",
      state: "SP",
      totalValue: 50000.0,
      initialDate: new Date(),
      finalDate: null,
      cancellationDate: null,
      car: {
        id: "456",
        brand: "Toyota",
        model: "Corolla",
        plate: "ABC-1234",
        km: 12000,
        year: 2020,
        price: 50000.0,
        status: "ativo",
        items: [],
        orders: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      client: {
        id: "123",
        name: "John Doe",
        cpf: "123.456.789-00",
        email: "johndoe@example.com",
        phone: "1234567890",
        birthday: new Date("1990-01-01"),
        deletedAt: null,
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    it("should create an order and return the order data", async () => {
      const createOrderServiceMock = CreateOrderService as jest.MockedClass<
        typeof CreateOrderService
      >;

      createOrderServiceMock.prototype.execute.mockResolvedValue(mockOrder);

      const mockRequest = {
        body: {
          clientId: "123",
          carId: "456",
        },
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await OrderController.create(mockRequest, mockResponse);

      expect(createOrderServiceMock.prototype.execute).toHaveBeenCalledWith({
        clientId: "123",
        carId: "456",
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
    });

    it("should return an error if order creation fails", async () => {
      const createOrderServiceMock = CreateOrderService as jest.MockedClass<
        typeof CreateOrderService
      >;

      createOrderServiceMock.prototype.execute.mockRejectedValue(
        new Error("Failed to create order")
      );

      const mockRequest = {
        body: {
          clientId: "123",
          carId: "456",
        },
      } as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await OrderController.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to create order",
      });
    });
  });
});
