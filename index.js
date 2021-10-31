const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6v6p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);


async function run() {
    try {
        await client.connect()
        const database = client.db('tevliyDB');
        const toursCollection = database.collection('tours');
        // Get tours api 
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
        // Use POST to get data by keys
        app.post('/tours/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const tours = await toursCollection.find(query).toArray();
            res.send(tours);
        });


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("running")
});

app.listen(port, () => {
    console.log("server running", port);

})