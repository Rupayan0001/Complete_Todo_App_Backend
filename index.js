const { userModel, todoModel } = require("./db")
const { auth, JWT_SECRET } = require("./auth")
const express = require("express");
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const zod = require("zod");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL)

const app = express();
const allowedOrigins = "https://complete-todo-app-git-main-rupayan0001s-projects.vercel.app";
// https://complete-todo-app.vercel.app
app.use(cors({
    origin: allowedOrigins, // Allow only the Vercel URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // Allow credentials if necessary (for cookies, tokens, etc.)
}));
app.use(express.json());
const signupSchema = zod.object({
    email: zod.string().email({ message: "Invalid email address" }),
    name: zod.string().min(2, { message: "Name must be atleast 2 characters long" })
})

const passwordSchema = zod.string().refine(val => {
    const has8Characters = val.length >= 8

    const hasSpecialCharacters = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    const hasNumbers = /\d/.test(val);

    const hasLowerCase = /[a-z]/.test(val);

    const hasUpperCase = /[A-Z]/.test(val);

    return hasSpecialCharacters && hasNumbers && hasLowerCase && hasUpperCase && has8Characters;

}, {
    message: "Password must contain atleast one special character, one Number, one lowercase character, one uppercase character and has to be atleast 8 characters long"
})

app.post("/signup", async (req, res) => {
    console.log(req.body.password)
    try {
        const result = signupSchema.safeParse(req.body)
        if (!result.success) {
            // If validation fails, map through the errors and send all error messages
            console.log(result)
            const errors = result.error.errors.map((err) => err.message);
            return res.status(400).json({ message: errors });
        }
        passwordSchema.parse(req.body.password);

        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        const ans = await userModel.create({
            password: hashedPassword,
            email,
            name,
        })

        res.json({
            message: "You are signed up ✔"
        })

    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: "Email already exits"
            })
        }
        else {
            console.log(error.errors[0].message)
            res.status(500).json({
                error: error.errors[0].message
            })
        }
    }


})

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {

        const user = await userModel.findOne({
            email,

        })
        // console.log(user);

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({
                    id: user._id
                }, JWT_SECRET)
                res.setHeader("token", token);
                console.log(token)
                res.json({
                    token,
                    name: user.name,
                })

            }
            else {
                res.status(403).json({
                    message: "Invalid email or password"
                })
            }
        }
        else {
            res.status(403).json({
                message: "Invalid email or password"
            })
        }
    }
    catch (error) {
        res.status(403).json({
            message: error
        })
    }
})


app.post("/todo", auth, async (req, res) => {
    try {
        const todo = await todoModel.create({
            title: req.body.title,
            description: req.body.description,
            userId: req.userId,
        })
        console.log(todo);
        res.json({
            message: "Todo created successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(403).json({
            arr: error
        })
    }
})

app.post("/todos", auth, async (req, res) => {
    console.log(res.userId)

    try {
        const ans = await todoModel.find({
            userId: req.userId
        });
        console.log("Reached here")
        res.json({
            ans
        })

    } catch (error) {
        res.status(403).json({
            message: error
        })
    }

})

app.delete("/user_delete", auth, async (req, res, next) => {
    try {
        const deletedUser = await userModel.deleteOne({ _id: req.userId });
        if (deletedUser.deletedCount >= 1) {
            res.json({
                message: "User deleted successfully"
            })
        }
        else {
            res.status(403).json({
                message: "User not found",
                id: req.userId
            })
        }
    }
    catch (error) {
        res.json({
            message: error
        })
    }
})

app.delete("/delete_todo", auth, async (req, res, next) => {
    try {
        const deleted = await todoModel.deleteMany({ _id: req.body.id })
        if (deleted.deletedCount >= 1) {
            res.json({
                message: "Todo deleted."
            })
        }
        else {
            res.status(403).json({
                message: "User not found",
                id: req.userId
            })
        }
    }
    catch (error) {
        res.status(403).json({
            message: error
        })
    }
})
app.delete("/delete_todo_all", auth, async (req, res, next) => {
    try {
        const deleted = await todoModel.deleteMany({ userId: req.userId })
        if (deleted.deletedCount >= 1) {
            res.json({
                message: "Todo deleted."
            })
        }
        else {
            res.status(403).json({
                message: "User not found",
                id: req.userId
            })
        }
    }
    catch (error) {
        res.status(403).json({
            message: error
        })
    }
})

app.put("/todo_update", auth, async (req, res, next) => {
    console.log("Started.....")
    try {
        const { title, description } = req.body;
        console.log(title)
        const result = await todoModel.updateOne(
            { _id: req.body.id },
            { $set: { title, description } }
        )
        console.log(result.modifiedCount)
        if (result.modifiedCount >= 1) {
            res.json({
                message: "Todo updated"
            })
        }
        else {
            res.status(403).json({
                message: "Something went wrong"
            })
        }
    }
    catch (error) {
        res.json({
            message: error
        })
    }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port 3000");
})
