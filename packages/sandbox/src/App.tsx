import React, { ReactNode } from "react";
import { SpicyKeys } from "react-spicykeys";
import "./App.css";

function Card(props: { children?: ReactNode; title: ReactNode }) {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <pre>react-spicykeys</pre>
        </h1>
        <Card title="Basics">
          <SpicyKeys
            keys={{
              enter: () => {
                console.log("enter pressed");
              },
            }}
          />
        </Card>
        <Card title="Inputs"></Card>
        <Card title="Inputs"></Card>
      </header>
    </div>
  );
}

export default App;
