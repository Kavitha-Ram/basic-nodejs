// server.js
// where your node app starts

// init project
const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const routes = require("./routes/santaRoutes");
const nodeCron = require("node-cron");
require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME, // generated ethereal user
    pass: process.env.SMTP_PASSWORD, // generated ethereal password
  },
});

app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded()); // parse data
app.use(morgan("combined"));

// Task scheduler for nodejs
nodeCron.schedule("*/15 * * * * *", function () {
  try {
    if (fs.existsSync("./santaMail.json")) {
      fs.readFile("./santaMail.json", "utf8", async (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        if (data) {
          const santaMail = JSON.parse(data);
          //parse the json data
          // send mail to santa every 15 seconds
          santaMail.map(async (mailList) => {
          let mail = JSON.parse(mailList);
            const { username, address, gifts } = mail;
            await transporter.sendMail({
              from: process.env.SMTP_SENDER,
              to: process.env.SMPT_RECEIVER,
              subject: "Incoming gift alert!",
              html: `<b>${username} has asked for ${gifts} to the address ${address}</b>`,
            });
          });
          // delete the json data after sending email
          fs.truncate("./santaMail.json", (err) => {
            if (err) {
              console.log(err);
              return;
            }
          });
        }
      });
    } else {
      console.log("no messages to send");
    }
  } catch (error) {
    console.log(error);
  }
});

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.render("index");
});
app.use("/api", routes);

const port = process.env.PORT || 3000;

// listen for requests
app.listen(port, () => {
  console.log(`App is running at ${port}`);
});
