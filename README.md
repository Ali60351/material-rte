# Material RTE

[![npm version](https://badge.fury.io/js/material-rte.svg)](https://badge.fury.io/js/material-rte)

A Rich Text Editor made for applications built using React and using Material UI (v4). A potential alternative to [CKEditor][ckeditor], [TinyMCE][tinymce] and other [rich text "WYSIWYG" editors][rte]. Based on [Draft.js][draft-js] which is maintained by Facebook.

## Demo

Try the editor here: [ali60351.github.io/material-rte/][material-rte-demo]

[![Screenshot 1](https://i.imgur.com/WRQHpez.png)][material-rte-demo]

## Getting Started

```sh
npm install --save material-rte
```

The main component of this package is the `Editor` one. It comprises of the base editor from Draft.js, a header which contains several button which you can use to modify selected text and a footer which provides extra info and can be used to toggle scroll.

The value of the editor is controller via the `value` prop which can be initialized using an empty value or a HTML string. The output of the editor can be obtained in HTML string form by transforming the value via included function.

### Example Usage

```javascript
import React from 'react';
import { Editor, importEditor, exportEditor, createEmptyEditor } from 'material-rte';

class ExampleEditor extends React.Component {
    constructor(props) {
        super(props);

        // INITIALIZE USING BLANK VALUE
        this.state = {
            value: createEmptyEditor(),
        };

        // INITIALIZE USING HTML STRING VALUE
        // this.state = {
        //     value: importEditor('<p>Lorem Ipsum</p>'),
        // };
    }

    handleChange = value => {
        console.log(exportEditor(value)); // PRINTS EDITOR VALUE IN HTML STRING FORM
        this.setState({ value });
    };

    render() {
        return <Editor value={this.state.value} onChange={this.handleChange} name="example-editor" />;
    }
}
```

## API

### Required Props

| Name  | Description                                                          | Type        |
| ----- | -------------------------------------------------------------------- | ----------- |
| value | Is the main prop responsible for controlling the value of the editor | EditorState |

### Other Props

| Name               | Description                                                                                                                                                                                                                                                                 | Type     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| onChange           | Function triggered on every editor change. Useful for updating editor value.                                                                                                                                                                                                | function |
| onBlur             | Function trigger when editor loses focus. Useful for validation purposes.                                                                                                                                                                                                   | function |
| maxLength          | Number used to specify the maximum length allowed for value. Default value is `-1`.                                                                                                                                                                                         | number   |
| readOnly           | Toggle used to control if the value is editable or not. Also removes footer and header. Useful for displaying stored values. Default value is `false`.                                                                                                                      | number   |
| maxLength          | Number used to specify the maximum length allowed for value. Default value is `-1`.                                                                                                                                                                                         | number   |
| className          | String which can contain your CSS classes allowing for style customization                                                                                                                                                                                                  | string   |
| name               | Attribute applied to the root of the editor. Useful for selecting element via `querySelector`                                                                                                                                                                               | string   |
| error              | Toggle used to notify user if entered value is invalid                                                                                                                                                                                                                      | boolean  |
| error              | Toggle used to notify user if entered value is invalid                                                                                                                                                                                                                      | boolean  |
| removeScroll       | Removes maximum height limitation for the editor. Default value is `false`.                                                                                                                                                                                                 | boolean  |
| showHeadingButtons | Removes header from the editor. Default value is `false`.                                                                                                                                                                                                                   | boolean  |
| borderLess         | Removes border from the editor. Default value is `false`.                                                                                                                                                                                                                   | boolean  |
| variables          | Is an optional array of variables in the format of `{value: '{{ custom_variable }}', id: 1}`. Upon insertion of a variable the user will see the variable in a Material Chip with the text `Custom variable`. Useful for filling value with dynamic values after submission | array    |

[ckeditor]: http://ckeditor.com/
[draft-js]: https://facebook.github.io/draft-js/
[material-rte-demo]: https://ali60351.github.io/material-rte/
[rte]: https://www.google.com/search?q=web+based+rich+text+editor
[tinymce]: https://www.tinymce.com/
