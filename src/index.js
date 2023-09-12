import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom';
// legacy_createStore 를 createStore 라는 이름으로 사용하기 (store 를 만들 함수)
import { legacy_createStore as createStore } from 'redux';
// store(저장소) 공급자 
import { Provider } from 'react-redux';

//store 에서 관리될 초기 상태값 
const initialState={
  userName:null,
  modalShow:false
}

//리듀서 함수(차원을 줄이는)
const reducer = (state=initialState, action)=>{
  
  return state;
}

//저장소를 만들어서 (저장소를 만들때 리듀서 함수를 전달)
const store = createStore(reducer);

// public/index.html 파일에서 id 가 root 인 요소에  App 을  렌더링하기 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();