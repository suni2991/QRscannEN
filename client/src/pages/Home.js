import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input, message } from "antd";
import "../styles/Home.css";// Import the CSS file

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
        <h2>Login</h2>
        <Form
          name="basic"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            
            name="username"
            rules={[
              { required: true, message: "Please input your username!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
           
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox className="remember-me">Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Home;
