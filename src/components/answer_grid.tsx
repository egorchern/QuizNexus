import * as React from 'react';
import { render } from 'react-dom';

interface Answer_grid_props{
    answers_list: any[],
    number_of_questions: number
}

interface Answer_grid_state{
    
}

export class Answer_grid extends React.Component<Answer_grid_props, Answer_grid_state> {
    constructor(props: Answer_grid_props) {
        super(props);
    }
    render() {
        let answers_list = this.props.answers_list;
        let number_of_questions = this.props.number_of_questions;
        let table_head = [(
            <th key="0">
                Question number
                <br></br>
                Username
            </th>
        )];
        for (let i = 1; i <= number_of_questions; i += 1) {
            table_head.push((
                <th key={i}>
                    {i}
                </th>
            ))
        }
        let table_body = answers_list.map((answer_obj, index) => {

            let tds = [];
            let keys = Object.keys(answer_obj.answers);

            for (let i = 0; i < keys.length; i += 1) {
                let answer = answer_obj.answers[keys[i]];

                let class_list = "answer_td ";
                if (answer.is_correct) {
                    class_list += "correct ";
                }
                else {
                    class_list += "incorrect ";
                }
                tds.push((
                    <td className={class_list} key={i}>
                        {answer.points_earned}
                    </td>
                ))
            }

            return (
                <tr key={answer_obj.username}>
                    <td key="0">
                        {answer_obj.username}
                    </td>
                    {tds}
                </tr>
            )
        })

        return (

            <div className="answer_grid">
                <table className="table">
                    <thead>
                        <tr>
                            {table_head}
                        </tr>
                    </thead>
                    <tbody>
                        {table_body}
                    </tbody>
                </table>
            </div>
        )
    }
}