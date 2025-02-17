const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const premiumRoutes = require('./routes/premiumRoutes');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const User = require("./models/User");
const Expense = require("./models/Expense");
const ForgotPasswordRequests = require('./models/ForgotPasswordRequests');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), 
  {flags: 'a' }
);

app.use(morgan('combined', {stream: accessLogStream}));
app.use(cors())
app.use(bodyParser.json());

User.hasMany(Expense , {foreignKey : "userId"})
Expense.belongsTo(User, {foreignKey: "userId"})
ForgotPasswordRequests.belongsTo(User, { foreignKey: 'userId' })

app.use('/user', authRoutes);
app.use('/expenses',expenseRoutes);
app.use('/payment', paymentRoutes);
app.use('/premium', premiumRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 8000);
  })
  .catch((err) => console.log("Error syncing database:", err));
  