import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const { setToken, url, loadCartData } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign Up");
  const [otp, setOtp] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Store email for OTP verification
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // Handler for Forgot Password Request
  const onForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${url}/api/user/forgot-password`, {
      email: forgotPasswordEmail,
    });
    if (response.data.success) {
      toast.success("Password reset email sent. Please check your inbox.");
      setCurrState("Login");
    } else {
      toast.error(response.data.message);
    }
  };

  // Handler for OTP Verification
  const onOtpSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${url}/api/user/verify-otp`, {
      email: userEmail,
      otp,
    });
    if (response.data.success) {
      toast.success("OTP verified successfully. Login complete!");
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      loadCartData({ token: response.data.token });
      setShowLogin(false);
    } else {
      toast.error(response.data.message);
    }
  };

  // Handler for Login or Signup
  const onLogin = async (e) => {
    e.preventDefault();
    let new_url = url;
    if (currState === "Login") {
      new_url += "/api/user/login";
    } else {
      new_url += "/api/user/register";
    }
    const response = await axios.post(new_url, data);
    if (response.data.success) {
      if (response.data.otpRequired) {
        setUserEmail(data.email); // Store email for OTP verification
        setCurrState("Verify OTP");
        toast.info("OTP sent to your email. Please verify.");
      } else {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        loadCartData({ token: response.data.token });
        setShowLogin(false);
      }
    } else {
      toast.error(response.data.message);
    }
  };

  // Handler for Resetting the Password
  const onResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${url}/api/user/reset-password`, {
      email: forgotPasswordEmail,
      newPassword,
    });
    if (response.data.success) {
      toast.success("Password reset successfully.");
      setCurrState("Login");
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="login-popup">
      <form
        onSubmit={
          currState === "Forgot Password"
            ? onForgotPasswordSubmit
            : currState === "Verify OTP"
            ? onOtpSubmit
            : currState === "Reset Password"
            ? onResetPasswordSubmit
            : onLogin
        }
        className="login-popup-container"
      >
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        {currState === "Forgot Password" && (
          <div className="login-popup-inputs">
            <input
              name="email"
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              value={forgotPasswordEmail}
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
        )}

        {currState === "Reset Password" && (
          <div className="login-popup-inputs">
            <input
              name="newPassword"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              type="password"
              placeholder="Enter new password"
              required
            />
          </div>
        )}

        {currState === "Verify OTP" && (
          <div className="login-popup-inputs">
            <input
              name="otp"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              type="text"
              placeholder="Enter OTP"
              required
            />
          </div>
        )}

        {currState !== "Forgot Password" && currState !== "Verify OTP" && currState !== "Reset Password" && (
          <div className="login-popup-inputs">
            {currState === "Sign Up" && (
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />
            )}
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Your email"
              required
            />
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder="Password"
              required
            />
          </div>
        )}

        <button type="submit">
          {currState === "Forgot Password"
            ? "Send Reset Link"
            : currState === "Verify OTP"
            ? "Verify OTP"
            : currState === "Reset Password"
            ? "Reset Password"
            : currState === "Login"
            ? "Login"
            : "Create account"}
        </button>

        {currState === "Login" && (
          <>
            <p>
              Create a new account?{" "}
              <span onClick={() => setCurrState("Sign Up")}>Click here</span>
            </p>
            <p>
              Forgot your password?{" "}
              <span onClick={() => setCurrState("Forgot Password")}>
                Reset here
              </span>
            </p>
          </>
        )}

        {currState === "Sign Up" && (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}

        {currState === "Forgot Password" && (
          <p>
            Back to <span onClick={() => setCurrState("Login")}>Login</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
