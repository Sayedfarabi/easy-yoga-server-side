const express = require("express");
const cors = require("cors");
const colors = require("colors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

// Post data for services 

app.post("/services", async (req, res) => {
    try {
        const data = req.body;
        const result = await Services.insertOne(data);
        // console.log(result)
        if (result.acknowledged) {
            console.log("services add to db successful")
            res.send({
                success: true,
                message: "successfully created the service"
            })
        } else {
            console.log("can't create the service".yellow)
            res.send({
                success: false,
                message: "couldn't create the service"
            })

        }
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
        res.send({
            success: false,
            message: error.message
        })
    }
})



app.post("/add-review", async (req, res) => {
    try {
        const data = req.body;
        const result = await Review.insertOne(data)
        if (result.acknowledged) {
            console.log("review add to db successful")
            res.send({
                success: true,
                message: "successfully created the review"
            })
        } else {
            console.log("can't create the review".yellow)
            res.send({
                success: false,
                message: "couldn't create the review"
            })
        }
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
        res.send({
            success: false,
            message: error.message
        })
    }
})

// Get Three data for homepage 

app.get("/three-service", async (req, res) => {
    try {
        const query = {};
        const cursor = Services.find(query)
        const data = await cursor.limit(3).toArray();
        res.send(data)
        console.log(data)
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
        res.send({
            success: false,
            message: "can't get limitation services"
        })
    }
})

// Get All data for services route 

app.get("/services", async (req, res) => {
    try {
        const services = await Services.find({}).toArray()
        if (!services) {
            res.send({
                success: false,
                message: "Services collection does not exist"
            })
        } else {
            res.send({
                success: true,
                message: "successfully got all data",
                data: services
            })
        }
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
        res.send({
            success: false,
            error: error.message
        })
    }
})





app.listen(port, () => {
    console.log(`This server running port on ${port}`);
})
