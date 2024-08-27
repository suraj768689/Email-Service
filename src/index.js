const express = require('express');
const EmailService = require('./EmailService'); // Adjust the path if necessary

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Initialize email providers
const primaryProvider = new MockProvider('Primary');  // Replace with actual provider
const secondaryProvider = new MockProvider('Secondary');  // Replace with actual provider
const emailService = new EmailService(primaryProvider, secondaryProvider);

// API endpoint to send email
app.post('/send-email', async (req, res) => {
    const email = req.body;
    try {
        const result = await emailService.sendEmail(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
