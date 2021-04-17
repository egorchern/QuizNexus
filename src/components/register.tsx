import * as React from 'react';
import { render } from 'react-dom';

export class Register extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username_value: "",
            password_value: "",
            confirm_password_value: ""
        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let regex = new RegExp("^/register$");
        let temp = regex.exec(path_name);
        if(temp === null){
            history.pushState({page_state: "register"}, "Register", "/register");
        }
    }
    on_register_button_click = () => {
        let username = this.state.username_value;
        let password = this.state.password_value;
        let confirm_password = this.state.confirm_password_value;
        if(username != "" && password != "" && confirm_password != ""){
            if(password === confirm_password){
                this.props.register(username, password);
            }
            else{
                alert("Passwords don't match. Please make sure that password is typed correctly in the Confirm password field");
            }
        }
        else{
            alert("Some fields were left empty. Please fill-in all of the fields")
        }
    }
    on_username_value_change = (ev) => {
        this.setState({
            username_value: ev.target.value
        })
    }
    on_password_value_change = (ev) => {
        this.setState({
            password_value: ev.target.value
        })
    }
    on_confirm_password_value_change = (ev) => {
        this.setState({
            confirm_password_value: ev.target.value
        })
    }
    render(){
        return (
            <div className="register">
                <div className="register_container">
                    <div className="register_benefits">
                        <div className="register_benefits_row">
                            <h2>If you register:</h2>
                        </div>
                        <div className="register_benefits_row">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="plus_svg" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            <span>
                                Your username will be reserved and you won't have to enter a username after joining a quiz
                            </span>
                        </div>
                        <div className="register_benefits_row">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="plus_svg" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            <span>
                                You will be able to create your own quizzes. You will also be able to give a like or dislike to a quiz
                            </span>
                        </div>
                        <div className="register_benefits_row">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="plus_svg" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            <span>
                                Your quiz results will be saved, and you would be able to view your account-wide statistics
                            </span>
                        </div>
                        
                    </div>
                    <div className="register_form_container">
                        <div className="register_form">
                            <span>
                                Username
                            </span>
                            <input className="form_control join_input" value={this.state.username_value} onChange={this.on_username_value_change}></input>
                            <span>
                                Password
                            </span>
                            <input className="form_control join_input" type="password" value={this.state.password_value} onChange={this.on_password_value_change}></input>
                            <span>
                                Confirm password
                            </span>
                            <input className="form_control join_input" type="password" value={this.state.confirm_password_value} onChange={this.on_confirm_password_value_change}></input>
                            <button className="btn btn-primary" onClick={this.on_register_button_click}>
                                Register
                            </button>
                        </div>
                    </div>
                    
                </div>
                
            </div>
        )
    }
}