import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ToDoList from './components/ToDoList'

export default function App() {
  
  console.log(
    "%c⛔️ FBI WARNING!!!",
    "color: white;font-family:system-ui;font-size:2rem;-webkit-text-stroke: 0px #F0F8FF;font-weight:bold;background: red; padding: 20px"
  );

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" ><ToDoList/></Route>
        </Switch>
      </BrowserRouter>
    </div>
  )
}