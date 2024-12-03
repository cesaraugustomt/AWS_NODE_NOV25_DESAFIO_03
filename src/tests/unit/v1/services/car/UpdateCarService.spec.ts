import { UpdateCarService } from "../../../../../application/services/car/UpdateCarService";
import { CarsRepository } from "../../../../../domain/repositories/CarsRepository";
import { UpdateCarDTO } from "../../../../../http/dtos/UpdateCar.dto";
import { Car } from "../../../../../domain/entities/Car";
import { CarItem } from "../../../../../domain/entities/CarItem";

jest.mock("../../../../../domain/repositories/CarsRepository"); // Mock do repositório

describe("UpdateCarService", () => {
  let carsRepositoryMock: jest.Mocked<CarsRepository>;
  let updateCarService: UpdateCarService;

  beforeEach(() => {
    carsRepositoryMock = new CarsRepository() as jest.Mocked<CarsRepository>;
    updateCarService = new UpdateCarService(carsRepositoryMock);
  });

  it("should throw an error if the plate is invalid", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";
    car.brand = "Tesla";
    car.model = "Model S";
    car.km = 20000;
    car.year = 2021;
    car.price = 800000;
    car.status = "ativo";

    const updateData: UpdateCarDTO = {
      plate: "INVALID_PLATE", // Placa inválida
      brand: "Tesla",
      model: "Model X",
      km: 25000,
      year: 2022,
      price: 850000,
      status: "ativo",
      items: ["teto solar", "camera traseira"],
    };

    // Mock para o carro encontrado
    carsRepositoryMock.findById.mockResolvedValueOnce(car);

    await expect(updateCarService.execute("1", updateData)).rejects.toThrow(
      "Placa inválida."
    );
  });

  it("should throw an error if the price is negative", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";
    car.brand = "Tesla";
    car.model = "Model S";
    car.km = 20000;
    car.year = 2021;
    car.price = 800000;
    car.status = "ativo";

    const updateData: UpdateCarDTO = {
      plate: "DEF5678",
      brand: "Tesla",
      model: "Model X",
      km: 25000,
      year: 2022,
      price: -5000, // Preço negativo
      status: "ativo",
      items: ["teto solar", "camera traseira"],
    };

    // Mock para o carro encontrado
    carsRepositoryMock.findById.mockResolvedValueOnce(car);

    await expect(updateCarService.execute("1", updateData)).rejects.toThrow(
      "O preço do carro não pode ser negativa."
    );
  });

  it("should throw an error if the year is less than 2014", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";
    car.brand = "Tesla";
    car.model = "Model S";
    car.km = 20000;
    car.year = 2021;
    car.price = 800000;
    car.status = "ativo";

    const updateData: UpdateCarDTO = {
      plate: "DEF5678",
      brand: "Tesla",
      model: "Model X",
      km: 25000,
      year: 2013, // Ano inferior a 2014
      price: 850000,
      status: "ativo",
      items: ["teto solar", "camera traseira"],
    };

    // Mock para o carro encontrado
    carsRepositoryMock.findById.mockResolvedValueOnce(car);

    await expect(updateCarService.execute("1", updateData)).rejects.toThrow(
      "O carro não pode ter mais de 11 anos."
    );
  });

  it("should throw an error if there is another car with the same plate", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";
    car.brand = "Tesla";
    car.model = "Model S";
    car.km = 20000;
    car.year = 2021;
    car.price = 800000;
    car.status = "ativo";

    const updateData: UpdateCarDTO = {
      plate: "DEF5678",
      brand: "Tesla",
      model: "Model X",
      km: 25000,
      year: 2022,
      price: 850000,
      status: "ativo",
      items: ["teto solar", "camera traseira"],
    };

    const carWithSamePlate = new Car();
    carWithSamePlate.id = "2";
    carWithSamePlate.plate = "DEF5678";
    carWithSamePlate.brand = "Ford";
    carWithSamePlate.model = "Fiesta";
    carWithSamePlate.km = 30000;
    carWithSamePlate.year = 2019;
    carWithSamePlate.price = 40000;
    carWithSamePlate.status = "ativo";

    // Mock para o carro encontrado e outro carro com a mesma placa
    carsRepositoryMock.findById.mockResolvedValueOnce(car);
    carsRepositoryMock.findByPlate.mockResolvedValueOnce(carWithSamePlate);

    await expect(updateCarService.execute("1", updateData)).rejects.toThrow(
      "Já existe outro carro no sistema com a placa informada."
    );
  });
});
