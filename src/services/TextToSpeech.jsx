export const speakText = async (text) => {
  const res = await fetch('https://chatbot-backend-wp2r.onrender.com/api/speak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const { error, details } = await res.json();
    throw new Error(error || details || 'Failed to convert text to speech');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
};