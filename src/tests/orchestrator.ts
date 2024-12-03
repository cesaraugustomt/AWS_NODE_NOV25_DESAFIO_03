import "dotenv/config";
import retry from "async-retry";

async function waitForAllServices() {
  await waitForApiServer();

  async function waitForApiServer() {
    return retry(fetchUserRoute, {
      retries: 10,
      minTimeout: 2000,
      maxTimeout: 5000,
      onRetry: (error: any, attempt: any) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status: ${error.message}`
        );
      },
    });
  }

  async function fetchUserRoute() {
    try {
      const url = `http://localhost:${process.env.PORT}/api/v1/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@admin.com",
          password: "123456",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      await response.json();
      console.log("API is ready!");
    } catch (error: any) {
      throw new Error(`Failed to connect to API: ${error.message}`);
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
