const express = require("express");
const cors = require("cors");
var multer = require("multer");
var upload = multer();
const database = require("./configs/database/index");
const accountRouter = require("./routes/accountRouter");
const questionRouter = require("./routes/questionRouter");
const tagRouter = require("./routes/tagRouter");
// const fileUpload = require("express-fileupload")
const bodyParser = require("body-parser");
const app = express();

// app.use(bodyParser.json());
// app.use(
//     bodyParser.urlencoded({
//         extended: true,
//     })
// );
const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOpts));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(accountRouter, function (req, res, next) {
    next();
});
// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

// database connect
database.connect();

app.use(questionRouter, function (req, res, next) {
    next();
});

app.use(tagRouter, function (req, res, next) {
    next();
});

app.use("/", (req, res) => {
    res.status(200).json({
        result: "success",
        message: "Deploy succeed <3",
    });
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Your app listening at http://localhost:${PORT}`);
// });
const http = require("http");
const { bindHttpServer } = require("./websocket");

let httpServer = http.createServer(app);

bindHttpServer(httpServer);

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Your app listening at http://localhost:${PORT}`);
});
