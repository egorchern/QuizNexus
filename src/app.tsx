import * as React from "react";
import { render } from "react-dom";
import { Navigation } from "./components/navigation";
import { Home } from "./components/home";
import { Browse } from "./components/browse";
import { Game } from "./components/game";
import { Register } from "./components/register";
import { Login } from "./components/login";
import assets from "./assets/*.png";
import "animate.css";
import { User_profile } from "./components/user_profile";
import { Edit } from "./components/edit";


let root = document.querySelector("#root");
let categories = [
    "Programming",
    "Video games",
    "Mathematics",
    "History",
    "General",
    "Russian&English",
    "Chess",
];
let socket;

class App extends React.Component {
    constructor(props) {
        super(props);
        let page_state;
        let path_name = location.pathname;
        if(path_name === "/home"){
            page_state = "home";
        }
        if (path_name === "/browse") {
            page_state = "browse";
        }
        if (path_name === "/register") {
            page_state = "register";
        }
        if (path_name === "/login") {
            page_state = "login";
        }
        if (path_name === "/user_profile") {
            page_state = "user_profile"
        }
        this.state = {
            page_state: page_state,
            join_code: undefined,
            global_username: null,
            edit_quiz_id: undefined
        };



    }
    componentDidMount() {
        let path_name = location.pathname;
        window.onpopstate = (ev) => {
            let state = ev.state;
            if (state.page_state === "game") {
                this.setState({
                    page_state: state.page_state,
                    join_code: state.join_code
                })
            }
            if (state.page_state === "edit") {
                this.setState({
                    page_state: state.page_state,
                    edit_quiz_id: state.edit_quiz_id
                })
            }
            else {
                this.setState({
                    page_state: state.page_state
                })
            }
        }
        // Get information from url and switch state appropriately


        let lobby_regex = new RegExp("^/lobby/(?<join_code>[0-9A-Z]+)$");
        let temp = lobby_regex.exec(path_name);

        if (temp != null) {
            this.join(temp.groups.join_code);
        }

        let edit_regex = new RegExp("^/edit/(?<edit_quiz_id>[0-9A-Z]+)$");
        temp = edit_regex.exec(path_name);
        if (temp != null) {
            console.log("reach");
            this.edit(Number(temp.groups.edit_quiz_id));
        }

        fetch("/get_global_username", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(result => result.json())
            .then(result => {
                let username = result.username;
                if (username != null) {
                    this.setState({
                        global_username: username
                    })
                }

            })
    }
    join = (join_code) => {
        let fetch_body = {
            join_code: join_code
        }
        fetch_body = JSON.stringify(fetch_body);
        // Check whether the lobby with selected join code exists and whether it can be joined
        // Response codes: 1 - lobby does not exist, 2 - lobby exists, but the game has already started, 3 - Game finished, 4 - lobby can be joined
        fetch("/can_join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: fetch_body

        })
            .then(result => result.json())
            .then(result => {
                // Response codes: 1 - lobby does not exist, 2 - lobby exists, but the game has already started, 3 - Game finished, 4 - lobby can be joined
                let code = result.code;
                console.log(code);
                if (code === 4) {
                    this.setState({
                        page_state: "game",
                        join_code: join_code
                    })
                }
                if (code === 1) {
                    alert(`Lobby with join code: ${join_code} does not exist! Please check if the join code is correct`);
                }
                if (code === 2) {
                    alert(`Lobby with join code: ${join_code} does exist, but the host has already started the quiz`);
                }
            })
    };
    start_quiz = (quiz_id) => {
        let jsoned = {
            quiz_id: quiz_id
        }
        jsoned = JSON.stringify(jsoned);

        // Post to the start_quiz route with quiz_id in the body. Get join_code as the response
        fetch("/start_quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: jsoned,
        })
            .then((result) => result.json())
            .then((data) => {
                let join_code = data.join_code;
                this.setState({
                    page_state: "game",
                    join_code: join_code
                })
            });
    };
    register = (username, password) => {
        return new Promise(resolve => {
            fetch("/register_user_globally", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }).then(result => result.json())
                .then(result => {
                    let code = result.code;
                    resolve(code);
                })
        })

    }
    log_in = (username: string, password: string) => {
        return new Promise(resolve => {
            fetch("/log_in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }).then(result => result.json())
                .then(result => {
                    let code = result.code;
                    resolve(code);
                })
        })
    }
    edit = (quiz_id: number) => {
        this.setState({
            page_state: "edit",
            edit_quiz_id: quiz_id
        })
    }
    switch_page_state = (state) => {
        //To prevent unneeded switches from same state
        if (this.state.page_state != state) {
            this.setState({
                page_state: state,
            });
        }
    };
    render() {
        let content;
        let state = this.state.page_state;
        // Logic for switching page state, such as from home page to browse page
        if (state === "home") {
            content = (
                <Home
                    switch_page_state={this.switch_page_state}
                    join={this.join}
                ></Home>
            );
        } else if (state === "browse") {
            content = (
                <Browse
                    switch_page_state={this.switch_page_state}
                    categories={categories}
                    start_quiz={this.start_quiz}
                ></Browse>
            );
        }
        else if (state === "game") {
            content = (
                <Game
                    join_code={this.state.join_code}
                    assets={assets}
                >

                </Game>
            )
        }
        else if (state === "register") {

            content = (
                <Register
                    register={this.register}
                >

                </Register>
            )
        }
        else if (state === "login") {
            content = (
                <Login
                    log_in={this.log_in}
                    switch_page_state={this.switch_page_state}
                >

                </Login>
            )
        }
        else if (state === "user_profile") {
            content = (
                <User_profile
                    edit={this.edit}
                >

                </User_profile>
            )
        }
        else if (state === "edit") {
            content = (
                <Edit
                    edit_quiz_id={this.state.edit_quiz_id}
                    categories={categories}
                    switch_page_state={this.switch_page_state}
                >

                </Edit>
            )
        }
        else{
            content = null
        }
        return (
            <div className="app_container">
                <Navigation
                    icon={assets.icon}
                    switch_page_state={this.switch_page_state}
                    username={this.state.global_username}
                ></Navigation>
                {content}
            </div>
        );
    }
}

render(<App></App>, root);
