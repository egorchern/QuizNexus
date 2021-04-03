import * as React from 'react';
import { render } from 'react-dom';

export class Home extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            join_code_value: ""
        }
    }
    on_join_code_value_change = (ev) => {
        this.setState({
            join_code_value: ev.target.value
        })
    }
    render(){
        return (
            <div className="home">
                <div className="home_content_container">
                    <div className="home_title_container animate__animated animate__zoomInDown">
                        <span className="home_title">
                            QuizNexus is a place where you can hone your knowledge while competing with others. Create quizzes with ease via the editor, host an already created quiz or join an unstarted lobby.
                        </span>
                    </div>
                    <div className="home_join_container animate__animated animate__zoomInUp" >
                        
                        <input className="form-control join_input" value={this.state.join_code_value} onChange={this.on_join_code_value_change} placeholder="Join code:"></input>
                        <button className="btn btn-primary" onClick={() => {
                            this.props.join(this.state.join_code_value);
                        }}>
                            Join
                        </button>
                        <span className="home_title">
                            Or 
                        </span>
                        <button className="btn btn-primary" onClick={() => {
                            this.props.switch_page_state("browse");
                        }}>
                            Browse quizzes
                        </button>
                    </div>
                    
                </div>
                
            </div>
        )
    }
}