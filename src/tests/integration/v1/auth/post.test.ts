import orchestrator from "../../../orchestrator";
import request from "supertest";

const API_URL = "http://localhost:8080/api/v1";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});


describe("Login (successfully)", () => {
  it("should login successfully with valid credentials", async () => {
    const response = await request(API_URL).post("/login").send({
      email: "admin@admin.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.message).toBe("Login realizado com sucesso!");
  });
});
