const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
app.use(cors());
const port = process.env.PORT || 5100;
app.use(express.json());

const corsConfig = {
  origin: "",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

// Connect to DB
require("./mongodb/conection");
const Chat = require("./models/chat");

// verify jwt
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@teamhexacoders.ek82ng1.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db("jobstack-database").collection("users");
    const jobsCollection = client.db("jobstack-database").collection("jobs");
    const selfpostCollection = client
      .db("jobstack-database")
      .collection("selfpost");
    const educationCollection = client
      .db("jobstack-database")
      .collection("education");
    const skillsCollection = client
      .db("jobstack-database")
      .collection("skills");
    const projectCollection = client
      .db("jobstack-database")
      .collection("project");
    const worksCollection = client
      .db("jobstack-database")
      .collection("experience");
    const conectionCollection = client
      .db("jobstack-database")
      .collection("conection");
    const likesCollection = client.db("jobstack-database").collection("likes");
    const commentsCollection = client
      .db("jobstack-database")
      .collection("comments");
    const jobapplyCollection = client
      .db("jobstack-database")
      .collection("jobapply");
    const bookmarkCollection = client
      .db("jobstack-database")
      .collection("bookmark");
    const reviewCollection = client
      .db("jobstack-database")
      .collection("reviews");
    const newsCollection = client.db("jobstack-database").collection("news");
    const jobtaskCollection = client
      .db("jobstack-database")
      .collection("jobtask");
    const assignmentCollection = client
      .db("jobstack-database")
      .collection("assignment");
    const newcommentCollection = client
      .db("jobstack-database")
      .collection("article-comment");
    const eventCollection = client.db("jobstack-database").collection("event");
    const articleCollection = client
      .db("jobstack-database")
      .collection("user-article");
    const reportCollection = client
      .db("jobstack-database")
      .collection("post-report");
    const userreportCollection = client
      .db("jobstack-database")
      .collection("user-report");

    // verify jwt this api sequre to website user must verify
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      console.log(token);
      res.send({ token });
    });

    // allusers get this api just admin get      TO DO  verifyJWT
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // check admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Admin

    app.get("/admin-stats", async (req, res) => {
      const users = await usersCollection.estimatedDocumentCount();
      const job = await jobsCollection.estimatedDocumentCount();
      const selfpost = await selfpostCollection.estimatedDocumentCount();
      const jobapply = await jobapplyCollection.estimatedDocumentCount();

      res.send({
        users,
        job,
        selfpost,
        jobapply,
      });
    });

    // ***************** USER HANDLE API *************************

    // this api job find single email data and provide to user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // Get user by Id

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // user get by role as a company

    app.get("/company/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { company: user?.role === "company" };
      res.send(result);
    });

    //  get API dynamicuser

    app.get("/dynamicuser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // Get user by search field

    app.get("/users-search/:text", async (req, res) => {
      const text = req.params.text;
      const result = await usersCollection
        .find({
          $or: [{ name: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.delete("/deleteuser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    //alluser data post this api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ error: "user Alredy exsits" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // ==========================================================

    app.post("/api/chat", async (req, res) => {
      try {
        const { senderId, receiverId } = req.body;
        const newChat = new Chat({ members: [senderId, receiverId] });
        await newChat.save();
        res.status(200).send("Chat created successfully");
      } catch (error) {
        console.log(error, "Error");
      }
    });

    // ==============================================================

    // ***************** USER HANDLE END *************************

    // **************** PROFILE HANDLE START ********************

    app.put("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const bgImage = req.body.bgImage;
      const image = req.body.image;
      const filter = { _id: new ObjectId(id) };
      if (bgImage) {
        const updateDoc = {
          $set: {
            bgImage: bgImage,
          },
        };

        const options = { upsert: true };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } else {
        const updateDoc = {
          $set: {
            image: image,
          },
        };
        const options = { upsert: true };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      }
    });

    // Update Profile Information API

    app.put("/editprofile/:userId", async (req, res) => {
      const userId = req.params.userId;
      const { name, image, bio, currentLocation, bgImage } = req.body;
      const query = { _id: new ObjectId(userId) };
      const updateFields = {};
      if (name !== undefined) {
        updateFields.name = name;
      }
      if (image !== undefined) {
        updateFields.image = image;
      }
      if (bio !== undefined) {
        updateFields.bio = bio;
      }
      if (currentLocation !== undefined) {
        updateFields.currentLocation = currentLocation;
      }
      if (bgImage !== undefined) {
        updateFields.bgImage = bgImage;
      }
      const updateOperation = { $set: updateFields };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        query,
        updateOperation,
        options
      );
      res.send(result);
    });

    // Contact info Update API

    app.put("/contactinfo/:id", async (req, res) => {
      const id = req.params.id;
      const phoneNumber = req.body.phoneNumber;
      const currentLocation = req.body.currentLocation;
      const homeLocation = req.body.homeLocation;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          phoneNumber: phoneNumber,
          currentLocation: currentLocation,
          homeLocation: homeLocation,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //  basic info update by ID

    app.put("/basicinfo/:id", async (req, res) => {
      const id = req.params.id;
      const gender = req.body.gender;
      const language = req.body.language;
      const date = req.body.date;
      const month = req.body.month;
      const year = req.body.year;
      const hobbys = req.body.hobbys;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          gender: gender,
          language: language,
          date: date,
          month: month,
          year: year,
          hobbys: hobbys,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // ******************* PROFILE HANDLE END *********************

    // ******************** JOBS HANDLE START **********************

    //   get job related api

    app.get("/job", async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // app.get("/job", verifyJWT, async (req, res) => {
    //   const email = req.query.email;
    //   console.log(email);
    //   if (!email) {
    //     res.send([]);
    //   }
    //   const decodedEmail = req.decoded.email;
    //   if (email !== decodedEmail) {
    //     return res
    //       .status(403)
    //       .send({ error: true, message: "forbidden access" });
    //   }
    //   const query = { email: email };
    //   const result = await jobsCollection.find(query).toArray();
    //   res.send(result);
    // });

    // get job API by id

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const result = await jobsCollection
        .find({ _id: new ObjectId(id) })
        .toArray();
      res.send(result);
    });

    // get email by job post

    app.get("/job/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await jobsCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // job post related api

    app.post("/job", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await jobsCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // get job API by id

    app.get("/jobtask/:email", async (req, res) => {
      const result = await jobtaskCollection
        .find({ email: req.params.applyEmail })
        .toArray();
      res.send(result);
    });

    // job Task related api

    app.post("/jobtask", async (req, res) => {
      const body = req.body;
      const result = await jobtaskCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // submit assignment Get api

    app.get("/assignment/:email", async (req, res) => {
      const result = await assignmentCollection
        .find({ email: req.params.applyEmail })
        .toArray();
      res.send(result);
    });

    // submit assignment post api

    app.post("/assignment", async (req, res) => {
      const body = req.body;
      const result = await assignmentCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // get email by bookmark job post

    app.get("/bookMarkJobs/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await bookmarkCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // bookmark job post

    app.post("/bookMarkJobs", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await bookmarkCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    app.get("/jobsapply/:applyEmail", async (req, res) => {
      const result = await jobapplyCollection
        .find({ applyEmail: req.params.applyEmail })
        .toArray();
      res.send(result);
    });

    app.get("/appliedmember/:jobPostEmail", async (req, res) => {
      const result = await jobapplyCollection
        .find({ jobPostEmail: req.params.jobPostEmail })
        .toArray();
      res.send(result);
    });

    app.post("/jobapply", async (req, res) => {
      const body = req.body;
      const result = await jobapplyCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ******************* JOBS HANDLE START **********************

    // ******************* SELF POST HANDLE START *****************

    // self post related api

    app.get("/selfpost", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await selfpostCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // selfpost by email api

    app.get("/selfpost/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await selfpostCollection
        .find({ email: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // self post delete related api

    app.delete("/selfpost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selfpostCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/updatepost/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          text: body.text,
        },
      };
      const options = { upsert: true };
      const result = await selfpostCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // self post related api

    app.post("/selfpost", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await selfpostCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ***************** SELF POST HANDLE END *********************

    // ***************** LIKES HANDLE START ***********************

    // likes get API

    app.get("/likes", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await likesCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/likes", (req, res) => {
      postMessage
        .findByIdAndUpdate(
          req.body.postId,
          {
            $push: { like: req.user._id },
          },
          {
            new: true,
          }
        )
        .exec((err, result) => {
          if (err) {
            return res.status(422).json({ error: err });
          } else {
            res.json(result);
          }
        });
    });

    app.put("/unlikes", (req, res) => {
      postMessage
        .findByIdAndUpdate(
          req.body.postId,
          {
            $pull: { like: req.user._id },
          },
          {
            new: true,
          }
        )
        .exec((err, result) => {
          if (err) {
            return res.status(422).json({ error: err });
          } else {
            res.json(result);
          }
        });
    });

    // Likes Post ApI

    app.post("/likes", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await likesCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ************** LIKES HANDLE END ************************

    // ************** COMMENTS HANDLE START *******************

    // Comment get API by id

    app.get("/comment/:postId", async (req, res) => {
      const result = await commentsCollection
        .find({ postId: req.params.postId })
        .toArray();
      res.send(result);
    });

    // Comments Post ApI

    app.post("/comments", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await commentsCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ======================================

    app.get("/post-report", async (req, res) => {
      const result = await reportCollection.find().toArray();
      res.send(result);
    });

    app.post("/post-report", async (req, res) => {
      const item = req.body;
      const result = await reportCollection.insertOne(item);
      res.send(result);
    });

    app.get("/user-report", async (req, res) => {
      const result = await userreportCollection.find().toArray();
      res.send(result);
    });

    app.post("/user-report", async (req, res) => {
      const item = req.body;
      const result = await userreportCollection.insertOne(item);
      res.send(result);
    });

    //  ************ CONNECT REQUEST HANDLE START *******************

    // Connect Request get api

    app.get("/connectrequest", async (req, res) => {
      const result = await conectionCollection.find().toArray();
      res.send(result);
    });

    app.get("/connectrequest/:email", async (req, res) => {
      const result = await conectionCollection
        .find({ userEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/connectrequest/:id", async (req, res) => {
      const id = req.params.id;
      const result = await conectionCollection
        .find({ userID: new ObjectId(id) })
        .toArray();
      res.send(result);
    });

    app.get("/followingrequest/:email", async (req, res) => {
      const result = await conectionCollection
        .find({ requestemail: req.params.email })
        .toArray();
      res.send(result);
    });

    // Connect Request post api

    app.post("/connectrequest", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await conectionCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    app.delete("/deleterequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await conectionCollection.deleteOne(query);
      res.send(result);
    });

    // Connect Request Accept API

    app.patch("/conformrequest/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const updateDoc = {
        $set: {
          status: "aproved",
        },
      };
      const result = await conectionCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // *************** CONNECT REQUEST HANDLE END *********************

    // *************** EDUCATION HALDLE START *************************

    //   Education get by email related API

    app.get("/education/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await educationCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // Education post related api

    app.post("/education", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await educationCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ******************** EDUCATION HANDLE END *******************

    // ******************* SKILLS HANDLE START *********************

    //   Skills get by email related API

    app.get("/skills/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await skillsCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/skill/:id", async (req, res) => {
      const id = req.params.id;
      const result = await skillsCollection
        .find({ _id: new ObjectId(id) })
        .toArray();
      res.send(result);
    });

    //  delete skills api

    app.delete("/skill/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await skillsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/updateskills/:id", async (req, res) => {
      const id = req.params.id;
      const { skillrate } = req.body;
      const updatefield = {};
      const query = { _id: new ObjectId(id) };
      if (skillrate !== undefined) {
        updatefield.skillrate = skillrate;
      }

      const updateOperation = { $set: updatefield };
      const result = await skillsCollection.updateOne(query, updateOperation);
      res.send(result);
    });

    // Skills post related api

    app.post("/skills", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await skillsCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ****************** SKILLS HANDLE END *********************

    // ****************** WORKS HANDLE START ********************

    //   Works get by email related API

    app.get("/works/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await worksCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/getwork/:id", async (req, res) => {
      const id = req.params.id;
      const result = await worksCollection
        .find({ _id: new ObjectId(id) })
        .toArray();
      res.send(result);
    });

    app.put("/updatework/:id", async (req, res) => {
      const id = req.params.id;
      const {
        company,
        position,
        location,
        description,
        workstatus,
        startyear,
        endYear,
      } = req.body;
      const query = { _id: new ObjectId(id) };
      const updatefield = {};
      if (company !== undefined) {
        updatefield.company = company;
      }
      if (position !== undefined) {
        updatefield.position = position;
      }
      if (location !== undefined) {
        updatefield.location = location;
      }
      if (description !== undefined) {
        updatefield.description = description;
      }
      if (workstatus !== undefined) {
        updatefield.workstatus = workstatus;
      }
      if (startyear !== undefined) {
        updatefield.startyear = startyear;
      }
      if (endYear !== undefined) {
        updatefield.endYear = endYear;
      }

      const updateOperation = { $set: updatefield };
      const result = await worksCollection.updateOne(query, updateOperation);
      res.send(result);
    });

    app.delete("/deletework/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await worksCollection.deleteOne(query);
      res.send(result);
    });

    // Works post related api

    app.post("/works", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await worksCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ****************** WORKS HANDLE END **********************

    // ****************** PROJECTS HANDLE START *****************

    //   Projects get by email related API

    app.get("/project/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await projectCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    //  Project get by Id

    app.get("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const result = await projectCollection
        .find({ _id: new ObjectId(id) })
        .toArray();
      res.send(result);
    });

    // Project delete Api

    app.delete("/deletproject/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await projectCollection.deleteOne(query);
      res.send(result);
    });

    // Project Update Api

    app.put("/updateProject/:id", async (req, res) => {
      const id = req.params.id;
      const {
        projectTitle,
        projectDescription,
        liveLink,
        codeLink,
        duration,
        workduration,
      } = req.body;
      const query = { _id: new ObjectId(id) };
      const updateFields = {};
      if (projectTitle !== undefined) {
        updateFields.projectTitle = projectTitle;
      }
      if (projectDescription !== undefined) {
        updateFields.projectDescription = projectDescription;
      }
      if (liveLink !== undefined) {
        updateFields.liveLink = liveLink;
      }
      if (codeLink !== undefined) {
        updateFields.codeLink = codeLink;
      }
      if (duration !== undefined) {
        updateFields.duration = duration;
      }
      if (workduration !== undefined) {
        updateFields.workduration = workduration;
      }
      const updateOperation = { $set: updateFields };
      const options = { upsert: true };
      const result = await projectCollection.updateOne(
        query,
        updateOperation,
        options
      );
      res.send(result);
    });

    //  Projects post related api

    app.post("/project", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await projectCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ***************** PROJECTS HANDLE END *********************

    // News-article colletion API

    app.get("/news-article", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await newsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/news-article/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.findOne(query);
      res.send(result);
    });

    app.post("/news-article", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await newsCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    app.delete("/deletearticle/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.deleteOne(query);
      res.send(result);
    });

    // Article Comment get API by id

    app.get("/articlecomments/:postId", async (req, res) => {
      const result = await newcommentCollection
        .find({ postId: req.params.postId })
        .toArray();
      res.send(result);
    });

    //Article Comments Post ApI

    app.post("/articlecomments", async (req, res) => {
      const body = req.body;
      const result = await newcommentCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // review colletion API

    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const item = req.body;
      const result = await reviewCollection.insertOne(item);
      res.send(result);
    });

    // ==========================================

    app.get("/events/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await eventCollection
        .find({ email: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // Event get API

    app.get("/events", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await eventCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // Event post API

    app.post("/event", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await eventCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // User- Article Api

    app.get("/user-article/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await articleCollection
        .find({ email: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // Event get API

    app.get("/user-article", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await articleCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/user-article/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articleCollection.findOne(query);
      res.send(result);
    });

    // Event post API

    app.post("/user-article", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await articleCollection.insertOne(body);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    // ======================================================================

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Jobstack Network bullidng platfrom server successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Jobstack Network bullidng platfrom server is running");
});

app.listen(port, (req, res) => {
  console.log(
    `Jobstack Network bullidng platfrom server is running on port ${port}`
  );
});
