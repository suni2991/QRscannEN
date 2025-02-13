import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const ScannedQR = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5090/api/scanned-qr")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        } else {
          console.error("Error fetching scanned QR data:", result.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Define table columns
  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    
    {
      title: "Attendence",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Gift Received",
      dataIndex: "giftStatus",
      key: "giftStatus",
      render: (text) => (text ? "Yes" : "No"),
    },
  ];
  // Function to download data as Excel
  const downloadExcel = () => {
    const excelData = data.map((item) => ({
      "Full Name": item.fullName,
      Department: item.department,
      "Attendence Status": item.status,
     "Gift Received": item.giftStatus ? "Yes" : "No",
      "Scanned At": new Date(item.scannedAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
      "Note" : item.note
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned QR Data");
    XLSX.writeFile(workbook, "Scanned_QR_Data.xlsx");
  };

  return (
    <div style={{ marginBottom:"30px",width: "90%", textAlign:"center" }}>
    <Button 
      type="primary" 
      icon={<DownloadOutlined />} 
      onClick={downloadExcel} 
      style={{ marginBottom: "20px",backgroundColor:"white",color:"green", maxWidth:"200px"}}
    >
      Download Excel
    </Button>
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="_id" 
      loading={loading} 
      pagination={{ pageSize: 10 }}
    />
  </div>
  );
};

export default ScannedQR;
