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
            game_state: undefined
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
            console.log(user_info);
        })
    }
    render(){
        return(
            <div className="game">

            </div>
        )
        
    }
}