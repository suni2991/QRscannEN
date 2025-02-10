import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequiredAuth";
import { AuthProvider } from "./context/AuthProvider";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Attendence from "./pages/Attendence";
import './App.css';

const App = () => {
 return(
  <BrowserRouter>
  <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
    
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/attendence" element={<Attendence />} />
       
      </Routes>
  </AuthProvider>
  </BrowserRouter>
  );
};

export default App;