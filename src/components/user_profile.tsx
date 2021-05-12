import * as React from "react";
import { render } from "react-dom";
import { Quizzes_container } from "./quizzes_container";
interface IProps {
    edit: Function;
    switch_page_state: Function;
    view_record: Function;
}

interface IState {
    user_info?: {
        username: string, created_quiz_ids: number[], result_records: {
            date: string,
            performance_data: {
                correct_answers: number,
                answers_total: number,
                correct_answers_percentage: number,
                points_earned: number,
                points_earned_percentage: number,
                total_points: number
            },
            quiz_id: number,
            record_id: number,
            answers: {
                answer_indexes: number[],
                correct_answer_indexes: number[],
                is_correct: boolean,
                points_earned: number,
                question_number: number,
                record_id: number
            }[]
        }[]
    },
    created_quizzes?: { title: string, category: string, difficulty: string, date_created: string, time_to_complete: number, creators_name: string, number_of_questions: number, description: string, quiz_id: string }[];
    stats: {
        average_score_percentage?: number,
        average_correct_answers_percentage?: number,
        quizzes_taken?: number
    }
}

interface Account_props {
    stats: {
        average_score_percentage?: number,
        average_correct_answers_percentage?: number,
        quizzes_taken?: number
    },
    username: string,
    log_out: Function
}

interface Account_state {

}

interface Records_props {
    result_records: {
        date: string,
        performance_data: {
            correct_answers: number,
            answers_total: number,
            correct_answers_percentage: number,
            points_earned: number,
            points_earned_percentage: number,
            total_points: number
        },
        quiz_id: number,
        record_id: number,
        answers: {
            answer_indexes: number[],
            correct_answer_indexes: number[],
            is_correct: boolean,
            points_earned: number,
            question_number: number,
            record_id: number
        }[]
    }[];
    view_record: Function;
}

interface Records_state {
    quizzes?: {
        quiz_id: {
            title: string, category: string, difficulty: string, date_created: string, time_to_complete: number, creators_name: string, number_of_questions: number, description: string, quiz_id: string
        }
    };
}


function calculate_mean(array: number[]) {
    let n = array.length;
    let total = 0;
    array.forEach(num => {
        total += num;
    })

    let mean = Math.floor((total / n));
    return mean;
}

function convert_to_array(obj: any){
    let array = [];
    let keys = Object.keys(obj);
    keys.forEach(key => {
        let element = obj[key];
        array.push(element);
    })
    return array;
}

function reverse_array(array: any[]) {
    let output = [];
    for (let i = array.length - 1; i >= 0; i -= 1) {
        output.push(array[i]);
    }
    return output;
}

class Records extends React.Component<Records_props, Records_state>{
    constructor(props: Records_props) {
        super(props);
        this.state = {

        }
    }

    fetch_quizzes = () => {
        let quiz_ids = [];
        this.props.result_records.forEach(result_record => {
            let quiz_id = result_record.quiz_id;
            if (!quiz_ids.includes(quiz_id)) {
                quiz_ids.push(quiz_id);
            }
        })
        fetch("/get_quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quiz_ids)
        }).then(result => result.json())
            .then(result => {
                let quizzes = result.quizzes;
                let quizzes_hash_map = {};
                for (let i = 0; i < quizzes.length; i += 1) {
                    let quiz_id = quizzes[i].quiz_id;
                    quizzes_hash_map[quiz_id] = quizzes[i];
                }

                this.setState({
                    quizzes: quizzes_hash_map
                })
            })
    }

    componentDidMount() {
        this.fetch_quizzes();
    }

    render() {
        let records = null
        if (this.state.quizzes != undefined) {
            let result_records: Records_props["result_records"] = reverse_array(this.props.result_records);
            records = result_records.map((result_record, index) => {
                let quiz_id = result_record.quiz_id;
                let quiz_obj = this.state.quizzes[quiz_id];
                if(quiz_obj === undefined){
                    quiz_obj = {
                        title: "[deleted]",
                        category: "[deleted]",
                        difficulty: "[deleted]",
                        date_created: "[deleted]",
                        time_to_complete: null,
                        creators_name: "[deleted]",
                        number_of_questions: null,
                        description: "[deleted]",
                        quiz_id: "[deleted]"
                    }
                }
                return (
                    <div key={index} className="answer_choice record" onClick={() => {
                        this.props.view_record(result_record.record_id);
                    }}>
                        <div className="flex_vertical">
                            <span>
                                {quiz_obj.title}
                            </span>
                        </div>

                        <div className="flex_vertical">
                            <span>
                                {result_record.date}
                            </span>
                        </div>
                        <div className="flex_vertical">
                            <span>
                                {result_record.performance_data.correct_answers_percentage}%
                            </span>
                        </div>
                        <div className="flex_vertical">
                            <span>
                                {result_record.performance_data.points_earned_percentage}%
                            </span>
                        </div>
                    </div>
                )
            });
        }
        let stl = {
            overflow: "hidden"
        }
        let stl2 = {
            paddingRight: "14px",
            paddingLeft: "6px"
        }
        return (
            <div className="flex_vertical animate__animated animate__zoomInLeft" style={stl}>
                <div className="record" style={stl2}>
                    <div className="flex_vertical">
                        <span>
                            Title
                        </span>
                    </div>
                    <div className="flex_vertical">
                        <span>
                            Date
                        </span>
                    </div>
                    <div className="flex_vertical">
                        <span>
                            Correct answers %
                        </span>
                    </div>
                    <div className="flex_vertical">
                        <span>
                            Score earned %
                        </span>
                    </div>

                </div>
                <div className="records">

                    {records}
                </div>
            </div>
        )
    }
}

class Account extends React.Component<Account_props, Account_state>{
    constructor(props: Account_props) {
        super(props);
    }
    render() {
        return (
            <div className="user_stats animate__animated animate__zoomInLeft">
                <div className="greeting flex_horizontal">
                    <div className="flex_grow flex_horizontal">
                        <span>Hi, {this.props.username}</span>
                    </div>

                    <div className="flex_horizontal">
                        <div className="log_out box_shadow_hoverable flex_horizontal" onClick={() => {
                            this.props.log_out();
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="leave_svg" viewBox="0 0 16 16">
                                <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15H1.5zM11 2h.5a.5.5 0 0 1 .5.5V15h-1V2zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1z" />
                            </svg>
                            <span>Log out</span>
                        </div>
                    </div>

                </div>
                <div className="stats">
                    <div className="stat">
                        <span>
                            Correct answers: {this.props.stats.average_correct_answers_percentage}%
                        </span>

                    </div>
                    <div className="stat">
                        <span>
                            Score earned: {this.props.stats.average_score_percentage}%
                        </span>

                    </div>
                    <div className="stat">
                        <span>
                            Quizzes taken: {this.props.stats.quizzes_taken}
                        </span>

                    </div>

                </div>
            </div>
        )
    }
}

export class User_profile extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            stats: {

            }
        }
        // This is to prevent pushing into history when the state is already at browse
        let path_name = location.pathname;
        let regex = new RegExp("^/user_profile$");
        let temp = regex.exec(path_name);
        if (temp === null) {
            history.pushState({ page_state: "user_profile" }, "User profile", "/user_profile");
        }
        this.fetch_user_info();
    }
    fetch_user_info = () => {
        fetch("/get_global_user_info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(result => result.json())
            .then(result => {
                let code = result.code;
                if (code === 2) {
                    result.user_info.result_records = convert_to_array(result.user_info.result_records);
                    this.setState({
                        user_info: result.user_info
                    })
                    this.calculate_stats();
                    this.fetch_created_quizzes();
                }
            })
    }
    fetch_created_quizzes = () => {
        fetch("/get_quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_ids: this.state.user_info.created_quiz_ids
            })
        }).then(result => result.json())
            .then(result => {
                this.setState({
                    created_quizzes: result.quizzes
                })
            })
    }
    on_quiz_button_click = (quiz_id) => {
        if (quiz_id === 0) {
            fetch("/create_new_quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(result => result.json())
                .then(result => {
                    this.props.edit(result.quiz_id);
                })
        }
        else {
            this.props.edit(quiz_id);
        }
    }
    log_out = () => {
        fetch("/log_out", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }

        }).then(result => result.json())
            .then(result => {
                let code = result.code;
                if (code === 2) {
                    this.props.switch_page_state("home");
                    location.reload();
                }
            })
    }
    calculate_stats = () => {
        let result_records = this.state.user_info.result_records;
        let correct_answers_percentages = [];
        let points_earned_percentages = []
        result_records.forEach(result_record => {
            let performance_data = result_record.performance_data;
            correct_answers_percentages.push(performance_data.correct_answers_percentage);
            points_earned_percentages.push(performance_data.points_earned_percentage);
        })
        let average_correct_answers_percentage = calculate_mean(correct_answers_percentages);
        let average_score_percentage = calculate_mean(points_earned_percentages);

        if (isNaN(average_correct_answers_percentage)) {

            average_correct_answers_percentage = 0;
            average_score_percentage = 0;
        }

        this.state.stats.average_correct_answers_percentage = average_correct_answers_percentage
        this.state.stats.average_score_percentage = average_score_percentage;
        this.state.stats.quizzes_taken = result_records.length;
        this.forceUpdate();

    }
    render() {
        return (
            <div className="user_profile">
                {
                    this.state.user_info != undefined ? (
                        <Account
                            stats={this.state.stats}
                            username={this.state.user_info.username}
                            log_out={this.log_out}
                        >

                        </Account>
                    )
                        : null

                }
                {
                    this.state.user_info != undefined ? (
                        <Records
                            result_records={this.state.user_info.result_records}
                            view_record={this.props.view_record}
                        >

                        </Records>
                    )
                        : null
                }
                <div className="created_quizzes animate__animated animate__zoomInRight">
                    <h2>Created Quizzes</h2>
                    {
                        this.state.created_quizzes != undefined ?
                            <Quizzes_container
                                button_text="Edit"
                                quizzes={this.state.created_quizzes}
                                action={this.on_quiz_button_click}
                                add_new={true}
                            >
                            </Quizzes_container>
                            : null
                    }
                </div>

            </div>
        )
    }
}