import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const ScannedQR = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/scanned-qr")
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
      title: "Gift Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  // Function to download data as Excel
  const downloadExcel = () => {
    const excelData = data.map((item) => ({
      "Full Name": item.fullName,
      Department: item.department,
      "Scanned By": item.scannedBy,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned QR Data");

    XLSX.writeFile(workbook, "Scanned_QR_Data.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button 
        type="primary" 
        icon={<DownloadOutlined />} 
        onClick={downloadExcel} 
        style={{ marginBottom: "20px" }}
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
