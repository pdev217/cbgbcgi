import logo from './logo.svg';
import Header from './components/Header'
import React, { useState, useEffect } from 'react';
import Main from './Main'
import './static/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [fullyLoaded, setFullyLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFullyLoaded(true)
    }, 1000);

  }, []);
  return (

    <div className="App">
      <Main />
    </div>
  );
}
const Accordion = ({ title, children }) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <div className="accordion-wrapper">

      <div
        className={`accordion-title ${isOpen ? "open" : ""}`}
        onClick={() => setOpen(!isOpen)}
      >
        {title}
      </div>
      <div className={`accordion-item ${!isOpen ? "collapsed" : ""}`}>
        <div className="accordion-content">{children}</div>
      </div>
    </div>
  );
};
export default App;
