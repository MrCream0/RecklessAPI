const express = require('express'); //grab express
const mongoose = require('mongoose'); //grab mongoose
const Application = require('./models/appModel');//grab applicationsmodel 
const User = require("./models/userModel");//grab user model
const bcrypt = require("bcrypt"); //grab bcrypt
const auth = require("./authMiddleware");//grab auth middleware
const jwt = require("jsonwebtoken"); //grab jsonwebtokn
const app = express(); //create an instance of express
const port = 3000;
const cors = require("cors"); //grab cors

app.use(cors()); //use cors
app.use(express.json()); //middleware to parse json data
app.use(express.urlencoded({ extended: false })) //middleware to parse form data


//default route

app.get("/", (request, response) => {
    response.send("Hello API ")
});


//get all applications
app.get("/application", auth, async (request, response) => {
    if (!request.user.isAdmin) {
        return response.status(403).json({ message: "Forbidden Authentication, Access denied" });
    }
    try {
        const applications = await Application.find({});
        response.status(200).json(applications);
    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

//get one application
app.get("/application/:id", auth, async (request, response) => {

    try {
        const { id } = request.params;
        const application = await Application.findById(id);
        response.status(200).json(application);
    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});


//send application
app.post("/application", async (request, response) => {

    try {
        const application = await Application.create(request.body);
        response.status(201).json(application); //201 is created

    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

//update application?
app.put("/application/:id", async (request, response) => {

    try {
        const { id } = request.params;
        const application = await Application.findByIdAndUpdate(id, request.body);
        //aplication notn ofund
        if (!application) {
            return response.status(404).json({ message: `Application of id ${id} not found` });
        }
        const updatedApplication = await Application.findById(id);
        response.status(200).json(updatedApplication);
    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

//delete application
app.delete("/application/:id", auth, async (request, response) => {
    if (!request.user.isAdmin) {
        return response.status(403).json({ message: "Forbidden Authentication, Access denied" });
    }
    try {
        const { id } = request.params;
        const application = await Application.findByIdAndDelete(id);

        if (!application) {
            return response.status(404).json({ message: `Application of id ${id} not found` });
        }
        response.status(200).json({ message: `Application of id ${id} deleted` });
    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});


//register user
app.post("/register", async (request, response) => {

    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10);
        const user = new User({
            username: request.body.username,
            password: hashedPassword,
            isAdmin: request.body.isAdmin,
        });
        const savedUser = await user.save();
        response.status(201).json(savedUser);
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
});

app.post("/login", async (request, response) => {

    try {
        const user = await User.findOne({ username: request.body.username });
        if (!user) {
            return response.status(400).json({ message: "User Not Found!" });
        }

        const validPassword = await bcrypt.compare(request.body.password, user.password);
        if (!validPassword) {
            return response.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, "secret", { expiresIn: "1h" });
        response.status(200).json({ token: token });
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
})

mongoose.set("strictQuery", false)
mongoose.connect("mongodb+srv://admin:Th3p455wd@recklessdataapi.wg7pxyb.mongodb.net/Reckless-API?retryWrites=true&w=majority").then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
        console.log(`node API is running on ${port}`)
    })
}).catch(() => {
    console.log("MongoDB connection failed");
})
