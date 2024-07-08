import cors from "cors";
import express from "express";
import { ServerConfig } from "./config/index.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
  console.log(`Successfully Started the Server on PORT: ${ServerConfig.PORT}`);
  await ServerConfig.connect();
});
