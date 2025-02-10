import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input, message } from "antd";
import "../styles/Home.css";// Import the CSS file
import logo from  "./enfuse-logo.png";

const Home = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.text();
        message.success(data);
        navigate("/dashboard");
      } else {
        const errorData = await response.text();
        message.error(errorData);
      }
    } catch (error) {
      console.error("Error during login:", error);
      message.error("An error occurred during login. Please try again.");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* <h2>Login</h2> */}
        <img src = {logo} alt="Enfuse Logo" style={{ height: "30px",marginBottom:"20px" }} />
        <Form
          name="basic"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            // label="Username"
            name="username"
           
            rules={[
              { required: true, message: "Please input your username!" },
            ]}
          >
            <Input placeholder="Username" className = "login-input-field"/>
          </Form.Item>

          <Form.Item
            // label="Password"
            name="password"
            className = "login-input-field"
            rules={[
              { required: true, message: "Please input your password!" },
            ]}
          >
            <Input.Password placeholder="Password" className = "login-input-field"/>
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox className="remember-me login-input-field">Remember me</Checkbox>
          </Form.Item>

          <Form.Item className="login-btn">
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Home;
