import {user} from "pg/lib/defaults";
import * as React from "react";
import {render} from "react-dom";
import {io} from "socket.io/client-dist/socket.io";

export class Game extends React.Component {
    join_code: any;
    constructor(props) {
        super(props);
        this.join_code = this.props.join_code;

        this.state = {
            username: undefined,
            game_state: "username_prompt",
            quiz_descriptors: undefined,
            username_value: "",
            participants: [],
            is_host: false,
        };
        // To prevent looping the history pushes i.e not pushing when location already at lobby
        let path_name = location.pathname;
        let lobby_regex = new RegExp("^/lobby/(?<join_code>[0-9A-Z]+)$");
        let temp = lobby_regex.exec(path_name);
        if(temp === null){
            history.pushState({page_state: "game", join_code: this.join_code}, this.join_code, `lobby/${this.join_code}`);
        }
        
        this.get_user_info();
        
    }

    join_io_room = () => {
        this.socket = io.connect();
        this.socket.on("get_quiz_descriptors", data => {
            let quiz_descriptors = data;
            this.setState({
                quiz_descriptors: quiz_descriptors
            })
        })
        this.socket.on("logged_users_in_room", (data) => {
            let logged_users = data;
            this.setState({
                participants: logged_users,
            });
        });
        let body = {
            join_code: this.join_code,
        };
        body = JSON.stringify(body);
        this.socket.emit("connect_to_room", body);
        this.socket.emit("request_quiz_descriptors", body);
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
                if (user_info.role === "host") {
                    this.setState({
                        is_host: true,
                    });
                }
                if (user_info.username != undefined) {
                    this.join_io_room();
                    this.setState({
                        game_state: "lobby",
                    });
                }
            });
    };
    on_username_value_change = (ev) => {
        this.setState({
            username_value: ev.target.value,
        });
    };
    start_game = () => {};
    on_submit_username = () => {
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
                }
                else{
                    alert(`Username: ${this.state.username_value} is already taken! Please choose another username`);
                }
            });
    };
    render() {
        let content;
        let state = this.state.game_state;
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
                    {
                        this.state.quiz_descriptors != undefined ?
                        (
                            <span className="quiz_title">Quiz title: {this.state.quiz_descriptors.title}</span>
                            
                        )
                        :null
                    }
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
                    {
                        this.state.is_host === true ?
                        <button className="btn btn-primary start_button" onClick={this.start_game}>
                            Start
                        </button>
                        :null
                    }
                    
                </div>
            );
        }
        else if(state === "quiz"){
            content = (
                <div className="quiz">

                </div>
            )
        }
        return <div className="game">{content}</div>;
    }
}
