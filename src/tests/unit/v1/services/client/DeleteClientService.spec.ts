import DeleteClientService from "./../../../../../application/services/client/DeleteClientService";
import ClientsRepository from "./../../../../../domain/repositories/ClientsRepository";
import { Client } from "./../../../../../domain/entities/Client";

jest.mock("../../../../../domain/repositories/ClientsRepository");

describe("DeleteClientService", () => {
  let deleteClientService: DeleteClientService;
  let clientsRepositoryMock: jest.Mocked<ClientsRepository>;

  beforeEach(() => {
    clientsRepositoryMock =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    deleteClientService = new DeleteClientService();
    deleteClientService["clientsRepository"] = clientsRepositoryMock;
  });

  it("should delete a client and return the deleted client", async () => {
    const clientId = "1";

    const deletedClient: Client = {
      id: clientId,
      createdAt: new Date(),
      deletedAt: new Date(),
      orders: [],
      birthday: new Date("1990-01-01"),
      name: "John Doe",
      cpf: "12345678901",
      email: "johndoe@example.com",
      phone: "1234567890",
    };

    clientsRepositoryMock.delete.mockResolvedValueOnce(deletedClient);

    const result = await deleteClientService.execute(clientId);

    expect(clientsRepositoryMock.delete).toHaveBeenCalledWith(clientId);

    expect(result).toEqual(deletedClient);
  });

  it("should return null if the client does not exist", async () => {
    const clientId = "1";

    clientsRepositoryMock.delete.mockResolvedValueOnce(null);

    const result = await deleteClientService.execute(clientId);

    expect(clientsRepositoryMock.delete).toHaveBeenCalledWith(clientId);

    expect(result).toBeNull();
  });
});
