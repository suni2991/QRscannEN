import React, { useState } from "react";
import ScanQR from "../components/ScanQR";
import ScannedQR from "../components/ScannedQR";
import { useNavigate } from "react-router-dom";
import logo from  "./enfuse-logo.png";

const Dashboard = () => {
  const [showScanQR, setShowScanQR] = useState(true);
  const navigate = useNavigate();

  const toggleView = () => {
    setShowScanQR(prevState => !prevState);
  };

  return (
    <>
      
      {/* Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        backgroundColor:"white"
      }}>
        <img src={logo} alt="Enfuse Logo" style={{ height: "1.5rem" }} />
        <button onClick={toggleView}>
          {showScanQR ? "Attendence Data" : "Home" }
        </button>
      </header>

      {/* Middle Section */}
      <main>
        {showScanQR ? <ScanQR /> : <ScannedQR />}
      </main>

      {/* Footer */}
      <footer>
        All rights reserved @ EnFuse Solutions Pvt Ltd
      </footer>

    </>
  );
};

export default Dashboard;