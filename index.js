const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.omgilvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const menuCollection = client
      .db("eleganceFood")
      .collection("menuCollection");
    const reviewCollection = client
      .db("eleganceFood")
      .collection("reviewCollection");
    const cartsCollection = client
      .db("eleganceFood")
      .collection("cartsCollection");
    const usersCollection = client
      .db("eleganceFood")
      .collection("usersCollection");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();

      res.send(result);
    });
    // user collection related api
    app.post("/user", async (req, res) => {
      const data = req.body;
      // check user already exist or not
      const email = data.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }

      const result = await usersCollection.insertOne(data);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    // cartCollection
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("test");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
