import * as React from 'react';
import { render } from 'react-dom';

export class Browse extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div className="browse">
                <div className="browse_toolbar">
                    <div className="browse_input_container">
                        <span>
                            Name:
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
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    
                </div>
                <div className="browse_results">
                    <span>Results</span>
                </div>
            </div>
        )
    }
}