import { useEffect, useState } from "react";
import { Editor, EditorState, ContentState,convertToRaw} from "draft-js";
import "draft-js/dist/Draft.css";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// helper function
const createState = (text) => {
  return EditorState.createWithContent(ContentState.createFromText(text));
};



const ControlledEditor = (props) => {
  // define the local state, using the createState callback to create the initial value
  const [editorState, setEditorState] = useState(createState(props.htmlContent));

  // override the local state any time that the props change
  useEffect(() => {
    setEditorState(createState(props.htmlContent));
  }, [props.htmlContent]);

  const saveContent = () => {
    const text = editorState.getCurrentContent().getPlainText('\u0001')
    localStorage.setItem("savedContent", text);
  }

  if (props.onSave){
    alert("in")
    saveContent();
    }

  return (
    <Editor
      editorState={editorState}
      onChange={setEditorState}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
    />
  );
};

export default ControlledEditor;
