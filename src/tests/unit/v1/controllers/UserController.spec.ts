import { Request, Response } from "express";
import { CreateUserService } from "../../../../application/services/user/CreateUseService";
import { ListUserService } from "../../../../application/services/user/ListUserService";
import { UpdateUserService } from "../../../../application/services/user/UpdateUserService";
import { SelectUserByIdService } from "../../../../application/services/user/SelectUserByIdService";
import { DeleteUserService } from "../../../../application/services/user/DeleteUserService";
const UserController = require("../../../../http/controller/UserController");

jest.mock("../../../../application/services/user/CreateUseService");
jest.mock("../../../../application/services/user/ListUserService");
jest.mock("../../../../application/services/user/UpdateUserService");
jest.mock("../../../../application/services/user/SelectUserByIdService");
jest.mock("../../../../application/services/user/DeleteUserService");

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
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

describe("UserController", () => {
  describe("index", () => {
    it("should list users and return the users data", async () => {
      const mockUsers = [
        {
          id: "1",
          full_name: "User One",
          email: "user.one@example.com",
          password: "hashed_password", // Pode ser necessário dependendo da lógica do serviço
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null, // ou new Date(), se o usuário tiver sido deletado
        },
        {
          id: "2",
          full_name: "User Two",
          email: "user.two@example.com",
          password: "hashed_password",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      const listUserServiceMock = ListUserService as jest.MockedClass<
        typeof ListUserService
      >;
      listUserServiceMock.prototype.execute.mockResolvedValue({
        users: mockUsers,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const request = mockRequest({}, {}, {});
      const response = mockResponse();

      await UserController.index(request, response);

      expect(listUserServiceMock.prototype.execute).toHaveBeenCalledWith({
        name: undefined,
        email: undefined,
        isDeleted: undefined,
        orderBy: undefined,
        orderDirection: undefined,
        page: 1,
        pageSize: 10,
      });

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        meta: {
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
        users: mockUsers,
      });
    });
  });

  describe("create", () => {
    it("should create a user and return the user data", async () => {
      const mockCreatedUser = {
        id: "1",
        full_name: "User One",
        email: "user.one@example.com",
        password: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const createUserServiceMock = CreateUserService as jest.MockedClass<
        typeof CreateUserService
      >;
      createUserServiceMock.prototype.execute.mockResolvedValue(
        mockCreatedUser
      );

      const request = mockRequest(
        {},
        {
          full_name: "User One",
          email: "user.one@example.com",
          password: "password123",
        }
      );
      const response = mockResponse();

      await UserController.create(request, response);

      expect(createUserServiceMock.prototype.execute).toHaveBeenCalledWith({
        full_name: "User One",
        email: "user.one@example.com",
        password: "password123",
      });

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith(mockCreatedUser);
    });
  });

  describe("update", () => {
    it("should update a user and return a success message", async () => {
      const updateUserServiceMock = UpdateUserService as jest.MockedClass<
        typeof UpdateUserService
      >;

      updateUserServiceMock.prototype.execute.mockResolvedValue({
        message: "Registro atualizado com sucesso",
      });

      const request = mockRequest(
        { id: "1" },
        {
          full_name: "User One Updated",
          email: "user.one@example.com",
          password: "password123",
          newPassword: "newPassword123",
        }
      );
      const response = mockResponse();

      await UserController.update(request, response);

      expect(updateUserServiceMock.prototype.execute).toHaveBeenCalledWith({
        id: "1",
        full_name: "User One Updated",
        email: "user.one@example.com",
        password: "password123",
        newPassword: "newPassword123",
      });

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message: "Registro atualizado com sucesso",
      });
    });
  });

  describe("delete", () => {
    it("should delete a user and return a success message", async () => {
      const deleteUserServiceMock = DeleteUserService as jest.MockedClass<
        typeof DeleteUserService
      >;

      deleteUserServiceMock.prototype.execute.mockResolvedValue({
        message: "Usuário excluído com sucesso",
      });

      const request = mockRequest({ id: "1" }, {});
      const response = mockResponse();

      await UserController.delete(request, response);

      expect(deleteUserServiceMock.prototype.execute).toHaveBeenCalledWith({
        id: "1",
      });

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message: "Usuário excluído com sucesso",
      });
    });
  });

  describe("selectById", () => {
    it("should select a user by ID and return the user data", async () => {
      const mockUser = {
        id: "1",
        full_name: "User One",
        email: "user.one@example.com",
        password: "hashed_password",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const selectUserByIdServiceMock =
        SelectUserByIdService as jest.MockedClass<typeof SelectUserByIdService>;
      selectUserByIdServiceMock.prototype.execute.mockResolvedValue(mockUser);

      const request = mockRequest({ id: "1" });
      const response = mockResponse();

      await UserController.selectById(request, response);

      expect(selectUserByIdServiceMock.prototype.execute).toHaveBeenCalledWith({
        id: "1",
      });
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
