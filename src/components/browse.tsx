import * as React from "react";
import { render } from "react-dom";

export class Browse extends React.Component {
    categories: any;
    constructor(props) {
        super(props);
        this.state = {
            results: [
                {
                    title: "Личная проверка",
                    description: "Sample",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 4,
                    number_of_questions: 8,
                    category: "General",
                    difficulty: "Easy",
                },
                {
                    title: "Личная проверкаа",
                    description: "Sample",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 4,
                    number_of_questions: 8,
                    category: "General",
                    difficulty: "Easy",
                },
                {
                    title: "JS quiz",
                    description: "Sample sampleee",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 12,
                    number_of_questions: 20,
                    category: "Programming",
                    difficulty: "Medium",
                },
                {
                    title: "Differentiation",
                    description: "Differentiate with speed",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 10,
                    number_of_questions: 12,
                    category: "Mathematics",
                    difficulty: "Hard",
                },
                {
                    title: "Integration",
                    description: "Integrate with speed",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 10,
                    number_of_questions: 12,
                    category: "Mathematics",
                    difficulty: "Medium",
                },
                {
                    title: "Formulas",
                    description: "Test your knowledge in formulas",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 10,
                    number_of_questions: 12,
                    category: "Mathematics",
                    difficulty: "Medium",
                },
                {
                    title: "Formulas",
                    description: "Test your knowledge in formulas",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 10,
                    number_of_questions: 12,
                    category: "Mathematics",
                    difficulty: "Hard",
                },
                {
                    title: "Formulas",
                    description: "Test your knowledge in formulas",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 10,
                    number_of_questions: 12,
                    category: "Mathematics",
                    difficulty: "Hard",
                },
                {
                    title: "Formulas",
                    description: "Test your knowledge in formulas",
                    creators_name: "egorcik",
                    date_created: "03/04/2021",
                    time_to_complete: 10,
                    number_of_questions: 12,
                    category: "Mathematics",
                    difficulty: "Hard",
                },
            ],

            title_value: "",
            time_min_value: "",
            time_max_value: "",
            category_value: "Any",
            difficulty_value: "Any",
        };
        // Get markup for categories passed in the props
        this.categories = this.props.categories.map((category, index) => {
            return <option key={index}>{category}</option>;
        });
    }
    on_title_change = (ev) => {
        this.setState({
            title_value: ev.target.value,
        });
    };
    on_time_min_change = (ev) => {
        this.setState({
            time_min_value: ev.target.value,
        });
    };
    on_time_max_change = (ev) => {
        this.setState({
            time_max_value: ev.target.value,
        });
    };
    on_category_change = (ev) => {
        this.setState({
            category_value: ev.target.value,
        });
    };
    on_difficulty_change = (ev) => {
        this.setState({
            difficulty_value: ev.target.value,
        });
    };
    render() {
        let matching_results = [];
        // Find quizzes that match the search criteria
        for (let i = 0; i < this.state.results.length; i += 1) {
            let current_quiz = this.state.results[i];
            if (
                (this.state.difficulty_value === "Any" || this.state.difficulty_value === current_quiz.difficulty) 
                && (this.state.category_value === "Any" || this.state.category_value === current_quiz.category)
                && (this.state.time_min_value === "" || current_quiz.time_to_complete >= Number(this.state.time_min_value)) 
            ) {
                matching_results.push(current_quiz);
            }
        }
        // Get markup for search results
        let browse_results = matching_results.map((quiz, index) => {
            return (
                <div className="browse_results_item" key={index}>
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
                        <button className="btn btn-primary flex_horizontal">
                            Start
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

        return (
            <div className="browse">
                <div className="browse_toolbar">
                    <div className="browse_input_container">
                        <span>Title:</span>
                        <input
                            className="form-control"
                            value={this.state.title_value}
                            onChange={this.on_title_change}
                        ></input>
                    </div>
                    <div className="browse_input_container">
                        <span>Time to complete (minutes):</span>
                        <div className="two_column_grid">
                            <input
                                className="form-control"
                                placeholder="min:"
                                value={this.state.time_min_value}
                                onChange={this.on_time_min_change}
                            ></input>
                            <input
                                className="form-control"
                                placeholder="max:"
                                value={this.state.time_max_value}
                                onChange={this.on_time_max_change}
                            ></input>
                        </div>
                    </div>
                    <div className="browse_input_container">
                        <span>Difficulty:</span>
                        <select
                            className="form-select"
                            value={this.state.difficulty_value}
                            onChange={this.on_difficulty_change}
                        >
                            <option>Any</option>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div className="browse_input_container">
                        <span>Category:</span>
                        <select
                            className="form-select"
                            value={this.state.category_value}
                            onChange={this.on_category_change}
                        >
                            <option>Any</option>
                            {this.categories}
                        </select>
                    </div>
                </div>
                <div className="browse_results">{browse_results}</div>
            </div>
        );
    }
}
