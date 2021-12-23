import React from 'react'

import { createEmptyEditor, Editor } from 'material-rte'
import 'material-rte/dist/index.css'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: createEmptyEditor()
    }
  }

  componentDidCatch (error, errorInfo) {
    console.log(error, errorInfo)
  }

  render() {
    return <div id="example-root">
      <Editor
        value={this.state.value}
        onChange={value => this.setState({value})}
        name="content"
        removeScroll
      />
    </div>
  }
}

export default App
