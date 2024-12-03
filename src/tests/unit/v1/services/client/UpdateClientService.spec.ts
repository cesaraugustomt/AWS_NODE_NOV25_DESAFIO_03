import UpdateClientService from "./../../../../../application/services/client/UpdateClientService";
import ClientsRepository from "./../../../../../domain/repositories/ClientsRepository";
import { UpdateClientDTO } from "./../../../../../http/dtos/UpdateClient.dto";
import { Client } from "./../../../../../domain/entities/Client";

jest.mock("../../../../../domain/repositories/ClientsRepository");

describe("UpdateClientService", () => {
  let updateClientService: UpdateClientService;
  let clientsRepositoryMock: jest.Mocked<ClientsRepository>;

  beforeEach(() => {
    clientsRepositoryMock =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    updateClientService = new UpdateClientService();
    updateClientService["clientsRepository"] = clientsRepositoryMock;
  });

  it("should update a client and return the updated client", async () => {
    const updateClientData: UpdateClientDTO = {
      id: "1",
      name: "Updated Name",
      email: "updatedemail@example.com",
      phone: "9876543210",
    };

    const updatedClient: Client = {
      id: "1",
      name: "Updated Name",
      cpf: "12345678901",
      email: "updatedemail@example.com",
      phone: "9876543210",
      birthday: new Date("1990-01-01"),
      createdAt: new Date(),
      deletedAt: null,
      orders: [],
    };

    clientsRepositoryMock.update.mockResolvedValueOnce(updatedClient);

    const result = await updateClientService.execute(updateClientData);
    expect(clientsRepositoryMock.update).toHaveBeenCalledWith(updateClientData);

    expect(result).toEqual(updatedClient);
  });

  it("should return null if the client does not exist", async () => {
    const updateClientData: UpdateClientDTO = {
      id: "999",
      name: "Non-existent Name",
      email: "nonexistent@example.com",
      phone: "0000000000",
    };

    clientsRepositoryMock.update.mockResolvedValueOnce(null);
    const result = await updateClientService.execute(updateClientData);

    expect(clientsRepositoryMock.update).toHaveBeenCalledWith(updateClientData);
    expect(result).toBeNull();
  });
});
