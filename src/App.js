
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";

function App() {
  return (
    <div className="App">
      {/* <Navbar /> */}
      <Router>
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Home/>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
