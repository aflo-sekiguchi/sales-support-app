import React from "react";
import { Button, Nav, Dropdown } from "react-bootstrap";
import type { HeaderProps } from "../types";
import { useAuthManager } from "../hooks/useAuthManager";

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onResetMatch,
  onSyncEmails,
  handleLogout,
}) => {
  const { useAuth } = useAuthManager();
  const { user } = useAuth();
  return (
    <header className="bg-primary text-white p-3">
      <div className="d-flex" style={{ justifyContent: "space-between" }}>
        <Nav
          variant="tabs"
          activeKey={activeTab}
          className="justify-content-left"
        >
          <Nav.Item>
            <Nav.Link
              eventKey="engineer"
              onClick={() => {
                onTabChange("engineer");
                onResetMatch;
              }}
              className={
                activeTab === "engineer"
                  ? "text-dark bg-white fw-bold"
                  : "text-white"
              }
            >
              人材から照合
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="job"
              onClick={() => {
                onTabChange("job");
                onResetMatch();
              }}
              className={
                activeTab === "job"
                  ? "text-dark bg-white fw-bold"
                  : "text-white"
              }
            >
              求人から照合
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <div
          className="d-flex"
          style={{
            justifyContent: "space-between",
            columnGap: "20px",
          }}
        >
          <Button variant="light" onClick={onSyncEmails}>
            同期
          </Button>
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              style={{
                textDecoration: "none",
                color: "white",
                padding: 0,
                height: "100%",
              }}
            >
              {user?.name}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout}>ログアウト</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
