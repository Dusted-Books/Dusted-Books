const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongodb_URI);
        console.log("mongoDB Connected");
    } catch (error){
        console.error(error);
        process.exit(1);
   }
};

module.exports = connectDB;