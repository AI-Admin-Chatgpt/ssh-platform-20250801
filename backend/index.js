const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const port = process.env.PORT || 8080;
const project = 'gemc-llm-app-20250801';
const location = 'us-east4';
const model = 'gemini-2.5-flash';

// Initialize Secret Manager client
const secretManagerClient = new SecretManagerServiceClient();

async function getApiKey() {
  const name = 'projects/gemc-llm-app-20250801/secrets/gemini-api-key/versions/latest';
  const [version] = await secretManagerClient.accessSecretVersion({ name });
  return version.payload.data.toString();
}

let apiKey;

// The main API endpoint
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Error: Missing prompt in request body.');
  }

  try {
    // Initialize Vertex AI with the fetched API key
    const vertexAI = new VertexAI({ project, location, apiKey });

    // Instantiate the model
    const generativeModel = vertexAI.getGenerativeModel({ model });

    const stream = await generativeModel.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream.stream) {
      if (chunk.candidates && chunk.candidates.length > 0) {
        const text = chunk.candidates[0].content.parts[0].text;
        res.write(text); // Stream the text back to the client
      }
    }
    res.end(); // End the stream
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating content.');
  }
});

// Start the server after fetching the API key
getApiKey().then(key => {
  apiKey = key;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}).catch(console.error);