import { FindOrderService } from "./../../../../../application/services/order/FindOrderService";
import { OrderRepository } from "./../../../../../domain/repositories/OrderRepository";
import { Order } from "./../../../../../domain/entities/Order";
import { Car } from "./../../../../../domain/entities/Car";

describe("FindOrderService", () => {
  let findOrderService: FindOrderService;
  let orderRepositoryMock: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    orderRepositoryMock = {
      findById: jest.fn(),
    } as any;

    findOrderService = new FindOrderService(orderRepositoryMock);
  });

  it("should throw an error if order does not exist", async () => {
    const orderId = "non-existent-id";
    orderRepositoryMock.findById.mockResolvedValue(null);

    await expect(findOrderService.findOrderById(orderId)).rejects.toThrow(
      "Pedido nao encontrado"
    );
  });

  it("should return the order when it exists", async () => {
    const orderId = "101";
    const mockOrder: Order = {
      id: "101",
      status: "Aberto",
      cancellationDate: null,
      car: {} as Car,
      client: {} as any,
      cep: null,
      city: null,
      state: null,
      totalValue: 31000,
      initialDate: new Date(),
      finalDate: null,
    };
    orderRepositoryMock.findById.mockResolvedValue(mockOrder);

    const result = await findOrderService.findOrderById(orderId);

    expect(result).toBe(mockOrder);
    expect(orderRepositoryMock.findById).toHaveBeenCalledWith(orderId);
  });
});
