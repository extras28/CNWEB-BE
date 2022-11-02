const express = require("express");
const cors = require("cors");
const app = express();
const database = require("./configs/database/index");

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

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
