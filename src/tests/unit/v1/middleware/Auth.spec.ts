import { Request, Response, NextFunction } from "express";
const Authenticated = require("../../../../http/middleware/Auth");
import { verify } from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("Authenticated Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next if token is valid", () => {
    (verify as jest.Mock).mockImplementationOnce(() => true);

    req.headers!["authorization"] = "Bearer validToken";

    Authenticated(req as Request, res as Response, next);

    expect(verify).toHaveBeenCalledWith("validToken", expect.any(String));
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 403 if token is missing", () => {
    Authenticated(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Você não está autenticado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is invalid", () => {
    (verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid token");
    }); // Simula token inválido

    req.headers!["authorization"] = "Bearer invalidToken";

    Authenticated(req as Request, res as Response, next);

    expect(verify).toHaveBeenCalledWith("invalidToken", expect.any(String));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token inválido ou expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
