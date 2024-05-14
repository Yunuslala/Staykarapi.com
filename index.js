const express=require('express');
const { connection } = require('./config/db');
const {UserRouter}=require("./routers/User.Router");
const errorMiddleware=require("./middlewares/Error");
const app=express();
const cors=require("cors");
const { ProfileRouter } = require('./routers/Profile.Router');
const { HotelsRouter } = require('./routers/Hotel.Router');
const { AmenetiesRouter } = require('./routers/Ameneties.Router');
const { BlogRouter } = require('./routers/Blog.Router');
const { CategoryRouter } = require('./routers/Categories.Router');
const { LocationRouter } = require('./routers/Locations.Router');
const { OffersRouter } = require('./routers/Offer.Router');
const { BookingRouter } = require('./routers/Booking.Router');
const { AddingPropertyRouter } = require('./routers/AddingProperty.Router');
const { QueryRouter } = require('./routers/Query.Router');
const { ScheduleRoomsAvailable } = require('./utils/RandomNumber');
require('dotenv').config()

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down server due to Uncaught Exception");
    process.exit(1);
})
// app.use(express.static('public'));
app.use(express.json());
app.use(cors());
ScheduleRoomsAvailable();
app.use('/api/v1',UserRouter);
app.use('/api/v1',ProfileRouter);
app.use('/api/v1',HotelsRouter);
app.use('/api/v1',AmenetiesRouter);
app.use('/api/v1',BlogRouter);
app.use('/api/v1',CategoryRouter);
app.use('/api/v1',LocationRouter);
app.use('/api/v1',OffersRouter);
app.use('/api/v1',BookingRouter);
app.use('/api/v1',AddingPropertyRouter);
app.use('/api/v1',QueryRouter);








app.use(errorMiddleware)

const server=app.listen(process.env.port,async()=>{
    try {
        await connection
        console.log("db is connected")
    } catch (error) {
        console.log("db is not connected",error)
    }
    console.log(`http://localhost:${process.env.port}`)
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down server due to unhandled promise rejection")

    server.close(()=>{
        process.exit(1)
    })
})