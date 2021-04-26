import * as React from "react";
import {render} from "react-dom";
import {Alert_message} from "./alert";

interface IProps {
    log_in?: Function;
    switch_page_state: Function;
}

interface IState {
    username_value: string;
    password_value: string;
    alert_visibility: boolean;
    alert_color: string;
    alert_message: string;
}

export class Login extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            username_value: "",
            password_value: "",
            alert_message: undefined,
            alert_visibility: false,
            alert_color: undefined,
        };
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let regex = new RegExp("^/login$");
        let temp = regex.exec(path_name);
        if (temp === null) {
            history.pushState({page_state: "login"}, "Login", "/login");
        }
    }
    push_alert = (message: string, color: string) => {
        this.setState({
            alert_message: message,
            alert_color: color,
            alert_visibility: true,
        });
    };
    dismiss_alert = () => {
        this.setState({
            alert_visibility: false,
        });
    };
    on_login_click = () => {
      if(this.state.username_value != "" && this.state.password_value != ""){
        this.props.log_in(this.state.username_value, this.state.password_value).then(code => {
          if(code === 1){
            this.push_alert("Invalid credentials. An account with that username either does not exist, or the password is wrong", "red");
          }
          else{
            this.props.switch_page_state("home");
            location.reload();
          }
        })
      }
      else{
        this.push_alert("Some fields were left empty. Please fill-in all of the fields", "red");
      }
    };
    on_username_value_change = (ev: any) => {
        this.setState({
            username_value: ev.target.value,
        });
    };
    on_password_value_change = (ev: any) => {
        this.setState({
            password_value: ev.target.value,
        });
    };

    render() {
        return (
            <div className="login">
              <Alert_message
                message={this.state.alert_message}
                color={this.state.alert_color}
                alert_visibility={this.state.alert_visibility}
                dismiss_alert={this.dismiss_alert}
                >

                </Alert_message>
                <div className="register_form animate__animated animate__zoomInDown">
                    <span>Username</span>
                    <input
                        className="form_control join_input"
                        value={this.state.username_value}
                        onChange={this.on_username_value_change}
                    ></input>
                    <span>Password</span>
                    <input
                        className="form_control join_input"
                        type="password"
                        value={this.state.password_value}
                        onChange={this.on_password_value_change}
                    ></input>

                    <button
                        className="btn btn-primary"
                        onClick={this.on_login_click}
                    >
                        Log in
                    </button>
                </div>
            </div>
        );
    }
}
