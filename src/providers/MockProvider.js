// src/providers/MockProvider.js

class MockProvider {
    constructor(name) {
        this.name = name;
    }

    async send(email) {
        // Simulate success/failure randomly
        if (Math.random() > 0.7) {
            throw new Error(`Provider ${this.name} failed to send email`);
        }
        console.log(`Provider ${this.name} sent email to ${email.to}`);
    }
}

module.exports = MockProvider;
