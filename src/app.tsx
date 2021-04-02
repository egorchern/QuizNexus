
import * as React from 'react';
import { render } from 'react-dom';
import { Navigation } from "./components/navigation";
import { Home } from "./components/home";
import assets from "./assets/*.png";
import "animate.css";

let root = document.querySelector("#root");

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page_state: "home"
        }
    }
    join = (join_code) => {

    }
    render(){
        return (
            <div className="app_container">
                <Navigation icon={assets.icon}>

                </Navigation>
                <Home>

                </Home>
            </div>
        )
    }
}

render(<App></App>, root);