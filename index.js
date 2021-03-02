const express = require("express");
const app = express();
const process = require('process');
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("mongodb");

const port = 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("AddService"));
app.use(express.static("orderImage"));
app.use(fileUpload());
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.wwwk6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const servicesCollection = client
    .db(process.env.DB_NAME)
    .collection("agencies");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
  const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
  console.log("Hello world");

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    file.mv(`${__dirname}/AddService/${file.name}`, (err) => {
      if (err) {
        return res.send({ message: "File Upload Failed" });
      }
     // return res.send({ name: file.name, path: `/${file.name}`, message: 'You have been added item successfully' });
    });
    const image = file.name;
    servicesCollection
      .insertOne({ title, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  //get all service list

  app.get("/getServices", (req, res) => {
    servicesCollection.find({}).limit(3)
    .toArray((err, data) => {
      res.send(data);
    });
  });

  //add client order

  app.post("/addOrder", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const productTitle = req.body.productTitle;
    const description = req.body.description;
    const price = req.body.price;
    const status = "Pending";
    const orderId = req.body.orderId;
    const filePath = `${__dirname}/orderImage/${file.name}`;
    file.mv(filePath, (err) => {
      if (err) {
        return res.send({ message: "file upload failed" });
      }
     //return res.send({ name: file.name, path: `/${file.name}`, msg: 'successfully ordered item' });
    });
    const image = file.name;
    ordersCollection
      .insertOne({
        name,
        email,
        productTitle,
        description,
        price,
        status,
        orderId,
        image,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });

  });

      // get single ordered item

      app.get("/getOrderedItem", (req, res) => {
        servicesCollection
          .find({ _id: ObjectID(req.query.id) })
          .toArray((err, documents) => {
            res.status(200).send(documents[0]);
          });
      });
      //search by email
      app.get('/orderedList', (req, res) => {
        ordersCollection
          .find({ email: req.query.email })
          .toArray((err, documents) => {
            res.send(documents);
          });
      });

      // get all ordered list

      app.get('/totalOrder', (req, res) =>{
        ordersCollection.find({})
        .toArray((err, documents)=>{
             res.send(documents);
        });
      });

  //post client review

  app.post('/review', (req, res) =>{
    const name = req.body.name;
    const photoURL = req.body.photoURL;
    const company = req.body.company;
    const description = req.body.description;
      reviewsCollection.insertOne({name, photoURL, company, description})
      .then(result =>{
        res.send(result.insertedCount>0);
      })
  });

  // get client feedback

  app.get('/feedback', (req, res) =>{
    reviewsCollection.find({}).limit(3)
    .toArray((err, documents) =>{
      res.send(documents);
    })
  });

  //process.on('unhandledRejection', (reason, p) => {
  //console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
//});

});

app.get("/", function (req, res) {
  res.send("hello world, Lets Enjoy!!");
});

app.listen(process.env.PORT || port);
