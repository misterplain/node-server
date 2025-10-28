const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const shortid = require("shortid");

const orderSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    datePlaced: { type: Date, required: true, default: Date.now },
    shortId: { type: String, default: shortid.generate },
    isGuest: { type: Boolean, required: true, default: false },
    emailAddress: { type: String },
    orderedItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    // paymentMethod: { type: String, required: true },
    // paymentResult: {
    //   id: { type: String },
    //   status: { type: String },
    //   update_time: { type: String },
    //   email_address: { type: String },
    // },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isCancelled: { type: Boolean, required: true, default: false },
    isPaid: { type: Boolean, required: true, default: true },
    // paidAt: { type: Date },
    isShippedToCourier: { type: Boolean, required: true, default: false },
    dateShipped: { type: Date, required: false },
    courierTrackingNumber: { type: String, required: false },
    isDelivered: { type: Boolean, required: true, default: false },
    dateDelivered: { type: Date, required: false },
    // deliveredAt: { type: Date },
  },
  {
    collection: "boilerPlateOrders",
  }
);

module.exports = mongoose.model("Orders", orderSchema);
