
import {useEffect, useRef, useState} from 'react';
import {initEditor} from './editor/SmartEditor';
import axios from 'axios';
axios.defaults.baseURL="http://localhost:9000/";


function App() {
	
  	const inputTitle=useRef();
  	const inputContent=useRef();
	const [editorTool, setEditorTool]=useState([]);

	useEffect(()=>{
		//initEditor() 함수를 호출하면서 SmartEditor 로 변환할 textarea 의 id 를 전달하면
		//textarea 가 SmartEditor 로 변경되면서 에디터 tool 객체가 리턴된다.  
		setEditorTool(initEditor("content"));
	},[]);

	const handleSubmit=(e)=>{
		//에디터 tool 을 이용해서 SmartEditor 에 입력한 내용을 textarea 의 value 값으로 변환
		editorTool.exec();
		e.preventDefault();
		//입력한 내용 읽어오기 
		console.log("제목:"+inputTitle.current.value);
		console.log("내용:"+inputContent.current.value);
	}
  
  return (
    <div className="App">
      	<h1>React SmartEditor</h1>
        <form action="insert" method="post">
			<div>
				<label htmlFor="title">제목</label>
				<input ref={inputTitle} type="text" name="title" id="title"/>
			</div>
			<div>
				<label htmlFor="content">내용</label>
				<textarea  ref={inputContent} name="content" id="content" rows="10"></textarea>
			</div>
			<button type="submit" onClick={handleSubmit}>저장</button>
		</form>
    </div>
  );
}

export default App;
