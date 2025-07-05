import React, { useEffect } from "react";
import { useApp } from "../../../context/AppContext";
import { useSocket } from "../../../context/SocketContext";
import Header from "../../common/Header/Header";
import CreatePoll from "../CreatePoll/CreatePoll";
import LiveResults from "../LiveResults/LiveResults";
import PollHistory from "../PollHistory/PollHistory";
import Chat from "../../common/Chat/Chat";
import styles from "./TeacherDashboard.module.css";
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const TeacherDashboard = () => {
  const { state, dispatch } = useApp();
  const { socket } = useSocket();
  const { currentPoll, teacherDashboardView } = state;
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useLocalStorage('teacherSessionId', null);

  useEffect(() => {
    // Join as teacher when component mounts
    if (socket) {
      socket.emit("teacher:join", (response) => {
        if (response?.success && response.data?.sessionId) {
          setSessionId(response.data.sessionId);
        }
      });
    }
  }, [socket, setSessionId]);

  useEffect(() => {
    // Switch to results view when a poll is active, or back to create when poll ends
    if (currentPoll) {
      dispatch({ type: "SET_TEACHER_DASHBOARD_VIEW", payload: "results" });
    } else if (teacherDashboardView === "results") {
      // If we're on results view but no active poll, switch to create
      dispatch({ type: "SET_TEACHER_DASHBOARD_VIEW", payload: "create" });
    }
  }, [currentPoll, dispatch, teacherDashboardView]);

  const renderContent = () => {
    switch (teacherDashboardView) {
      case "create":
        return <CreatePoll />;
      case "results":
        return <LiveResults />;
      case "history":
        return <PollHistory />;
      default:
        return <CreatePoll />;
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.content}>
        <button
          className={styles.historyButton}
          onClick={() => navigate('/teacher/history')}
          style={{ marginBottom: '1rem', alignSelf: 'flex-end' }}
        >
          View History
        </button>
        <div className={styles.main}>{renderContent()}</div>
      </div>

      <Chat />
    </div>
  );
};

export default TeacherDashboard;
