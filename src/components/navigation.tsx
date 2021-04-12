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
                                <div onClick={() => {
                                    this.props.switch_page_state("home");
                                }}>
                                    <span>Home</span>
                                </div>
                                <div onClick={() => {
                                    this.props.switch_page_state("browse");
                                }}>
                                    <span>Browse</span>
                                </div>
                                <div>
                                    <span>Log in</span>
                                </div>
                                <div>
                                    <span>Register</span>
                                </div>
                            </div>
                        )
                            : null
                    }
                </SlideDown>
                <div className="navigation_buttons_container desktop_nav">
                    <div onClick={() => {
                        this.props.switch_page_state("home");
                    }}>
                        <span>Home</span>
                    </div>
                    <div onClick={() => {
                        this.props.switch_page_state("browse");
                    }}>
                        <span>Browse</span>
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