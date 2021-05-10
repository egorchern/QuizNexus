import * as React from "react";
import { render } from "react-dom";
import {Answers_breakdown} from "./answers_breakdown";
import {Answer_grid} from "./answer_grid";

interface Record_props{
   record_id: number
}
interface Record_state{
    questions?: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    record?: {
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
        username: string,
        answers: {
            username: string,
            answers: {
                answer_indexes: number[],
                correct_answer_indexes: number[],
                is_correct: boolean,
                points_earned: number,
                question_number: number,
                record_id: number
            }[]
        }
    }
}   

export class Record extends React.Component<Record_props, Record_state> {
    constructor(props: Record_props){
        super(props);
        this.state = {

        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let edit_regex = new RegExp("^/view_record/(?<edit_quiz_id>[0-9A-Z]+)$");
        let temp = edit_regex.exec(path_name);
        if (temp === null) {
            history.pushState({ page_state: "view_record", record_id: this.props.record_id }, "View record", `view_record/${this.props.record_id}`);
        }
    }
    fetch_record = () => {
        fetch("/get_record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                record_id: this.props.record_id
            })
        })
        .then(result => result.json())
        .then(result => {
            if(result.code === 2){
                let local_result = result;
                let new_answers = [];
                new_answers.push({
                    username: local_result.record.username,
                    answers: local_result.record.answers
                });
                local_result.record.answers = new_answers;
                this.setState({
                    record: local_result.record,
                    questions: local_result.questions
                });
            }
        })
    }
    componentDidMount(){
        document.querySelector(".app_container").classList.add("height_full");
        this.fetch_record();
    }
    componentWillUnmount() {
        document.querySelector(".app_container").classList.remove("height_full");
    }
    render(){
        let content = null;
        if(this.state.record != undefined){
            content = (
                <div>
                    <Answer_grid
                    answers_list={this.state.record.answers}
                    number_of_questions={this.state.record.answers[0].answers.length}
                    >

                    </Answer_grid>
                    <Answers_breakdown
                    username={this.state.record.username}
                    questions={this.state.questions}
                    all_answers={this.state.record.answers}
                    >

                    </Answers_breakdown>
                </div>
                
            )
        }
        return (
            <div className="view_record flex_vertical">
                {content}
            </div>
        )
    }
}