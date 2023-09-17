const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9t60goe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const quadbDatas = client.db("quadB").collection("quadBDatas");

    // find top 10 datas from the link and sorting
    app.get("/api/tickers", async (req, res) => {
      try {
        const response = await fetch("https://api.wazirx.com/api/v2/tickers");
        const data = await response.json();
        const dataArray = Object.entries(data);
        // sorting top 10 datas
        dataArray.sort((a, b) => b[1].last - a[1].last);
        // Slice the top 10 datas
        const slicedData = dataArray
          .slice(0, 10)
          .reduce((result, [key, value]) => {
            result[key] = value;
            return result;
          }, {});

        res.json(slicedData);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      }
    });

    app.get("/api/datas", async (req, res) => {
      const query = {};
      const options = await quadbDatas.find(query).toArray();
      console.log(options);
      res.send(options);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("server is running");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
