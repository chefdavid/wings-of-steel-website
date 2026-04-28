// Test the Edge Function directly
const testEdgeFunction = async () => {
  const response = await fetch(
    'https://zfiqvovfhkqiucmuwykw.supabase.co/functions/v1/send-feedback-email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaXF2b3ZmaGtxaXVjbXV3eWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzg3MjEsImV4cCI6MjA2NTY1NDcyMX0.z8llCv7zZX7-D2DtySDZTI9KTsGC1O2XziRRAbrHJ1Q'
      },
      body: JSON.stringify({
        record: {
          id: 'test-123',
          text: 'Test feedback from direct function call',
          url: 'http://localhost:5173',
          selector: '.test-element',
          position_x: 100,
          position_y: 200,
          viewport_width: 1920,
          viewport_height: 1080,
          created_at: new Date().toISOString()
        }
      })
    }
  );

  const result = await response.json();
  console.log('Edge Function Response:', result);
  console.log('Status:', response.status);
};

testEdgeFunction().catch(console.error);