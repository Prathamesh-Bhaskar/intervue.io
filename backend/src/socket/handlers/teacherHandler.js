const pollService = require('../../services/pollService');
const studentService = require('../../services/studentService');
const redisService = require('../../services/redisService');
const timerService = require('../../services/timerService');
const { SOCKET_EVENTS } = require('../../utils/constants');
const { createErrorResponse, createSuccessResponse, generateSessionId } = require('../../utils/helpers');
const logger = require('../../utils/logger');

class TeacherHandler {

  async handleTeacherJoin(socket, io, data, callback) {
    try {
      // Set teacher session in Redis
      const sessionData = {
        socketId: socket.id,
        joinedAt: new Date().toISOString(),
        sessionId: generateSessionId(),
        isOnline: true,
      };

      await redisService.setTeacherSession(sessionData);

      // Join teacher room
      socket.join('teacher_room');

      logger.info(`Teacher joined: ${socket.id}`);

      if (callback) {
        callback(createSuccessResponse({
          sessionId: sessionData.sessionId,
          teacherInfo: sessionData,
        }, 'Teacher joined successfully'));
      }

    } catch (error) {
      logger.error('Error handling teacher join:', error);
      if (callback) {
        callback(createErrorResponse('Failed to join as teacher', 'TEACHER_JOIN_ERROR'));
      }
    }
  }

  async handleCreatePoll(socket, io, data, callback) {
    try {
      const { question, options, duration = 60 } = data;

      // Create poll
      const result = await pollService.createPoll({ question, options, duration }, socket.id);

      // Start timer
      timerService.startTimer(
        result.poll._id.toString(),
        duration,
        (timeRemaining) => {
          // Broadcast timer updates
          io.to('main_room').emit(SOCKET_EVENTS.TIMER_UPDATE, timeRemaining);
        },
        async () => {
          // Auto-end poll when timer expires
          try {
            const endResult = await pollService.endPoll(result.poll._id.toString(), socket.id);
            
            io.to('main_room').emit(SOCKET_EVENTS.POLL_ENDED, {
              poll: endResult.poll,
              finalResults: endResult.finalResults,
              reason: 'Time expired',
            });

            // Reset all students' vote status
            await studentService.resetStudentsVoteStatus();
            
          } catch (error) {
            logger.error('Error auto-ending poll:', error);
          }
        }
      );

      // Broadcast poll to all clients
      const pollData = {
        id: result.poll._id.toString(),
        question: result.poll.question,
        options: result.poll.options,
        duration: result.poll.duration,
        startTime: result.poll.startedAt,
      };

      io.to('main_room').emit(SOCKET_EVENTS.POLL_STARTED, pollData);

      logger.info(`Poll created and broadcasted: ${result.poll._id}`);

      if (callback) {
        callback(createSuccessResponse(result, 'Poll created successfully'));
      }

    } catch (error) {
      logger.error('Error creating poll:', error);
      if (callback) {
        callback(createErrorResponse(error.message || 'Failed to create poll', 'POLL_CREATE_ERROR'));
      }
    }
  }

  async handleEndPoll(socket, io, data, callback) {
    try {
      // Get current active poll
      const activePoll = await redisService.getActivePoll();
      if (!activePoll) {
        if (callback) {
          callback(createErrorResponse('No active poll found', 'NO_ACTIVE_POLL'));
        }
        return;
      }

      // End the poll
      const result = await pollService.endPoll(activePoll.id, socket.id);

      // Stop timer
      timerService.stopTimer(activePoll.id);

      // Broadcast poll ended
      io.to('main_room').emit(SOCKET_EVENTS.POLL_ENDED, {
        poll: result.poll,
        finalResults: result.finalResults,
        reason: 'Ended by teacher',
      });

      // Reset all students' vote status
      await studentService.resetStudentsVoteStatus();

      logger.info(`Poll ended by teacher: ${activePoll.id}`);

      if (callback) {
        callback(createSuccessResponse(result, 'Poll ended successfully'));
      }

    } catch (error) {
      logger.error('Error ending poll:', error);
      if (callback) {
        callback(createErrorResponse(error.message || 'Failed to end poll', 'POLL_END_ERROR'));
      }
    }
  }

  async handleKickStudent(socket, io, data, callback) {
    try {
      const { studentName } = data;

      if (!studentName) {
        if (callback) {
          callback(createErrorResponse('Student name is required', 'INVALID_DATA'));
        }
        return;
      }

      // Kick student
      const result = await studentService.kickStudent(studentName, socket.id);

      // Find and disconnect the student's socket
      const connectedSockets = await io.in('main_room').fetchSockets();
      const studentSocket = connectedSockets.find(s => s.id === result.kickedStudent.socketId);
      
      if (studentSocket) {
        studentSocket.emit(SOCKET_EVENTS.STUDENT_KICKED, {
          reason: 'Removed by teacher',
        });
        studentSocket.disconnect(true);
      }

      // Broadcast updated student list
      io.to('main_room').emit(SOCKET_EVENTS.STUDENTS_UPDATED, result.connectedStudents);

      logger.info(`Student kicked: ${studentName} by teacher ${socket.id}`);

      if (callback) {
        callback(createSuccessResponse(result, 'Student kicked successfully'));
      }

    } catch (error) {
      logger.error('Error kicking student:', error);
      if (callback) {
        callback(createErrorResponse(error.message || 'Failed to kick student', 'KICK_STUDENT_ERROR'));
      }
    }
  }

  async handleGetHistory(socket, io, data, callback) {
    try {
      const { limit = 10 } = data;

      const pollHistory = await pollService.getPollHistory(socket.id, limit);

      if (callback) {
        callback(createSuccessResponse({
          polls: pollHistory,
          total: pollHistory.length,
        }, 'Poll history retrieved successfully'));
      }

    } catch (error) {
      logger.error('Error getting poll history:', error);
      if (callback) {
        callback(createErrorResponse('Failed to get poll history', 'HISTORY_ERROR'));
      }
    }
  }
}

module.exports = new TeacherHandler(); 