import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAccountStore } from "../state/useAccountStore";
import Panel from "../components/common/Panel";
import Button from "../components/common/Button";

const LoginScene = () => {
  const login = useAccountStore((state) => state.login);
  const authStatus = useAccountStore((state) => state.authStatus);
  const authError = useAccountStore((state) => state.authError);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; username: string; displayName: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth
      .listUsers()
      .then((resp) => {
        if (!active) return;
        setUsers(resp);
      })
      .catch(() => {
        if (!active) return;
        setUsers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async () => {
    const nextUsername = username.trim();
    const nextPassword = password;
    if (!nextUsername || !nextPassword) return;
    setIsSubmitting(true);
    try {
      await login(nextUsername, nextPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !isSubmitting && authStatus !== "checking";

  const fillCredentials = (nextUsername: string, nextPassword: string) => {
    setUsername(nextUsername);
    setPassword(nextPassword);
  };

  return (
    <div
      className="login-scene"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Panel title="Sign In" className="login-scene__panel">
        <div style={{ display: "grid", gap: "12px", minWidth: "280px" }}>
          <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #2c2c2c" }}
            />
          </label>
          <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #2c2c2c" }}
            />
          </label>
          <Button type="button" variant="primary" onClick={handleLogin} disabled={!canSubmit}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
          {authError ? <div style={{ fontSize: "12px", color: "#c04848" }}>{authError}</div> : null}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button type="button" variant="ghost" onClick={() => fillCredentials("JoshDoubleYou", "1234")}>
              Use JoshDoubleYou
            </Button>
            <Button type="button" variant="ghost" onClick={() => fillCredentials("Admin", "2468")}>
              Use Admin
            </Button>
          </div>
          {users.length > 0 ? (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Existing Users
              </div>
              <div style={{ display: "grid", gap: "6px" }}>
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setUsername(user.username)}
                    disabled={isSubmitting}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #2c2c2c",
                      background: "rgba(0,0,0,0.35)",
                      color: "inherit",
                    }}
                  >
                    {user.displayName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
};

export default LoginScene;
