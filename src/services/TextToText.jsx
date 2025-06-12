export const getChatResponse = async (content, isComplex = false) => {
  const res = await fetch('http://localhost:4000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: content, isComplex }),
  });

  if (!res.ok) {
    const { error, details } = await res.json();
    throw new Error(error || details || 'Failed to get chat response');
  }

  const { text } = await res.json();
  return text;
};