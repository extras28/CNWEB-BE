const express = require("express");
const cors = require("cors");
const app = express();
const database = require("./configs/database/index");
const accountRouter = require('./routes/accountRouter')

const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOpts));

app.use(
    express.json({
        limit: "50mb",
    })
);
app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
    })
);

// database connect
database.connect();

app.use(accountRouter, function(req, res, next){
    next();
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Your app listening at http://localhost:${PORT}`);
});
