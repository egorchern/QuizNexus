import * as React from "react";
import {render} from "react-dom";

interface IProps {
    edit_quiz_id: number
}

interface IState {
   
}

export class Edit extends React.Component<IProps, IState>{
    constructor(props: IProps){
        super(props);
        this.state = {

        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let edit_regex = new RegExp("^/edit/(?<edit_quiz_id>[0-9A-Z]+)$");
        let temp = edit_regex.exec(path_name);
        if (temp === null) {
            history.pushState({page_state: "edit", edit_quiz_id: this.props.edit_quiz_id}, "Edit", `edit/${this.props.edit_quiz_id}`);
        }
        
    }
    componentDidMount(){
        this.fetch_quiz_questions();
    }
    fetch_quiz_questions = () => {
        fetch("/get_quiz_questions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_id: this.props.edit_quiz_id
            })
        })
    }
    render(){
        return (
            <div className="edit">

            </div>
        )
    }
}