import CreateClientService from "./../../../../../application/services/client/CreateClientService";
import ClientsRepository from "./../../../../../domain/repositories/ClientsRepository";
import { CreateClientDTO } from "./../../../../../http/dtos/CreateClient.dto";
import { Client } from "./../../../../../domain/entities/Client";

jest.mock("../../../../../domain/repositories/ClientsRepository");

describe("CreateClientService", () => {
  let createClientService: CreateClientService;
  let clientsRepositoryMock: jest.Mocked<ClientsRepository>;

  beforeEach(() => {
    clientsRepositoryMock =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;

    createClientService = new CreateClientService();

    createClientService["clientsRepository"] = clientsRepositoryMock;
  });

  it("should create a client and return the created client", async () => {
    const clientData: CreateClientDTO = {
      name: "John Doe",
      birthday: "1990-01-01",
      cpf: "12345678901",
      email: "johndoe@example.com",
      phone: "1234567890",
    };

    const createdClient: Client = {
      id: "1",
      createdAt: new Date(),
      deletedAt: null,
      orders: [],
      birthday: new Date(clientData.birthday),
      name: clientData.name,
      cpf: clientData.cpf,
      email: clientData.email,
      phone: clientData.phone,
    };

    clientsRepositoryMock.create.mockResolvedValueOnce(createdClient);

    const result = await createClientService.execute(clientData);

    expect(clientsRepositoryMock.create).toHaveBeenCalledWith({
      ...clientData,
      birthday: clientData.birthday,
    });

    expect(result).toEqual(createdClient);
  });
});
