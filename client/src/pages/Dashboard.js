import React, { useState } from "react";
import ScanQR from "../components/ScanQR";
import ScannedQR from "../components/ScannedQR";
import { useNavigate } from "react-router-dom";
import logo from  "./enfuse-logo.png";
import { FaPowerOff } from "react-icons/fa";

const Dashboard = () => {
  const [showScanQR, setShowScanQR] = useState(true);
  const navigate = useNavigate();

  const toggleView = () => {
    setShowScanQR(prevState => !prevState);
  };

  const handleLogout = () => {
    navigate("/")
  }

  return (
    <>
      
      {/* Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        backgroundColor:"white",
        minHeight:"40px"
      }}>
        <img src={logo} alt="Enfuse Logo" style={{ height: "1.5rem" }} />
        
        
        <button onClick={toggleView}>
          {showScanQR ? "Attendence Data" : "Scan" }
        </button>
        <button onClick={handleLogout} style={{background:"#AF0C0E"}}><FaPowerOff /></button>
      </header>

     
      <main className= {showScanQR ? "scan-content" : "main-content"}>
        {showScanQR ? <ScanQR /> : <ScannedQR />}
      </main>

    
      <footer>
        All rights reserved @ EnFuse Solutions Ltd
      </footer>

    </>
  );
};

export default Dashboard;