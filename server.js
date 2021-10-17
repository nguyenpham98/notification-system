const express = require('express')
const app = express()
const schedule = require('node-schedule')
const nodemailer = require('nodemailer')
const path = require('path')
const hbs = require('nodemailer-express-handlebars')
const cors = require('cors')
const mongoose = require('mongoose')
const Email = require("./models/EmailSchema")
require('dotenv').config()


app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.PROD_CLIENT : process.env.DEV_CLIENT,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1) // trust first proxy
}

mongoose.connect(
    process.env.MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
const db = mongoose.connection
db.on('error', (error) => console.log("Something wrong with MongoDB?"))
db.once('open', () => console.log("MONGODB connected..."))


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
    }
})
transporter.use('compile', hbs({
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
}))

const sendMail = (mailOptions) => {
    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("error: " + err)
                reject(err)
            }
            else {
                console.log("Mail Sent Successfully...")
                resolve(info)
            }
        })
    })
}

app.get("/", (req, res) => {
    res.send("hello from server")
})

app.post("/save-email", async (req, res) => {
    try {
        const exists = await Email.findOne({ email: req.body.email })
        if (exists) {
            res.json({
                msg: req.body.email + " is already in system..."
            })
        }
        else {
            const email = new Email({
                email: req.body.email
            })
            await email.save()
            res.json({
                msg: req.body.email + " saved in database..."
            })
        }
    }
    catch{
        res.json({
            msg: "something wrong"
        })
    }
})
const date = new Date(2021, 11, 24, 0, 0, 0);
// December 24, 2021, 0:00 AM (midnight)

const job = schedule.scheduleJob(date, async () => {
    const users = await Email.find()
    users.forEach(async (user) => {
        let mailOptions = {
            from: process.env.USER,
            to: user.email,
            subject: "220C Banh Mi And Sweets Is Here",
            template: "notificationPage",
            
        }
        await sendMail(mailOptions)
    })
})

app.get('/send', async (req,res) => {
    let mailOptions = {
        from: process.env.USER,
        to: "kaisoul1998@gmail.com",
        subject: "220C Banh Mi And Sweets Is Here",
        template: "notificationPage",
        attachments: [
            {
                filename: "banhmi.jpg",
                path: __dirname + '/public/media/banhmi.jpg',
                cid: 'uniq-banhmi.jpg'
            },
            {
                filename: "boba.jpg",
                path: __dirname + '/public/media/boba.jpg',
                cid: 'uniq-boba.jpg'
            },
            {
                filename: "flan.jpg",
                path: __dirname + '/public/media/flan.jpg',
                cid: 'uniq-flan.jpg'
            },
            {
                filename: "cake.jpg",
                path: __dirname + '/public/media/cake.jpg',
                cid: 'uniq-cake.jpg'
            },
            {
                filename: "logo.png",
                path: __dirname + '/public/media/logo.png',
                cid: 'uniq-logo.png'
            },
            {
                filename: "hero.jpg",
                path: __dirname + '/public/media/hero.jpg',
                cid: 'uniq-hero.jpg'
            }
        ]
    }
    await sendMail(mailOptions)
    res.send("OK")
})
app.listen(process.env.PORT || 5000, () => {
    console.log("Notification system is online...")
})