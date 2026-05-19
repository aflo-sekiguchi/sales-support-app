import { Link } from "react-router-dom";
import { useAuthManager } from "../hooks/useAuthManager";

const Login: React.FC = () => {
  const { setName, setEmail, setPassword, handleLogin, userLoginError } =
    useAuthManager();
  return (
    <div
      className="
        d-flex
        justify-content-center
        align-items-center
        min-vh-100
        bg-light
      "
    >
      <div
        className="
          bg-white
          p-5
          rounded-4
          shadow
        "
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-2">Login</h1>

          <p className="text-muted">アカウントにログイン</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>

            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="example@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>

            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {userLoginError && (
            <div className="alert alert-danger">{userLoginError}</div>
          )}

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary btn-lg">
              ログイン
            </button>

            <Link
              to="/register"
              className="
                btn
                btn-outline-secondary
                btn-lg
              "
            >
              新規登録
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
