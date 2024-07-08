import express from "express";
import { ProductTransactionController } from "../../controller/index.js";

const router = express.Router();

router.get(
  "/initialize-database",
  ProductTransactionController.initializeDatabase
);

router.get("/transactions", ProductTransactionController.getAllTransaction);

router.get(
  "/transaction-statistics",
  ProductTransactionController.getTransactionStatistics
);

router.get("/bar-chart", ProductTransactionController.getBarChartData);

router.get("/pie-chart", ProductTransactionController.getPieChartData);

router.get("/combined-data", ProductTransactionController.getCombinedData);

export default router;
