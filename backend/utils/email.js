const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'yashmanojdeshmukh06@gmail.com', // Admin email as sender
        pass: process.env.EMAIL_PASS || 'your_app_password' // Needs App Password
    }
});

const sendEmergencyEmail = async (userEmail, location, txId) => {
    const adminEmail = 'yashmanojdeshmukh06@gmail.com';

    // Google Maps Link
    const mapLink = `https://www.google.com/maps?q=${location}`;
    const explorerLink = `https://testnet.algoexplorer.io/tx/${txId}`;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'SafeTourX Emergency System',
        to: [adminEmail, userEmail], // Send to Admin AND User
        subject: `🚨 SOS EMERGENCY ALERT - Location Tracked`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid red; border-radius: 10px;">
                <h1 style="color: red;">🚨 SOS ALERT TRIGGERED 🚨</h1>
                <p><strong>User:</strong> ${userEmail}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                
                <div style="margin: 20px 0;">
                    <a href="${mapLink}" style="background-color: red; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">📍 VIEW LOCATION ON MAP</a>
                </div>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 5px solid blue;">
                    <h3>🔗 Blockchain Verification</h3>
                    <p>This incident has been immutably logged on the Algorand Blockchain.</p>
                    <p><strong>Transaction ID:</strong> ${txId}</p>
                    <a href="${explorerLink}" style="color: blue;">View on AlgoExplorer</a>
                </div>
                
                <p style="margin-top: 20px; color: gray; font-size: 12px;">
                    This is an automated message from the SafeTourX Decentralized Trust Ecosystem.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Details sent to Admin & User");
        return true;
    } catch (error) {
        console.error("Email sending failed:", error);
        return false;
    }
};

module.exports = { sendEmergencyEmail };
