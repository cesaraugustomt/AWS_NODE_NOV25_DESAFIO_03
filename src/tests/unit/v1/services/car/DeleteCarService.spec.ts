import { DeleteCarService } from "../../../../../application/services/car/DeleteCarService";
import { CarsRepository } from "../../../../../domain/repositories/CarsRepository";
import { OrderRepository } from "../../../../../domain/repositories/OrderRepository";

jest.mock("../../../../../domain/repositories/CarsRepository", () => ({
  CarsRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    remove: jest.fn(),
  })),
}));

jest.mock("../../../../../domain/repositories/OrderRepository", () => ({
  OrderRepository: jest.fn().mockImplementation(() => ({
    findOpenOrderByCarId: jest.fn(),
  })),
}));

describe("DeleteCarService", () => {
  let deleteCarService: DeleteCarService;
  let carsRepository: jest.Mocked<CarsRepository>;
  let orderRepository: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    carsRepository = new (CarsRepository as jest.Mock)();
    orderRepository = new (OrderRepository as jest.Mock)();
    deleteCarService = new DeleteCarService(carsRepository, orderRepository);
  });

  it("should throw an error if car is not found", async () => {
    (carsRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(deleteCarService.execute("1234")).rejects.toThrow(
      "Carro não encontrado."
    );
  });

  it("should throw an error if there are open orders for the car", async () => {
    (carsRepository.findById as jest.Mock).mockResolvedValue({
      id: "1234",
      plate: "ABC1234",
      brand: "Tesla",
      model: "Model S",
      km: 20000,
      year: 2021,
      price: 800000,
      status: "ativo",
      items: ["autopilot", "câmbio automático"],
    });

    (orderRepository.findOpenOrderByCarId as jest.Mock).mockResolvedValue({
      id: "5678",
      carId: "1234",
      status: "open",
    });

    await expect(deleteCarService.execute("1234")).rejects.toThrow(
      "O carro não pode ser excluído pois tem pedidos em aberto."
    );
  });

  it("should successfully delete the car if there are no open orders", async () => {
    (carsRepository.findById as jest.Mock).mockResolvedValue({
      id: "1234",
      plate: "ABC1234",
      brand: "Tesla",
      model: "Model S",
      km: 20000,
      year: 2021,
      price: 800000,
      status: "ativo",
      items: ["autopilot", "câmbio automático"],
    });

    (orderRepository.findOpenOrderByCarId as jest.Mock).mockResolvedValue(null);

    (carsRepository.remove as jest.Mock).mockResolvedValue(undefined);

    await expect(deleteCarService.execute("1234")).resolves.toBeUndefined();

    expect(carsRepository.remove).toHaveBeenCalledWith({
      id: "1234",
      plate: "ABC1234",
      brand: "Tesla",
      model: "Model S",
      km: 20000,
      year: 2021,
      price: 800000,
      status: "ativo",
      items: ["autopilot", "câmbio automático"],
    });
  });
});
