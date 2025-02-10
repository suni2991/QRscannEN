import React, { useState } from "react";
import logo from './enfuse-logo.png';
import ScannedQR from "../components/ScannedQR";
import { useNavigate } from "react-router-dom";

const Attendence = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/dashboard'); // Navigate to the Dashboard page
  };

  return (  
    <main style={{ 
      // display: "flex", 
      // flexDirection: "column", 
      // justifyContent: "space-between", 
      // alignItems: "center", 
      // height: "100vh", 
      // padding: "20px"
    }}>
      
      {/* Header */}
      <div style={{ 
      }}>
        <img src={logo} alt="Enfuse Logo" style={{ height: "50px" }} />
        <button onClick={handleNavigation}>Home</button>
      </div>

      {/* Middle Section */}
      <div>
        <ScannedQR />
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", paddingBottom: "10px" }}>
        <p>All rights reserved</p>
      </div>

    </main>
  );
};

export default Attendence;
