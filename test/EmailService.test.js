const EmailService = require('../src/EmailService');

class MockProvider {
    constructor(name) {
        this.name = name;
    }

    async send(email) {
        if (this.name === 'Primary') {
            throw new Error('Primary provider failed');
        }
        return true;
    }
}

describe('EmailService', () => {
    let primaryProvider;
    let secondaryProvider;
    let emailService;

    beforeEach(() => {
        primaryProvider = new MockProvider('Primary');
        secondaryProvider = new MockProvider('Secondary');
        emailService = new EmailService(primaryProvider, secondaryProvider, {
            retryCount: 3,
            backoffFactor: 10, // Reduced backoff for testing
        });
    });

    it('should send an email using the primary provider', async () => {
        primaryProvider.send = jest.fn().mockResolvedValue(true);

        const email = { id: 1, to: 'test@example.com', subject: 'Test', body: 'Hello World' };
        const result = await emailService.sendEmail(email);

        expect(result.status).toBe('sent');
        expect(primaryProvider.send).toHaveBeenCalled();
    }, 10000);

    it('should switch to secondary provider on failure', async () => {
        primaryProvider.send = jest.fn().mockRejectedValue(new Error('Primary provider failed'));
        secondaryProvider.send = jest.fn().mockResolvedValue(true);

        const email = { id: 2, to: 'test2@example.com', subject: 'Test', body: 'Hello World' };
        const result = await emailService.sendEmail(email);

        expect(result.status).toBe('sent');
        expect(secondaryProvider.send).toHaveBeenCalledTimes(1);
        expect(primaryProvider.send).toHaveBeenCalledTimes(3);  // Assuming 3 retries before switching
    }, 10000);  // Increased timeout for this test

    it('should not resend the same email', async () => {
        primaryProvider.send = jest.fn().mockResolvedValue(true);

        const email = { id: 3, to: 'test3@example.com', subject: 'Test', body: 'Hello World' };
        await emailService.sendEmail(email);

        const result = await emailService.sendEmail(email);

        expect(result.status).toBe('duplicate');
        expect(primaryProvider.send).toHaveBeenCalledTimes(1);
    });
});

