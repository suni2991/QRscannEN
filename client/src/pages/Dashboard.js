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
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between", 
      alignItems: "center", 
      height: "100vh", 
      padding: "10px"
    }}>
      
      {/* Header */}
      <div style={{ 
        width: "600px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <img src={logo} alt="Enfuse Logo" style={{ height: "50px" }} />
        <button onClick={toggleView}>
          {showScanQR ? "Attendence Data" : "Home" }
        </button>
      </div>

      {/* Middle Section */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {showScanQR ? <ScanQR /> : <ScannedQR />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", paddingBottom: "10px", background:"#00B4D2", width:"600px" }}>
        <p>All rights reserved @ EnFuse Solutions Pvt Ltd</p>
      </div>

    </main>
  );
};

export default Dashboard;
