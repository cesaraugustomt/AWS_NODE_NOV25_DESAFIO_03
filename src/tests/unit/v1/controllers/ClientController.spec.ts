import { Request, Response } from "express";
import CreateClientService from "../../../../application/services/client/CreateClientService";
import ReadClientService from "../../../../application/services/client/ReadClientService";
import ListClientService from "../../../../application/services/client/ListClientService";
import UpdateClientService from "../../../../application/services/client/UpdateClientService";
import DeleteClientService from "../../../../application/services/client/DeleteClientService";

const ClientController = require("../../../../http/controller/ClientController");

jest.mock("../../../../application/services/client/CreateClientService");
jest.mock("../../../../application/services/client/ReadClientService");
jest.mock("../../../../application/services/client/ListClientService");
jest.mock("../../../../application/services/client/UpdateClientService");
jest.mock("../../../../application/services/client/DeleteClientService");

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
};

const mockRequest = (
  params: object = {},
  body: object = {},
  query: object = {}
) => {
  return {
    params,
    body,
    query,
  } as unknown as Request;
};

describe("ClientController", () => {
  describe("create", () => {
    it("should return error for invalid CPF", async () => {
      const request = mockRequest(
        {},
        {
          name: "Client One",
          birthday: "2000-01-01",
          cpf: "invalid-cpf",
          email: "client.one@example.com",
          phone: "1234567890",
        }
      );
      const response = mockResponse();

      await ClientController.create(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ message: "Invalid cpf" });
    });
  });

  describe("findById", () => {
    it("should return a client by ID", async () => {
      const mockClient = {
        id: "1",
        name: "Client One",
        birthday: new Date("2000-01-01"),
        cpf: "12345678900",
        email: "client.one@example.com",
        phone: "1234567890",
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      };

      const readClientServiceMock = ReadClientService as jest.MockedClass<
        typeof ReadClientService
      >;
      readClientServiceMock.prototype.execute.mockResolvedValue(mockClient);

      const request = mockRequest({ id: "1" });
      const response = mockResponse();

      await ClientController.findById(request, response);

      expect(readClientServiceMock.prototype.execute).toHaveBeenCalledWith("1");
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(mockClient);
    });

    it("should return 404 if client not found", async () => {
      const readClientServiceMock = ReadClientService as jest.MockedClass<
        typeof ReadClientService
      >;
      readClientServiceMock.prototype.execute.mockResolvedValue(null);

      const request = mockRequest({ id: "1" });
      const response = mockResponse();

      await ClientController.findById(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        message: "Client not found",
      });
    });
  });

  describe("update", () => {
    it("should return error for invalid CPF", async () => {
      const request = mockRequest(
        { id: "1" },
        {
          name: "Client One Updated",
          birthday: "2000-01-01",
          cpf: "invalid-cpf",
          email: "client.one.updated@example.com",
          phone: "0987654321",
        }
      );
      const response = mockResponse();

      await ClientController.update(request, response);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ message: "Invalid cpf" });
    });
  });

  describe("delete", () => {
    it("should delete a client and return a success message", async () => {
      const deleteClientServiceMock = DeleteClientService as jest.MockedClass<
        typeof DeleteClientService
      >;
      deleteClientServiceMock.prototype.execute.mockResolvedValue({
        id: "1",
        name: "Client One",
        birthday: new Date("2000-01-01"),
        cpf: "12345678900",
        email: "client.one@example.com",
        phone: "1234567890",
        createdAt: new Date(),
        deletedAt: new Date(),
        orders: [],
      });

      const request = mockRequest({ id: "1" });
      const response = mockResponse();

      await ClientController.delete(request, response);

      expect(deleteClientServiceMock.prototype.execute).toHaveBeenCalledWith(
        "1"
      );
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message: "Client deleted successfully",
      });
    });

    it("should return 404 if client not found", async () => {
      const deleteClientServiceMock = DeleteClientService as jest.MockedClass<
        typeof DeleteClientService
      >;

      deleteClientServiceMock.prototype.execute.mockResolvedValue(null);

      const request = mockRequest({}, { id: "1" }, {});
      const response = mockResponse();

      await ClientController.delete(request, response);

      expect(deleteClientServiceMock.prototype.execute).toHaveBeenCalledWith(
        "1"
      );
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        message: "Client not found or is already deleted",
      });
    });
  });
});
