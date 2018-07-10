//Packages used
const mongoose = require("mongoose");
const faker = require("faker");

//Faker settings
faker.locale = "tr";

//Database configurations
const dbConfig = require('./config/dbconfig');
mongoose.Promise = global.Promise;
let db = mongoose.connection;

//Object containing MongoDB schemas
const schemas =require("./modules.js");

//MongoDB Schemas
const Customer = schemas.customer;
const Bank = schemas.bank;
const Account = schemas.account;
const Transaction = schemas.transaction;

//Connecting to the database
mongoose.connect("mongodb://localhost:27017");

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let cities = ['Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale',
    'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
    'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir',
    'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya',
    'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya',
    'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
    'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
    'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'];
//let residenceIDs = [];
//let ibans = [];

function customerGenerator(){
    let newId = Math.floor(Math.random() * 900000000000) + 100000000000;
    /*
    while(residenceIDs.indexOf(newId) !== -1)
    {
        newId = Math.floor(Math.random() * 900000000000) + 100000000000;
    }
    */
    //residenceIDs.push(newId);
    let customer = new Customer({
        name: faker.name.findName(),
        email: faker.internet.email(),
        residenceID: newId
    });
    return customer.save();
}  //Returns a promise

function bankGenerator()
{
    let cityIndex = Math.floor(Math.random() * cities.length);
    let bank = new Bank({
        city: cities[cityIndex],
        county: faker.address.county(),
        district: faker.address.streetName()
    });

    return bank.save();
}

function accountGenerator(customerId, bankId)
{
    let iban = faker.finance.iban();
    /*
    while(ibans.indexOf(iban) !== -1)
    {
        iban = faker.finance.iban();
    }
    */
    //ibans.push(iban);
    let balance = (Math.random() * 1000000).toFixed(2);
    let account = new Account({
        personID: customerId,
        accountIBAN: iban,
        bankID: bankId,
        balance: balance
    });

    return account.save();
}

function transactionGenerator(senderId, receiverId, amount)
{
    let transaction = new Transaction({
        senderID: senderId,
        receiverID: receiverId,
        amount: amount
    });

    return transaction.save();
}


async function driver(customerCount, bankCount)
{
    let customerPromises = [];
    let bankPromises = [];
    let accountPromises = [];
    let transactionPromises = [];
    for(let customer = 0; customer < customerCount; customer++)
    {
        let customerPromise = await customerGenerator();
        customerPromises.push(customerPromise);
    }
    await Promise.all(customerPromises);
    let customers = await Customer.find({}); //Has the query from containing all of the customers
    console.log("No of customers: " + customers.length);

    for(let bank = 0; bank < bankCount; bank++)
    {
        let bankPromise = await bankGenerator();
        bankPromises.push(bankPromise);
    }
    await Promise.all(bankPromises);
    let banks = await Bank.find({});
    console.log("No of banks: " + banks.length);

    for(let each = 0; each < customers.length; each++)
    {
        let accNo = Math.floor(Math.random() * 5) + 1; //Account number per customer
        for(let acc = 0; acc < accNo; acc++)
        {
            let bankIndex = Math.floor(Math.random() * bankCount); //banks[bankIndex] accesses a bank
            let bankId = banks[bankIndex]._id;
            let customerId = customers[each]._id;
            let accountPromise = accountGenerator(customerId, bankId);
            accountPromises.push(accountPromise);
        }
    }
    await Promise.all(accountPromises);
    let accounts = await Account.find({});
    console.log("No of accounts: " + accounts.length);

    for(let acc = 0; acc < accounts.length; acc++)
    {
        let transactionCount = Math.floor(Math.random() * 10);
        for(let opNo = 0; opNo < transactionCount; opNo++)
        {
            let amount = (Math.random() * (accounts[acc].balance / 100)).toFixed(2);
            let receiverIndex = Math.floor(Math.random() * accounts.length);
            while(receiverIndex === acc)
            {
                receiverIndex = Math.floor(Math.random() * accounts.length);
            }
            let transactionPromise = transactionGenerator(accounts[acc]._id,
                                        accounts[receiverIndex]._id, amount);
            transactionPromises.push(transactionPromise);
        }
    }
    await Promise.all(transactionPromises);
    let transactions = await Transaction.find({});
    console.log("No of transactions: " + transactions.length);
}

driver(5000,60);
