import * as React from "react";
import { render } from "react-dom";

interface Edit_props {
    edit_quiz_id: number,
    categories: string[]
}

interface Edit_state {
    quiz_questions?: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    quiz_descriptors?: { category: string, creators_name: string, date_created: string, description: string, difficulty: string, number_of_questions: number, quiz_id: number, time_to_complete: number, title: string };
}

interface Quiz_descriptors_edit_props {
    quiz_descriptors: { category: string, creators_name: string, date_created: string, description: string, difficulty: string, number_of_questions: number, quiz_id: number, time_to_complete: number, title: string };
    categories: string[];
}

interface Quiz_descriptors_edit_state {
    title_value: string;
    description_value: string;
    category_value: string;
    difficulty_value: string;
}
class Quiz_descriptors_edit extends React.Component<Quiz_descriptors_edit_props, Quiz_descriptors_edit_state>{
    categories: JSX.Element[];
    constructor(props: Quiz_descriptors_edit_props) {
        super(props);
        this.state = {
            title_value: this.props.quiz_descriptors.title,
            description_value: this.props.quiz_descriptors.description,
            difficulty_value: this.props.quiz_descriptors.difficulty,
            category_value: this.props.quiz_descriptors.category
        }
        this.categories = this.props.categories.map((category, index) => {
            return <option key={index}>{category}</option>;
        });
    }
    on_title_value_change = (ev) => {
        this.setState({
            title_value: ev.target.value
        })
    }
    on_description_value_change = (ev) => {
        this.setState({
            description_value: ev.target.value
        })
    }
    on_difficulty_value_change = (ev) => {
        this.setState({
            difficulty_value: ev.target.value
        })
    }
    on_category_value_change = (ev) => {
        this.setState({
            category_value: ev.target.value
        })
    }
    render() {
        return (
            <div className="quiz_descriptors flex_vertical">
                <input className="form-control title reset_input"
                    value={this.state.title_value}
                    onChange={this.on_title_value_change}
                >
                </input>
                <div className="quiz_descriptors_item description_container">
                    <span className="quiz_heading">
                        Description
                    </span>
                    <textarea className="form-control description reset_input" value={this.state.description_value} onChange={this.on_description_value_change}>

                    </textarea>

                </div>
                <div className="quiz_descriptors_item two_column_grid">
                    <div className="flex_vertical">
                        <span className="quiz_heading">
                            Category
                        </span>
                        <select className="form-select select" value={this.state.category_value} onChange={this.on_category_value_change}>
                            {this.categories}
                        </select>
                    </div>
                    <div className="flex_vertical">
                        <span className="quiz_heading">
                            Difficulty
                        </span>
                        <select className="form-select select" value={this.state.difficulty_value} onChange={this.on_difficulty_value_change}>

                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>

                </div>
            </div>
        )
    }
}

export class Edit extends React.Component<Edit_props, Edit_state>{
    constructor(props: Edit_props) {
        super(props);
        this.state = {

        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let edit_regex = new RegExp("^/edit/(?<edit_quiz_id>[0-9A-Z]+)$");
        let temp = edit_regex.exec(path_name);
        if (temp === null) {
            history.pushState({ page_state: "edit", edit_quiz_id: this.props.edit_quiz_id }, "Edit", `edit/${this.props.edit_quiz_id}`);
        }

    }

    componentDidMount() {
        // Prevents fetching of quiz details when creating a new quiz (since quiz_id = 0)
        if (this.props.edit_quiz_id != 0) {
            this.fetch_quiz_descriptors();
            this.fetch_quiz_questions();

        }

    }

    // Fetches quiz_questions from server and handles the response code
    fetch_quiz_questions = () => {

        fetch("/get_quiz_questions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_id: this.props.edit_quiz_id
            })
        }).then(result => result.json())
            .then(result => {
                console.log(result);
                let code = result.code;
                if (code === 2) {
                    this.setState({
                        quiz_questions: result.questions
                    })
                }
            })
    }

    // Fetcjes quiz descriptors from server
    fetch_quiz_descriptors = () => {
        fetch("/get_quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_ids: [this.props.edit_quiz_id]
            })
        }).then(result => result.json())
            .then(result => {
                let quiz_descriptors = result.quizzes[0];
                this.setState({
                    quiz_descriptors: quiz_descriptors
                })

            })
    }

    render() {
        return (
            <div className="edit">
                {
                    this.state.quiz_descriptors != undefined ?
                        (
                            <Quiz_descriptors_edit
                                quiz_descriptors={this.state.quiz_descriptors}
                                categories={this.props.categories}
                            >

                            </Quiz_descriptors_edit>
                        )
                        : null
                }
            </div>
        )
    }
}