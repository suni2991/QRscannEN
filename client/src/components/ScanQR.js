import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { message } from "antd";
import '../css/QR.css';

const ScanQR = () => {
  const [scannedData, setScannedData] = useState(null);
  const [existingStatus, setExistingStatus] = useState(null);
  const [giftStatus, setGiftStatus] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner;
    setIsScanning(true);
  
    const success = (decodedText, decodedResult) => {
      console.log(`Code matched = ${decodedText}`, decodedResult);
      // Do something with the decoded text or result
      setScannedData(decodedResult);
      setIsScanning(false);
    };

    const error = (errorMessage) => {
      console.error(`QR Code scanning error: ${errorMessage}`);
      // Handle error
    };

    if (isScanning) {
      const readerElement = document.getElementById("reader");
      if (readerElement) {
        scanner = new Html5QrcodeScanner("reader", {
          qrbox: { width: 250, height: 250 },
          fps: 10,
          disableFlip: true,
        });
        scanner.render(success, error);
      } else {
        console.error("Element with ID 'reader' not found in the DOM.");
        setIsScanning(false); // Stop scanning if the element is not found
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
  };

  const handleStatusChange = (newStatus) => {
    const updatedData = { ...scannedData, status: newStatus };
    setScannedData(updatedData);

    fetch("http://localhost:5000/save-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert(data.message);
        } else {
          message.success("Attendance updated successfully!");

          if (newStatus === "Accepted") {
            checkGiftReceived(scannedData.email);
          } else {
            setTimeout(() => {
              navigate("/attendence");
              setIsScanning(false); // Stop scanning after handling status change
            }, 500);
          }
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const saveNewInvitee = (inviteeData) => {
    fetch("http://localhost:5000/save-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inviteeData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          message.success("New invitee recorded in the database!");
          setTimeout(() => {
            navigate("/attendence");
            setIsScanning(false); // Stop scanning after saving new invitee
          }, 500);
        } else {
          alert("Failed to record new invitee.");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const checkGiftReceived = (email) => {
    Swal.fire({
      title: "Has the candidate received the gift?",
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: "No",
    }).then((result) => {
      const giftStatus = result.isConfirmed;

      fetch("http://localhost:5000/update-gift-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, giftStatus }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            message.success(`Gift status set to ${giftStatus ? "received" : "not received"}.`);
            setIsScanning(false);
          } else {
            alert("Failed to update gift status.");
          }
          setTimeout(() => {
            navigate("/attendence");
            setIsScanning(false); // Stop scanning after updating gift status
          }, 500);
        })
        .catch((error) => console.error("Error:", error));
    });
  };

  return (
    <main className="scanDetails">
      <div id="reader" style={{ width: "600px", display: isScanning ? 'block' : 'none' }}></div>

      {scannedData && (
        <div id="result" >
          <h2>Details</h2>
          <div><strong>Full Name:</strong> {scannedData.fullName}</div>
          <div><strong>Email:</strong> {scannedData.email}</div>
          <div><strong>Department:</strong> {scannedData.department}</div>
          <div><strong>Status:</strong> {existingStatus}</div>
          <div><strong>Gift Status:</strong> {giftStatus ? "Received" : "Not Received"}</div>

          {!existingStatus && (
            <div className="acceptRejectBtns">
              <button
                onClick={() => handleStatusChange("Accepted")}
                style={{ margin: "10px" }}
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusChange("Rejected")}
                style={{ margin: "10px" }}
              >
                Reject
              </button>
            </div>
          )}

          {existingStatus === "Accepted" && !giftStatus && (
            <div>
              <button onClick={() => checkGiftReceived(scannedData.email)} style={{ margin: "10px" }}>
                Update Gift Status
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default ScanQR;
