import mongoose from "mongoose";

const producTransactionSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
  dateOfSale: {
    type: Date,
  },
  sold: {
    type: Boolean,
  },
});

const ProductTransaction = mongoose.model(
  "Transaction",
  producTransactionSchema
);
export default ProductTransaction;
