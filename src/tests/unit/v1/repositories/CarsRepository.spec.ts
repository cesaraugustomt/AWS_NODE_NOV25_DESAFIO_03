import { Repository } from "typeorm";
import { Car } from "../../../../domain/entities/Car";
import { AppDataSource } from "../../../../infra/data-source";
import { CreateCarDTO } from "../../../../http/dtos/CreateCar.dto";
import { UpdateCarDTO } from "../../../../http/dtos/UpdateCar.dto";
import { CarsRepository } from "../../../../domain/repositories/CarsRepository";

jest.mock("../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("CarsRepository", () => {
  let carsRepository: CarsRepository;
  let mockRepository: jest.Mocked<Repository<Car>>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findById: jest.fn(),
      findByPlate: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Car>>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    carsRepository = new CarsRepository();
  });

  it("should create and save a car", async () => {
    const carData: CreateCarDTO = {
      plate: "ABC1234",
      brand: "BrandX",
      model: "ModelY",
      km: 10000,
      year: 2020,
      price: 20000,
      status: "available",
      items: ["item1", "item2"],
    };

    const savedCar = new Car();
    savedCar.id = "1";
    savedCar.plate = carData.plate;

    mockRepository.create.mockReturnValue(savedCar);
    mockRepository.save.mockResolvedValue(savedCar);

    const result = await carsRepository.create(carData);

    expect(mockRepository.create).toHaveBeenCalledWith({
      plate: carData.plate,
      brand: carData.brand,
      model: carData.model,
      km: carData.km,
      year: carData.year,
      price: carData.price,
      status: carData.status,
      items: expect.any(Array),
    });
    expect(mockRepository.save).toHaveBeenCalledWith(savedCar);
    expect(result).toEqual(savedCar);
  });

  it("should update a car", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";

    const updateData: UpdateCarDTO = {
      plate: "XYZ5678",
      brand: "BrandY",
      model: "ModelZ",
      km: 15000,
      year: 2021,
      price: 25000,
      status: "sold",
      items: ["item1", "item2"],
    };

    mockRepository.update.mockResolvedValue({
      affected: 1,
      raw: [],
      generatedMaps: [],
    });

    const result = await carsRepository.update(car, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(
      { id: car.id },
      {
        plate: updateData.plate,
        brand: updateData.brand,
        model: updateData.model,
        km: updateData.km,
        year: updateData.year,
        price: updateData.price,
        status: updateData.status,
      }
    );
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toEqual(car);
  });

  it("should save a car", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";

    mockRepository.save.mockResolvedValue(car);

    const result = await carsRepository.save(car);

    expect(mockRepository.save).toHaveBeenCalledWith(car);
    expect(result).toEqual(car);
  });

  it("should mark a car as deleted", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";

    const updatedCar = { ...car, deletedAt: new Date(), status: "excluído" };

    mockRepository.save.mockResolvedValue(updatedCar);

    await carsRepository.remove(car);

    expect(mockRepository.save).toHaveBeenCalledWith(updatedCar);
    expect(updatedCar.status).toBe("excluído");
    expect(updatedCar.deletedAt).toBeInstanceOf(Date);
  });

  it("should find a car by id", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";

    mockRepository.findOne.mockResolvedValue(car);

    const result = await carsRepository.findById("1");

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: "1" },
      relations: ["items"],
    });
    expect(result).toEqual(car);
  });

  it("should find a car by plate", async () => {
    const car = new Car();
    car.id = "1";
    car.plate = "ABC1234";

    mockRepository.findOne.mockResolvedValue(car);

    const result = await carsRepository.findByPlate("ABC1234");

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { plate: "ABC1234" },
      relations: ["items"],
    });
    expect(result).toEqual(car);
  });
});
