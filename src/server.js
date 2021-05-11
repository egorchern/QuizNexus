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
const sql = require("yesql").pg;
const cloneDeep = require("lodash.clonedeep");
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
let destroy_lobby_after_minutes = 1;
let destroy_lobby_after_ms = destroy_lobby_after_minutes * 60 * 1000;
let global_users = {

}
let record_id_to_username_map = {

}
let auth_tokens = {

}
// if dev mode enabled, fetch database connection string from the connection_string.txt file.
if (dev_mode === true) {
    let database_url = fs.readFileSync("connection_string.txt", "utf8");

    process.env.DATABASE_URL = database_url;
}

// connect to a database
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

client.connect();

function get_quizzes() {
    return new Promise(resolve => {
        client.query(
            sql("SELECT * FROM quizzes ORDER BY quiz_id ASC")({})
        ).then(res => {
            let rows = res.rows;

            for (let i = 0; i < rows.length; i += 1) {
                let current_row = rows[i];
                let quiz_id = current_row.quiz_id;
                quizzes[quiz_id] = current_row;
                quizzes[quiz_id].ratings_list = {};
                quizzes[quiz_id].rating = 0;
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
            sql(`
            SELECT * FROM quiz_questions
            ORDER BY quiz_id ASC
            `)({})
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

function get_global_users() {
    return new Promise(resolve => {
        client.query(
            sql(`
            SELECT * FROM global_users
            ORDER BY username ASC
            `)({})
        ).then(res => {
            let rows = res.rows;
            for (let i = 0; i < rows.length; i += 1) {
                let current_row = rows[i];
                let username = current_row.username;
                global_users[username] = current_row;
                global_users[username].created_quiz_ids = [];
                global_users[username].result_records = [];
            }
            resolve();
        })
    })
}

function get_auth_tokens() {
    return new Promise(resolve => {
        client.query(
            sql(`
            SELECT * FROM auth_tokens
            ORDER BY username ASC
            `)({})
        ).then(res => {
            let rows = res.rows;
            for (let i = 0; i < rows.length; i += 1) {
                let row = rows[i];
                auth_tokens[row.auth_token] = {
                    username: row.username,
                    client_id: row.client_id
                }
            }
            resolve();
        })
    })
}

function get_record_answers(){
    return new Promise(resolve => {
        client.query(sql(`
        SELECT *
        FROM record_answers
        ORDER BY record_id ASC
        `)({})).then(res => {
            let rows = res.rows;
            rows.forEach(row => {
                let info = record_id_to_username_map[row.record_id];
                let username = info.username;
                let index = info.index;
                let result_records = global_users[username].result_records[index];
                result_records.answers.push(row);
                
            })
            resolve();
        })
    })
}

function get_result_records(){
    return new Promise(resolve => {
        client.query(sql(`
        SELECT * 
        FROM result_records
        ORDER BY record_id ASC
        `)({})).then(res => {
            let rows = res.rows;
            rows.forEach(row => {
                let global_user_obj = global_users[row.username];
                let result_record = {
                    record_id: row.record_id,
                    username: row.username,
                    quiz_id: row.quiz_id,
                    date: row.date,
                    answers: []
                }
                global_user_obj.result_records.push(result_record);
                record_id_to_username_map[row.record_id] = {
                    username: row.username,
                    index: global_user_obj.result_records.length - 1
                }
                
            })
            let next_record_id = Number(rows[rows.length - 1].record_id) + 1;
            resolve(next_record_id);
        })

        
    })
}

function get_quiz_ratings(){
    return new Promise(resolve => {
        client.query(sql(`
        SELECT *
        FROM quiz_ratings
        `)({})).then(res => {
            let rows = res.rows;
            rows.forEach(row => {
                let quiz_id = row.quiz_id;
                let username = row.username;
                let is_positive = row.is_positive;
                quizzes[quiz_id].ratings_list[username] = is_positive;
                if(is_positive){
                    quizzes[quiz_id].rating += 1;
                }
                else{
                    quizzes[quiz_id].rating -= 1;
                }
            })
            resolve();

        })
    })
}

function insert_global_user(username, password_hash) {

    client.query(
        sql(`
    INSERT INTO global_users
    VALUES(:username, :password_hash)
    `)({
            username: username,
            password_hash: password_hash
        })
    );

}

function insert_auth_token(username, auth_token, client_id) {
    client.query(
        sql(`
        INSERT INTO auth_tokens
        VALUES(:username, :auth_token, :client_id)
        `)({
            username: username,
            auth_token: auth_token,
            client_id: client_id
        })
    )
}

function assign_quizzes_to_creators() {
    let quiz_keys = Object.keys(quizzes);
    quiz_keys.forEach(key => {
        let quiz = quizzes[key];
        let creators_name = quiz.creators_name;
        global_users[creators_name].created_quiz_ids.push(quiz.quiz_id);
    })
}

// hash using bcrypt
get_hashed_password = (password) => {
    let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    return hash;
};

async function do_credentials_match(username, password) {
    let user_obj = global_users[username];
    if (user_obj != undefined) {
        let db_hash = user_obj.password_hash;

        let match = await bcrypt.compare(password, db_hash);
        if (match === true) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }

}

function register_user_globally(username, password) {
    let password_hash = get_hashed_password(password);
    global_users[username] = {
        username: username,
        password_hash: password_hash
    }
    insert_global_user(username, password_hash);
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

function get_global_user_info(username) {

    if (username === undefined) {
        return undefined;
    }
    let user_info = global_users[username];
    return user_info;
}

function attempt_register_global_user_in_lobby(username, auth_token, join_code) {
    let global_user_info = get_global_user_info(username);
    if (global_user_info != undefined) {
        if (lobbies[join_code].participants[auth_token] === undefined) {
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
        return true;

    }
    return false;
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

function delete_redundant_auth_token(username, client_id) {
    return new Promise(resolve => {
        let auth_token;
        
        client.query(
            sql(`
            SELECT auth_token
            FROM auth_tokens
            WHERE username = :username AND client_id = :client_id
            `)({
                username: username,
                client_id: client_id
            })
        ).then(res => {

            if (res.rows.length > 0) {
                auth_token = res.rows[0].auth_token
            }


            client.query(
                sql(`
                DELETE FROM auth_tokens
                WHERE auth_token = :auth_token
                `)({
                    auth_token: auth_token
                })
            ).then(res => {

                resolve(auth_token);
            })
        })



    })


}

// Returns a boolean on whether the selected username is free (not used by global users and lobby users)
function is_username_free(username, join_code = undefined) {
    let global_usernames = Object.keys(global_users);
    let is_globally_used = false
    for (let i = 0; i < global_usernames.length; i += 1) {
        if (global_usernames[i].toLowerCase() === username.toLowerCase()) {
            is_globally_used = true;
            break;
        }
    }
    if (is_globally_used === true) {
        return false;
    }
    if (join_code != undefined) {
        let usernames = all_usernames[join_code];

        for (let i = 0; i < usernames.length; i += 1) {
            if (usernames[i].toLowerCase() === username.toLowerCase()) {
                return false;
            }
        }
        return true;
    }
    else {
        return true;
    }

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

function get_all_questions(quiz_id) {
    let output_list = [];
    let quiz_questions_obj = quiz_questions[quiz_id];

    let keys = Object.keys(quiz_questions_obj);
    for (let i = 0; i < keys.length; i += 1) {
        let key = keys[i];
        let question_obj = quiz_questions_obj[key];
        output_list.push(question_obj);
    }
    return output_list;
}

function insert_quiz(descriptors) {
    return new Promise(resolve => {
        client.query(sql(`
        INSERT INTO quizzes (quiz_id, title, description, creators_name, date_created, time_to_complete, number_of_questions, category, difficulty)
        VALUES(:quiz_id, :title, :description, :creators_name, :date_created, :time_to_complete, :number_of_questions, :category, :difficulty);
        `)({
            quiz_id: descriptors.quiz_id,
            title: descriptors.title,
            description: descriptors.description,
            creators_name: descriptors.creators_name,
            date_created: descriptors.date_created,
            time_to_complete: descriptors.time_to_complete,
            number_of_questions: descriptors.number_of_questions,
            category: descriptors.category,
            difficulty: descriptors.difficulty
        })).then(res => {
            resolve();
        })
    })

}

function create_new_quiz(descriptors, creators_name) {
    return new Promise(resolve => {
        quizzes[descriptors.quiz_id] = descriptors;
        global_users[creators_name].created_quiz_ids.push(descriptors.quiz_id);
        quiz_questions[descriptors.quiz_id] = {};

        let insert_promise = insert_quiz(descriptors);
        insert_promise.then(result => {
            resolve();
        })
    })
}

function delete_quiz_db(quiz_id) {
    return new Promise(resolve => {
        client.query(sql(`
            DELETE FROM quizzes
            WHERE quiz_id = :quiz_id
        `)({
            quiz_id: quiz_id
        })).then(res => {
            client.query(sql(`
                DELETE FROM quiz_questions
                WHERE quiz_id = :quiz_id
            `)({
                quiz_id: quiz_id
            })).then(res => {
                resolve();
            })
        })
    })
}

function delete_quiz(quiz_id) {
    return new Promise(resolve => {
        let creators_name = quizzes[quiz_id].creators_name;
        let delete_index = global_users[creators_name].created_quiz_ids.indexOf(quiz_id);
        global_users[creators_name].created_quiz_ids.splice(delete_index, 1);
        delete quizzes[quiz_id];
        delete quiz_questions[quiz_id];
        let delete_db_promise = delete_quiz_db(quiz_id);
        delete_db_promise.then(res => {
            resolve();
        })
    })

}

function insert_question(question) {
    

    client.query(sql(`
        INSERT INTO quiz_questions (quiz_id, question_number, multi_choice, question_text, answer_choices, correct_answer_indexes, time_allocated, points_base)
        VALUES(:quiz_id, :question_number, :multi_choice, :question_text, :answer_choices, :correct_answer_indexes, :time_allocated, :points_base);
        `)({
        quiz_id: question.quiz_id,
        question_number: question.question_number,
        multi_choice: question.multi_choice,
        question_text: question.question_text,
        answer_choices: question.answer_choices,
        correct_answer_indexes: question.correct_answer_indexes,
        time_allocated: question.time_allocated,
        points_base: question.points_base
    })).then(res => {
        

    })


}

async function edit_quiz(quiz_descriptors, quiz_questionss) {
    let delete_quiz_promise = await delete_quiz(quiz_descriptors.quiz_id);
    let create_quiz_promise = await create_new_quiz(quiz_descriptors, quiz_descriptors.creators_name);
    let question_index = 0;
    
    
    for(let i = 0; i < quiz_questionss.length; i += 1){
        let current_question = quiz_questionss[i];
        
        insert_question(current_question);
        quiz_questions[current_question.quiz_id][current_question.question_number] = current_question;
        
    }



}

function is_title_free(title){
    let quiz_keys = Object.keys(quizzes);
    for(let i = 0; i < quiz_keys.length; i += 1){
        let key = quiz_keys[i];
        let quiz_title = quizzes[key].title;
        if(quiz_title.toLowerCase() === title.toLowerCase()){
            return false;
        }
    }
    return true;
}

function destroy_lobby(join_code){
    
    delete lobbies[join_code];
    
}

function get_formatted_current_date(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let return_date = `${dd}/${mm}/${yyyy}`;
    return return_date;
}

function get_performance_data(quiz_id, answers){
    let current_quiz_questions = quiz_questions[quiz_id];
    
    let correct_answers = 0;
    let answers_total = answers.length;
    let correct_answers_percentage;
    let points_earned = 0;
    let total_points = 0;
    let points_earned_percentage;
    for(let i = 0; i < answers_total; i += 1){
        
        let answer = answers[i];
        if(answer.is_correct){
            correct_answers += 1;

        }
        points_earned += Number(answer.points_earned);
        total_points += Number(current_quiz_questions[answer.question_number].points_base);
    }
    correct_answers_percentage = Math.floor((correct_answers / answers_total) * 100);
    points_earned_percentage = Math.floor((points_earned / total_points) * 100);
    return {
        correct_answers: correct_answers,
        answers_total: answers_total,
        correct_answers_percentage: correct_answers_percentage,
        points_earned: points_earned,
        total_points: total_points,
        points_earned_percentage: points_earned_percentage
    }
}

function insert_result_record(record_obj){
    client.query(sql(`
    INSERT INTO result_records (record_id, username, quiz_id, date)
    VALUES(:record_id, :username, :quiz_id, :date)
    `)(record_obj))
    
}

function insert_record_answer(record_id, question_number, answer){
    
    client.query(sql(`
    INSERT INTO record_answers(record_id, question_number, answer_indexes, correct_answer_indexes, is_correct, points_earned)
    VALUES(:record_id, :question_number, :answer_indexes, :correct_answer_indexes, :is_correct, :points_earned)
    `)({
        record_id: record_id,
        question_number: question_number,
        answer_indexes: answer.answer_indexes,
        correct_answer_indexes: answer.correct_answer_indexes,
        is_correct: answer.is_correct,
        points_earned: answer.points_earned
    }))
}

function insert_quiz_rating(quiz_id, username, is_positive){
    client.query(sql(`
    INSERT INTO quiz_ratings (quiz_id, username, is_positive)
    VALUES(:quiz_id, :username, :is_positive)
    `)({
        quiz_id: quiz_id,
        username: username,
        is_positive: is_positive
    }));
}

function update_quiz_rating(quiz_id, username, is_positive){
    client.query(sql(`
    UPDATE quiz_ratings
    SET is_positive = :is_positive
    WHERE quiz_id = :quiz_id AND username = :username
    `)({
        quiz_id: quiz_id,
        username: username,
        is_positive: is_positive
    }))
}

function record_quiz_rating(quiz_id, username, is_positive){
    let ratings_obj = quizzes[quiz_id].ratings_list;
    let already_rated = ratings_obj[username] != undefined;
    
    if(already_rated){
        let val = ratings_obj[username];
        if(val != is_positive){
            
            console.log(ratings_obj[username]);
            if(val === false){
                quizzes[quiz_id].rating += 2;
            }
            else{
                quizzes[quiz_id].rating -= 2;
            }
            ratings_obj[username] = is_positive;
            
            update_quiz_rating(quiz_id, username, is_positive);
        }
    }
    else{
        ratings_obj[username] = is_positive;
        
        if(is_positive){
            quizzes[quiz_id].rating += 1;
        }
        else{
            quizzes[quiz_id].rating -= 1;
        }
        insert_quiz_rating(quiz_id, username, is_positive);
    }
    
}

function record_results(join_code, auth_token, username, next_record_id){
    let global_user_obj = global_users[username];
    if(global_user_obj != undefined){
        let answers = lobbies[join_code].participants[auth_token].answers;
        let converted_answers = [];
        let answer_keys = Object.keys(answers);
        answer_keys.forEach(answer_key => {
            let ans_obj = answers[answer_key];
            ans_obj.question_number = answer_key;
            converted_answers.push(ans_obj);

        });
        answers = converted_answers;
        
        let quiz_id = lobbies[join_code].quiz_id;
        let record_obj = {
            record_id: next_record_id,
            answers: answers,
            username: username,
            quiz_id: quiz_id,
            date: get_formatted_current_date(),
            performance_data: get_performance_data(quiz_id, answers)
            
        }
        
        global_user_obj.result_records.push(record_obj);
        record_id_to_username_map[record_obj.record_id] = {
            username: username,
            index: global_user_obj.result_records.length - 1
        }
        insert_result_record(record_obj);
        for(let i = 0; i < answers.length; i += 1){
            let answer = answers[i];
            insert_record_answer(record_obj.record_id, answer_keys[i], answer);
        }
    }
}


function assign_performance_data_on_records(){
    let global_user_keys = Object.keys(global_users);
    global_user_keys.forEach(global_user_key => {
        let global_user = global_users[global_user_key];
        
        let result_records = global_user.result_records;
        result_records.forEach(result_record => {
            
            let performance_data = get_performance_data(result_record.quiz_id, result_record.answers);
            result_record.performance_data = performance_data;
        })

    })
}

async function main() {
    let quizzes_promise = await get_quizzes();
    let quiz_questions_promise = await get_quiz_questions();
    let global_users_promise = await get_global_users();
    let auth_tokens_promise = await get_auth_tokens();
    let next_record_id = await get_result_records();
    let get_record_answers_promise = await get_record_answers();
    let get_quiz_ratings_promise = await get_quiz_ratings();
    
    assign_quizzes_to_creators();
    assign_performance_data_on_records()
    console.log(quizzes);
    let next_quiz_id;
    let quiz_keys = Object.keys(quizzes);
    next_quiz_id = Number(quiz_keys[quiz_keys.length - 1]) + 1;
    
    // To support URL-encoded bodies
    app.use(body_parser.urlencoded({ extended: true }));
    // To support json bodies
    app.use(body_parser.json());
    // To parse cookies from the HTTP Request
    app.use(cookie_parser());
    app.use(express.static("dist"));
    // Middleware for authenticating users. Looks up auth_token in auth_tokens and affixes the username to the req, req.username
    app.use((req, res, next) => {
        
        let auth_token = req.cookies.auth_token;
        let auth_token_output = auth_tokens[auth_token];

        if (auth_token_output != undefined) {
            req.username = auth_token_output.username;
        }
        else {
            req.username = null;
        }

        next();
    })
    var server = http.createServer(app);
    var io = socketio(server);
    app.post("/log_out", (req, res) => {

        res.clearCookie("auth_token");
        res.send({
            code: 2
        })
    })
    // When receive a request for quizzes data, send quizzes array
    app.post("/get_quizzes", (req, res) => {

        let quiz_list = [];
        if (req.body.quiz_ids === undefined) {
            quiz_list = Object.values(quizzes);
        }
        else {
            req.body.quiz_ids.forEach(quiz_id => {
                quiz_list.push(quizzes[quiz_id]);
            })
        }
        res.send({
            quizzes: quiz_list,
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
                httpOnly: true
            });
            lobbies[join_code].participants[auth_token] = {
                role: "participant",
                score: 0,
                question_pointer: 0,
                logged: false,
                answers: {}
            };
        }

        let username_free = is_username_free(username, join_code);

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
        let is_global_user = attempt_register_global_user_in_lobby(req.username, auth_token, join_code);
        let user_info = lobbies[join_code].participants[auth_token];

        res.send({
            user_info: user_info,
            is_global_user: is_global_user
        });
    });

    // Response codes: 1 - username is not free, 2 - registration successful
    app.post("/register_user_globally", (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let is_free = is_username_free(username);
        if (is_free === true) {
            register_user_globally(username, password);
            console.log(global_users);
            res.send({
                code: 2
            })
        }
        else {
            res.send({
                code: 1
            })
        }
    })

    // Response codes: 1 - invalid credentials, 2 - authenticated
    app.post("/log_in", (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let client_id = req.body.client_id;
        do_credentials_match(username, password).then(match => {
            if (match) {
                let auth_token = generateToken();
                if(client_id === null){
                    client_id = generateToken();
                }
                
                auth_tokens[auth_token] = {
                    username: username,
                    client_id: client_id
                }

                let deleted_auth_token_promise = delete_redundant_auth_token(username, client_id);
                deleted_auth_token_promise.then(deleted_auth_token => {
                    delete auth_tokens[deleted_auth_token];

                })


                res.cookie("auth_token", auth_token, {
                    maxAge: 725760000,
                    expires: 725760000,
                    httpOnly: true
                }

                )
                insert_auth_token(username, auth_token, client_id);
                res.send({
                    code: 2,
                    client_id: client_id
                })
            }
            else {
                res.send({
                    code: 1
                })
            }
        })

    })

    // Used to relay whether user is authenticated to the App component. If not authenticated send username = null, otherwise send username.
    app.post("/get_global_username", (req, res) => {
        res.send({
            username: req.username
        })
    })

    // Used when User_profile page requests information for display. Response codes: 1 - not allowed, 2 - allowed
    app.post("/get_global_user_info", (req, res) => {
        let username = req.username;
        if (username != null) {
            let user_info = get_global_user_info(username);
            let new_user_info = cloneDeep(user_info);
            delete new_user_info.password_hash;

            res.send({
                code: 2,
                user_info: new_user_info
            })
        }
        else {
            res.send({
                code: 1
            })
        }
    })

    // Used to fetch record by the Record component. Response codes: 1 - not allowed, 2 - allowed
    app.post("/get_record", (req, res) => {
        let record_id = req.body.record_id;
        let username = req.username;
        let record_about = record_id_to_username_map[record_id];
        let is_allowed = username != null && record_about != undefined && record_about.username === username;
        if(is_allowed){
            let record_obj = global_users[username].result_records[record_about.index];
            let quiz_id = record_obj.quiz_id;
            let questions = get_all_questions(quiz_id);
            res.send({
                code: 2,
                questions: questions,
                record: record_obj
            })
            
        }
        else{
            res.send({
                code: 1
            })
        }

    })

    // Used to record a quiz rating
    app.post("/record_rating", (req, res) => {
        let join_code = req.body.join_code;
        let quiz_id = lobbies[join_code].quiz_id;
        let username = req.username;
        let is_positive = req.body.is_positive;
        if(username != null){
            record_quiz_rating(quiz_id, username, is_positive);
            res.send({
                code: 2
            })
        }
        else{
            res.send({
                code: 1
            })
        }
    })
    // Used when Edit page requests questions for edit. Response codes: 1 - not allowed, 2 - allowed
    app.post("/get_quiz_questions", (req, res) => {
        let quiz_id = req.body.quiz_id;
        
        let is_allowed = req.username != null && quiz_id != undefined && global_users[req.username].created_quiz_ids.includes(quiz_id);
        console.log(`quiz edit access: ${quiz_id}, ${req.username}, ${is_allowed}`);
        if (is_allowed) {
            let questions = get_all_questions(quiz_id);
            res.send({
                code: 2,
                questions: questions
            })
        }
        else {
            res.send({
                code: 1
            })
        }
    })

    // Route for creating a new quiz. Calls create_new_quiz and return newly created quiz_id with response code
    app.post("/create_new_quiz", (req, res) => {
        let username = req.username;
        let is_allowed = username != null;
        if (is_allowed) {
            
            let descriptors = {
                category: "General",
                creators_name: username,
                date_created: get_formatted_current_date(),
                description: "",
                difficulty: "Easy",
                number_of_questions: 0,
                quiz_id: next_quiz_id,
                time_to_complete: 0,
                title: `Untitled-${next_quiz_id}`
            }
            let create_promise = create_new_quiz(descriptors, username);
            create_promise.then(result => {
                res.send({
                    quiz_id: next_quiz_id,
                    code: 2
                });
                next_quiz_id += 1;
            })
        }
    })

    // Route for deleting a quiz; returs code = 2 if successfully deleted
    app.post("/delete_quiz", (req, res) => {
        let quiz_id = req.body.quiz_id;
        let is_allowed = req.username != null && quiz_id != undefined && global_users[req.username].created_quiz_ids.includes(quiz_id);
        if (is_allowed) {
            let delete_promise = delete_quiz(quiz_id);
            delete_promise.then(result => {
                res.send({
                    code: 2
                })
            })
        }
    })

    // Response codes: 2 - successfull, 3 - title taken
    app.post("/edit_quiz", (req, res) => {
        let quiz_id = req.body.quiz_id;
        let is_allowed = req.username != null && quiz_id != undefined && global_users[req.username].created_quiz_ids.includes(quiz_id);
        console.log(`Edit quiz atempt: ${quiz_id}, ${req.username}, ${is_allowed}`);
        if (is_allowed) {
            let quiz_descriptors = req.body.quiz_descriptors;
            let quiz_questions = req.body.quiz_questions;
            let title_free_bool;
            if(quizzes[quiz_id].title != quiz_descriptors.title){
                title_free_bool = is_title_free(quiz_descriptors.title);
            }
            else{
                title_free_bool = true;
            }
            if(title_free_bool){
                let edit_quiz_promise = edit_quiz(quiz_descriptors, quiz_questions);
                edit_quiz_promise.then(result => {
                    res.send({
                        code: 2
                    })
                })
            }
            else{
                res.send({
                    code: 3
                })
            }
            
        }
    })
    // Start up a new lobby
    app.post("/start_quiz", (req, res) => {
        let quiz_id = req.body.quiz_id;

        let join_code = generate_join_code();
        let auth_token = req.cookies.auth_token;
        if (auth_token === undefined) {
            auth_token = generateToken();
        }
        // Issue host auth_token
        res.cookie("auth_token", auth_token, {
            maxAge: 725760000,
            expires: 725760000,
            httpOnly: true
        });
        let global_user_info = get_global_user_info(req.username);
        let new_username = undefined;
        if (global_user_info != undefined) {
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
    app.get("/register", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/login", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/user_profile", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/lobby/:join_code", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/edit/:edit_quiz_id", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    });
    app.get("/view_record/:record_id", (req, res) => {
        res.status(200).sendFile("index_page.html", { root: "dist" });
    })
    app.get("/", (req, res) => {
        res.redirect("/home");
    });
    io.on("connect", (socket) => {
        socket.on("connect_to_room", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>[^;]+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            socket.join(`${join_code}`);

            lobbies[join_code].participants[auth_token].logged = true;

            let logged_users = get_logged_participants(join_code);
            let scores_list = get_scores(join_code);
            clearTimeout(lobbies[join_code].destroy_timer);
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
            let regex = new RegExp("auth_token=(?<auth_token>[^;]+)");
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
        socket.on("request_all_questions", data => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>[^;]+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            let quiz_id = lobbies[join_code].quiz_id;
            let question_number = lobbies[join_code].participants[auth_token].question_pointer;
            let number_of_questions = quizzes[quiz_id].number_of_questions;
            if (question_number >= number_of_questions) {
                let all_questions = get_all_questions(quiz_id);
                socket.emit("get_all_questions", all_questions);
            }
        })
        socket.on("submit_answer", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>[^;]+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            let username = lobbies[join_code].participants[auth_token].username;
            let question_number = lobbies[join_code].participants[auth_token].question_pointer + 1;
            
            let quiz_id = lobbies[join_code].quiz_id;
            let answer_indexes = parsed.answer_indexes;
            let time = parsed.time;
            let question_obj = quiz_questions[quiz_id][question_number];
            if(question_obj != undefined){

            
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
                if (points_earned > question_obj.points_base) {
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
                if(quizzes[quiz_id].number_of_questions === question_number){
                    record_results(join_code, auth_token, username, next_record_id);
                    next_record_id += 1;
                }
            }
        });
        socket.on("start_game", (data) => {
            let parsed = JSON.parse(data);
            let join_code = parsed.join_code;
            let regex = new RegExp("auth_token=(?<auth_token>[^;]+)");
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
            let regex = new RegExp("auth_token=(?<auth_token>[^;]+)");
            let auth_token = regex.exec(socket.handshake.headers.cookie).groups
                .auth_token;
            if (socket_rooms.length > 1) {
                let join_code = socket_rooms[1];
                lobbies[join_code].participants[auth_token].logged = false;
                let logged_users = get_logged_participants(join_code);
                if(logged_users.length === 0){
                    lobbies[join_code].destroy_timer = 
                    setTimeout(() => {
                        destroy_lobby(join_code);
                    }, destroy_lobby_after_ms);
                    
                    
                }
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

