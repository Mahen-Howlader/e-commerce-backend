const express = require("express")
const cors = require("cors")
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config()
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}

// middleware
app.use(cors(corsOptions))
app.use(express.json())



// mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ecommerce:cXwnbkw6PoUvc1GF@cluster0.iagloem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version


// ecommerce
// cXwnbkw6PoUvc1GF

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    const allProduct = client.db("ecommerces").collection("products");
    const userCollection = client.db("ecommerces").collection("user");

    app.get("/populardata", async (req, res) => {
      const { sort } = req?.query;
      const query = {};
      const options = {
        new_price: sort === "asc" ? 1 : -1
      }
      const result = await allProduct.find(query, options).toArray()
      res.send(result)
    })
    app.get("/kidscollection", async (req, res) => {
      const { filter } = req?.query;
      // console.log(req?.query)
      const page = parseInt(req?.query?.page);
      const size = parseInt(req?.query?.size);
      const sort = req?.query?.sort;
      const query = { category: filter };

      let AllData = await allProduct.find(query).skip(page * size).limit(size);

      if (sort === "asc") {
        AllData = AllData.sort({ "new_price": 1 })
      } else if (sort === "dec") {
        AllData = AllData.sort({ "new_price": -1 })
      }

      const count = await allProduct.countDocuments(query);

      try {
        const result = await AllData.toArray();
        res.send({ result, count });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
      }
    })
    app.get("/kid/:id", async (req, res) => {
      // Send the fetched result
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await allProduct.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "Product not found" });
        }
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
      }
    })
    app.get("/women/:id", async (req, res) => {
      // Send the fetched result
      try {
        const id = req.params.id;

        const query = { _id: new ObjectId(id) };

        const result = await allProduct.findOne(query);


        if (!result) {
          return res.status(404).send({ message: "Product not found" });
        }


        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
      }
    })
    app.get("/men/:id", async (req, res) => {
      // Send the fetched result
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await allProduct.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "Product not found" });
        }
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
      }
    })

    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.delete("/user/:id", async (req, res) => {
      console.log(req.body)

      const id = req?.params?.id;
      const query = {
        _id: new ObjectId(id)
      };
      const result = await userCollection.deleteOne(query);
      res.send(result)

    })

    app.post("/user", async (req, res) => {
      console.log(req?.body)
      const user = req?.body;
      const email = user?.email;

      const query = {
        email: email
      };
      const queryResult = await userCollection.findOne(query);
      if (queryResult) {
        return req.send({ message: "User already exist", insertedId: null })
      }

      const result = await userCollection.insertOne(user)
      res.send(result)
    })


    app.patch(`/rolechange/admin/:email`, async (req, res) => {
      try {
        const email = req.params.email; // Get the email from the URL parameters
        const role = req.body.role; // Get the role from the request body

        // Construct the query to find the user by email
        const query = { email: email };

        // Construct the update document to set the new role
        const updateDoc = {
          $set: { role: role }
        };

        // Update the user's role in the database
        const result = await userCollection.updateOne(query, updateDoc);

        // Check if a document was modified
        if (result.modifiedCount > 0) {
          res.send({ success: true, message: "User role updated successfully.", data: result });
        } else {
          res.status(404).send({ success: false, message: "User not found or role not changed." });
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).send({ success: false, message: "Server error while updating user role." });
      }
    });



  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
