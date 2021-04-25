import * as React from "react";
import { render } from "react-dom";
import { SlideDown } from "react-slidedown";

interface Edit_props {
    edit_quiz_id: number,
    categories: string[]
}

interface Edit_state {
    quiz_questions?: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    quiz_descriptors?: { category: string, creators_name: string, date_created: string, description: string, difficulty: string, number_of_questions: number, quiz_id: number, time_to_complete: number, title: string };
}

interface Quiz_descriptors_edit_props {
    quiz_descriptors: { category: string, creators_name: string, date_created: string, description: string, difficulty: string, number_of_questions: number, quiz_id: number, time_to_complete: number, title: string };
    categories: string[];
    change_quiz_property: Function;

}

interface Quiz_descriptors_edit_state {

}

interface Quiz_questions_edit_props {
    questions: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    change_quiz_propery: Function;
    add_new_question: Function;
    delete_question: Function;
}

interface Quiz_questions_edit_state {
    selected_index: number;

}

interface Question_props {
    question: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number };
    is_expanded: boolean;
    change_quiz_property: Function;
    select_question: Function;
    delete_question: Function;
}

interface Question_state {

}

class Question extends React.Component<Question_props, Question_state>{
    index: number;
    constructor(props: Question_props) {
        super(props);

        this.index = this.props.question.question_number - 1;
    }
    on_question_click = () => {
        this.props.select_question(this.index);
    }
    on_question_text_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("question_text", this.index, new_value);
    }
    on_points_base_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("points_base", this.index, new_value);
    }
    on_time_allocated_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("time_allocated", this.index, new_value);
    }
    on_question_delete_click = () => {
        this.props.delete_question(this.index);
    }
    render() {
        let question_classlist = "question flex_vertical ";
        if (this.props.is_expanded === true) {
            question_classlist += "expanded ";
        }
        return (
            <div className={question_classlist} onClick={this.on_question_click}>
                <span className="quiz_heading">
                    Question {this.props.question.question_number}
                </span>
                <SlideDown className="question_details_container">
                    {
                        this.props.is_expanded === true ? (
                            <div className="question_details">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="delete_question_svg" viewBox="0 0 16 16" onClick={this.on_question_delete_click}>
                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                                </svg>
                                <span className="quiz_heading">
                                    Question text
                                </span>
                                <textarea className="form-control description reset_input" value={this.props.question.question_text} onChange={this.on_question_text_value_change}>

                                </textarea>
                                <span className="points_explanation">
                                    Points earned for answering the question correctly is calculated with: P = B - (B / TA * TT)
                                    <br></br>
                                    Where: P - points earned, B - points base, TA - time allocated, TT - time taken to answer the quetion.
                                </span>
                                <div className="two_column_grid points_edit">
                                    <div className="flex_vertical"> 
                                        <span className="quiz_heading">
                                            Points base
                                        </span>
                                        <input className="join_input" value={this.props.question.points_base} onChange={this.on_points_base_value_change}>
                                        </input>
                                    </div>
                                    <div className="flex_vertical">
                                        <span className="quiz_heading">
                                            Time allocated (seconds)
                                        </span>
                                        <input className="join_input" value={this.props.question.time_allocated} onChange={this.on_time_allocated_value_change}>
                                        </input>
                                    </div>
                                </div>
                            </div>
                        )
                            : null
                    }
                </SlideDown>
            </div>
        )
    }
}

class Quiz_questions_edit extends React.Component<Quiz_questions_edit_props, Quiz_questions_edit_state>{
    constructor(props: Quiz_questions_edit_props) {
        super(props);

        this.state = {
            selected_index: -1
        }
    }
    select_question = (index: number) => {
        if (index != this.state.selected_index) {
            this.setState({
                selected_index: index
            })
        }
    }
    on_question_delete = (index: number) => {
        
        this.setState({
            selected_index: -1
        })
        this.props.delete_question(index);
    } 
    render() {
        let questions = this.props.questions.map((question, index) => {
            return (
                <Question
                    question={question}
                    key={index}
                    select_question={this.select_question}
                    is_expanded={this.state.selected_index === index}
                    change_quiz_property={this.props.change_quiz_propery}
                    delete_question={this.on_question_delete}
                >

                </Question>
            )
        })
        let add_new = (
            <div className="question flex_horizontal" onClick={() => {this.props.add_new_question()}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="plus_svg" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                <span className="quiz_heading">
                    Create new
                </span>
            </div>
        )
        return (
            <div className="quiz_questions flex_vertical">
                {questions}
                {add_new}
            </div>
        )
    }
}

class Quiz_descriptors_edit extends React.Component<Quiz_descriptors_edit_props, Quiz_descriptors_edit_state>{
    categories: JSX.Element[];
    constructor(props: Quiz_descriptors_edit_props) {
        super(props);
        this.state = {

        }
        this.categories = this.props.categories.map((category, index) => {
            return <option key={index}>{category}</option>;
        });
    }
    on_title_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("title", -1, new_value);
    }
    on_description_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("description", -1, new_value);
    }
    on_difficulty_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("difficulty", -1, new_value);
    }
    on_category_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.change_quiz_property("category", -1, new_value);
    }
    render() {
        return (
            <div className="quiz_descriptors flex_vertical">
                <input className="form-control title reset_input"
                    value={this.props.quiz_descriptors.title}
                    onChange={this.on_title_value_change}
                >
                </input>
                <div className="quiz_descriptors_item description_container">
                    <span className="quiz_heading">
                        Description
                    </span>
                    <textarea className="form-control description reset_input" value={this.props.quiz_descriptors.description} onChange={this.on_description_value_change}>

                    </textarea>

                </div>
                <div className="quiz_descriptors_item two_column_grid">
                    <div className="flex_vertical">
                        <span className="quiz_heading">
                            Category
                        </span>
                        <select className="form-select select" value={this.props.quiz_descriptors.category} onChange={this.on_category_value_change}>
                            {this.categories}
                        </select>
                    </div>
                    <div className="flex_vertical">
                        <span className="quiz_heading">
                            Difficulty
                        </span>
                        <select className="form-select select" value={this.props.quiz_descriptors.difficulty} onChange={this.on_difficulty_value_change}>

                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>

                </div>
            </div>
        )
    }
}

export class Edit extends React.Component<Edit_props, Edit_state>{
    constructor(props: Edit_props) {
        super(props);
        this.state = {

        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let edit_regex = new RegExp("^/edit/(?<edit_quiz_id>[0-9A-Z]+)$");
        let temp = edit_regex.exec(path_name);
        if (temp === null) {
            history.pushState({ page_state: "edit", edit_quiz_id: this.props.edit_quiz_id }, "Edit", `edit/${this.props.edit_quiz_id}`);
        }

    }
    change_quiz_property = (property: string, index: number, new_value: any): void => {
        if (property === "question_text") {
            this.state.quiz_questions[index].question_text = new_value;
        }
        else if (property === "title") {
            this.state.quiz_descriptors.title = new_value;
        }
        else if (property === "description") {
            this.state.quiz_descriptors.description = new_value;
        }
        else if (property === "category") {
            this.state.quiz_descriptors.category = new_value;
        }
        else if (property === "difficulty") {
            this.state.quiz_descriptors.difficulty = new_value;
        }
        else if(property === "points_base"){
            let number_only = new RegExp("^[1-9][0-9]*$");
            let matches = number_only.exec(new_value) != null;
            if(matches === true){
                this.state.quiz_questions[index].points_base = Number(new_value);
            }
        }
        else if(property === "time_allocated"){
            let number_only = new RegExp("^[1-9][0-9]*$");
            let matches = number_only.exec(new_value) != null;
            if(matches === true){
                this.state.quiz_questions[index].time_allocated = Number(new_value);
            }
        }
        this.forceUpdate();
    }
    add_new_question = () => {
        console.log("new question reached");
        let next_question_num = this.state.quiz_descriptors.number_of_questions + 1;
        this.state.quiz_descriptors.number_of_questions += 1;
        let new_question: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number };
        new_question = {
            question_number: next_question_num,
            question_text: "",
            answer_choices: [],
            correct_answer_indexes: [],
            quiz_id: this.state.quiz_descriptors.quiz_id,
            points_base: 1000,
            time_allocated: 20,
            multi_choice: false,

        }
        this.state.quiz_questions.push(new_question);
        this.forceUpdate();
    }
    delete_question = (index: number) => {
        // Reduce question number of questions that come after the deleted question. if question num 4 is deleted, questions 5 6 7 become 4 5 6
        for(let i = index; i < this.state.quiz_questions.length; i += 1){
            this.state.quiz_questions[i].question_number -= 1;
        }
        this.state.quiz_descriptors.number_of_questions -= 1;
        this.state.quiz_questions.splice(index, 1);
        this.forceUpdate();
    }
    componentDidMount() {
        document.querySelector(".app_container").classList.add("height_full");
        // Prevents fetching of quiz details when creating a new quiz (since quiz_id = 0)
        if (this.props.edit_quiz_id != 0) {
            this.fetch_quiz_questions();

        }

    }
    componentWillUnmount() {
        document.querySelector(".app_container").classList.remove("height_full");
    }
    // Fetches quiz_questions from server and handles the response code
    fetch_quiz_questions = () => {

        fetch("/get_quiz_questions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_id: this.props.edit_quiz_id
            })
        }).then(result => result.json())
            .then(result => {

                let code = result.code;
                if (code === 2) {
                    // This is here so that if the user is not allowed to edit the quiz, the front-end does not recieve quiz descriptors
                    this.fetch_quiz_descriptors();
                    this.setState({
                        quiz_questions: result.questions
                    })
                }
            })
    }

    // Fetcjes quiz descriptors from server
    fetch_quiz_descriptors = () => {
        fetch("/get_quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_ids: [this.props.edit_quiz_id]
            })
        }).then(result => result.json())
            .then(result => {
                let quiz_descriptors = result.quizzes[0];
                this.setState({
                    quiz_descriptors: quiz_descriptors
                })

            })
    }

    render() {
        return (
            <div className="edit">
                {
                    this.state.quiz_descriptors != undefined ?
                        (
                            <Quiz_descriptors_edit
                                quiz_descriptors={this.state.quiz_descriptors}
                                categories={this.props.categories}
                                change_quiz_property={this.change_quiz_property}
                            >

                            </Quiz_descriptors_edit>
                        )
                        : null
                }
                {
                    this.state.quiz_questions != undefined ?
                        (
                            <Quiz_questions_edit
                                questions={this.state.quiz_questions}
                                change_quiz_propery={this.change_quiz_property}
                                add_new_question={this.add_new_question}
                                delete_question={this.delete_question}
                            >

                            </Quiz_questions_edit>
                        )
                        : null
                }
            </div>
        )
    }
}