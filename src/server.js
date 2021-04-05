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
// join code => lobby info
let lobbies = {

}
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

// Generates random secure token
const generateToken = () => {
    return crypto.randomBytes(80).toString('hex');
}

// Gives random integer between min(inclusive) and max(inclusive)
function get_random_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

function generate_join_code(){
    let join_code = "";
    let charlist = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C",
    "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
    "T", "U", "V", "W", "X", "Y", "Z"
    ]
    let code_length = 8;
    for (let i = 0; i < code_length; i += 1){
        let char_index = get_random_int(0, charlist.length - 1);
        let char = charlist[char_index];
        join_code += char;
    }
    return join_code;
    
}

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
    
    // When receive a request for quizzes data, send quizzes array
    app.get("/get_quizzes", (req, res) => {
        res.send({
            quizzes: quizzes
        });
    })
    // Check whether the lobby with selected join code exists and whether it can be joined
    // Response codes: 1 - lobby does not exist, 2 - lobby exists, but the game has already started, 3 - Game finished, 4 - lobby can be joined
    app.post("/can_join", (req, res) => {
        let join_code = req.body.join_code;
        let lobby_exists = lobbies[join_code] != undefined;
        if(lobby_exists === false){
            res.send({
                code: 1
            })
        }
        else{
            let lobby_state = lobbies[join_code].state;
            if(lobby_state === "game"){
                res.send({
                    code: 2
                })
            }
            else if(lobby_state === "finished"){
                res.send({
                    code: 3
                })
            }
            else{
                res.send({
                    code: 4
                })
            }
        }
        
    })
    // Registers a new user in lobby, and issues an auth_token if needed
    app.post("/register_user_in_lobby", (req, res) => {
        let join_code = req.body.join_code;
        let auth_token = req.cookies.auth_token;
        let username = req.body.username;
        // If no auth_token found, then the participant is not a host and a new token needs to be issued.
        if(auth_token === undefined){
            auth_token = generateToken();
            res.cookie('auth_token', auth_token, { maxAge: 725760000, expires: 725760000 });
            lobbies[join_code].participants[auth_token] = {
                role: "participant",
                score: 0,
                question_pointer: 0

            }
        }
        lobbies[join_code].participants[auth_token].username = username;
        res.send({
            code: 1
        })
    })
    // Get user information from a certain lobby and auth_token
    app.post("/get_user_info", (req, res) => {
        let join_code = req.body.join_code;
        let auth_token = req.cookies.auth_token;
        let user_info = lobbies[join_code].participants[auth_token];
        res.send({
            user_info: user_info
        });
    })
    // Start up a new lobby
    app.post("/start_quiz", (req, res) => {
        let quiz_id = req.body.quiz_id;
        console.log(quiz_id);
        let join_code = generate_join_code();
        
        let auth_token = generateToken();
        // Issue host auth_token
        res.cookie('auth_token', auth_token, { maxAge: 725760000, expires: 725760000 });
        // Lobby states: lobby - game not started, game - game in progress, finished - game finished
        lobbies[join_code] = {
            participants: {
                [auth_token]:{
                    role: "host",
                    username: undefined,
                    score: 0,
                    question_pointer: 0
                }
            },
            quiz_id: quiz_id,
            state: "lobby"
        }
        console.log(lobbies)
        res.send({
            join_code: join_code
        });
    })
    app.get("/", (req, res) => {
        res.status(200).sendFile("index_page.html", {root: "dist"});
    });
    io.on("connect", socket => {
        
    })
    server.listen(port);
    console.log(`Listening on port: ${port}`)
}
main();