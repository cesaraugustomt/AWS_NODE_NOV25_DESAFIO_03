import CarsRepository from "../../../../../domain/repositories/CarsRepository";
import ShowCarService from "../../../../../application/services/car/ShowCarService";
import { Car } from "../../../../../domain/entities/Car";
import { CarItem } from "../../../../../domain/entities/CarItem";

jest.mock("../../../../../domain/repositories/CarsRepository");

describe("ShowCarService", () => {
  let carsRepositoryMock: jest.Mocked<CarsRepository>;
  let showCarService: ShowCarService;

  beforeEach(() => {
    carsRepositoryMock = new CarsRepository() as jest.Mocked<CarsRepository>;
    showCarService = new ShowCarService(carsRepositoryMock);
  });

  it("should return the correct car data when the car exists", async () => {
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

    carsRepositoryMock.findById.mockResolvedValueOnce(car);

    const result = await showCarService.execute("1");

    expect(result.id).toBe("1");
    expect(result.plate).toBe("ABC1234");
    expect(result.items).toEqual([
      "autopilot",
      "câmbio automático",
      "sensor",
      "teto solar",
      "camera traseira",
    ]);
  });

  it("should throw an error if the car is not found", async () => {
    carsRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(showCarService.execute("1")).rejects.toThrow(
      "Carro não encontrado."
    );
  });

  it("should return the car data with the correct items", async () => {
    const car = new Car();
    car.id = "2";
    car.plate = "XYZ5678";
    car.brand = "BMW";
    car.model = "X5";
    car.km = 15000;
    car.year = 2020;
    car.price = 350000;
    car.status = "inativo";

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

    carsRepositoryMock.findById.mockResolvedValueOnce(car);

    const result = await showCarService.execute("2");

    expect(result.items).toEqual([
      "autopilot",
      "câmbio automático",
      "sensor",
      "teto solar",
      "camera traseira",
    ]);
  });
});
