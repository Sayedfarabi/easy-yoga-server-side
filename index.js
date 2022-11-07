const express = require("express");
const cors = require("cors");
const colors = require("colors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middle wares : 
app.use(cors());
app.use(express.json());

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;


const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.wfsi327.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function dbConnection() {
    try {
        await client.connect()
        console.log("Database connect".blue)
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
    }
}

dbConnection()

const Services = client.db("easyYoga").collection("services");
const Review = client.db("easyYoga").collection("review");

// app.get("services", (req, res) => {

// })



app.listen(port, () => {
    console.log(`This server running port on ${port}`);
})
