import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHookOptions {
  language?: 'bn-BD' | 'en-US';
  onResult?: (transcript: string) => void;
  onWakeWordDetected?: () => void;
}

export function useSpeechRecognition({
  language = 'bn-BD',
  onResult,
  onWakeWordDetected,
}: SpeechRecognitionHookOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState<'bn-BD' | 'en-US'>(language);

  const recognitionRef = useRef<any>(null);
  const isStoppingIntentionallyRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recognitionLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr) {
          const full = finalStr.trim();
          setTranscript(full);
          setInterimTranscript('');

          // Wake word check
          const lower = full.toLowerCase();
          if (
            lower.includes('hey mou') ||
            lower.includes('মৌ') ||
            lower.includes('হে মৌ') ||
            lower.includes('বাবু')
          ) {
            onWakeWordDetected?.();
          }

          onResult?.(full);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (!isStoppingIntentionallyRef.current && isListening) {
          // Restart if continuous listening requested
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [recognitionLang, onResult, onWakeWordDetected]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    isStoppingIntentionallyRef.current = false;
    setTranscript('');
    setInterimTranscript('');
    try {
      recognitionRef.current.lang = recognitionLang;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
    }
  }, [recognitionLang]);

  const stopListening = useCallback(() => {
    isStoppingIntentionallyRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    recognitionLang,
    setRecognitionLang,
    startListening,
    stopListening,
  };
}
