import * as React from "react";
import { render } from "react-dom";

interface Answers_breakdown_props{
    assets: any,
    username: string,
    questions: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    all_answers: any[]
}

interface Answers_breakdown_state{

}

export class Answers_breakdown extends React.Component<Answers_breakdown_props, Answers_breakdown_state> {
    constructor(props: Answers_breakdown_props) {
        super(props);
    }
    render() {
        let all_answers = this.props.all_answers;
        let username = this.props.username;
        let questions = this.props.questions;
        let assets = this.props.assets;
        let own_answers_index;
        let content = null;
        let correct_answers, number_of_questions, correct_answer_percent;
        let points_earned, points_total, points_earned_percentage;
        if (all_answers.length > 0 && questions.length > 0) {
            
            for (let i = 0; i < all_answers.length; i += 1) {
                if (all_answers[i].username === username) {
                    own_answers_index = i;
                }
            }

            let own_answers = all_answers[own_answers_index].answers;
            
            let own_answers_keys = Object.keys(own_answers);
            
            number_of_questions = own_answers_keys.length;
            correct_answers = 0;
            points_earned = 0;
            points_total = 0;
            
            content = own_answers_keys.map((key, index) => {
                let current_question_obj = questions[index];
                
                let answer = own_answers[key];
                points_earned += answer.points_earned;
                points_total += current_question_obj.points_base;
                let is_correct = answer.is_correct;
                let own_answer_string = ``;
                for (let i = 0; i < answer.answer_indexes.length; i += 1) {
                    let answer_index = answer.answer_indexes[i];
                    let answer_string = current_question_obj.answer_choices[answer_index];
                    if (i === answer.answer_indexes.length - 1) {
                        own_answer_string += answer_string
                    }
                    else {
                        own_answer_string += `${answer_string}, `;
                    }
                }
                let correct_answer_string = ``;
                for (let i = 0; i < answer.correct_answer_indexes.length; i += 1) {
                    let answer_index = answer.correct_answer_indexes[i];
                    let answer_string = current_question_obj.answer_choices[answer_index];
                    if (i === answer.correct_answer_indexes.length - 1) {
                        correct_answer_string += answer_string
                    }
                    else {
                        correct_answer_string += `${answer_string}, `;
                    }
                }
                let mark_src;
                if (is_correct) {
                    mark_src = assets.tick;
                    correct_answers += 1;
                }
                else {
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
                                : null
                        }
                    </div>
                )
            })
            correct_answer_percent = Math.floor(correct_answers / number_of_questions * 100);
            points_earned_percentage = Math.floor(points_earned / points_total * 100);
            

        }
        return (
            <div className="answers_breakdown">
                {
                    correct_answers != undefined && points_earned != undefined ? (
                        <div className="two_column_grid">
                            <span className="text_align_center">
                                Correct answers: {correct_answers} / {number_of_questions}
                            </span>
                            <span className="text_align_center">
                                Percentage: {correct_answer_percent}%
                            </span>
                            <span className="text_align_center">
                                Points earned: {points_earned} / {points_total}
                            </span>
                            <span className="text_align_center">
                                Percentage: {points_earned_percentage}%
                            </span>
                        </div>
                    )
                    :null
                }
                
                
                {content}
            </div>
        )

    }
}