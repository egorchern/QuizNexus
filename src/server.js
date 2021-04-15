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
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
app.set("trust proxy", true);

let dev_mode = true;
let quizzes = {

};
let quiz_questions = {

};
// join code => lobby info
let lobbies = {};
let all_usernames = {};

let global_users = {
    "Egorcik": {
        username: "Egorcik"
    }
}
let auth_tokens = {
    "1e3140d794e76c48649b211609356168595dc9086dd69cfe3ceea0c470090138c1c2f571715a0b2db64047a79cf07b52508c0f1993e1d7ffd1271c108780fdd3048841c317e54004cecc6304c79f6e34": "Egorcik"
}
// if dev mode enabled, fetch database connection string from the connection_string.txt file.
if (dev_mode === true) {
    let database_url = fs.readFileSync("connection_string.txt", "utf8");

    process.env.DATABASE_URL = database_url;
}

//app.use(express.static("dist"));

// connect to a database
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

client.connect();
/*
INSERT INTO quizzes (title, description, creators_name, date_created, time_to_complete, number_of_questions, category, difficulty)
VALUES('Личная проверка', 'Проверка от Егора', 'Egorcik', '13/04/2021', 3, 8, 'General', 'Easy');

INSERT INTO quiz_questions (quiz_id, question_number, multi_choice, question_text, answer_choices, correct_answer_indexes, time_allocated, points_base)
VALUES(1, 8, false, 'Кто виноват что Владислав Былёв Витальевич не поднимает ММР в Доте?' , 
'{"Дмитрий Мысников Александрович", "Егор Чернышев Владимерович", "Он сам (например: рубик пятерка с take aim)", "Агенты Габена"}',
'{2}',
25, 1000
)
*/

function get_quizzes() {
    return new Promise(resolve => {
        client.query(
            `
            SELECT * FROM quizzes
            ORDER BY quiz_id ASC
        `
        ).then(res => {
            let rows = res.rows;
            for (let i = 0; i < rows.length; i += 1) {
                let current_row = rows[i];
                let quiz_id = current_row.quiz_id;
                quizzes[quiz_id] = current_row;
                quiz_questions[quiz_id] = {

                }
            }
            resolve();
        })
    })
}

function get_quiz_questions() {
    return new Promise(resolve => {
        client.query(
            `
            SELECT * FROM quiz_questions
            ORDER BY quiz_id ASC
        `
        ).then(res => {
            let rows = res.rows;
            for (let i = 0; i < rows.length; i += 1) {
                let current_row = rows[i];
                let quiz_id = current_row.quiz_id;
                let question_number = current_row.question_number;

                quiz_questions[quiz_id][question_number] = current_row;

            }
            resolve();
        })
    })
}

// Generates random secure token
const generateToken = () => {
    return crypto.randomBytes(80).toString("hex");
};

// Gives random integer between min(inclusive) and max(inclusive)
function get_random_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_global_user_info(auth_token){
    let username = auth_tokens[auth_token];
    console.log(auth_token, username);
    let user_info = global_users[username];
    return user_info;
}

function attempt_register_global_user_in_lobby(auth_token, join_code){
    let global_user_info = get_global_user_info(auth_token);
    if(global_user_info != undefined){
        if(lobbies[join_code].participants[auth_token] === undefined){
            lobbies[join_code].participants[auth_token] = {
                role: "participant",
                score: 0,
                username: global_user_info.username,
                question_pointer: 0,
                logged: false,
                answers: {}
            };
            all_usernames[join_code].push(global_user_info.username);
        }
        
    }
}

// Generates a new join code from the charlist
function generate_join_code() {
    let join_code = "";
    let charlist = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ];
    let code_length = 8;
    for (let i = 0; i < code_length; i += 1) {
        let char_index = get_random_int(0, charlist.length - 1);
        let char = charlist[char_index];
        join_code += char;
    }
    return join_code;
}

// Returns a boolean on whether the selected username in a particular lobby is free
function is_username_free(join_code, username) {
    let usernames = all_usernames[join_code];

    for (let i = 0; i < usernames.length; i += 1) {
        if (usernames[i].toLowerCase() === username.toLowerCase()) {
            return false;
        }
    }
    return true;
}

function get_all_answers(join_code) {
    let return_list = [];
    let participants = lobbies[join_code].participants;
    let participants_keys = Object.keys(participants);
    for (let i = 0; i < participants_keys.length; i += 1) {
        let key = participants_keys[i];
        let user_info = participants[key];
        let answers = user_info.answers;
        let new_obj = {
            answers: answers,
            username: user_info.username
        }
        return_list.push(new_obj);
    }
    return return_list;
}

// Returns a list of currently logged participants in a particular lobby
function get_logged_participants(join_code) {
    let participants = lobbies[join_code].participants;
    let keys = Object.keys(participants);
    let logged_in_participants_list = [];
    for (let i = 0; i < keys.length; i += 1) {
        let user_info = participants[keys[i]];
        if (user_info.logged === true) {
            logged_in_participants_list.push(user_info.username);
        }
    }
    console.log(logged_in_participants_list);
    return logged_in_participants_list;
}

function get_scores(join_code) {
    let participants = lobbies[join_code].participants;
    let participants_keys = Object.keys(participants);
    let scores_list = [];
    for (let i = 0; i < participants_keys.length; i += 1) {
        let user_info = participants[participants_keys[i]];
        let obj = {
            username: user_info.username,
            score: user_info.score
        }
        scores_list.push(obj);
    }
    return scores_list;
}
async function main() {
    let quizzes_promise = await get_quizzes();
    let quiz_questions_promise = await get_quiz_questions();

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
        let quizzes_list = Object.values(quizzes);
        res.send({
            quizzes: quizzes_list,
        });
    });

    // Check whether the lobby with selected join code exists and whether it can be joined
    // Response codes: 1 - lobby does not exist, 2 - lobby exists, but the game has already started, 3 - Game finished, 4 - lobby can be joined
    app.post("/can_join", (req, res) => {
        let join_code = req.body.join_code;
        let lobby_exists = lobbies[join_code] != undefined;
        if (lobby_exists === false) {
            res.send({
                code: 1,
            });
        } else {
            let lobby_state = lobbies[join_code].state;
            let auth_token = req.cookies.auth_token;

            if (lobby_state === "game") {
                let is_participant =
                    lobbies[join_code].participants[auth_token] != undefined;
                if (is_participant) {
                    res.send({
                        code: 4,
                    });
                } else {
                    res.send({
                        code: 2,
                    });
                }
            } else if (lobby_state === "finished") {
                res.send({
                    code: 3,
                });
            } else {
                res.send({
                    code: 4,
                });
            }
        }
    });

    // Registers a new user in lobby, and issues an auth_token if needed
    app.post("/register_user_in_lobby", (req, res) => {
        let join_code = req.body.join_code;
        let auth_token = req.cookies.auth_token;
        let username = req.body.username;
        // Check if the username is already chosen in the lobby
        // If no auth_token found, then the participant is not a host and a new token needs to be issued.
        if (
            auth_token === undefined ||
            lobbies[join_code].participants[auth_token] === undefined
        ) {
            auth_token = generateToken();
            res.cookie("auth_token", auth_token, {
                maxAge: 725760000,
                expires: 725760000,
            });
            lobbies[join_code].participants[auth_token] = {
                role: "participant",
                score: 0,
                question_pointer: 0,
                logged: false,
                answers: {}
            };
        }

        let username_free = is_username_free(join_code, username);

        // If username is not free, send code 1 to indicate that it is taken
        if (username_free === false) {
            res.send({
                code: 1,
            });
        } else {
            // Set the username on the auth_token in the particular lobby
            lobbies[join_code].participants[auth_token].username = username;
            all_usernames[join_code].push(username);

            res.send({
                code: 2,
            });
        }
    });

    // Get user information from a certain lobby and auth_token
    app.post("/get_user_info", (req, res) => {
        let join_code = req.body.join_code;
        let auth_token = req.cookies.auth_token;
        attempt_register_global_user_in_lobby(auth_token, join_code);
        let user_info = lobbies[join_code].participants[auth_token];
        console.log(user_info);
        res.send({
            user_info: user_info,
        });
    });

    // Start up a new lobby
    app.post("/start_quiz", (req, res) => {
        let quiz_id = req.body.quiz_id;

        let join_code = generate_join_code();
        let auth_token = req.cookies.auth_token;
        if(auth_token === undefined){
            auth_token = generateToken();
        }
        // Issue host auth_token
        res.cookie("auth_token", auth_token, {
            maxAge: 725760000,
            expires: 725760000,
        });
        let global_user_info = get_global_user_info(auth_token);
        let new_username = undefined;
        if(global_user_info != undefined){
            new_username = global_user_info.username;
        }
        
        // Lobby states: lobby - game not started, game - game in progress, finished - game finished
        lobbies[join_code] = {
            participants: {
                [auth_token]: {
                    role: "host",
                    username: new_username,
                    score: 0,
                    question_pointer: 0,
                    logged: false,
                    answers: {}
                },
            },
            quiz_id: quiz_id,
            state: "lobby",
        };
        all_usernames[join_code] = [];

        res.send({
            join_code: join_code,
        });
    });
    app.get("/browse", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/home", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/lobby/:join_code", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    io.on("connect", (socket) => {
        socket.on("connect_to_room", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>.+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            socket.join(`${join_code}`);
            lobbies[join_code].participants[auth_token].logged = true;

            let logged_users = get_logged_participants(join_code);
            let scores_list = get_scores(join_code);

            socket.emit("get_all_scores", scores_list);
            socket.emit("get_lobby_state", lobbies[join_code].state);
            io.to(`${join_code}`).emit("logged_users_in_room", logged_users);
        });
        socket.on("request_quiz_descriptors", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let quiz_id = lobbies[join_code].quiz_id;
            let quiz_obj = quizzes[quiz_id];
            socket.emit("get_quiz_descriptors", quiz_obj);
        });
        socket.on("request_users_answers", data => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let scope_of_request = parsed.scope_of_request;
            let regex = new RegExp("auth_token=(?<auth_token>.+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            if (scope_of_request === 0) {
                let answers_list = get_all_answers(join_code);
                socket.join(`${join_code}_get_new_answers`);
                socket.emit("get_users_answers", answers_list);
            }
        })
        socket.on("request_question", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let question_number = parsed.question_number;
            let quiz_id = lobbies[join_code].quiz_id;
            let question_obj = quiz_questions[quiz_id][question_number];
            let answer_body = {
                multi_choice: question_obj.multi_choice,
                question_text: question_obj.question_text,
                answer_choices: question_obj.answer_choices,
                time_allocated: question_obj.time_allocated,
                points_base: question_obj.points_base,
            };
            socket.emit("get_question", answer_body);
        });
        socket.on("submit_answer", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>.+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            let username = lobbies[join_code].participants[auth_token].username;
            let question_number = parsed.question_number;
            let quiz_id = lobbies[join_code].quiz_id;
            let answer_indexes = parsed.answer_indexes;
            let time = parsed.time;
            let question_obj = quiz_questions[quiz_id][question_number];
            isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
            let is_correct = isSetsEqual(new Set(answer_indexes), new Set(question_obj.correct_answer_indexes));
            if (time >= question_obj.time_allocated) {
                is_correct = false;
            }
            let points_earned;
            // Formula for points: points_base - (points_base / time_allocated * time);
            if (is_correct) {
                points_earned = question_obj.points_base - (Math.floor(question_obj.points_base / question_obj.time_allocated) * time);
            }
            else {
                points_earned = 0;
            }
            lobbies[join_code].participants[auth_token].answers[question_number] = {
                answer_indexes: answer_indexes,
                correct_answer_indexes: question_obj.correct_answer_indexes,
                is_correct: is_correct,
                points_earned: points_earned
            }
            lobbies[join_code].participants[auth_token].question_pointer += 1;
            lobbies[join_code].participants[auth_token].score += points_earned;
            if (points_earned != 0) {
                io.to(`${join_code}`).emit("score_update", {
                    username: username,
                    score: lobbies[join_code].participants[auth_token].score
                });
            }
            socket.emit("get_correct_answer", question_obj.correct_answer_indexes);
            let answers_list = get_all_answers(join_code);
            io.to(`${join_code}_get_new_answers`).emit("get_users_answers", answers_list);
            console.log(`Question: ${question_number}, answer_indexes: ${answer_indexes}, username: ${username}, is_correct: ${is_correct}, points_earned: ${points_earned}`);

        });
        socket.on("start_game", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>.+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            // Authorization, only a host is allowed to start a game
            let is_host =
                lobbies[join_code].participants[auth_token].role === "host";
            let code = 1;
            if (is_host) {
                lobbies[join_code].state = "game";
                code = 2;
            }
            let scores_list = get_scores(join_code);
            io.to(`${join_code}`).emit("get_all_scores", scores_list);
            io.to(`${join_code}`).emit("start_game_response", code);
        });
        socket.on("disconnecting", () => {
            let socket_rooms = [...socket.rooms];
            let regex = new RegExp("auth_token=(?<auth_token>.+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            if (socket_rooms.length > 1) {
                let join_code = socket_rooms[1];
                lobbies[join_code].participants[auth_token].logged = false;
                let logged_users = get_logged_participants(join_code);
                io.to(`${join_code}`).emit(
                    "logged_users_in_room",
                    logged_users
                );
            }
        });
    });
    server.listen(port);
    console.log(`Listening on port: ${port}`);
}
main();
