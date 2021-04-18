import * as React from 'react';
import { render } from 'react-dom';

export class Alert_message extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let color = this.props.color;
        let background_color;
        let border_color;

        if (color === "red") {
            color = "hsl(355deg, 61%, 32%)";
            background_color = "#f8d7da";
            border_color = "#f5c2c7";
        } else if (color === "green") {
            color = "hsl(152deg, 69%, 19%)";
            background_color = "#d1e7dd";
            border_color = "#badbcc";
        }

        let alert_style = {
            color: color,
            backgroundColor: background_color,
            borderColor: border_color,
        };

        let message = this.props.message;
        let animate = this.props.alert_visibility === true;
        let class_list = "alert_message";
        if (animate === true) {
            class_list += " animate_fade_in";
        } else {
            class_list += " animate_fade_out";
        }

        return (
            <div className={class_list} style={alert_style}>
                {message != undefined ? (
                    <div className="flex_horizontal">
                        <span className="margin_right">{message}</span>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="close_alert"
                            onClick={this.props.dismiss_alert}
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                ) : null}
            </div>
        );
    }
}
