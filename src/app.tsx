
import * as React from 'react';
import { render } from 'react-dom';
import { Navigation } from "./components/navigation";
import { Home } from "./components/home";
import { Browse } from "./components/browse";
import assets from "./assets/*.png";
import {io} from "socket.io/client-dist/socket.io";
import "animate.css";

let root = document.querySelector("#root");
let socket;
class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page_state: "home"
        }
        socket = io.connect();
    }
    join = (join_code) => {
        console.log(join_code);
    }
    switch_page_state = (state) => {
        //To prevent unneeded switches from same state
        if(this.state.page_state != state){
            this.setState({
                page_state: state
            })
        }
        
    }
    render(){
        let content;
        let state = this.state.page_state;
        // Logic for switching page state, such as from home page to browse page
        if(state === "home"){
            content = (
                
                <Home switch_page_state={this.switch_page_state} join={this.join}>

                </Home>
                
            )
        }
        else if(state === "browse"){
            content = (
                <Browse switch_page_state={this.switch_page_state}>
                </Browse>
            )
        }
        return (
            <div className="app_container">
                <Navigation icon={assets.icon} switch_page_state={this.switch_page_state}>

                </Navigation>
                {content}
            </div>
        )
    }
}

render(<App></App>, root);