import { CreateCarService } from "../../../../../application/services/car/CreateCarService";
import { CarsRepository } from "../../../../../domain/repositories/CarsRepository";

jest.mock("../../../../../domain/repositories/CarsRepository", () => ({
  CarsRepository: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    create: jest.fn(),
    findByPlate: jest.fn(),
  })),
}));

describe("CreateCarService", () => {
  let createCarService: CreateCarService;
  let carsRepository: jest.Mocked<CarsRepository>;

  beforeEach(() => {
    carsRepository = new (CarsRepository as jest.Mock)();
    createCarService = new CreateCarService(carsRepository);
  });

  it("should throw an error if required fields are missing", async () => {
    await expect(
      createCarService.execute({
        plate: "",
        brand: "Tesla",
        model: "Model S",
        km: 20000,
        year: 2021,
        price: 800000,
        status: "ativo",
        items: [
          "autopilot",
          "câmbio automático",
          "câmera de ré",
          "ar-condicionado",
        ],
      })
    ).rejects.toThrow("Campo vazio: placa");
  });

  it("should throw an error if plate is invalid", async () => {
    await expect(
      createCarService.execute({
        plate: "1234XYZ",
        brand: "Tesla",
        model: "Model S",
        km: 20000,
        year: 2021,
        price: 800000,
        status: "ativo",
        items: [
          "autopilot",
          "câmbio automático",
          "câmera de ré",
          "ar-condicionado",
        ],
      })
    ).rejects.toThrow("Placa inválida.");
  });

  it("should throw an error if status is invalid", async () => {
    await expect(
      createCarService.execute({
        plate: "ABC1234",
        brand: "Tesla",
        model: "Model S",
        km: 20000,
        year: 2021,
        price: 800000,
        status: "indefinido",
        items: [
          "autopilot",
          "câmbio automático",
          "câmera de ré",
          "ar-condicionado",
        ],
      })
    ).rejects.toThrow(
      "O status do carro deve ser um dos seguintes: 'ativo' ou 'inativo'."
    );
  });

  it("should throw an error if car already exists", async () => {
    (carsRepository.findByPlate as jest.Mock).mockResolvedValue({
      plate: "ABC1234",
      brand: "Tesla",
      model: "Model S",
    });

    await expect(
      createCarService.execute({
        plate: "ABC1234",
        brand: "Tesla",
        model: "Model S",
        km: 20000,
        year: 2021,
        price: 800000,
        status: "ativo",
        items: [
          "autopilot",
          "câmbio automático",
          "câmera de ré",
          "ar-condicionado",
        ],
      })
    ).rejects.toThrow("Já existe um carro no sistema com a placa informada.");
  });

  it("should successfully create a car", async () => {
    (carsRepository.findByPlate as jest.Mock).mockResolvedValue(null);

    const createCarDTO = {
      plate: "ABC1234",
      brand: "Tesla",
      model: "Model S",
      km: 20000,
      year: 2021,
      price: 800000,
      status: "ativo",
      items: [
        "autopilot",
        "câmbio automático",
        "câmera de ré",
        "ar-condicionado",
      ],
    };

    (carsRepository.create as jest.Mock).mockResolvedValue(createCarDTO);

    const result = await createCarService.execute(createCarDTO);

    expect(carsRepository.create).toHaveBeenCalledWith({
      plate: "ABC1234",
      brand: "Tesla",
      model: "Model S",
      km: 20000,
      year: 2021,
      price: 800000,
      status: "ativo",
      items: [
        "autopilot",
        "câmbio automático",
        "câmera de ré",
        "ar-condicionado",
      ],
    });

    expect(result).toEqual(createCarDTO);
  });
});
