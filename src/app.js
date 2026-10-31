const express = require('express');
const cookieParser = require('cookie-parser');
const authroutes = require('./routes/auth.route');

const accountRouter = require('./routes/account.route');
const transactionRoutes = require('./routes/transaction.route');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authroutes);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRoutes);

module.exports = app;