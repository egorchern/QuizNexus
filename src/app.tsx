import * as React from "react";
import {render} from "react-dom";
import {Navigation} from "./components/navigation";
import {Home} from "./components/home";
import {Browse} from "./components/browse";
import {Game} from "./components/game";
import assets from "./assets/*.png";
import "animate.css";

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
        let page_state = "home";
        let path_name = location.pathname;
        if(path_name === "/browse"){
            page_state = "browse";
        }
        this.state = {
            page_state: page_state,
            join_code: undefined
        };
        window.onpopstate = (ev) => {
            let state = ev.state;
            if(state.page_state === "game"){
                this.setState({
                    page_state: state.page_state,
                    join_code: state.join_code
                })
            }
            else{
                this.setState({
                    page_state: state.page_state
                })
            }
        }

        // Get information from url and switch state appropriately
        
        console.log(path_name);
        let lobby_regex = new RegExp("^/lobby/(?<join_code>[0-9A-Z]+)$");
        let temp = lobby_regex.exec(path_name);
        
        if(temp != null){
            this.join(temp.groups.join_code);
        }
        
       
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
            if(code === 4){
                this.setState({
                    page_state: "game",
                    join_code: join_code
                })
            }
            if(code === 1){
                alert(`Lobby with join code: ${join_code} does not exist! Please check if the join code is correct`);
            }
            if(code === 2){
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
        else if(state === "game"){
            content = (
                <Game
                join_code={this.state.join_code}
                assets={assets}
                >

                </Game>
            )
        }
        return (
            <div className="app_container">
                <Navigation
                    icon={assets.icon}
                    switch_page_state={this.switch_page_state}
                ></Navigation>
                {content}
            </div>
        );
    }
}

render(<App></App>, root);
