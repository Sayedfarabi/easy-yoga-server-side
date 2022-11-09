const express = require("express");
const cors = require("cors");
const colors = require("colors");
const app = express();
require("dotenv").config();
const jwt = require('jsonwebtoken');
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
const Users = client.db("easyYoga").collection("users");

// // For server Testing 

// app.get("/", (req, res) => {
//     res.send({
//         success: true,
//         message: "Server is connected"
//     })
// })

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

// Post data for review collection 

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

// Post api create for users collection 

app.post("/register", async (req, res) => {
    try {
        const { email } = req.body;
        const data = await Users.insertOne({ email })
        if (data.acknowledged) {
            res.send({
                success: true,
                message: "Successfully added the user"
            })
        } else {
            res.send({
                success: false,
                message: "Couldn't added the user"
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

// Post api created for JWT token verify 

app.post("/login", async (req, res) => {
    try {
        const { email } = req.body;
        const newEmail = email;
        if (!newEmail) {
            return res.send({
                success: false,
                message: "Please provide email address"
            })
        } else {
            const userEmail = await Users.findOne({ email: newEmail })
            if (!userEmail) {
                return res.send({
                    success: false,
                    message: "Email is doesn't exist"
                })
            } else {
                const tokenObj = {
                    email: newEmail
                }

                // console.log(tokenObj)
                const token = jwt.sign(tokenObj, process.env.ACCESS_TOKEN_SECRET);
                res.send({
                    success: true,
                    data: tokenObj,
                    token: token
                })
            }
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

app.get("/", async (req, res) => {
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

// Get service by Id 

app.get("/services/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Services.findOne({ _id: ObjectId(id) });
        console.log(service)
        res.send({
            success: true,
            data: service
        })
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// Get api for reviews by serviceId params 

app.get("/review/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const cursor = await Review.find({ serviceId: id });
        const reviews = await cursor.toArray();
        console.log(reviews)
        res.send({
            success: true,
            data: reviews
        })
    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
        res.send({
            success: false,
            message: error.message
        })
    }
})

// Get api for user reviews by pass email query 

app.get("/user-reviews", async (req, res) => {
    try {
        const userEmail = req.query?.email;
        if (userEmail) {
            const cursor = await Review.find({ email: userEmail });
            const reviews = await cursor.toArray();
            console.log(reviews)
            res.send({
                success: true,
                data: reviews
            })
        } else {
            console.log("doesn't exist data by query params")
            res.send("doesn't exist data by query params")
        }

    } catch (error) {
        console.log(error.name.bgRed, error.message.yellow)
        res.send({
            success: false,
            message: error.message
        })
    }
})

// Patch api create for user-review by review id 

app.patch("/user-reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Review.updateOne({ _id: ObjectId(id) }, { $set: req.body });

        if (result.matchedCount) {
            res.send({
                success: true,
                message: "Successfully updated"
            })
        } else {
            res.send({
                success: false,
                message: "Couldn't update the review"
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

// Delete api create for user-review by review id 

app.delete("/user-reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Review.deleteOne({ _id: ObjectId(id) })
        console.log(result)
        if (result.deletedCount) {
            res.send({
                success: true,
                message: "Successfully deleted"
            })
        } else {
            res.send({
                success: false,
                message: "Already deleted the review"
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

app.listen(port, () => {
    console.log(`This server running port on ${port}`);
})
