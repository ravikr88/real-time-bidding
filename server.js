const express = require("express");
const itemsRoute = require("./api-endpoints/items.js");
const usersRoute = require("./api-endpoints/users.js");
const notificationsRoute = require("./api-endpoints/notifications.js");
const bidsRoute = require("./api-endpoints/bids.js");

require("dotenv").config();
// const db = require("./database/db.js");

const app = express();
app.use(express.json()); // includes bodyParser

//

app.use("/users", usersRoute);
app.use("/items", itemsRoute);
app.use("/notifications", notificationsRoute);
app.use("/bids", bidsRoute);
//

const port = process.env.PORT || 5001;
console.clear();
app.listen(port, () => {
  console.log(`Server is up and listening on port: ${port}`);
});
