import ListClientService from "./../../../../../application/services/client/ListClientService";
import ClientsRepository from "./../../../../../domain/repositories/ClientsRepository";
import { ListClientParams } from "./../../../../../application/params/ListClientParams.type";
import { ListClientResultDTO } from "./../../../../../http/dtos/ListeClientResult.dto";
import { Client } from "./../../../../../domain/entities/Client";

jest.mock("../../../../../domain/repositories/ClientsRepository");

describe("ListClientService", () => {
  let listClientService: ListClientService;
  let clientsRepositoryMock: jest.Mocked<ClientsRepository>;

  beforeEach(() => {
    clientsRepositoryMock =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    listClientService = new ListClientService();
    listClientService["clientsRepository"] = clientsRepositoryMock;
  });

  it("should return a list of clients", async () => {
    const params: ListClientParams = { page: 1, pageSize: 10 };

    const mockClients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        cpf: "12345678901",
        email: "johndoe@example.com",
        phone: "1234567890",
        birthday: new Date("1990-01-01"),
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      },
      {
        id: "2",
        name: "Jane Doe",
        cpf: "10987654321",
        email: "janedoe@example.com",
        phone: "0987654321",
        birthday: new Date("1992-02-02"),
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      },
    ];

    const total = mockClients.length;

    clientsRepositoryMock.index.mockResolvedValueOnce({
      clients: mockClients,
      total,
    });

    const result: ListClientResultDTO = await listClientService.execute(params);

    expect(clientsRepositoryMock.index).toHaveBeenCalledWith(params);

    expect(result).toEqual({
      clients: mockClients,
      total,
      totalPages: Math.ceil(total / (params.pageSize || 10)),
    });
  });

  it("should return a message when no clients are found", async () => {
    const params: ListClientParams = { page: 1, pageSize: 10 };

    clientsRepositoryMock.index.mockResolvedValueOnce({
      clients: [],
      total: 0,
    });

    const result: ListClientResultDTO = await listClientService.execute(params);

    expect(clientsRepositoryMock.index).toHaveBeenCalledWith(params);

    expect(result).toEqual({
      message: "No clients found",
      clients: [],
      total: 0,
      totalPages: 0,
    });
  });
});
