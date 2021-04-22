import * as React from "react";
import { render } from "react-dom";
import { Quizzes_container } from "./quizzes_container";

export class Browse extends React.Component {
    categories: any;
    constructor(props) {
        super(props);
        this.state = {
            results: [
                
            ],

            title_value: "",
            time_min_value: "",
            time_max_value: "",
            category_value: "Any",
            difficulty_value: "Any",
        };
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let regex = new RegExp("^/browse$");
        let temp = regex.exec(path_name);
        if(temp === null){
            history.pushState({page_state: "browse"}, "Browse", "/browse");
        }
        
        // Fetch all quizzes from the server and set the state when response received
        fetch("/get_quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(result => result.json())
        .then(data => {
            let quizzes = data.quizzes;
            this.setState({
                results: quizzes
            })
        })
        
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
            // Matches whether the quiz title contains title search criteria
            let regex = new RegExp(`.*${this.state.title_value}.*`, "i");
            let regex_matches_bool = current_quiz.title.match(regex) != null;
            if (
                
                (this.state.difficulty_value === "Any" || this.state.difficulty_value === current_quiz.difficulty) 
                && (this.state.category_value === "Any" || this.state.category_value === current_quiz.category)
                && (this.state.time_min_value === "" || current_quiz.time_to_complete >= Number(this.state.time_min_value)) 
                && (this.state.time_max_value === "" || current_quiz.time_to_complete <= Number(this.state.time_max_value))
                && regex_matches_bool === true
            ) {
                matching_results.push(current_quiz);
            }
        }
        

        return (
            <div className="browse">
                <div className="browse_toolbar animate__animated animate__zoomInLeft">
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
                <div className="browse_results animate__animated animate__zoomInRight">
                    {
                        matching_results != undefined || matching_results.length > 0 ?
                            <Quizzes_container
                                quizzes={matching_results}
                                action={this.props.start_quiz}
                                button_text="Start"
                                add_new={false}
                            >

                            </Quizzes_container>
                        :null
                    }
                    
                </div>
            </div>
        );
    }
}
