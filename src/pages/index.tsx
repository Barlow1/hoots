import { useState } from "react";
import "../App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>
        <h1>Hoots</h1>
        <p>Find a mentor who gives a hoot!</p>
      </div>
    </div>
  );
}

export default App;
