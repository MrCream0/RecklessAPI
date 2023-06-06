const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please Enter User Name"]
        },
        discovery: {
            type: String,
            required: [true, "Please Enter Your initial Discovery"],
            /*default: 0,*/
        },
        reason: {
            type: String,
            required: [true, "Please Enter Your Reason for Joining"],
        },
        dob: {
            type: Date,
            required: [true, "Please Enter Your Date of Birth"],
        },
        information: {
            type: String,
            required: [true, "Please Enter Any Additional Information "],
        },
        referral: {
            type: [String, "Please Enter The Member Of Referral"],

        },
        contact: {
            type: String,
            required: [true, "Please Enter Your Email"],
        }
    },
    {
        timestamps: true
    }
)

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;