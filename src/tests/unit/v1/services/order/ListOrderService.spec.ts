import { OrderOutputDTO } from "./../../../../../http/dtos/CreateOrder.dto";
import { ListOrderService } from "./../../../../../application/services/order/ListOrdersService";
import { OrderRepository } from "./../../../../../domain/repositories/OrderRepository";
import { Order } from "./../../../../../domain/entities/Order";

describe("ListOrderService", () => {
  let listOrderService: ListOrderService;
  let orderRepositoryMock: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    orderRepositoryMock = {
      listOrders: jest.fn(),
    } as any;

    listOrderService = new ListOrderService(orderRepositoryMock);
  });

  it("should return a list of orders and pagination data", async () => {
    const params: OrderOutputDTO = {
      page: 1,
      limit: 10,
      status: "Aberto",
    };

    const mockOrders: Order[] = [
      {
        id: "1",
        status: "Aberto",
        cancellationDate: null,
        car: {} as any,
        client: {} as any,
        cep: null,
        city: null,
        state: null,
        totalValue: 30000,
        initialDate: new Date(),
        finalDate: null,
      },
      {
        id: "2",
        status: "Aberto",
        cancellationDate: null,
        car: {} as any,
        client: {} as any,
        cep: null,
        city: null,
        state: null,
        totalValue: 25000,
        initialDate: new Date(),
        finalDate: null,
      },
    ];

    const paginationData = {
      orders: mockOrders,
      total: 2,
      pages: 1,
    };

    orderRepositoryMock.listOrders.mockResolvedValue(paginationData);

    const result = await listOrderService.listOrders(params);

    expect(result.orders).toEqual(mockOrders);
    expect(result.total).toBe(2);
    expect(result.pages).toBe(1);
    expect(orderRepositoryMock.listOrders).toHaveBeenCalledWith(params);
  });

  it("should return an empty list when no orders match the parameters", async () => {
    const params: OrderOutputDTO = {
      page: 1,
      limit: 10,
      status: "Cancelado",
    };

    const paginationData = {
      orders: [],
      total: 0,
      pages: 0,
    };

    orderRepositoryMock.listOrders.mockResolvedValue(paginationData);

    const result = await listOrderService.listOrders(params);

    expect(result.orders).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.pages).toBe(0);
    expect(orderRepositoryMock.listOrders).toHaveBeenCalledWith(params);
  });
});
