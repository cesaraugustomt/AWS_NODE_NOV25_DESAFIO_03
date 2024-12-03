import { ListCarService } from "../../../../../application/services/car/ListCarService";
import { CarsRepository } from "../../../../../domain/repositories/CarsRepository";
import { ListCarParams } from "../../../../../application/params/ListCarsParams.type";
import Car from "../../../../../domain/entities/Car";
import CarItem from "../../../../../domain/entities/CarItem";

jest.mock("../../../../../domain/repositories/CarsRepository", () => ({
  CarsRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
  })),
}));

describe("ListCarService", () => {
  let listCarService: ListCarService;
  let carsRepository: jest.Mocked<CarsRepository>;

  beforeEach(() => {
    carsRepository = new (CarsRepository as jest.Mock)();
    listCarService = new ListCarService(carsRepository);
  });

  it("should limit items to a maximum of 5", async () => {
    const listParams: ListCarParams = {
      items: ["item1", "item2", "item3", "item4", "item5", "item6"],
      page: 1,
      limit: 10,
    };

    (carsRepository.findAll as jest.Mock).mockResolvedValue({
      limit: 10,
      total: 6,
      page: 1,
      data: [new Car()],
    });

    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";
    car.brand = "Tesla";
    car.model = "Model S";
    car.km = 20000;
    car.year = 2021;
    car.price = 800000;
    car.status = "ativo";

    car.items = [
      new CarItem(),
      new CarItem(),
      new CarItem(),
      new CarItem(),
      new CarItem(),
    ];

    car.items[0].name = "autopilot";
    car.items[1].name = "câmbio automático";
    car.items[2].name = "sensor";
    car.items[3].name = "teto solar";
    car.items[4].name = "camera traseira";

    car.items.forEach((item) => {
      item.car = car;
    });

    (carsRepository.findAll as jest.Mock).mockResolvedValueOnce({
      limit: 10,
      total: 6,
      page: 1,
      data: [car],
    });

    const result = await listCarService.execute(listParams);

    expect(result.data[0].items.length).toBeLessThanOrEqual(5);
  });

  it("should return the correct data based on pagination", async () => {
    const listParams: ListCarParams = {
      items: ["item1", "item2", "item3", "item4", "item5", "item6"],
      page: 1,
      limit: 2, // Esperando 2 itens no resultado
    };

    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";
    car.brand = "Tesla";
    car.model = "Model S";
    car.km = 20000;
    car.year = 2021;
    car.price = 800000;
    car.status = "ativo";

    car.items = [
      new CarItem(),
      new CarItem(),
      new CarItem(),
      new CarItem(),
      new CarItem(),
      new CarItem(),
    ];

    car.items[0].name = "autopilot";
    car.items[1].name = "câmbio automático";
    car.items[2].name = "sensor";
    car.items[3].name = "teto solar";
    car.items[4].name = "camera traseira";
    car.items[5].name = "airbag";

    car.items.forEach((item) => {
      item.car = car;
    });

    // Mock da resposta do repositório
    (carsRepository.findAll as jest.Mock).mockResolvedValueOnce({
      limit: 2,
      total: 6,
      page: 1,
      data: [{ ...car, items: car.items.slice(0, 2) }],
    });

    const result = await listCarService.execute(listParams);

    expect(result.data[0].items.length).toBe(2);
  });

  it("should return an empty array if no cars are found", async () => {
    const listParams: ListCarParams = {
      items: ["item1", "item2"],
      page: 1,
      limit: 10,
    };

    (carsRepository.findAll as jest.Mock).mockResolvedValue({
      limit: 10,
      total: 0,
      page: 1,
      data: [],
    });

    const result = await listCarService.execute(listParams);

    expect(result.data).toEqual([]);
  });
});
