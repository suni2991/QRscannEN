import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { message } from "antd";
import '../css/QR.css';

const ScanQR = () => {
  const [scannedData, setScannedData] = useState(null);
  const [showScannedData, setShowScannedData] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);
  const [giftStatus, setGiftStatus] = useState(false);
  const [dept, setDept] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let scanner;
    setIsScanning(true)
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        disableFlip: false,
      });
      scanner.render(success, error);
    }

    function success(result) {
      scanner.clear().then(() => {
        document.getElementById("reader").innerHTML = "";
      });

      try {
        const resultData = result.split(" ");
        if (resultData.length < 4) {
          Swal.fire("Invalid QR code format", "Please scan a valid QR code.", "error");
          return;
        }

        const empId = resultData[5].replace("Email:", "").trim();
        const fullName = resultData[2] + " " + resultData[3].replace("Zoho", "").trim();
        const emailId = resultData[6];
        // Fetch existing status
        fetch(`http://localhost:5090/api/get-status?emailId=${emailId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setExistingStatus(data.status);
              setGiftStatus(data.giftStatus);
              setDept(data.department);

              setScannedData({ fullName, emailId, empId});
              setShowScannedData(true);
              setIsScanning(true); // Stop scanning when showing details
              if (data.status === "Accepted" && data.giftStatus) {
                Swal.fire(`${fullName} Attended & Gift also disbursed`, "", "info");
                setShowScannedData(false);
                setIsScanning(false); 
              }
            } else {
             
              setIsScanning(true); 
              setShowScannedData(false);
              setScannedData({ fullName, emailId, empId });
             
            }
          })
          .catch((error) => console.error("Error fetching status:", error));
      } catch (err) {
        console.error("Error parsing QR code:", err);
        setShowScannedData(false);
        Swal.fire("Error reading QR code", "Please try again.", "error");
      }
    }

    function error(err) {
      if (!err.includes("NotFoundException")) {
        console.error("QR code scan error:", err);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Cleanup error:", err));
      }
    };
  }, [isScanning]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (isScanning){
      setScannedData(null);
    }
  };

  const handleStatusChange = (newStatus) => {
    setButtonClicked(true);
    const updatedData = { ...scannedData, status: newStatus };
    setScannedData(updatedData);
  
    fetch("http://localhost:5090/api/save-qr", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          Swal.fire("Error", data.message, "error");
          setShowScannedData(false);
          setButtonClicked(false); // Re-enable buttons if there is an error
        } else {
          setButtonClicked(true);
          Swal.fire("Success", "Attendance updated successfully!", "success");
           
          message.success("Attendance updated successfully!");
          setIsScanning(false);
          setShowScannedData(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setButtonClicked(false); // Re-enable buttons if there is an error
        setShowScannedData(false);
      });
  };

  const saveGiftStatus = (emailId, giftStatus, note) => {
    fetch("http://localhost:5090/api/update-gift-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailId, giftStatus, note }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          message.success("Gift status updated successfully!");
          setShowScannedData(false);
          setIsScanning(false); 
          setButtonClicked(true);
          
          navigate("/dashboard");
        } else {
          setShowScannedData(false);
          Swal.fire("Error", "Failed to update gift status.", "error");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const promptGiftStatus = (emailId) => {
    Swal.fire({
      title: 'Gift Status',
      text: 'Has the invitee received the gift?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      input: 'text',
      inputPlaceholder: 'Answer with Yes or No'
    }).then((result) => {
      const giftStatus = result.isConfirmed;
      const note = result.value; // Correctly access the input value
      setGiftStatus(giftStatus);
      saveGiftStatus(emailId, giftStatus, note);
      Swal.fire("Success", "Gift status updated successfully!", "success");
      setIsScanning(true);

    });
  };

  return (
    <main className="scanDetails">
      <div id="reader"></div>
      {showScannedData &&  (
        <div id="result">
          <h2>Details</h2>
          <div><label>Employee ID:</label><p>{scannedData.empId}</p></div>
          <div><label>Full Name:</label><p>{scannedData.fullName}</p></div>
          <div><label>Email:</label> <p id="scannedEmail">{scannedData.emailId} </p></div>
          <div><label>Department:</label><p>{dept}</p></div>
          <div><label>Status:</label><p>{existingStatus}</p></div>
          <div><label>Gift Status:</label> <p>{giftStatus ? "Received" : "Not Received"}</p></div>
          {existingStatus === "Pending" && !buttonClicked && (
            <div className="qrResultBtns">
              <button
                onClick={() => handleStatusChange("Accepted")}
                style={{ margin: "10px" }}
                disabled={buttonClicked}
              >
                Accept
              </button>
             
            </div>
          )}
          {existingStatus === "Accepted" && !giftStatus && (
            <div className="qrResultBtns">
              <button
                onClick={() => promptGiftStatus(scannedData.emailId)}
                style={{ margin: "10px" }}
              >
                Add Gift Status
              </button>
            </div>
          )}
        </div>
      )}
       {/* <button onClick={toggleScanning} style={{ marginTop: "20px" }}>
        {isScanning ? "Stop Scanning" : "Start Scanning"}
      </button> */}
    </main>
  );
};

export default ScanQR;