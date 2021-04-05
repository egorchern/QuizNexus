import { user } from "pg/lib/defaults";
import * as React from "react";
import { render } from "react-dom";

export class Game extends React.Component{
    join_code: any;
    constructor(props){
        super(props);
        this.join_code = this.props.join_code;
        this.state = {
            username: undefined,
            game_state: "username_prompt",
            username_value: ""
        }
        let fetch_body = {
            join_code: this.join_code
        }
        
        fetch_body = JSON.stringify(fetch_body);
        // Get user info 
        fetch("/get_user_info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: fetch_body
        })
        .then(result => result.json())
        .then(result => {
            let user_info = result.user_info;
            if(user_info.username != undefined){
                this.setState({
                    game_state: "lobby"
                })
            }
            
        })
    }
    on_username_value_change = (ev) => {
        this.setState({
            username_value: ev.target.value
        })
    }
    on_submit_username = () => {
        let fetch_body = {
            join_code: this.join_code,
            username: this.state.username_value
        }
        fetch_body = JSON.stringify(fetch_body);
        fetch("/register_user_in_lobby", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: fetch_body
        })
        .then(result => result.json())
        .then(result => {
            let code = result.code;
            if(code === 2){
                this.setState({
                    username: this.state.username_value,
                    game_state: "lobby"
                })
            }
        })
    }
    render(){
        let content;
        let state = this.state.game_state;
        if(state === "username_prompt"){
            content = (
                <div className="username_prompt">
                    <span>
                        Choose a username:
                    </span>
                    <input value={this.state.username_value} onChange={this.on_username_value_change} className="form-control username_input">
                    </input>
                    <button className="btn btn-primary" onClick={this.on_submit_username}>
                        Submit
                    </button>
                </div>
            )
        }
        else if(state === "lobby"){
            content = (
                <div className="lobby">
                    <span className="join_code">Join code: {this.join_code}</span>
                </div>
            )
        }
        return(
            <div className="game">
                {content}
            </div>
        )
        
    }
}