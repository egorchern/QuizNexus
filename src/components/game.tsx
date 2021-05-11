import { user } from "pg/lib/defaults";
import * as React from "react";
import { render } from "react-dom";
import socketIo, { io } from "socket.io/client-dist/socket.io";
import {Answers_breakdown} from "./answers_breakdown";
import {Answer_grid} from "./answer_grid";
function round_to(n, digits) {
    if (digits === undefined) {
        digits = 0;
    }

    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    return Math.round(n) / multiplicator;
}

interface Rate_props{
    rate: Function
}

interface Rate_state{
    is_positive: boolean
}

class Rate extends React.Component<Rate_props, Rate_state>{
    constructor(props: Rate_props){
        super(props);
        this.state = {
            is_positive: null
        }
    }
    on_rate = (is_positive: boolean) => {
        if(is_positive != this.state.is_positive){
            this.props.rate(is_positive);
            this.setState({
                is_positive: is_positive
            })
        }
    }
    render(){
        let class_list_1 = "rate_svg positive ";
        let class_list_2 = "rate_svg negative ";
        if(this.state.is_positive === true){
            class_list_1 += "active ";
        }
        else if(this.state.is_positive === false){
            class_list_2 += "active ";
        }
        return (
            <div className="rate flex_vertical">
                <span>Please rate this quiz!</span>
                <div className="flex_horizontal">
                    <svg xmlns="http://www.w3.org/2000/svg" className={class_list_1} viewBox="0 0 16 16" onClick={() => {
                        this.on_rate(true);
                    }}>
                        <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className={class_list_2} viewBox="0 0 16 16" onClick={() => {
                        this.on_rate(false);
                    }}>
                        <path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.378 1.378 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51.136.02.285.037.443.051.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.896 1.896 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2.094 2.094 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.162 3.162 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.823 4.823 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591z"/>
                    </svg>
                </div>
                
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

    timer: NodeJS.Timeout;
    fps: number;
    timer_interval: number;
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
            milliseconds_elapsed: 0,
            seconds_elapsed: 0,
            question_pointer: 0,
            score: 0,
            correct_answer_indexes: [],
            selected_answer_indexes: [],
            answers_list: [],
            questions: []
        };
        this.fps = 60;
        this.timer_interval = round_to(1000 / this.fps, 0);
        
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
    on_timer_interval_elapse = () => {
        let seconds = Math.floor(this.state.milliseconds_elapsed / 1000);
        if (seconds > this.state.seconds_elapsed) {
            this.state.seconds_elapsed += 1;
        }
        if (this.state.seconds_elapsed === this.state.current_question_obj.time_allocated - 1) {
            this.state.selected_answer_indexes = [];
            this.submit_answer();
        }
        else {

            this.setState({
                milliseconds_elapsed: this.state.milliseconds_elapsed + this.timer_interval
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
            this.timer = setInterval(this.on_timer_interval_elapse, this.timer_interval);
            this.setState({
                seconds_elapsed: 0,
                milliseconds_elapsed: 0,
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
        this.socket.on("get_all_questions", data => {
            this.setState({
                questions: data
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


        this.socket.emit(
            "submit_answer",
            JSON.stringify({
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
                let is_global_user = result.is_global_user;
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
                        is_global_user: is_global_user,
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
        this.socket.emit("request_all_questions", JSON.stringify({
            join_code: this.join_code
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
    rate = (is_positive: boolean) => {
        fetch("/record_rating", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                join_code: this.join_code,
                is_positive: is_positive
            })
        }).then(result => result.json())
        .then(result => {
            console.log(result);
        })
    }
    render() {
        let content;
        let state = this.state.game_state;
        if (state != "results") {
            document.querySelector(".app_container").classList.remove("height_full");
        }
        else {
            document.querySelector(".app_container").classList.add("height_full");
        }
        if (state === "username_prompt") {
            content = (
                <div className="username_prompt">
                    <span>Username</span>
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
                    <span className="heading">Join code</span>
                    <span className="join_code">{this.join_code}</span>
                    <span className="heading">Link</span>
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


                let progress_bar_width_percentage =
                    round_to((this.state.milliseconds_elapsed /
                        (this.state.current_question_obj.time_allocated * 1000)) *
                    100, 1)


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
                    {
                        this.state.is_global_user === true ? (
                            <Rate
                            rate={this.rate}
                            >

                            </Rate>
                        )
                        :null
                    }
                    
                    <Score_board scores={this.state.scores}>

                    </Score_board>
                    <Answer_grid answers_list={this.state.answers_list} number_of_questions={this.state.quiz_descriptors.number_of_questions}>

                    </Answer_grid>
                    <Answers_breakdown all_answers={this.state.answers_list} username={this.state.username} questions={this.state.questions} assets={this.props.assets}>

                    </Answers_breakdown>

                </div>
            )

        }
        return <div className="game">{content}</div>;
    }
    componentWillUnmount() {
        document.querySelector(".app_container").classList.remove("height_full");
    }
}
