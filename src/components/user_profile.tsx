import * as React from "react";
import {render} from "react-dom";
import { Quizzes_container } from "./quizzes_container";
interface IProps {
    edit: Function;
}

interface IState {
    user_info?: {username: string, created_quiz_ids: number[], result_records: {
        date: string,
        performance_data: {
            correct_answers: number,
            answers_total: number,
            correct_answers_percentage: number,
            points_earned: number,
            points_earned_percentage: number,
            total_points: number
        },
        quiz_id: number,
        record_id: number,
        answers: {
            answer_indexes: number[],
            correct_answer_indexes: number[],
            is_correct: boolean,
            points_earned: number,
            question_number: number,
            record_id: number
        }[]
    }[]},
    created_quizzes?: { title: string, category: string, difficulty: string, date_created: string, time_to_complete: number, creators_name: string, number_of_questions: number, description: string, quiz_id: string }[];
    stats: {
        average_score_percentage?: number,
        average_correct_answers_percentage?: number,
    }
}

interface account_props {
    stats: {
        average_score_percentage: number,
        average_correct_answers_percentage: number,
        
    },
    username: string
}

interface account_state {

}

function calculate_mean(array: number[]){
    let n = array.length;
    let total = 0;
    array.forEach(num => {
        total += num;
    })
    
    let mean = Math.floor((total / n));
    return mean;
}

export class User_profile extends React.Component<IProps, IState> {
    constructor(props: IProps){
        super(props);
        this.state = {
            stats: {

            }
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
                this.calculate_stats();
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
    on_quiz_button_click = (quiz_id) => {
        if(quiz_id === 0){
            fetch("/create_new_quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            .then(result => result.json())
            .then(result => {
                this.props.edit(result.quiz_id);
            })
        }
        else{
            this.props.edit(quiz_id);
        }
    }
    log_out = () => {
        fetch("/log_out", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }

        }).then(result => result.json())
        .then(result => {
            let code = result.code;
            if(code === 2){
                location.reload();
            }
        })
    }
    calculate_stats = () => {
        let result_records = this.state.user_info.result_records;
        let correct_answers_percentages = [];
        let points_earned_percentages = []
        result_records.forEach(result_record => {
            let performance_data = result_record.performance_data;
            correct_answers_percentages.push(performance_data.correct_answers_percentage);
            points_earned_percentages.push(performance_data.points_earned_percentage);
        })
        console.log(correct_answers_percentages, points_earned_percentages);
        this.state.stats.average_correct_answers_percentage = calculate_mean(correct_answers_percentages);
        this.state.stats.average_score_percentage = calculate_mean(points_earned_percentages);
        this.forceUpdate();
        
    }
    render(){
        return (
            <div className="user_profile">
                <div className="user_stats">
                    <button className="btn btn-danger log_out" onClick={this.log_out}>
                        Log out
                    </button>
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