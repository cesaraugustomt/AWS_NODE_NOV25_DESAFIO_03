import { Repository } from "typeorm";
import ClientsRepository from "./../../../../domain/repositories/ClientsRepository";
import { Client } from "./../../../../domain/entities/Client";
import { AppDataSource } from "./../../../../infra/data-source";
import { CreateClientDTO } from "./../../../../http/dtos/CreateClient.dto";

jest.mock("../../../../infra/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("ClientsRepository", () => {
  let clientsRepository: ClientsRepository;
  let ormRepository: Repository<Client>;

  beforeEach(() => {
    ormRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        getManyAndCount: jest.fn(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
      }),
    } as unknown as Repository<Client>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(ormRepository);

    clientsRepository = new ClientsRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a client with valid data", async () => {
      const createData: CreateClientDTO = {
        name: "João Silva",
        birthday: "1990-01-01",
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "987654321",
      };

      (ormRepository.create as jest.Mock).mockReturnValue(createData);

      (ormRepository.save as jest.Mock).mockResolvedValue(createData);

      const createdClient = await clientsRepository.create(createData);

      expect(ormRepository.create).toHaveBeenCalledTimes(1);
      expect(ormRepository.save).toHaveBeenCalledTimes(1);
      expect(createdClient).toEqual(createData);
    });

    it("should not create a client if the CPF or email already exists", async () => {
      const createData: CreateClientDTO = {
        name: "João Silva",
        birthday: "1990-01-01",
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "987654321",
      };

      (ormRepository.findOne as jest.Mock).mockResolvedValue(createData);

      const result = await clientsRepository.create(createData);

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return the client when the id is valid", async () => {
      const mockClient: Client = {
        id: "1",
        name: "João Silva",
        birthday: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "987654321",
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      };

      (ormRepository.findOneBy as jest.Mock).mockResolvedValue(mockClient);

      const client = await clientsRepository.findById("1");

      expect(ormRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(client).toEqual(mockClient);
    });

    it("should return null if the client does not exist", async () => {
      (ormRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      const client = await clientsRepository.findById("non-existing-id");

      expect(ormRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(client).toBeNull();
    });
  });

  describe("index", () => {
    it("should return all clients", async () => {
      const mockClients: Client[] = [
        {
          id: "1",
          name: "João Silva",
          birthday: new Date("1990-01-01"),
          cpf: "12345678901",
          email: "joao.silva@example.com",
          phone: "987654321",
          createdAt: new Date(),
          deletedAt: null,
          orders: [],
        },
        {
          id: "2",
          name: "Maria Souza",
          birthday: new Date("1995-02-15"),
          cpf: "98765432100",
          email: "maria.souza@example.com",
          phone: "123456789",
          createdAt: new Date(),
          deletedAt: null,
          orders: [],
        },
      ];

      (ormRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([mockClients, mockClients.length]),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
      });

      (ormRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockClients,
        mockClients.length,
      ]);

      const result = await clientsRepository.index({ page: 1, pageSize: 10 });

      expect(ormRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(result.clients).toEqual(mockClients);
      expect(result.total).toBe(mockClients.length);
    });
  });

  describe("update", () => {
    it("should update a client with valid data", async () => {
      const updateData: Partial<CreateClientDTO> = {
        name: "João Silva Updated",
        birthday: new Date("1991-02-01").toISOString(),
      };
      const mockClient: Client = {
        id: "1",
        name: "João Silva",
        birthday: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "987654321",
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      };

      const updatedClient: Client = {
        ...mockClient,
        ...updateData,
        birthday: updateData.birthday ? new Date(updateData.birthday) : null,
      };

      (ormRepository.findOne as jest.Mock).mockResolvedValue(mockClient);
      (ormRepository.save as jest.Mock).mockResolvedValue(updatedClient);

      const result = await clientsRepository.update({ id: "1", ...updateData });

      expect(ormRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ...updatedClient,
        birthday: updateData.birthday
          ? new Date(updateData.birthday).toISOString()
          : null,
      });
    });

    it("should return null if the client does not exist", async () => {
      (ormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await clientsRepository.update({
        id: "non-existing-id",
        name: "Invalid",
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a client with valid id", async () => {
      const mockClient: Client = {
        id: "1",
        name: "João Silva",
        birthday: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "987654321",
        createdAt: new Date(),
        deletedAt: null,
        orders: [],
      };

      (ormRepository.findOne as jest.Mock).mockResolvedValue(mockClient);
      (ormRepository.save as jest.Mock).mockResolvedValue(mockClient);

      const result = await clientsRepository.delete("1");

      expect(ormRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockClient);
    });

    it("should return null if the client does not exist", async () => {
      (ormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await clientsRepository.delete("non-existing-id");

      expect(result).toBeNull();
    });
  });
});
