import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useSocket } from "../../../context/SocketContext";
import PollResults from "../../common/PollResults/PollResults";
import styles from "./LiveResults.module.css";

const LiveResults = () => {
  const { state, dispatch } = useApp();
  const { socket } = useSocket();
  const { currentPoll, pollResults, connectedStudents } = state;
  const [showWarning, setShowWarning] = useState(false);

  const handleNewQuestion = () => {
    // Check if all connected students have submitted their votes
    // Handle different possible data structures for pollResults
    const voterCount = pollResults.voterCount ?? pollResults.totalVotes ?? 0;
    const totalConnectedStudents =
      pollResults.connectedStudents ?? connectedStudents.length;

    // console.log("Checking votes:", {
    //   voterCount,
    //   totalConnectedStudents,
    //   pollResults,
    // });

    // If there are connected students but not all have voted, show warning
    if (totalConnectedStudents > 0 && voterCount < totalConnectedStudents) {
      setShowWarning(true);
      return;
    }

    // Hide warning if it was shown before
    setShowWarning(false);

    // All students have answered (or no students connected), end poll and redirect to create
    socket?.emit("teacher:end_poll", (response) => {
      if (response?.success) {
        // Reset poll and navigate to create view atomically
        dispatch({ type: "RESET_POLL_AND_GO_TO_CREATE" });
      } else {
        console.error("Failed to end poll:", response);
      }
    });
  };

  if (!currentPoll) {
    return (
      <div className={styles.noPoll}>
        <p>No active poll. Create a new poll to see results.</p>
      </div>
    );
  }

  const handleViewHistory = () => {
    // Navigate to poll history page
    // You can implement the navigation logic here
    console.log("Navigating to poll history");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.placeholder}></div>
        <button className={styles.viewHistoryBtn} onClick={handleViewHistory}>
          <svg
            className={styles.eyeIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View Poll history
        </button>
      </div>
      <PollResults />

      <div className={styles.actions}>
        <button className={styles.newQuestionBtn} onClick={handleNewQuestion}>
          + Ask a new question
        </button>
      </div>

      {showWarning && (
        <div className={styles.warning}>
          Not all students have answered yet! (
          {pollResults.voterCount ?? pollResults.totalVotes ?? 0}/
          {pollResults.connectedStudents ?? connectedStudents.length} students
          have voted)
        </div>
      )}
    </div>
  );
};

export default LiveResults;
