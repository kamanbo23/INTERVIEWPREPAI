import { useEffect, useRef, useCallback } from 'react';
import { Button, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFeedback,
  toggleRecording,
  setAIFeedback,
  setAnalyzing
} from '../store/slice';
import axios from 'axios';

const VoiceInput = () => {
  const dispatch = useDispatch();
  const isRecording = useSelector(state => state.app.isRecording);
  const problem = useSelector(state => state.app.problem);
  const startTimeRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const recognitionRef = useRef(null);

  const analyzeSpeech = useCallback(async (transcript) => {
    try {
      dispatch(setAnalyzing());
      const response = await axios.post(
        'http://localhost:5001/api/ai-feedback',
        {
          transcript: transcript.slice(0, 2000),
          problemTitle: problem?.title || 'coding problem'
        }
      );
      dispatch(setAIFeedback(response.data.feedback));
    } catch (error) {
      console.error('Analysis error:', error);
      dispatch(setAIFeedback("Failed to get AI analysis"));
    }
  }, [dispatch, problem]);

  useEffect(() => {
    if (isRecording) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        dispatch(setFeedback("Speech recognition not supported"));
        return;
      }

      finalTranscriptRef.current = '';
      startTimeRef.current = Date.now();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        const combinedTranscript = finalTranscriptRef.current + interimTranscript;
        const fillerWords = (combinedTranscript.match(/\b(um|uh|like)\b/gi) || []).length;
        const wordCount = combinedTranscript.split(/\s+/).filter(word => word.length > 0).length;
        const timeElapsed = (Date.now() - startTimeRef.current) / 60000;
        const pace = Math.round(wordCount / timeElapsed) || 0;
        
        dispatch(setFeedback(`Live Analysis:\nFiller Words: ${fillerWords}\nPace: ${pace} wpm`));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      return () => {
        recognition.stop();
      };
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (finalTranscriptRef.current.trim()) {
        analyzeSpeech(finalTranscriptRef.current.trim());
      }
    }
  }, [isRecording, dispatch, analyzeSpeech]);

  return (
    <Box sx={{ mb: 4 }}>
      <Button
        variant="contained"
        color={isRecording ? "error" : "primary"}
        startIcon={<MicIcon />}
        onClick={() => dispatch(toggleRecording())}
        disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
      >
        {isRecording ? "Stop Recording" : "Start Voice Input"}
      </Button>
    </Box>
  );
};

export default VoiceInput;