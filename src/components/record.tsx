import * as React from "react";
import { render } from "react-dom";
import {Answers_breakdown} from "./answers_breakdown";
import {Answer_grid} from "./answer_grid";

interface Record_props{
   record_id: number
}
interface Record_state{

}

export class Record extends React.Component<Record_props, Record_state> {
    constructor(props: Record_props){
        super(props);
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let edit_regex = new RegExp("^/view_record/(?<edit_quiz_id>[0-9A-Z]+)$");
        let temp = edit_regex.exec(path_name);
        if (temp === null) {
            history.pushState({ page_state: "view_record", record_id: this.props.record_id }, "View record", `view_record/${this.props.record_id}`);
        }
    }
    render(){
        return (
            <div className="record">
                
            </div>
        )
    }
}