import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context";

import axios from "axios";

export const useAuthManager = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [userRegisterError, setUserRegisterError] = useState("");
  const [userLoginError, setUserLoginError] = useState("");

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setUserRegisterError("パスワードが一致しません");
      return;
    }

    // ユーザ登録APIへリクエスト
    try {
      await axios.post("http://localhost:8000/register", {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      alert("登録成功");
      navigate("/login");
    } catch (error: any) {
      setUserRegisterError("登録に失敗しました");
      console.error("Failed to Resister User:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to Resister User from API",
      );
    } finally {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  // ログイン関数
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });
      // トークンを保存
      localStorage.setItem("access_token", res.data.access_token);
      alert("ログイン成功");
      navigate("/emails");
    } catch (error: any) {
      setUserLoginError("ログインに失敗しました");
      console.error("Failed to Login:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to Login from API",
      );
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  // ログアウト関数
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    alert("ログアウトしました");
    navigate("/login");
  };

  const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
      throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
  };

  return {
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister,
    userRegisterError,
    handleLogin,
    userLoginError,
    handleLogout,
    useAuth,
  };
};
