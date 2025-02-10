const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const User = require("./models/user");

const app = express();
const PORT = 8000;

app.use(cors())
app.use(bodyParser.json());


app.use('/auth', authRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully!");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log("Error syncing database:", err));
  