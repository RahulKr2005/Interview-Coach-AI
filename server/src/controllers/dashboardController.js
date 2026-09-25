import { InterviewSession } from '../models/InterviewSession.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const userId = String(req.user._id || req.user.id);
    const targetRole = req.user.target_role || 'Frontend Developer';

    let sessions = [];
    if (isMongoConnected()) {
      sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: 1 });
    } else {
      sessions = memoryStore.findSessionsByUserId(userId).reverse(); // oldest first for trend
    }

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;

    let totalAttempted = 0;
    let totalScore = 0;
    let scoredCount = 0;

    const topicStats = new Map(); // topic -> { sumScore, count, skippedCount }

    sessions.forEach(s => {
      (s.questions || []).forEach(q => {
        if (q.user_answer !== null || q.skipped) {
          totalAttempted += 1;
        }

        if (q.score !== null && q.score !== undefined && !q.skipped) {
          totalScore += q.score;
          scoredCount += 1;
        }

        if (q.topic) {
          const stat = topicStats.get(q.topic) || { sumScore: 0, count: 0, skippedCount: 0 };
          if (q.score !== null && !q.skipped) {
            stat.sumScore += q.score;
            stat.count += 1;
          }
          if (q.skipped) {
            stat.skippedCount += 1;
          }
          topicStats.set(q.topic, stat);
        }
      });
    });

    const averageScore = scoredCount > 0 ? Math.round((totalScore / scoredCount) * 10) / 10 : null;

    // Topics needing practice: average score < 70 or skipped > 0
    const topicsNeedingPractice = [];
    for (const [topic, stat] of topicStats.entries()) {
      const avg = stat.count > 0 ? Math.round((stat.sumScore / stat.count) * 10) / 10 : 0;
      if (avg < 70 || stat.skippedCount > 0) {
        topicsNeedingPractice.push({
          topic,
          avg_score: avg,
          count: stat.count,
          skipped_count: stat.skippedCount,
        });
      }
    }
    topicsNeedingPractice.sort((a, b) => a.avg_score - b.avg_score);

    // Recent sessions (latest 5)
    const recent = [...sessions].reverse().slice(0, 5).map(s => {
      let sum = 0;
      let count = 0;
      let answered = 0;
      (s.questions || []).forEach(q => {
        if (q.score !== null && !q.skipped) {
          sum += q.score;
          count += 1;
        }
        if (q.user_answer) answered += 1;
      });
      return {
        id: String(s._id || s.id),
        target_role: s.target_role,
        interview_type: s.interview_type,
        difficulty: s.difficulty,
        question_count: s.question_count,
        status: s.status,
        mode: s.mode,
        created_at: s.createdAt || s.created_at,
        average_score: count > 0 ? Math.round((sum / count) * 10) / 10 : null,
        answered_count: answered,
      };
    });

    // Score trend for charts (all completed sessions sorted chronologically)
    const scoreTrend = [];
    let completedIdx = 1;
    sessions.forEach(s => {
      if (s.status === 'completed') {
        let sum = 0;
        let count = 0;
        (s.questions || []).forEach(q => {
          if (q.score !== null && !q.skipped) {
            sum += q.score;
            count += 1;
          }
        });
        if (count > 0) {
          const dateStr = s.createdAt || s.created_at;
          const dateLabel = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Mock ${completedIdx}`;
          scoreTrend.push({
            session_index: completedIdx,
            date: dateLabel,
            role: s.target_role,
            score: Math.round((sum / count) * 10) / 10,
          });
          completedIdx += 1;
        }
      }
    });

    // Calculate actual practice streak in days
    const uniqueDays = new Set(
      sessions
        .map(s => s.createdAt || s.created_at)
        .filter(Boolean)
        .map(d => new Date(d).toISOString().slice(0, 10))
    );
    const practiceStreakDays = uniqueDays.size;

    return res.status(200).json({
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      total_questions_attempted: totalAttempted,
      average_score: averageScore,
      practice_streak_days: practiceStreakDays,
      target_role: targetRole,
      active_mode: req.user.active_mode || 'Basic Practice Mode',
      topics_needing_practice: topicsNeedingPractice.slice(0, 6),
      recent_sessions: recent,
      score_trend: scoreTrend.slice(-15),
    });
  } catch (err) {
    next(err);
  }
}
