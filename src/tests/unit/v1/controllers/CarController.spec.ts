import { Request, Response } from "express";
import { CarsRepository } from "../../../../domain/repositories/CarsRepository";
import { CreateCarDTO } from "./../../../../http/dtos/CreateCar.dto";
const CarController = require("../../../../http/controller/CarController");

jest.mock("../../../../domain/repositories/CarsRepository");
jest.mock("../../../../domain/repositories/OrderRepository");

describe("CarController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let carsRepository: jest.Mocked<CarsRepository>;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };

    carsRepository = new CarsRepository() as jest.Mocked<CarsRepository>;
    jest.spyOn(CarsRepository.prototype, "create").mockResolvedValue({
      id: "123",
      plate: "XYZ-1234",
      brand: "Brand",
      model: "Model",
      km: 10000,
      year: 2020,
      price: 50000,
      status: "available",
      items: [],
    } as any);

    jest.spyOn(CarsRepository.prototype, "findById").mockResolvedValue({
      id: "123",
      brand: "Brand",
      model: "Model",
      plate: "XYZ-1234",
      km: 10000,
      year: 2020,
      price: 50000,
      status: "available",
      items: [],
    } as any);

    jest.spyOn(CarsRepository.prototype, "findAll").mockResolvedValue({
      data: [{ id: "123", brand: "Brand", model: "Model" }],
      total: 1,
    } as any);

    jest.spyOn(CarsRepository.prototype, "update").mockResolvedValue({
      id: "123",
      plate: "XYZ-1234",
      brand: "Updated Brand",
      model: "Updated Model",
      km: 10000,
      year: 2020,
      price: 50000,
      status: "available",
      items: [],
    } as any);

    jest.spyOn(CarsRepository.prototype, "remove").mockResolvedValue();
  });

  describe("create", () => {
    it("should return 400 if DTO validation fails", async () => {
      req.body = {
        plate: "",
        brand: "Brand",
        model: "Model",
        km: 10000,
        year: 2020,
        price: 50000,
        status: "available",
        items: [],
      };

      await CarController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Campo vazio: placa",
      });
    });
  });

  describe("show", () => {
    it("should return car details for a valid ID", async () => {
      req.params = { id: "123" };

      await CarController.show(req as Request, res as Response);

      expect(CarsRepository.prototype.findById).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith({
        id: "123",
        brand: "Brand",
        model: "Model",
        plate: "XYZ-1234",
        km: 10000,
        year: 2020,
        price: 50000,
        status: "available",
        items: [],
      });
    });
  });
});
