const express = require('express')

const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.o1cg3.mongodb.net/${ process.env.DB_NAME }?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 5050

app.get('/', function (req, res)
{
    res.send('server connected')
})

client.connect(err =>
{
    const serviceCollection = client.db("carfixingdb").collection("services");
    const reviewCollection = client.db("carfixingdb").collection("reviews");
    const orderCollection = client.db("carfixingdb").collection("orders");
    const adminCollection = client.db("carfixingdb").collection("admins");

    app.post('/addService', (req, res) =>
    {
        const newService = req.body;

        serviceCollection.insertOne(newService)
            .then(result =>
            {
                res.send(result.insertedCount > 0)
            })
            .then(error => console.log(error))
    })

    app.get('/services', (req, res) =>
    {
        const query = req.query;

        serviceCollection.find(query)

            .toArray((error, data) =>
            {
                res.send(data);
            })
    })

    app.delete('/service/:id', (req, res) =>
    {
        const id = ObjectID(req.params.id);

        serviceCollection.findOneAndDelete({ _id: id })
            .then(result =>
            {
                res.json({ success: !!result.value })
            })
            .then(error =>
            {
                console.log(error);
            })
    })

    app.post('/addReview', (req, res) =>
    {
        const newReview = req.body;

        reviewCollection.insertOne(newReview)
            .then(result =>
            {
                res.send(result.insertedCount > 0)
            })
            .then(error => console.log(error))
    })

    app.get('/reviews', (req, res) =>
    {
        const query = req.query;

        reviewCollection.find(query)

            .toArray((error, data) =>
            {
                res.send(data);
            })
    })

    app.post('/addOrder', (req, res) =>
    {
        const orders = req.body;
        orderCollection.insertOne(orders)
            .then(result =>
            {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/orders', (req, res) =>
    {
        const query = req.query;
        orderCollection.find(query)
            .toArray((err, documents) =>
            {
                res.send(documents);
            })
    })

    app.patch("/update/:id", (req, res) =>
    {
        const id = ObjectID(req.params.id);

        orderCollection.updateOne(
            { _id: id },
            {
                $set: { status: req.body.updateStatus }
            }
        )
            .then(result =>
            {
                res.send(result);
            })
            .then(error =>
            {
                console.log(error);
            })
    })

    app.post('/addAdmin', (req, res) =>
    {
        const admins = req.body;

        adminCollection.insertOne(admins)
            .then(result =>
            {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) =>
    {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) =>
            {
                res.send(admins.length > 0);
            })
    })
});


app.listen(port)