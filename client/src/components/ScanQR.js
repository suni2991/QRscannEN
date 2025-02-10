import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { message } from "antd";

const ScanQR = () => {
  const [scannedData, setScannedData] = useState(null);
  const [existingStatus, setExistingStatus] = useState(null);
  const [giftStatus, setGiftStatus] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        disableFlip: true,
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
          alert("Invalid QR code format. Please scan a valid QR code.");
          return;
        }

        const fullName = resultData[1] + " " + resultData[2];
        const email = resultData[3];
        const department = resultData[4] + " " + resultData[5];

        // Fetch existing status
        fetch(`http://localhost:5000/get-status?email=${email}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setExistingStatus(data.status);
              setGiftStatus(data.giftStatus);

              if (data.status === "Accepted") {
                if (data.giftStatus) {
                  alert("Invitee Attended & Gift also disbursed");
                  navigate("/attendence");
                  setIsScanning(false);
                } else {
                  setScannedData({ fullName, email, department, status: data.status });
                  setIsScanning(false); // Stop scanning when showing details
                }
              } else {
                setScannedData({ fullName, email, department, status: "new" });
                setIsScanning(false); // Stop scanning when showing details
              }
            } else {
              alert("Invitee not found. Please accept or reject the invitee.");
              setScannedData({ fullName, email, department, status: "new" });
              setIsScanning(false); // Stop scanning when showing details
            }
          })
          .catch((error) => console.error("Error fetching status:", error));
      } catch (err) {
        console.error("Error parsing QR code:", err);
        alert("Error reading QR code. Please try again.");
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
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <button onClick={toggleScanning} style={{ margin: "10px" }}>
        {!isScanning ? "Start Scanning" : "Stop Scanning"}
      </button>

      <div id="reader" style={{ width: "600px", display: isScanning ? 'block' : 'none' }}></div>

      {scannedData && (
        <div id="result" style={{ textAlign: "center", fontSize: "1.5rem" }}>
          <h2>Details</h2>
          <p><strong>Full Name:</strong> {scannedData.fullName}</p>
          <p><strong>Email:</strong> {scannedData.email}</p>
          <p><strong>Department:</strong> {scannedData.department}</p>
          <p><strong>Status:</strong> {existingStatus}</p>
          <p><strong>Gift Status:</strong> {giftStatus ? "Received" : "Not Received"}</p>

          {!existingStatus && (
            <div>
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
