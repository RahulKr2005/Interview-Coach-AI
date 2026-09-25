import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  SkipForward, 
  LogOut, 
  Send, 
  ArrowRight, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  AlertCircle,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Check,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  RotateCcw,
  Radio,
  FileAudio,
  Edit3
} from 'lucide-react';
import Card from '../components/Card';
import ModeBadge from '../components/ModeBadge';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

export default function InterviewSession({ setActivePage, onCompleteSession }) {
  const { activeSessionId, setActiveSessionId } = useUser();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [error, setError] = useState(null);

  // Voice Interview Mode States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingState, setRecordingState] = useState('idle'); // 'idle' | 'recording' | 'review'
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribeNotice, setTranscribeNotice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const recognitionRef = useRef(null);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (activeSessionId) {
      loadSession(activeSessionId);
    } else {
      setLoading(false);
    }
  }, [activeSessionId]);

  const loadSession = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSession(sessionId);
      setSession(data);

      // If session is already completed, go to results
      if (data.status === 'completed') {
        onCompleteSession(data.id);
        return;
      }

      // Check current question
      const currentIndex = data.current_question_index;
      const currentQ = data.questions.find((q) => q.question_index === currentIndex);
      if (currentQ && currentQ.feedback) {
        setFeedback(currentQ.feedback);
        setUserAnswer(currentQ.user_answer || '');
      } else {
        setFeedback(null);
        setUserAnswer('');
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview session');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = session?.questions?.find((q) => q.question_index === session.current_question_index);

  // Load browser TTS voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);
        const enVoice = allVoices.find(v => v.lang.startsWith('en') && v.localService) ||
                        allVoices.find(v => v.lang.startsWith('en')) ||
                        allVoices[0];
        if (enVoice) setSelectedVoice(enVoice);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      // Unmount cleanup: cancel speech, stop timers, stop mic tracks, stop recognition
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      stopAllAudioTracks();
    };
  }, []);

  const stopAllAudioTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
  };

  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window) || !currentQ) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.question_text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleStartRecording = async () => {
    // 1. Crucial: Stop question read-aloud before recording begins
    handleStopSpeaking();
    setTranscribeNotice(null);

    const SpeechRec = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRec) {
      setTranscribeNotice({
        type: 'warning',
        message: 'Your browser does not have native SpeechRecognition (available in Chrome, Edge, Safari). You can type your response directly below or test in an updated browser.'
      });
      return;
    }

    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let accumulated = userAnswer ? userAnswer.trim() + ' ' : '';

      recognition.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulated += transcriptChunk + ' ';
          } else {
            interimText += transcriptChunk;
          }
        }
        setUserAnswer((accumulated + interimText).trim());
      };

      recognition.onerror = (e) => {
        console.warn('[WebSpeech] Recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setTranscribeNotice({
            type: 'error',
            message: 'Microphone permission was denied. Please allow microphone access in your browser.'
          });
        } else if (e.error === 'no-speech') {
          // Normal timeout if user was quiet
        } else {
          setTranscribeNotice({
            type: 'warning',
            message: `Speech recognition note: ${e.error}. You can also type or edit your answer directly below.`
          });
        }
      };

      recognition.onend = () => {
        setRecordingState('review');
        if (timerRef.current) clearInterval(timerRef.current);
        stopAllAudioTracks();
      };

      recognition.start();
      recognitionRef.current = recognition;
      setRecordingState('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 179) {
            handleStopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      stopAllAudioTracks();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setTranscribeNotice({
          type: 'error',
          message: 'Microphone permission was denied. Please allow microphone access in your browser to record voice answers.'
        });
      } else if (err.name === 'NotFoundError') {
        setTranscribeNotice({
          type: 'error',
          message: 'No microphone was detected. Please connect an audio input device or use standard text mode.'
        });
      } else {
        setTranscribeNotice({
          type: 'error',
          message: `Microphone error: ${err.message}. You can continue by typing your answer.`
        });
      }
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    stopAllAudioTracks();
    setRecordingState('review');
    setTranscribeNotice({
      type: 'success',
      message: 'Voice recorded and transcribed! Please review, edit if necessary, and submit your confirmed answer.'
    });
  };

  const handleCancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
    stopAllAudioTracks();
    setRecordingState('idle');
    setRecordingTime(0);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQ || !userAnswer.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.submitAnswer(currentQ.id, userAnswer);
      setFeedback(res.feedback);

      // Update question in local state
      setSession((prev) => {
        const updatedQuestions = prev.questions.map((q) => {
          if (q.id === currentQ.id) {
            return {
              ...q,
              user_answer: userAnswer,
              feedback: res.feedback,
              score: res.feedback.score,
            };
          }
          return q;
        });
        return {
          ...prev,
          status: res.session_completed ? 'completed' : prev.status,
          questions: updatedQuestions,
        };
      });

      if (res.session_completed) {
        setActiveSessionId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (!currentQ) return;
    handleStopSpeaking();
    handleCancelRecording();

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.skipQuestion(currentQ.id);

      // Update in local state
      setSession((prev) => {
        const updatedQuestions = prev.questions.map((q) => {
          if (q.id === currentQ.id) {
            return { ...q, skipped: true, score: 0 };
          }
          return q;
        });
        return {
          ...prev,
          status: res.session_completed ? 'completed' : prev.status,
          current_question_index: res.next_question_index || prev.current_question_index,
          questions: updatedQuestions,
        };
      });

      if (res.session_completed) {
        setActiveSessionId(null);
        onCompleteSession(session.id);
      } else {
        setUserAnswer('');
        setFeedback(null);
        setTranscribeNotice(null);
        setRecordingState('idle');
      }
    } catch (err) {
      setError(err.message || 'Failed to skip question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    handleStopSpeaking();
    handleCancelRecording();
    setTranscribeNotice(null);
    setRecordingState('idle');

    if (session.status === 'completed' || session.current_question_index >= session.question_count) {
      setActiveSessionId(null);
      onCompleteSession(session.id);
      return;
    }

    const nextIndex = session.current_question_index + 1;
    setSession((prev) => ({
      ...prev,
      current_question_index: nextIndex,
    }));
    setUserAnswer('');
    setFeedback(null);
  };

  const handleEndSessionEarly = async () => {
    if (!session) return;
    handleStopSpeaking();
    handleCancelRecording();
    try {
      setShowEndModal(false);
      await api.endSession(session.id);
      setActiveSessionId(null);
      onCompleteSession(session.id);
    } catch (err) {
      setError(err.message || 'Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Restoring interview session state...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-semibold text-slate-900 text-lg">No Active Session Found</h3>
        <p className="text-sm text-slate-500">
          You don't have an active interview session in progress. Configure a new session to start practicing.
        </p>
        <button
          onClick={() => setActivePage('start')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          Start New Mock Interview
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(
    ((session.current_question_index - 1) / session.question_count) * 100
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Session Status Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            {session.current_question_index}/{session.question_count}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">{session.target_role}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {session.interview_type}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {session.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Session state saved locally • Refresh-safe</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ModeBadge mode={session.mode} size="sm" />
          <button
            onClick={() => setShowEndModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-teal-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Question Card */}
      {currentQ && (
        <Card className="border-teal-100 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                Topic: {currentQ.topic}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Question {session.current_question_index} of {session.question_count}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question_text}
            </h2>

            {/* Voice Mode: Question Read-Aloud Controls */}
            {session.input_mode === 'voice' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-teal-600 animate-pulse' : 'text-slate-500'}`} />
                  <span className="font-semibold text-slate-700">Question Audio (TTS):</span>
                  {isSpeaking && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold animate-pulse">
                      Playing...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isSpeaking ? (
                    <button
                      type="button"
                      onClick={handleSpeakQuestion}
                      disabled={recordingState === 'recording'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read Question</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopSpeaking}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop Playback</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    disabled={recordingState === 'recording'}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Answer Input & Voice Recorder (when feedback is not shown yet) */}
            {!feedback && (
              <div className="space-y-4 pt-2">
                {/* Voice Mode: Microphone Capture Controls */}
                {session.input_mode === 'voice' && (
                  <div className="space-y-3">
                    {/* Idle State: Big Start Recording Button */}
                    {recordingState === 'idle' && (
                      <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                            <Mic className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Voice Response</h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Record your spoken response (up to 3 minutes). It will be transcribed locally for review.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start Recording</span>
                        </button>
                      </div>
                    )}

                    {/* Recording in Progress State */}
                    {recordingState === 'recording' && (
                      <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-red-900 uppercase tracking-wider">Recording Answer</span>
                              <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')} / 03:00
                              </span>
                            </div>
                            <p className="text-[11px] text-red-600 mt-0.5">Speak clearly into your microphone. Microphone tracks are stopped on exit.</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleCancelRecording}
                            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                          >
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleStopRecording}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Done Speaking (Stop)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Transcribing State */}
                    {recordingState === 'transcribing' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-blue-900 block">Transcribing audio locally on your PC...</span>
                          <span className="text-[11px] text-blue-700">Audio is processed strictly in temporary storage and deleted immediately.</span>
                        </div>
                      </div>
                    )}

                    {/* Transcribe Notice / Setup Guide Banner */}
                    {transcribeNotice && (
                      <div className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 ${
                        transcribeNotice.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : transcribeNotice.type === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-red-50 border-red-200 text-red-900'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {transcribeNotice.type === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold">{transcribeNotice.message}</p>
                              {transcribeNotice.setupGuide && (
                                <pre className="mt-2 p-2 bg-white/80 rounded border border-amber-200 text-[11px] font-mono whitespace-pre-wrap">
                                  {transcribeNotice.setupGuide}
                                </pre>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTranscribeNotice(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Review State Actions: Re-record option */}
                    {recordingState === 'review' && (
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-slate-500 font-medium">
                          Review or edit your transcribed response below before submitting:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRecordingState('idle');
                            setUserAnswer('');
                            setTranscribeNotice(null);
                          }}
                          className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-record Voice Answer</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Answer / Confirmed Transcript Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">
                      {session.input_mode === 'voice' ? 'Confirmed Answer / Transcript (Editable):' : 'Your Answer:'}
                    </label>
                    <span className="text-slate-400">
                      {userAnswer.length} characters • Treat as coaching input
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={
                      session.input_mode === 'voice'
                        ? "Your spoken response will appear here after recording. You can also edit it or type directly..."
                        : "Type your answer clearly. Structure with key concepts, trade-offs, and practical examples..."
                    }
                    disabled={submitting || recordingState === 'recording' || recordingState === 'transcribing'}
                    className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed font-sans disabled:bg-slate-50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    {session.input_mode === 'voice' && "Audio is never saved on disk. Only your submitted transcript is evaluated."}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSkipQuestion}
                      disabled={submitting || recordingState === 'recording' || recordingState === 'transcribing'}
                      className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Skip Question</span>
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !userAnswer.trim() || recordingState === 'recording' || recordingState === 'transcribing'}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Evaluating...' : 'Submit Confirmed Answer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback & Review Card (when answer is submitted) */}
            {feedback && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-in fade-in duration-200">
                {/* Score & Banner */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      feedback.score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {feedback.score}%
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Coaching Practice Score</h4>
                      <p className="text-xs text-slate-500">
                        Evaluated via {feedback.feedback_mode}. (Scores reflect practice feedback, not hiring decisions).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
                  >
                    <span>
                      {session.current_question_index >= session.question_count
                        ? 'Finish & View Summary'
                        : 'Next Question'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Candidate's submitted answer */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Your Response:
                  </h4>
                  <p className="text-slate-800 text-xs sm:text-sm whitespace-pre-wrap">{userAnswer}</p>
                </div>

                {/* Evaluation Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
                      <ThumbsUp className="w-4 h-4" />
                      <span>What You Did Well</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {feedback.strengths?.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Points */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Points to Strengthen</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-950">
                      {feedback.missing_points?.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Self-Review Checklist in Basic Practice Mode */}
                {feedback.checklist_results && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-teal-600" />
                      <span>Self-Review Rubric Checklist</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {feedback.checklist_results.map((c, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            c.covered
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{c.item}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            c.covered ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {c.covered ? 'Covered' : 'Missed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Advice */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Actionable Coaching Advice</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-blue-950">
                    {feedback.actionable_tips?.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold shrink-0">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improved Reference Answer */}
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Model Placement Answer</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {feedback.improved_answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End Interview Session Early?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to end this session? Any questions you've already answered will be saved in your dashboard and history.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setShowEndModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Resume Practice
            </button>
            <button
              onClick={handleEndSessionEarly}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              End Session & Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
