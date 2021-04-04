const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { Client } = require("pg");
const cookie_parser = require("cookie-parser");
const body_parser = require("body-parser");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const request_ip = require("request-ip");
let dist_path = path.join(__dirname, "dist");
let app = express();
const port = process.env.PORT || 3000;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.set("trust proxy", true);


let dev_mode = false;
let quizzes = [
    {
        title: "Личная проверка",
        quiz_id: 1,
        description: "Sample",
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 4,
        number_of_questions: 8,
        category: "General",
        difficulty: "Easy",
    },
    {
        title: "Личная проверкаа",
        description: "Sample",
        quiz_id: 2,
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 4,
        number_of_questions: 8,
        category: "General",
        difficulty: "Easy",
    },
    {
        title: "JS quiz",
        description: "Sample sampleee",
        quiz_id: 3,
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 12,
        number_of_questions: 20,
        category: "Programming",
        difficulty: "Medium",
    },
    {
        title: "Differentiation",
        description: "Differentiate with speed",
        quiz_id: 4,
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 10,
        number_of_questions: 12,
        category: "Mathematics",
        difficulty: "Hard",
    },
    {
        title: "Integration",
        description: "Integrate with speed",
        quiz_id: 5,
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 10,
        number_of_questions: 12,
        category: "Mathematics",
        difficulty: "Medium",
    },
    {
        title: "Formulas",
        description: "Test your knowledge in formulas",
        quiz_id: 6,
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 10,
        number_of_questions: 12,
        category: "Mathematics",
        difficulty: "Medium",
    },
    {
        title: "Formulas",
        description: "Test your knowledge in formulas",
        quiz_id: 7,
        creators_name: "egorcik",
        date_created: "03/04/2021",
        time_to_complete: 10,
        number_of_questions: 12,
        category: "Mathematics",
        difficulty: "Hard",
    }
];

/*
// if dev mode enabled, fetch database connection string from the connection_string.txt file.
if (dev_mode === true) {
    let database_url = fs.readFileSync("connection_string.txt", "utf8");

    process.env.DATABASE_URL = database_url;
}

app.use(express.static("dist"));

// connect to a database
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

client.connect();
*/

async function main(){
    // To support URL-encoded bodies
    app.use(body_parser.urlencoded({ extended: true }));
    // To support json bodies
    app.use(body_parser.json());
    // To parse cookies from the HTTP Request
    app.use(cookie_parser());
    app.use(express.static("dist"));
    var server = http.createServer(app);
    var io = socketio(server);
    app.get("/", (req, res) => {
        res.status(200).sendFile("index_page.html", {root: "dist"});
    });
    io.on("connect", socket => {
        // When receive a request for quizzes data, send quizzes array
        socket.on("request_quizzes", data => {
            console.log("request for quizzes received");
            socket.emit("get_quizzes", JSON.stringify(quizzes));
        })
    })
    server.listen(port);
    console.log(`Listening on port: ${port}`)
}
main();