import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Editor, createEmptyEditor } from '../.';

import './index.css';

class App extends React.Component<any, { value: any }> {
    constructor(props) {
        super(props);

        this.state = {
            value: createEmptyEditor(),
        };
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo);
    }

    render() {
        return (
            <div id="example-root">
                <h2>Material Editor</h2>
                <Editor
                    value={this.state.value}
                    onChange={value => {
                        this.setState({ value });
                    }}
                    name="content"
                    maxLength={500}
                />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
