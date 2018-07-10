const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    name: String,
    email: String,
    residenceID: Number
});

const bankSchema = new Schema({
    city: String,
    county: String,
    district: String,
    location: String
});

const accountSchema = new Schema({
    personID: String,
    accountIBAN: String,
    bankID: String,
    balance: Number
});

const transactionSchema = new Schema({
    senderID: String,
    receiverID: String,
    amount: Number
});

module.exports = {
    customer: mongoose.model("Customer", customerSchema),
    bank: mongoose.model("Bank", bankSchema),
    account: mongoose.model("Account", accountSchema),
    transaction: mongoose.model("Transaction", transactionSchema)
};