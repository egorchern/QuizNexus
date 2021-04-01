import { fileURLToPath } from 'node:url';
import * as React from 'react';
import { render } from 'react-dom';
import { Navigation } from "./components/navigation";
import assets from "./assets/*.png";
let root = document.querySelector("#root");
console.log(assets);
class App extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div className="app_container">
                <Navigation icon={assets.icon}>

                </Navigation>
                <span>Hello </span>
            </div>
        )
    }
}

render(<App></App>, root);