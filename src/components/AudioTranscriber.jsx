import React, { useState, useRef } from 'react';
import axios from 'axios';

function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return alert('Please upload or record audio first');
    setLoading(true);
    setResult('');

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await axios.post('http://localhost:4000/api/talk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(res.data.prompt || 'No transcription found.');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setResult('❌ Error: ' + (err.response?.data?.error || 'Transcription failed'));
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Or use audio/mp4 if supported
      });

      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const file = new File([blob], 'recorded_audio.webm', { type: 'audio/webm' });
        setFile(file);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or not supported.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>🎤 Audio Transcriber</h2>

      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <br /><br />

      {!recording ? (
        <button onClick={startRecording}>🎙️ Start Recording</button>
      ) : (
        <button onClick={stopRecording}>🛑 Stop Recording</button>
      )}

      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Transcribing...' : 'Upload & Transcribe'}
      </button>

      <br /><br />

      {result && (
        <div>
          <strong>📝 Transcription:</strong>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default AudioTranscriber;