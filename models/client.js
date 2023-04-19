const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    clientname: {
        type: String,
        trim: true,
        required: true,
        max: 64
    },
    email: {
        type: String,
        required: true,
        trim:true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: 8,
        max: 32
    },
    domains: [{
        domainname: {
            type: String,
            required: true,
            trim: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        api: {
            type: String,
            default: undefined
        },
        txt:{
            type: String,
            default: undefined
        }
    }]
}, { timestamps: true })

const Client = mongoose.model("Client", clientSchema)
module.exports = Client
