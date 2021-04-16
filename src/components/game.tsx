import { user } from "pg/lib/defaults";
import * as React from "react";
import { render } from "react-dom";
import socketIo, { io } from "socket.io/client-dist/socket.io";


class Answers_breakdown extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let all_answers = this.props.all_answers;
        let username = this.props.username;
        let questions = this.props.questions;
        let assets = this.props.assets;
        let own_answers_index;
        let content = null;
        if(all_answers.length > 0){
            console.log(all_answers, questions);
            for (let i = 0; i < all_answers.length; i += 1) {
                if (all_answers[i].username === username) {
                    own_answers_index = i;
                }
            }
            
            let own_answers = all_answers[own_answers_index].answers;
            let own_answers_keys = Object.keys(own_answers);
            content = own_answers_keys.map((key, index) => {
                let current_question_obj = questions[index];
                console.log(current_question_obj);
                
                let answer = own_answers[key];
                let is_correct = answer.is_correct;
                let own_answer_string = ``;
                for(let i = 0; i < answer.answer_indexes.length; i += 1){
                    let answer_index = answer.answer_indexes[i];
                    let answer_string = current_question_obj.answer_choices[answer_index];
                    if(i === answer.answer_indexes.length - 1){
                        own_answer_string += answer_string
                    }
                    else{
                        own_answer_string += `${answer_string}, `;
                    }
                }
                let correct_answer_string = ``;
                for(let i = 0; i < answer.correct_answer_indexes.length; i += 1){
                    let answer_index = answer.correct_answer_indexes[i];
                    let answer_string = current_question_obj.answer_choices[answer_index];
                    if(i === answer.correct_answer_indexes.length - 1){
                        correct_answer_string += answer_string
                    }
                    else{
                        correct_answer_string += `${answer_string}, `;
                    }
                }
                let mark_src;
                if(is_correct){
                    mark_src = assets.tick;
                }
                else{
                    mark_src = assets.cross;
                }
                return (
                    <div className="answer_breakdown" key={key}>
                        <span>Question {index + 1}) {current_question_obj.question_text}</span>
                        <div className="your_answer">
                            <span>
                                Your answer: {own_answer_string}
                            </span>
                            <img className="your_answer_mark" src={mark_src}>
                            </img>
                        </div>
                        
                        {
                            is_correct === false ? (
                                <span>
                                    Correct answer: {correct_answer_string}
                                </span>
                            )
                            :null
                        }
                    </div>
                )
            })
            
        }
        return (
            <div className="answers_breakdown">
                {content}
            </div>
        )
        
    }
}


class Answer_grid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let answers_list = this.props.answers_list;
        let number_of_questions = this.props.number_of_questions;
        let table_head = [(
            <th key="0">
                Question number
                <br></br>
                Username
            </th>
        )];
        for (let i = 1; i <= number_of_questions; i += 1) {
            table_head.push((
                <th key={i}>
                    {i}
                </th>
            ))
        }
        let table_body = answers_list.map((answer_obj, index) => {

            let tds = [];
            let keys = Object.keys(answer_obj.answers);
            
            for (let i = 0; i < keys.length; i += 1) {
                let answer = answer_obj.answers[keys[i]];

                let class_list = "answer_td ";
                if (answer.is_correct) {
                    class_list += "correct ";
                }
                else {
                    class_list += "incorrect ";
                }
                tds.push((
                    <td className={class_list} key={i}>
                        {answer.points_earned}
                    </td>
                ))
            }

            return (
                <tr key={answer_obj.username}>
                    <td key="0">
                        {answer_obj.username}
                    </td>
                    {tds}
                </tr>
            )
        })

        return (

            <div className="answer_grid">
                <table className="table">
                    <thead>
                        <tr>
                            {table_head}
                        </tr>
                    </thead>
                    <tbody>
                        {table_body}
                    </tbody>
                </table>
            </div>
        )
    }
}

class Score_board extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let scores_content;
        if (this.props.scores != undefined) {
            scores_content = this.props.scores.map(
                (score_obj, index) => {
                    return (
                        <tr
                            className="user_score"
                            key={score_obj.username}
                        >
                            <td scope="row">{score_obj.username}</td>
                            <td>{score_obj.score}</td>
                        </tr>
                    );
                }
            );
        } else {
            scores_content = null;
        }

        return (
            <div className="user_scores">
                <table className="table align-middle">
                    <thead>
                        <tr>
                            <th scope="col">Username</th>
                            <th scope="col">Score</th>
                        </tr>
                    </thead>
                    <tbody>{scores_content}</tbody>
                </table>
            </div>
        )
    }
}

export class Game extends React.Component {
    join_code: any;
    wait_interval_between_questions: number;
    socket: any;
    all_questions: any[];
    timer: NodeJS.Timeout;
    constructor(props) {
        super(props);
        this.join_code = this.props.join_code;
        this.wait_interval_between_questions = 2000;
        this.state = {
            username: undefined,
            game_state: "username_prompt",
            quiz_descriptors: undefined,
            username_value: "",
            participants: [],
            scores: undefined,
            is_host: false,
            current_question_obj: undefined,
            seconds_elapsed: 0,
            question_pointer: 0,
            score: 0,
            correct_answer_indexes: [],
            selected_answer_indexes: [],
            answers_list: []
        };
        this.all_questions = [];
        // To prevent looping the history pushes i.e not pushing when location already at lobby
        let path_name = location.pathname;
        let lobby_regex = new RegExp("^/lobby/(?<join_code>[0-9A-Z]+)$");
        let temp = lobby_regex.exec(path_name);
        if (temp === null) {
            history.pushState(
                { page_state: "game", join_code: this.join_code },
                this.join_code,
                `lobby/${this.join_code}`
            );
        }

        this.get_user_info();
    }
    on_second_elapse = () => {

        if (this.state.seconds_elapsed === this.state.current_question_obj.time_allocated - 1) {
            this.submit_answer([-1]);
        }
        else {
            this.setState({
                seconds_elapsed: this.state.seconds_elapsed + 1
            })
        }

    };
    fetch_question = () => {
        this.setState({
            correct_answer_indexes: [],
            selected_answer_indexes: [],
        });
        
        this.state.question_pointer += 1;
        
        this.socket.emit(
            "request_question",
            JSON.stringify({
                join_code: this.join_code,
                question_number: this.state.question_pointer,
            })
        );
    };
    join_io_room = () => {
        this.socket = io.connect();
        this.socket.on("get_question", (data) => {
            this.timer = setInterval(this.on_second_elapse, 1000);
            this.setState({
                seconds_elapsed: 0,
                current_question_obj: data,
            });
        });
        this.socket.on("get_correct_answer", (data) => {
            this.setState({
                correct_answer_indexes: data,
            });
        });
        this.socket.on("score_update", (data) => {
            let updated_username = data.username;
            let updated_index;
            let new_score = data.score;
            for (let i = 0; i < this.state.scores.length; i += 1) {
                let current_score_obj = this.state.scores[i];
                let current_username = current_score_obj.username;
                if (updated_username === current_username) {
                    updated_index = i;
                }
            }

            this.state.scores[updated_index].score = new_score;
            this.sort_scores();
            this.forceUpdate();
        });
        this.socket.on("get_all_scores", (data) => {
            this.setState({
                scores: data,
            });
        });
        this.socket.on("get_quiz_descriptors", (data) => {
            let quiz_descriptors = data;
            this.setState({
                quiz_descriptors: quiz_descriptors,
            });
        });
        this.socket.on("logged_users_in_room", (data) => {
            let logged_users = data;
            this.setState({
                participants: logged_users,
            });
        });
        this.socket.on("get_lobby_state", (data) => {
            let lobby_state = data;
            if (lobby_state === "game") {
                if (
                    this.state.question_pointer <
                    this.state.quiz_descriptors.number_of_questions
                ) {
                    this.fetch_question();
                } else {
                    lobby_state = "results";
                    this.results_init();
                }
            }
            this.setState({
                game_state: lobby_state,
            });
        });
        this.socket.on("start_game_response", (data) => {
            let code = data;
            if (code === 2) {
                this.fetch_question();
                this.setState({
                    game_state: "game",
                });
            } else {
                alert("You are not authorized to start the game!");
            }
        });
        this.socket.on("get_users_answers", data => {
            this.setState({
                answers_list: data
            })
        })
        let body = {
            join_code: this.join_code,
        };
        body = JSON.stringify(body);
        this.socket.emit("request_quiz_descriptors", body);
        this.socket.emit("connect_to_room", body);
    };
    submit_answer = () => {
        this.all_questions.push(this.state.current_question_obj);
        
        this.socket.emit(
            "submit_answer",
            JSON.stringify({
                question_number: this.state.question_pointer,
                answer_indexes: this.state.selected_answer_indexes,
                time: this.state.seconds_elapsed,
                join_code: this.join_code,
            })
        );
        clearInterval(this.timer);
        let tmr = setTimeout(() => {
            if (
                this.state.question_pointer <
                this.state.quiz_descriptors.number_of_questions
            ) {
                this.fetch_question();
            } else {
                this.results_init();
                this.setState({
                    game_state: "results",
                });
            }
        }, this.wait_interval_between_questions);
    };
    get_user_info = () => {
        let fetch_body = {
            join_code: this.join_code,
        };

        fetch_body = JSON.stringify(fetch_body);
        // Get user info
        fetch("/get_user_info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: fetch_body,
        })
            .then((result) => result.json())
            .then((result) => {
                let user_info = result.user_info;
                if (user_info != undefined && user_info.role === "host") {
                    this.setState({
                        is_host: true,
                    });
                }
                if (user_info != undefined && user_info.username != undefined) {
                    this.join_io_room();
                    this.setState({
                        game_state: "lobby",
                        username: user_info.username,
                        question_pointer: user_info.question_pointer,
                        score: user_info.score,
                    });
                }
            });
    };
    on_username_value_change = (ev) => {
        this.setState({
            username_value: ev.target.value,
        });
    };
    start_game = () => {
        this.socket.emit(
            "start_game",
            JSON.stringify({
                join_code: this.join_code,
            })
        );
    };
    on_submit_username = () => {
        if (this.state.username_value != "") {
            let fetch_body = {
                join_code: this.join_code,
                username: this.state.username_value,
            };
            fetch_body = JSON.stringify(fetch_body);
            fetch("/register_user_in_lobby", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: fetch_body,
            })
                .then((result) => result.json())
                .then((result) => {
                    let code = result.code;
                    // Codes: 1 - username taken, 2 - good to go
                    if (code === 2) {
                        this.join_io_room();
                        this.setState({
                            username: this.state.username_value,
                            game_state: "lobby",
                        });
                    } else {
                        alert(
                            `Username: ${this.state.username_value} is already taken! Please choose another username`
                        );
                    }
                });
        }
        else {
            alert("You left the username field empty! Please select a username");
        }

    };
    results_init = () => {
        this.socket.emit("request_users_answers", JSON.stringify({
            join_code: this.join_code,
            scope_of_request: 0
        }))
    }
    sort_scores() {
        let lst = this.state.scores;
        for (let i = 0; i < lst.length; i += 1) {
            for (let j = 0; j < lst.length - i - 1; j += 1) {
                let left_score = lst[j].score;
                let right_score = lst[j + 1].score;
                if (left_score < right_score) {
                    let temp = lst[j];
                    lst[j] = lst[j + 1];
                    lst[j + 1] = temp;
                }
            }
        }
    }
    render() {
        let content;
        let state = this.state.game_state;
        if(state != "results"){
            document.querySelector(".app_container").classList.remove("height_full");
        }
        else{
            document.querySelector(".app_container").classList.add("height_full");
        }
        if (state === "username_prompt") {
            content = (
                <div className="username_prompt">
                    <span>Choose a username:</span>
                    <input
                        value={this.state.username_value}
                        onChange={this.on_username_value_change}
                        className="form-control username_input"
                    ></input>
                    <button
                        className="btn btn-primary"
                        onClick={this.on_submit_username}
                    >
                        Submit
                    </button>
                </div>
            );
        } else if (state === "lobby") {
            let participants_markup = this.state.participants.map(
                (participant, index) => {
                    return (
                        <div
                            className="participant animate__animated animate__zoomIn"
                            key={index}
                        >
                            <span>{participant}</span>
                        </div>
                    );
                }
            );

            content = (
                <div className="lobby">
                    {this.state.quiz_descriptors != undefined ? (
                        <span className="quiz_title">
                            Quiz title: {this.state.quiz_descriptors.title}
                        </span>
                    ) : null}
                    <span className="heading">Join code:</span>
                    <span className="join_code">{this.join_code}</span>
                    <span className="heading">Link:</span>
                    <span className="join_code">{location.href}</span>
                    <span className="participants_span heading">
                        Participants:
                    </span>
                    <div className="participants_container">
                        {participants_markup}
                    </div>
                    {this.state.is_host === true ? (
                        <button
                            className="btn btn-primary start_button"
                            onClick={this.start_game}
                        >
                            Start
                        </button>
                    ) : null}
                </div>
            );
        } else if (state === "game") {
            if (this.state.current_question_obj != undefined) {
                let answer_choices = this.state.current_question_obj.answer_choices.map(
                    (answer_choice, index) => {
                        let class_list = "answer_choice ";
                        if (this.state.correct_answer_indexes.length > 0) {
                            if (
                                this.state.selected_answer_indexes.includes(
                                    index
                                ) &&
                                this.state.correct_answer_indexes.includes(
                                    index
                                ) === false
                            ) {
                                class_list += "incorrect ";
                            }
                            if (
                                this.state.correct_answer_indexes.includes(
                                    index
                                )
                            ) {
                                class_list += "correct ";
                            }
                        }
                        if (
                            this.state.current_question_obj.multi_choice ===
                            true &&
                            this.state.correct_answer_indexes.length === 0 &&
                            this.state.selected_answer_indexes.includes(index)
                        ) {
                            class_list += "selected ";
                        }

                        return (
                            <div
                                className={class_list}
                                key={index}
                                onClick={() => {
                                    if (
                                        this.state.current_question_obj
                                            .multi_choice === true
                                    ) {
                                        if (
                                            this.state.selected_answer_indexes.includes(
                                                index
                                            )
                                        ) {
                                            let index_to_remove = this.state.selected_answer_indexes.indexOf(
                                                index
                                            );

                                            this.state.selected_answer_indexes.splice(
                                                index_to_remove,
                                                1
                                            );
                                        } else {
                                            this.state.selected_answer_indexes.push(
                                                index
                                            );
                                        }
                                        this.forceUpdate();
                                    } else {
                                        this.state.selected_answer_indexes = [
                                            index,
                                        ];
                                        if (
                                            this.state.correct_answer_indexes
                                                .length === 0
                                        ) {
                                            this.submit_answer();
                                        }
                                    }
                                }}
                            >
                                <span>{answer_choice}</span>
                            </div>
                        );
                    }
                );


                let progress_bar_width_percentage = Math.floor(
                    (this.state.seconds_elapsed /
                        this.state.current_question_obj.time_allocated) *
                    100
                );

                let styles = {
                    width: `${progress_bar_width_percentage}%`,
                };
                content = (
                    <div className="quiz">
                        <div className="quiz_top_part">
                            <div className="timer">
                                <span>
                                    {this.state.seconds_elapsed} /{" "}
                                    {
                                        this.state.current_question_obj
                                            .time_allocated
                                    }
                                </span>
                                <div className="progress_bar">
                                    <div
                                        className="progress_bar_fill"
                                        style={styles}
                                    ></div>
                                </div>
                            </div>
                            <div className="question_info">
                                <span className="question_indicator">
                                    Question: {this.state.question_pointer} /{" "}
                                    {
                                        this.state.quiz_descriptors
                                            .number_of_questions
                                    }
                                </span>
                                {
                                    this.state.current_question_obj.multi_choice === true ?
                                        (
                                            <span className="multi_choice_indicator">
                                                Multiple Answers!
                                            </span>
                                        )
                                        : null
                                }
                                <div className="question_text_container">
                                    <span className="question_text">
                                        {
                                            this.state.current_question_obj
                                                .question_text
                                        }
                                    </span>
                                </div>

                                {
                                    this.state.current_question_obj.multi_choice === true && this.state.selected_answer_indexes.length > 0 ?
                                        (
                                            <button className="btn btn-primary multi_choice_submit" onClick={this.submit_answer}>
                                                Submit
                                            </button>
                                        )
                                        : null
                                }

                            </div>

                            <Score_board scores={this.state.scores}>

                            </Score_board>
                        </div>

                        <div className="answer_choices">{answer_choices}</div>
                    </div>
                );
            }
        }
        else if (state = "results") {

            content = (
                <div className="game_results">
                    <Score_board scores={this.state.scores}>

                    </Score_board>
                    <Answer_grid answers_list={this.state.answers_list} number_of_questions={this.state.quiz_descriptors.number_of_questions}>

                    </Answer_grid>
                    <Answers_breakdown all_answers={this.state.answers_list} username={this.state.username} questions={this.all_questions} assets={this.props.assets}>

                    </Answers_breakdown>

                </div>
            )
            
        }
        return <div className="game">{content}</div>;
    }
    componentWillUnmount(){
        document.querySelector(".app_container").classList.remove("height_full");
    }
}
