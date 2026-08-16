const nodemailer = require("nodemailer");

const createTransporter = () => {
    const service = process.env.EMAIL_SERVICE;
    const host = process.env.EMAIL_HOST;

    if (service || (host && host.includes("gmail"))) {
        return nodemailer.createTransport({
            service: service || "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    return nodemailer.createTransport({
        host: host || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_SECURE === "true" || process.env.EMAIL_PORT === "465",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false
        }
    });
};

const transporter = createTransporter();

const sendVerificationEmail = async (email, token, name) => {
    const clientBaseUrl = process.env.FRONTEND_URL || process.env.client_url || "http://localhost:5173";
    const verificationUrl = `${clientBaseUrl.replace(/\/+$/, "")}/verify-email?token=${token}`;
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@dustedbooks.com";
    const fromName = process.env.EMAIL_FROM_NAME || "Dusted Books";
    const displayName = name ? name.trim() : "Book Lover";

    const mailOptions = {
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        subject: "Verify Your Email Address - Dusted Books",
        html: `
            <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #F5CDCD; box-shadow: 0 8px 30px rgba(45, 26, 30, 0.08);">
                <!-- Header Banner -->
                <div style="background: linear-gradient(135deg, #A83A3A 0%, #8B2D2D 50%, #6E2222 100%); padding: 36px 24px; text-align: center;">
                    <h1 style="font-family: 'Lora', Georgia, 'Times New Roman', serif; color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Dusted Books</h1>
                    <p style="color: #FCE8E8; margin: 8px 0 0 0; font-size: 14px; font-weight: 400; letter-spacing: 0.2px;">Your Gateway to Rare &amp; Beloved Reads</p>
                </div>
                
                <!-- Email Body Content -->
                <div style="padding: 36px 32px; color: #2D1A1E; line-height: 1.65;">
                    <h2 style="font-family: 'Lora', Georgia, 'Times New Roman', serif; color: #2D0A0A; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 14px;">
                        Welcome, ${displayName}! 📚
                    </h2>
                    <p style="color: #453C3E; font-size: 15px; margin: 0 0 18px 0;">
                        Thank you for joining <strong>Dusted Books</strong>! Please verify your email address to activate your account.
                    </p>

                    <!-- Feature Highlights Card -->
                    <div style="background-color: #FEF5F5; border: 1px solid #F5CDCD; border-radius: 14px; padding: 16px 18px; margin-bottom: 24px;">
                        <p style="color: #6E2222; font-size: 13px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 0.2px;">
                            WHAT YOU CAN DO ONCE SIGNED IN:
                        </p>
                        <ul style="margin: 0; padding-left: 18px; color: #453C3E; font-size: 13.5px; line-height: 1.6;">
                            <li style="margin-bottom: 6px;">
                                <strong>Request Books You Love:</strong> Can't find the title you're looking for? Submit a request and our community will help you find it!
                            </li>
                            <li style="margin-bottom: 6px;">
                                <strong>Discover &amp; Buy:</strong> Explore rare gems, timeless classics, and pre-loved favorites at unbeatable prices.
                            </li>
                            <li>
                                <strong>Sell &amp; Rehome:</strong> List your own books easily and pass stories on to fellow readers.
                            </li>
                        </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${verificationUrl}"
                           style="background: linear-gradient(135deg, #A83A3A 0%, #8B2D2D 100%); color: #ffffff; padding: 15px 36px;
                                  text-decoration: none; border-radius: 9999px; display: inline-block;
                                  font-weight: 600; font-size: 15px; letter-spacing: 0.3px;
                                  box-shadow: 0 4px 16px rgba(168, 58, 58, 0.35);">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <!-- Fallback Link -->
                    <p style="color: #7D7072; font-size: 13px; margin-bottom: 8px;">
                        Button not working? Copy and paste this link into your browser:
                    </p>
                    <div style="background-color: #FEF5F5; border: 1px solid #F5CDCD; border-radius: 10px; padding: 12px 14px; word-break: break-all; font-size: 12px; color: #8B2D2D;">
                        <a href="${verificationUrl}" style="color: #8B2D2D; text-decoration: underline; font-weight: 500;">${verificationUrl}</a>
                    </div>
                    
                    <!-- Expiry & Help Info -->
                    <div style="border-top: 1px solid #F2EEEF; margin-top: 36px; padding-top: 20px;">
                        <p style="color: #A89A9C; font-size: 12px; margin: 0; line-height: 1.5;">
                            ⏰ This verification link will expire in <strong>24 hours</strong>.<br/>
                            If you did not sign up for a Dusted Books account, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email successfully sent to ${email} (MessageID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
};

module.exports = { sendVerificationEmail };
