import * as React from 'react';
import { render } from 'react-dom';
let root = document.querySelector("#root");



class App extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div>

            </div>
        )
    }
}

render(<App></App>, root);