require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./routes/api')
const authRoutes = require('./routes/auth')
const clientRoutes = require('./routes/client')
const domainRoutes = require('./routes/domain')
const otpRoutes = require('./routes/otp')

const app = express()
const PORT = 5000

//: TODO : better comments and verify otp route
// Middlewares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// DB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DBCONNECTION);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

// Routes
app.use('/api', apiRoutes)
app.use('/auth', authRoutes)
app.use('/client', clientRoutes)
app.use('/domain', domainRoutes)
app.use('/otp', otpRoutes)

app.get("/", (req, res)=>{
    return res.send("Hello World!!")
})

// Server Linsteing
connectDB().then(() => {
  app.listen(process.env.PORT || PORT, () => {
      console.log("Server is up and running");
  })
})

