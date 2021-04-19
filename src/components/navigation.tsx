import * as React from 'react';
import { render } from 'react-dom';
import { SlideDown } from "react-slidedown";

export class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_mobile_nav_opened: false
        }
    }
    on_hamburger_click = () => {
        this.setState({
            is_mobile_nav_opened: !this.state.is_mobile_nav_opened
        });
    }
    render() {
        let nav_button_class_list = "ham hamRotate ham1 mobile_nav ";
        let username = this.props.username;
        if (this.state.is_mobile_nav_opened === true) {
            nav_button_class_list += "active ";
        }

        return (
            <div className="navigation">
                <div className="flex_horizontal">
                    <svg className={nav_button_class_list} viewBox="0 0 100 100" width="75" onClick={this.on_hamburger_click} fill="white">
                        <path
                            className="line top"
                            d="m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40" />
                        <path
                            className="line middle"
                            d="m 30,50 h 40" />
                        <path
                            className="line bottom"
                            d="m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40" />
                    </svg>
                    <div className="navigation_logo_container">
                        <img src={this.props.icon} className="navigation_logo">

                        </img>
                        <span>QuizNexus</span>
                    </div>
                </div>

                <SlideDown className="mobile_nav">
                    {
                        this.state.is_mobile_nav_opened === true ? (
                            <div className="navigation_buttons_container">
                                <div className="navigation_button" onClick={() => {
                                    this.props.switch_page_state("home");
                                }}>
                                    <span>Home</span>
                                </div>
                                <div className="navigation_button" onClick={() => {
                                    this.props.switch_page_state("browse");
                                }}>
                                    <span>Browse</span>
                                </div>
                                {
                                    username === null ? (
                                        <div className="login_container">
                                            <div className="navigation_button" onClick={() => {
                                                this.props.switch_page_state("login");
                                            }} >
                                                <span>Log in</span>
                                            </div>
                                            <div className="navigation_button" onClick={() => {
                                                this.props.switch_page_state("register");
                                            }}>
                                                <span>Register</span>
                                            </div>
                                        </div>
                                    )
                                        : (
                                            <div className="navigation_button">
                                                <div className="flex_horizontal">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="person_icon" viewBox="0 0 16 16">
                                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                                                    </svg>
                                                    <span>
                                                        {username}
                                                    </span>
                                                </div>
                                            </div>
                                        )

                                }

                            </div>
                        )
                            : null
                    }
                </SlideDown>
                <div className="navigation_buttons_container desktop_nav">
                    <div className="navigation_button" onClick={() => {
                        this.props.switch_page_state("home");
                    }}>
                        <span>Home</span>
                    </div>
                    <div className="navigation_button" onClick={() => {
                        this.props.switch_page_state("browse");
                    }}>
                        <span>Browse</span>
                    </div>
                    {
                        username === null ? (
                            <div className="login_container">
                                <div className="navigation_button" onClick={() => {
                                    this.props.switch_page_state("login");
                                }} >
                                    <span>Log in</span>
                                </div>
                                <div className="navigation_button" onClick={() => {
                                    this.props.switch_page_state("register");
                                }}>
                                    <span>Register</span>
                                </div>
                            </div>
                        )
                            : (
                                <div className="navigation_button">
                                    <div className="flex_horizontal">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="person_icon" viewBox="0 0 16 16">
                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                                        </svg>
                                        <span>
                                            {username}
                                        </span>
                                    </div>
                                </div>
                            )

                    }

                </div>
            </div>
        )
    }
}