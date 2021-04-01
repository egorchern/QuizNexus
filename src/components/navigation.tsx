import * as React from 'react';
import { render } from 'react-dom';

export class Navigation extends React.Component{
    constructor(props){
        super(props);
        
    }
    render(){
        return (
            <div className="navigation">
                <img src={this.props.icon} className="navigation_logo"> 
                </img>
                <div className="navigation_item">
                    <span>Home</span>
                </div>
                <div className="navigation_item">
                    <span>Log in</span>
                </div>
                <div className="navigation_item">
                    <span>Register</span>
                </div>
            </div>
        )
    }
}