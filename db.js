const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = mongoose.ObjectId;

const User = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    password: String,
})

const Todo = new Schema({
    title: String,
    description: String,
    userId: ObjectId
})

const userModel = mongoose.model("users", User);
const todoModel = mongoose.model("todos", Todo);

module.exports = {
    userModel,
    todoModel
}