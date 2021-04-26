import * as React from "react";
import { render } from "react-dom";
import { SlideDown } from "react-slidedown";
import assets from "../assets/*.png";
console.log(assets);
interface Edit_props {
    edit_quiz_id: number;
    categories: string[];
    switch_page_state: Function;
}

interface Edit_state {
    quiz_questions?: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    quiz_descriptors?: { category: string, creators_name: string, date_created: string, description: string, difficulty: string, number_of_questions: number, quiz_id: number, time_to_complete: number, title: string };
}

interface Quiz_descriptors_edit_props {
    quiz_descriptors: { category: string, creators_name: string, date_created: string, description: string, difficulty: string, number_of_questions: number, quiz_id: number, time_to_complete: number, title: string };
    categories: string[];
    change_quiz_property: Function;
    delete_quiz: Function;
}

interface Quiz_descriptors_edit_state {

}

interface Quiz_questions_edit_props {
    questions: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    change_quiz_propery: Function;
    add_new_question: Function;
    delete_question: Function;
    add_new_answer_choice: Function;
    delete_answer_choice: Function;
    change_correct_answer_choice: Function;
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
    add_new_answer_choice: Function;
    delete_answer_choice: Function;
    change_correct_answer_choice: Function;
}

interface Question_state {

}

interface Answer_choices_props {
    answer_choices: string[];
    correct_answer_indexes: number[];
    on_answer_choice_change: Function;
    add_new_answer_choice: Function;
    delete_answer_choice: Function;
    change_correct_answer_choice: Function;
}

interface Answer_choices_state {
    selected_index: number;
}

interface Bottom_panel_props {
    questions: { answer_choices: string[], correct_answer_indexes: number[], multi_choice: boolean, points_base: number, question_number: number, question_text: string, quiz_id: number, time_allocated: number }[];
    totals: {points_total: number, time_total: number};
    submit_edit: Function;
}

interface Bottom_panel_state {

}

class Bottom_panel extends React.Component<Bottom_panel_props, Bottom_panel_state>{
    constructor(props: Bottom_panel_props) {
        super(props);
        this.state = {

        }
    }
    calculate_totals = (): { points_total: number, time_total: number } => {
        let points_total = 0;
        let time_total = 0;
        for (let i = 0; i < this.props.questions.length; i += 1) {
            let current_question = this.props.questions[i];
            points_total += current_question.points_base;
            time_total += current_question.time_allocated;
        }
        let return_obj = {
            points_total: points_total,
            time_total: Math.round(time_total / 60)
        }
        return return_obj;

    }
    render() {
        let totals = this.calculate_totals();
        console.log(totals);
        return (
            <div className="bottom_panel flex_vertical">
                <div className="two_column_grid">
                    <div className="flex_horizontal">
                        <span className="quiz_heading">
                            Total points (max): {this.props.totals.points_total}
                        </span>
                        
                    </div>
                    <div className="flex_horizontal">
                        <span className="quiz_heading">
                            Time to complete (mins): {this.props.totals.time_total}
                        </span>
                    </div>
                </div>
                <button className="save_btn btn btn-primary" onClick={() => {
                    this.props.submit_edit();
                }}>
                    Save
                </button>
            </div>
        )
    }
}

class Answer_choices extends React.Component<Answer_choices_props, Answer_choices_state>{
    constructor(props: Answer_choices_props) {
        super(props);
        this.state = {

            selected_index: -1
        }

    }
    on_answer_choice_click = (index: number) => {
        if (index != this.state.selected_index) {
            this.setState({
                selected_index: index
            })
        }
    }
    on_answer_choice_value_change = (ev) => {
        let new_value = ev.target.value;
        this.props.on_answer_choice_change(this.state.selected_index, new_value);
    }
    on_create_new = () => {
        this.props.add_new_answer_choice();
        this.setState({
            selected_index: this.props.answer_choices.length - 1
        })
    }
    on_delete_click = (index) => {
        this.props.delete_answer_choice(index);
        this.setState({
            selected_index: -1
        })
    }
    on_change_correct_answer = (index) => {
        this.props.change_correct_answer_choice(index);
    }
    render() {
        let answer_choices_list_items = this.props.answer_choices.map((answer_choice, index) => {
            let class_list = "edit_answer_choice ";
            let mark_src;
            if (this.props.correct_answer_indexes.includes(index)) {
                mark_src = assets.tick;
            }
            else {
                mark_src = assets.cross;
            }
            if (index === this.state.selected_index) {
                class_list += "expanded ";
            }
            return (
                <div className={class_list} key={index} onClick={() => {
                    this.on_answer_choice_click(index);
                }}>
                    {
                        this.state.selected_index != index ? (
                            <div className="answer_choice_line">
                                <span className="quiz_main">
                                    {index + 1})
                                </span>
                                <span className="quiz_main margin-left">
                                    {answer_choice}
                                </span>
                                <img className="your_answer_mark" src={mark_src}>
                                </img>
                            </div>
                        )
                            : null
                    }

                    <SlideDown className="question_details_container">
                        {
                            this.state.selected_index === index ? (
                                <div className="answer_choice_details">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="delete_question_svg_smaller" viewBox="0 0 16 16" onClick={() => {
                                        this.on_delete_click(index);
                                    }}>
                                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                    </svg>
                                    <span className="quiz_main">
                                        Answer choice
                                    </span>
                                    <textarea className="form-control description reset_input" value={answer_choice} onChange={this.on_answer_choice_value_change}>

                                    </textarea>
                                    <div className="answer_choice_line">
                                        <span className="quiz_main">
                                            Correct answer?
                                        </span>
                                        <input className="form-check-input is_correct_check quiz_main" type="checkbox" checked={this.props.correct_answer_indexes.includes(index)} onChange={() => {
                                            this.on_change_correct_answer(index)
                                        }}>
                                        </input>

                                    </div>
                                </div>
                            )
                                : null
                        }
                    </SlideDown>
                </div>
            )
        })
        let add_new = (
            <div className="edit_answer_choice flex_horizontal add_new_answer_choice" key={this.props.answer_choices.length} onClick={() => {
                this.on_create_new();
            }}>

                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="plus_svg_smaller" viewBox="0 0 16 16" preserveAspectRatio="xMidYMin slice">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>


                <span className="quiz_main">
                    Create new
                </span>
            </div>
        )
        answer_choices_list_items.push(add_new);
        return (
            <div className="edit_answer_choices flex-vertical">
                <span className="quiz_heading">
                    Answer choices
                </span>
                {answer_choices_list_items}
            </div>
        )
    }
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
    on_answer_choice_change = (second_index: number, new_value: string) => {
        this.props.change_quiz_property("answer_choice", this.index, new_value, second_index);
    }
    add_new_answer_choice = () => {
        this.props.add_new_answer_choice(this.index);
    }
    delete_answer_choice = (answer_choice_index: number) => {
        this.props.delete_answer_choice(this.index, answer_choice_index);
    }
    change_correct_answer_choice = (answer_choice_index: number) => {
        console.log(`in question component: ${answer_choice_index}`);
        this.props.change_correct_answer_choice(this.index, answer_choice_index);
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
                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                </svg>
                                <span className="quiz_heading">
                                    Question text
                                </span>
                                <textarea className="form-control description reset_input" value={this.props.question.question_text} onChange={this.on_question_text_value_change}>

                                </textarea>
                                <Answer_choices
                                    answer_choices={this.props.question.answer_choices}
                                    correct_answer_indexes={this.props.question.correct_answer_indexes}
                                    on_answer_choice_change={this.on_answer_choice_change}
                                    add_new_answer_choice={this.add_new_answer_choice}
                                    delete_answer_choice={this.delete_answer_choice}
                                    change_correct_answer_choice={this.change_correct_answer_choice}
                                >

                                </Answer_choices>
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
    add_new_question = () => {
        this.props.add_new_question();
        this.setState({
            selected_index: this.props.questions.length - 1
        })
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
                    add_new_answer_choice={this.props.add_new_answer_choice}
                    delete_answer_choice={this.props.delete_answer_choice}
                    change_correct_answer_choice={this.props.change_correct_answer_choice}
                >

                </Question>
            )
        })
        let add_new = (
            <div className="question flex_horizontal" onClick={() => { this.add_new_question() }}>
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="delete_question_svg_bigger" viewBox="0 0 16 16" onClick={() => {
                    this.props.delete_quiz();
                }}>
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                </svg>
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
    totals: { points_total: number; time_total: number; };
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
    change_quiz_property = (property: string, index: number, new_value: any, second_index = -1): void => {
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
        else if (property === "points_base") {
            let number_only = new RegExp("^[1-9][0-9]*$");
            let matches = number_only.exec(new_value) != null;
            if (matches === true) {
                this.state.quiz_questions[index].points_base = Number(new_value);
                this.totals = this.calculate_totals();
            }
        }
        else if (property === "time_allocated") {
            let number_only = new RegExp("^[1-9][0-9]*$");
            let matches = number_only.exec(new_value) != null;
            if (matches === true) {
                this.state.quiz_questions[index].time_allocated = Number(new_value);
                this.totals = this.calculate_totals();
                this.state.quiz_descriptors.time_to_complete = this.totals.time_total;
            }
        }
        else if (property === "answer_choice") {
            this.state.quiz_questions[index].answer_choices[second_index] = new_value;
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
        for (let i = index; i < this.state.quiz_questions.length; i += 1) {
            this.state.quiz_questions[i].question_number -= 1;
        }
        this.state.quiz_descriptors.number_of_questions -= 1;
        this.state.quiz_questions.splice(index, 1);
        this.forceUpdate();
    }
    add_new_answer_choice = (question_index: number) => {
        this.state.quiz_questions[question_index].answer_choices.push("");
        this.forceUpdate();
    }
    delete_answer_choice = (question_index: number, answer_choice_index: number) => {
        let correct_answer_indexes = this.state.quiz_questions[question_index].correct_answer_indexes;
        let delete_index = correct_answer_indexes.indexOf(answer_choice_index);
        if (delete_index != -1) {
            correct_answer_indexes.splice(delete_index, 1);
        }
        for (let i = 0; i < correct_answer_indexes.length; i += 1) {
            let correct_answer_index = correct_answer_indexes[i];
            if (correct_answer_index > answer_choice_index) {
                console.log(correct_answer_indexes);
                correct_answer_indexes[i] -= 1;
                console.log(correct_answer_indexes);
            }
        }


        this.state.quiz_questions[question_index].answer_choices.splice(answer_choice_index, 1);
        this.forceUpdate();
    }
    change_correct_answer_choice = (question_index: number, answer_choice_index: number) => {
        let correct_answer_indexes = this.state.quiz_questions[question_index].correct_answer_indexes
        let delete_index = correct_answer_indexes.indexOf(answer_choice_index);
        console.log(`question index: ${question_index}, answer_choice_index: ${answer_choice_index}`)
        if (delete_index != -1) {
            correct_answer_indexes.splice(delete_index, 1);
        }
        else {
            console.log(correct_answer_indexes);
            correct_answer_indexes.push(answer_choice_index);
            if (correct_answer_indexes.length > 1) {
                this.state.quiz_questions[question_index].multi_choice = true;
            }
            console.log(correct_answer_indexes);
        }
        this.forceUpdate();
    }
    calculate_totals = (): { points_total: number, time_total: number } => {
        let points_total = 0;
        let time_total = 0;
        for (let i = 0; i < this.state.quiz_questions.length; i += 1) {
            let current_question = this.state.quiz_questions[i];
            points_total += current_question.points_base;
            time_total += current_question.time_allocated;
        }
        let return_obj = {
            points_total: points_total,
            time_total: Math.round(time_total / 60)
        }
        return return_obj;

    }
    delete_quiz = () => {
        let is_sure = window.confirm(`Are you sure that you want to delete "${this.state.quiz_descriptors.title}" quiz?`);
        if(is_sure){
            fetch("/delete_quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quiz_id: this.state.quiz_descriptors.quiz_id
                })
            })
            .then(result => result.json())
            .then(result => {
                if(result.code === 2){
                    this.props.switch_page_state("user_profile");
                }
            })
        }
    }
    submit_edit = () => {
        fetch("/edit_quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_id: this.state.quiz_descriptors.quiz_id,
                quiz_descriptors: this.state.quiz_descriptors,
                quiz_questions: this.state.quiz_questions
            })
        })
        .then(result => result.json())
        .then(result => {
            console.log(result);
        })
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
                this.totals = this.calculate_totals();
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
                                delete_quiz={this.delete_quiz}
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
                                add_new_answer_choice={this.add_new_answer_choice}
                                delete_answer_choice={this.delete_answer_choice}
                                change_correct_answer_choice={this.change_correct_answer_choice}
                            >

                            </Quiz_questions_edit>
                        )
                        : null
                }
                {
                    this.state.quiz_descriptors != undefined ? (
                        <Bottom_panel
                        questions={this.state.quiz_questions}
                        totals={this.totals}
                        submit_edit={this.submit_edit}
                        >

                        </Bottom_panel>
                    )
                        : null
                }
            </div>
        )
    }
}