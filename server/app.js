const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const premiumRoutes = require('./routes/premiumRoutes');

const User = require("./models/User");
const Expense = require("./models/Expense");

const app = express();
const PORT = 8000;

app.use(cors())
app.use(bodyParser.json());

User.hasMany(Expense , {foreignKey : "userId"})
Expense.belongsTo(User, {foreignKey: "userId"})

app.use('/user', authRoutes);
app.use('/expenses',expenseRoutes);
app.use('/payment', paymentRoutes);
app.use('/premium', premiumRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully!");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log("Error syncing database:", err));
  