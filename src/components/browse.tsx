import * as React from 'react';
import { render } from 'react-dom';

export class Browse extends React.Component{
    categories: any;
    constructor(props){
        super(props);
        this.state = {
            results: [{
                title: "Личная проверка",
                description: "Sample",
                creator_name: "egorcik",
                date_created: "03/04/2021",
                time_to_complete: 4,
                questions: 8,
                category: "General",
                difficulty: "Easy"

            }]
        }
        // Get markup for categories passed in the props
        this.categories = this.props.categories.map((category, index) => {
            return (
                <option key={index}>
                    {category}
                </option>
            )
        })
    }
    render(){
        // Get markup for search results
        let browse_results = this.state.results.map((quiz, index) => {
            return (
                <div className="browse_results_item" key={index}>
                    <span>{quiz.title}</span>
                </div>
            )
        })
        return (
            <div className="browse">
                <div className="browse_toolbar">
                    <div className="browse_input_container">
                        <span>
                            Title:
                        </span>
                        <input className="form-control">
                        </input>
                    </div>
                    <div className="browse_input_container">
                        <span>
                            Time to complete (minutes):
                        </span>
                        <div className="two_column_grid">
                            <input className="form-control" placeholder="min:">
                            </input>
                            <input className="form-control" placeholder="max:">
                            </input>
                        </div>
                        
                    </div>
                    <div className="browse_input_container">
                        <span>
                            Difficulty:
                        </span>
                        <select className="form-select">
                            <option>Any</option>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>  
                    <div className="browse_input_container">
                        <span>
                            Category:
                        </span>
                        <select className="form-select">
                            <option>Any</option>
                            {this.categories}
                        </select>
                    </div>
                </div>
                <div className="browse_results">
                    {browse_results}
                </div>
            </div>
        )
    }
}