import * as React from 'react';
import { render } from 'react-dom';

export class Navigation extends React.Component{
    constructor(props){
        super(props);
        
    }
    render(){
        return (
            <div className="navigation">
                <div className="navigation_logo_container">
                    <img src={this.props.icon} className="navigation_logo"> 

                    </img>
                    <span>QuizNexus</span>
                </div>
                <div className="navigation_buttons_container">
                    <div>
                        <span>Home</span>
                    </div>
                    <div>
                        <span>Log in</span>
                    </div>
                    <div>
                        <span>Register</span>
                    </div>
                </div>
                
            </div>
        )
    }
}