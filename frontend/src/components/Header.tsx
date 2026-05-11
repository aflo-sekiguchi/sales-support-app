import React from "react";
import { Button, Nav } from "react-bootstrap";
import type { HeaderProps } from "../types";

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onResetMatch,
  onSyncEmails,
}) => {
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
        <Button
          variant="light"
          // className="w-100 mb-3"
          onClick={onSyncEmails}
        >
          同期
        </Button>
      </div>
    </header>
  );
};

export default Header;
