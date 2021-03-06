import * as React from "react";
import { render } from "react-dom";

interface IProps {
    quizzes: { title: string, category: string, difficulty: string, date_created: string, time_to_complete: number, creators_name: string, number_of_questions: number, description: string, quiz_id: string, rating: number }[];
    action: Function;
    button_text: string;
    add_new: boolean;
}


interface IState {

}

export class Quizzes_container extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);
        this.state = {

        }



    }
    componentDidMount() {


    }
    render() {

        let quizzes = this.props.quizzes.map((quiz, index) => {
            return (
                <div className="quizz" key={index}>
                    <div className="flex_vertical top_part">
                        <span className="result_title">{quiz.title}</span>
                        
                        <span className="result_heading">
                            Category: {quiz.category}
                        </span>
                        <span className="result_heading">
                            Difficulty: {quiz.difficulty}
                        </span>
                        <span className="result_heading">
                            Time to complete: {quiz.time_to_complete} mins
                        </span>
                        <span className="result_heading">
                            Rating: {quiz.rating}
                        </span>
                    </div>
                    <div className="flex_vertical bottom_part">
                        <span className="result_text">
                            Creator's name: {quiz.creators_name}
                        </span>
                        <span className="result_text">
                            Date created: {quiz.date_created}
                        </span>
                        <span className="result_text">
                            Number of questions: {quiz.number_of_questions}
                        </span>
                        <span className="result_text margin_bottom_small">
                            Description: {quiz.description}
                        </span>
                        <button className="btn btn-primary flex_horizontal" onClick={() => {
                            // Call action passed in props
                            this.props.action(quiz.quiz_id);
                        }}>
                            {this.props.button_text}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            );
        });
        if (this.props.add_new) {
            let add_btn = (
                <div key={this.props.quizzes.length} className="create_new_quiz" onClick={() => {
                    this.props.action(0);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="plus_svg" viewBox="0 0 16 16">
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    <span className="result_title">Create new</span>
                </div>
            )
            quizzes.push(add_btn);
        }
        return (
            <div className="quizzes_container">
                {quizzes}
            </div>
        )
    }
}