import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import '../css/QR.css';
const ScanQR = () => {
  const [scannedData, setScannedData] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 10, // Reduce FPS to minimize errors
    });
  
    scanner.render(success, error);
  
    function success(result) {
      // Stop scanning immediately after success
      scanner.clear().then(() => {
        document.getElementById("reader").innerHTML = ""; // Proper cleanup
      });
  
      try {
        const resultData = result.split(" ");
        if (resultData.length < 4) {
          alert("Invalid QR code format. Please scan a valid QR code.");
          return;
        }
  
        const fullName = resultData[1] + " " + resultData[2];
        const email = resultData[3];
        const department = resultData.slice(4).join(" ");
  
        setScannedData({ fullName, email, department });
      } catch (err) {
        console.error("Error parsing QR code:", err);
        alert("Error reading QR code. Please try again.");
      }
    }
  
    function error(err) {
      // Suppress repeated "NotFoundException" errors
      if (!err.includes("NotFoundException")) {
        console.error("QR code scan error:", err);
      }
    }
  
    return () => {
      scanner.clear().catch((err) => console.error("Cleanup error:", err));
    };
  }, []);
  

  const handleStatusChange = (status) => {
    setStatus(status);
  
    fetch("http://localhost:5000/save-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...scannedData,
        status,
        scannedBy: "SUNITHA",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert(data.message); // Show error if duplicate
        } else {
          console.log("Saved:", data);
          alert(`QR Code ${status} successfully!`); // Show success message
        }
        
        // Navigate after alert
        setTimeout(() => {
          navigate("/dashboard");
        }, 500); // Short delay to ensure alert is acknowledged
      })
      .catch((error) => console.error("Error:", error));
  };
  
  

  return (
    <main className = "scanDetails">
      <div id="reader"></div>

      {scannedData && (
        <div id="result">
          <h2>Success!</h2>
          <div><label>Full Name:</label><p>{scannedData.fullName}</p></div>
          <div><label>Email:</label> <p>{scannedData.email} </p></div>
          <div><label>Department:</label><p>{scannedData.department}</p></div>

          {/* Show buttons after scanning */}
          <div className="acceptRejectBtns">
            <button onClick={() => handleStatusChange("Accepted")} style={{ margin: "10px" }}>
              Accept
            </button>
            <button onClick={() => handleStatusChange("Rejected")} style={{ margin: "10px" }}>
              Reject
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ScanQR;