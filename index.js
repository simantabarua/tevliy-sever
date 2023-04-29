const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6v6p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
         client.connect()
        const database = client.db('tevliyDB');
        const toursCollection = database.collection('tours');
        const OrderCollection = database.collection('orders');
        const AdminCollection = database.collection('admins')
        // Get tours api for pagination
        app.get('/tours', async (req, res) => {
            const cursor = toursCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            if (page) {
                tours = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                tours = await cursor.toArray();
            }
            res.send({
                count,
                tours
            });
        });
        // one tours
        app.get('/tours/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            console.log('load user with id:', id);
            res.send(tour);
        });

        // add order 
        app.post("/placeOrder", async (req, res) => {
            const order = req.body;
            const result = await OrderCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });
        // delete order
        app.delete("/deleteOrder/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await OrderCollection.deleteOne(query);
            res.json(result);
        });
        // load all order 
        app.get("/orders", async (req, res) => {
            const orders = await OrderCollection.find({}).toArray();
            res.json(orders);

        });
        // load all order base on user email
        app.get("/myOrders/:email", async (req, res) => {
            const result = await OrderCollection.find({ email: req.params.email }).toArray();
            res.json(result);
        });
        // add Tour 
        app.post("/addTour", async (req, res) => {
            const tour = req.body;
            const result = await toursCollection.insertOne(tour);
            res.json(result);
        });
        //make Admin
        app.post("/makeAdmin", async (req, res) => {
            const admin = req.body;
            const result = await AdminCollection.insertOne(admin);
            res.json(result);
        });
        //load admin
        app.get("/admins", async (req, res) => {
            if (req.query.email) {
                const result = await AdminCollection.find({ email: req.query.email }).toArray();
                res.send(result?.length > 0);
            }
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("tevily server is running")
});

app.listen(port, () => {
    console.log("server running", port);

})