require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Patient = require("./models/Patient");

(async () => {
    await mongoose.connect(process.env.MONGO_URI); // apne .env ka naam rakhna
    const users = await User.find({ role: "patient" });
    for (const u of users) {
        const has = await Patient.exists({ user: u._id });
        if (!has) {
            await Patient.create({ user: u._id, source: "self", createdBy: u._id });
            console.log("Created patient for", u.email);
        }
    }
    await mongoose.disconnect();
})();