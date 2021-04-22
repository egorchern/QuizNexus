import * as React from "react";
import {render} from "react-dom";
import { Quizzes_container } from "./quizzes_container";
interface IProps {
    
}

interface IState {
    user_info?: {username: string, created_quiz_ids: number[]},
    created_quizzes?: { title: string, category: string, difficulty: string, date_created: string, time_to_complete: number, creators_name: string, number_of_questions: number, description: string, quiz_id: string }[];
}

export class User_profile extends React.Component<IProps, IState> {
    constructor(props: IProps){
        super(props);
        this.state = {

        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let regex = new RegExp("^/user_profile$");
        let temp = regex.exec(path_name);
        if (temp === null) {
            history.pushState({page_state: "user_profile"}, "User profile", "/user_profile");
        }
        this.fetch_user_info();
    }
    fetch_user_info = () => {
        fetch("/get_global_user_info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(result => result.json())
        .then(result => {
            let code = result.code;
            if(code === 2){
                this.setState({
                    user_info: result.user_info
                })
                this.fetch_created_quizzes();
            }
        })
    }
    fetch_created_quizzes = () => {
        fetch("/get_quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_ids: this.state.user_info.created_quiz_ids
            })
        }).then(result => result.json())
        .then(result => {
            this.setState({
                created_quizzes: result.quizzes
            })
        })
    }
    on_quiz_button_click = () => {

    }
    render(){
        return (
            <div className="user_profile">
                <div>

                </div>
                <div>

                </div>
                <div className="created_quizzes animate__animated animate__zoomInRight">
                    <h2>Created Quizzes</h2>
                    {
                        this.state.created_quizzes != undefined ?
                        <Quizzes_container
                        button_text="Edit"
                        quizzes={this.state.created_quizzes}
                        action={this.on_quiz_button_click}
                        add_new={true}
                        >
                        </Quizzes_container>
                        :null
                    }
                </div>
                
            </div>
        )
    }
}