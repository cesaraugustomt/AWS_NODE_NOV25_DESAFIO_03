import { DeleteOrderService } from "./../../../../../application/services/order/DeleteOrderService";
import { OrderRepository } from "./../../../../../domain/repositories/OrderRepository";
import { CarsRepository } from "./../../../../../domain/repositories/CarsRepository";
import { Order } from "./../../../../../domain/entities/Order";
import { Car } from "./../../../../../domain/entities/Car";

describe("DeleteOrderService", () => {
  let deleteOrderService: DeleteOrderService;
  let orderRepositoryMock: jest.Mocked<OrderRepository>;
  let carRepositoryMock: jest.Mocked<CarsRepository>;

  beforeEach(() => {
    orderRepositoryMock = {
      findById: jest.fn(),
      createOrder: jest.fn(),
    } as any;

    carRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    deleteOrderService = new DeleteOrderService(
      orderRepositoryMock,
      carRepositoryMock
    );
  });

  it("should throw an error if order does not exist", async () => {
    const orderId = "non-existent-id";
    orderRepositoryMock.findById.mockResolvedValue(null);

    await expect(deleteOrderService.softDeleteOrder(orderId)).rejects.toThrow(
      "Pedido não encontrado"
    );
  });

  it('should throw an error if the order is not in "Aberto" status', async () => {
    const orderId = "101";
    const mockOrder: Order = {
      id: "101",
      status: "Aprovado",
      cancellationDate: null,
      car: {} as Car,
      client: {} as any,
      cep: null,
      city: null,
      state: null,
      totalValue: 0,
      initialDate: new Date(),
      finalDate: null,
    };
    orderRepositoryMock.findById.mockResolvedValue(mockOrder);

    await expect(deleteOrderService.softDeleteOrder(orderId)).rejects.toThrow(
      'Apenas pedidos com status "Aberto" podem ser cancelados.'
    );
  });

  it('should cancel the order and set car status to "ativo"', async () => {
    const orderId = "101";
    const mockOrder: Order = {
      id: "101",
      status: "Aberto",
      cancellationDate: null,
      car: { id: "1", status: "inativo" } as Car,
      client: {} as any,
      cep: null,
      city: null,
      state: null,
      totalValue: 30000,
      initialDate: new Date(),
      finalDate: null,
    };
    const mockCar: Car = {
      id: "1",
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      status: "inativo",
      km: 15000,
      createdAt: new Date(),
      deletedAt: null,
      items: [],
      orders: [],
    };
    orderRepositoryMock.findById.mockResolvedValue(mockOrder);
    carRepositoryMock.findById.mockResolvedValue(mockCar);
    carRepositoryMock.save.mockResolvedValue({ ...mockCar, status: "ativo" });

    orderRepositoryMock.createOrder.mockResolvedValue({
      ...mockOrder,
      status: "Cancelado",
      cancellationDate: new Date(),
    });

    const result = await deleteOrderService.softDeleteOrder(orderId);

    expect(result.status).toBe("Cancelado");
    expect(result.cancellationDate).toBeDefined();

    expect(carRepositoryMock.save).toHaveBeenCalledWith({
      ...mockCar,
      status: "ativo",
    });

    expect(orderRepositoryMock.createOrder).toHaveBeenCalledWith({
      ...mockOrder,
      status: "Cancelado",
      cancellationDate: expect.any(Date),
    });
  });
});
