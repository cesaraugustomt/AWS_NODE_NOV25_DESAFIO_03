import ReadClientService from "./../../../../../application/services/client/ReadClientService";
import ClientsRepository from "./../../../../../domain/repositories/ClientsRepository";
import { Client } from "./../../../../../domain/entities/Client";

jest.mock("../../../../../domain/repositories/ClientsRepository");

describe("ReadClientService", () => {
  let readClientService: ReadClientService;
  let clientsRepositoryMock: jest.Mocked<ClientsRepository>;

  beforeEach(() => {
    clientsRepositoryMock =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;

    readClientService = new ReadClientService();
    readClientService["clientsRepository"] = clientsRepositoryMock;
  });

  it("should return the client when the client is found", async () => {
    const clientId = "1";

    const mockClient: Client = {
      id: "1",
      name: "John Doe",
      cpf: "12345678901",
      email: "johndoe@example.com",
      phone: "1234567890",
      birthday: new Date("1990-01-01"),
      createdAt: new Date(),
      deletedAt: null,
      orders: [],
    };

    clientsRepositoryMock.findById.mockResolvedValueOnce(mockClient);

    const result = await readClientService.execute(clientId);

    expect(clientsRepositoryMock.findById).toHaveBeenCalledWith(clientId);

    expect(result).toEqual(mockClient);
  });

  it("should return null if the client is not found", async () => {
    const clientId = "999";

    clientsRepositoryMock.findById.mockResolvedValueOnce(null);

    const result = await readClientService.execute(clientId);

    expect(clientsRepositoryMock.findById).toHaveBeenCalledWith(clientId);

    expect(result).toBeNull();
  });
});
