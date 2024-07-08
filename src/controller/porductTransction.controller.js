import axios from "axios";
import { StatusCodes } from "http-status-codes";
import ProductTransaction from "../models/productTransction.model.js";
import { ErrorResponse, SuccessResponse } from "../utils/common/index.js";

const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transaction = response.data;

    await ProductTransaction.insertMany(transaction);

    SuccessResponse.message = "Successfully initialize database with seed data";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

const getAllTransaction = async (req, res) => {
  try {
    const {
      month,
      pageNumber = 1,
      search = "",
      transactionPerPage = 10,
    } = req.query;
    const monthNumber = new Date(`${month}-01`).getMonth() + 1;

    const query = {
      $and: [
        { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] } },
        {
          $or: [
            { title: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
            { price: !isNaN(search) ? Number(search) : null },
          ].filter(Boolean), // Remove null values from the $or array
        },
      ],
    };

    const skipAmount = (pageNumber - 1) * transactionPerPage;

    const transactions = await ProductTransaction.find(query)
      .skip(skipAmount)
      .limit(parseInt(transactionPerPage));

    const totalDocumentCount = await ProductTransaction.find(
      query
    ).countDocuments();
    const totalPageCount = Math.ceil(totalDocumentCount / transactionPerPage);

    SuccessResponse.data = { transactions, totalPageCount };
    SuccessResponse.message = "Successfully fetched all the transactions";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

const getTransactionStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(`${month}-01`).getMonth(); // Ensure valid date format

    const transactions = await ProductTransaction.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber + 1] },
    });

    const totalSaleAmount = transactions.reduce(
      (acc, item) => acc + item.price,
      0
    );
    const totalSoldItems = transactions.filter((item) => item.sold).length;
    const totalNotSoldItems = transactions.filter((item) => !item.sold).length;

    SuccessResponse.data = {
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems,
    };
    SuccessResponse.message = "Successfully fetched the statistics.";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};
const getBarChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(`${month}-01`).getMonth(); // Ensure valid date format

    const transactions = await ProductTransaction.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber + 1] },
    });

    const priceRanges = {
      "0-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "501-600": 0,
      "601-700": 0,
      "701-800": 0,
      "801-900": 0,
      "901-above": 0,
    };

    transactions.forEach((item) => {
      switch (true) {
        case item.price <= 100:
          priceRanges["0-100"]++;
          break;
        case item.price <= 200:
          priceRanges["101-200"]++;
          break;
        case item.price <= 300:
          priceRanges["201-300"]++;
          break;
        case item.price <= 400:
          priceRanges["301-400"]++;
          break;
        case item.price <= 500:
          priceRanges["401-500"]++;
          break;
        case item.price <= 600:
          priceRanges["501-600"]++;
          break;
        case item.price <= 700:
          priceRanges["601-700"]++;
          break;
        case item.price <= 800:
          priceRanges["701-800"]++;
          break;
        case item.price <= 900:
          priceRanges["801-900"]++;
          break;
        default:
          priceRanges["901-above"]++;
          break;
      }
    });

    SuccessResponse.data = priceRanges;
    SuccessResponse.message = "Successfully fetched Bar Chart data.";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

const getPieChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(`${month}-01`).getMonth(); // Ensure valid date format

    const transactions = await ProductTransaction.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber + 1] },
    });

    const categories = {};

    transactions.forEach((item) => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    SuccessResponse.data = categories;
    SuccessResponse.message = "Successfully fetched Pie Chart data.";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

const getCombinedData = async (req, res) => {
  try {
    const { month } = req.query;

    const [
      transactionsResponse,
      statisticsResponse,
      barChartResponse,
      pieChartResponse,
    ] = await Promise.all([
      axios.get(`http://localhost:3000/api/v1/transactions?month=${month}`),
      axios.get(
        `http://localhost:3000/api/v1/transaction-statistics?month=${month}`
      ),
      axios.get(`http://localhost:3000/api/v1/bar-chart?month=${month}`),
      axios.get(`http://localhost:3000/api/v1/pie-chart?month=${month}`),
    ]);

    const combinedResponse = {
      transactions: transactionsResponse.data,
      statistics: statisticsResponse.data,
      barChart: barChartResponse.data,
      pieChart: pieChartResponse.data,
    };

    SuccessResponse.data = combinedResponse;
    SuccessResponse.message = "Successfully fetched the combined response.";

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

export default {
  initializeDatabase,
  getAllTransaction,
  getTransactionStatistics,
  getBarChartData,
  getPieChartData,
  getCombinedData,
};
