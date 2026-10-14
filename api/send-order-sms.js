// Vercel Serverless Function: /api/send-order-sms
// Handles secure SMS dispatch to owner mobile number (8056639518)
const twilio = require('twilio');

// In-memory rate limiting map (IP-based, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 6;

function isRateLimited(ip) {
    if (!ip) return false;
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

    if (now > clientData.resetAt) {
        clientData.count = 1;
        clientData.resetAt = now + RATE_LIMIT_WINDOW_MS;
        rateLimitMap.set(ip, clientData);
        return false;
    }

    clientData.count += 1;
    rateLimitMap.set(ip, clientData);
    return clientData.count > MAX_REQUESTS_PER_WINDOW;
}

// Basic input sanitization to prevent injection & SMS payload abuse
function sanitizeText(str, maxLength = 250) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .replace(/[\r\n]+/g, ' ')  // Normalize newlines
        .trim()
        .slice(0, maxLength);
}

module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            error: `Method ${req.method} not allowed. Please use POST.`
        });
    }

    // Rate limiting check
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please wait a moment before trying again.'
        });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const notificationType = body.type || 'booking'; // 'booking' or 'contact'

        // Retrieve Twilio credentials from Vercel Environment Variables
        const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
        const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
        const fromNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();
        
        // Owner phone defaults to 8056639518 (formatted as +918056639518 for Indian carriers)
        let ownerNumber = (process.env.OWNER_PHONE_NUMBER || '8056639518').trim();
        if (!ownerNumber.startsWith('+')) {
            const cleanDigits = ownerNumber.replace(/\D/g, '');
            if (cleanDigits.length === 10) {
                ownerNumber = '+91' + cleanDigits;
            } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
                ownerNumber = '+91' + cleanDigits.slice(1);
            } else {
                ownerNumber = '+' + cleanDigits;
            }
        }

        let smsMessage = '';
        const orderRef = body.id ? `#${body.id}` : 'NEW';
        const bookingDate = sanitizeText(body.booking_date, 30);

        if (notificationType === 'contact') {
            const name = sanitizeText(body.name, 60);
            const phone = sanitizeText(body.phone, 20);
            const email = sanitizeText(body.email, 80);
            const subject = sanitizeText(body.subject, 100);
            const message = sanitizeText(body.message, 300);

            if (!name || (!phone && !email) || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required contact fields (name, message, and phone/email are required).'
                });
            }

            smsMessage = 
`R-TECH PURE WATER - NEW INQUIRY

From: ${name}
Phone: ${phone || 'Not provided'}
Email: ${email || 'Not provided'}
Subject: ${subject || 'General Inquiry'}
Message: ${message}

Action: Check your admin messages or reply directly.`;

        } else {
            // Default: Booking notification
            const { id } = body;
            const name = sanitizeText(body.name, 60);
            const phone = sanitizeText(body.phone, 20);
            const service = sanitizeText(body.service, 80);
            const address = sanitizeText(body.address, 150);
            const notes = sanitizeText(body.message, 200);

            if (!name || !phone || !service || !bookingDate) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required booking details (name, phone, service, and booking_date are required).'
                });
            }

            smsMessage = 
`R-TECH PURE WATER - NEW BOOKING ${orderRef}

Customer: ${name}
Phone: ${phone}
Service: ${service}
Date: ${bookingDate}
Address: ${address || 'On file'}
${notes ? `Note: ${notes}` : ''}

Please check the admin dashboard for full details.`;
        }

        // Extract clean 10-digit customer and owner numbers
        const ownerDigits = ownerNumber.replace(/\D/g, '').slice(-10);
        const customerClean = (body.phone || '').replace(/\D/g, '');
        const customerDigits = customerClean.length >= 10 ? customerClean.slice(-10) : '';

        const customerSmsMessage = notificationType === 'booking'
            ? `Dear ${body.name || 'Customer'}, your RO service booking (${orderRef}) with R-Tech Pure Water is confirmed for ${bookingDate}. Contact/WhatsApp: 8056639518.`
            : `Dear ${body.name || 'Customer'}, we have received your message. Our team will contact you shortly. R-Tech Pure Water (+91 80566 39518).`;

        // 1. Check Indian SMS Gateway (Fast2SMS - instant free SMS to Indian numbers without DLT approval)
        const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
        if (fast2smsKey) {
            try {
                // Send alert to owner
                const ownerParams = new URLSearchParams({
                    route: 'q',
                    message: smsMessage,
                    numbers: ownerDigits
                });

                const ownerRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?${ownerParams.toString()}`, {
                    method: 'GET',
                    headers: { 'Authorization': fast2smsKey, 'Accept': 'application/json' }
                });
                const ownerData = await ownerRes.json();
                console.log(`[Fast2SMS] Owner alert dispatched to ${ownerDigits}:`, ownerData);

                // Send confirmation to customer if different from owner
                let customerData = null;
                if (customerDigits && customerDigits !== ownerDigits) {
                    const custParams = new URLSearchParams({
                        route: 'q',
                        message: customerSmsMessage,
                        numbers: customerDigits
                    });
                    const custRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?${custParams.toString()}`, {
                        method: 'GET',
                        headers: { 'Authorization': fast2smsKey, 'Accept': 'application/json' }
                    });
                    customerData = await custRes.json();
                    console.log(`[Fast2SMS] Customer confirmation dispatched to ${customerDigits}:`, customerData);
                }

                return res.status(200).json({
                    success: true,
                    provider: 'fast2sms',
                    ownerRecipient: ownerDigits,
                    customerRecipient: customerDigits,
                    ownerResult: ownerData,
                    customerResult: customerData
                });
            } catch (f2sErr) {
                console.error('[Fast2SMS] Dispatch error:', f2sErr);
            }
        }

        // 2. Check Twilio SMS Gateway
        if (accountSid && authToken && fromNumber) {
            const client = twilio(accountSid, authToken);
            
            // Dispatch to owner
            const ownerResult = await client.messages.create({
                body: smsMessage,
                from: fromNumber,
                to: ownerNumber
            });
            console.log(`[Twilio SMS] SMS sent to owner (${ownerNumber}). SID: ${ownerResult.sid}`);

            // Dispatch confirmation to customer
            let customerSid = null;
            if (customerDigits) {
                try {
                    const customerTarget = customerClean.startsWith('91') ? `+${customerClean}` : `+91${customerDigits}`;
                    const custResult = await client.messages.create({
                        body: customerSmsMessage,
                        from: fromNumber,
                        to: customerTarget
                    });
                    customerSid = custResult.sid;
                    console.log(`[Twilio SMS] SMS sent to customer (${customerTarget}). SID: ${custResult.sid}`);
                } catch (custTwilioErr) {
                    console.warn(`[Twilio SMS] Could not dispatch to customer:`, custTwilioErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                provider: 'twilio',
                ownerSid: ownerResult.sid,
                customerSid
            });
        }

        // 3. Neither Twilio nor Fast2SMS configured yet
        console.warn(`[SMS Notification Notice] Order notification generated for: ${ownerNumber}`);
        console.warn(`[SMS Notification Notice] No carrier SMS credentials found in .env or environment.`);
        console.warn(`[SMS Notification Notice] To deliver real carrier SMS to ${ownerNumber}, add FAST2SMS_API_KEY or TWILIO credentials to .env.`);

        return res.status(200).json({
            success: false,
            simulated: true,
            recipient: ownerNumber,
            warning: 'Carrier SMS credentials (FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID) are not set. Customer can send details via WhatsApp.'
        });

    } catch (err) {
        console.error('[Twilio SMS] Failed to dispatch SMS:', err);
        return res.status(200).json({
            success: false,
            error: 'SMS dispatch encountered an issue. Customer action recorded safely.'
        });
    }
};
