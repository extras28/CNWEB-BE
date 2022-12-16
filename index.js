const express = require("express");
const cors = require("cors");
const app = express();
const database = require("./configs/database/index");
const accountRouter = require("./routes/accountRouter");
const questionRouter = require("./routes/questionRouter");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOpts));

app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    uriDecodeFileNames: true,
    defParamCharset: 'utf8',
    abortOnLimit: true,
  }),
);
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(
    bodyParser.json({
        limit: "128mb",
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "128mb",
    })
);


// database connect
database.connect();

app.use(accountRouter, function (req, res, next) {
    next();
});

app.use(questionRouter, function (req, res, next) {
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Your app listening at http://localhost:${PORT}`);
});
