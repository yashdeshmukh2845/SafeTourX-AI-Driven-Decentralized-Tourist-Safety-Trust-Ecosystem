const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase'); // Supabase Client
const { registerUserOnChain } = require('../utils/algorand');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed, or use crypto if not. The old code used crypto for hash, let's stick to crypto for consistency with old code unless I see bcrypt usage. Old code used crypto.createHash.

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`);

        if (checkError) throw checkError;
        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password (using crypto as per previous implementation style, or bcrypt if preferred)
        // Previous file used: const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // Generate Identity Hash
        const identityHash = crypto.createHash('sha256').update(username + email + Date.now()).digest('hex');

        // Blockchain Interaction
        let txId = "";
        try {
            txId = await registerUserOnChain(null, identityHash);
        } catch (err) {
            console.error("Blockchain Error:", err.message);
        }

        // Insert into Supabase
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password: passwordHash,
                identity_hash: identityHash,
                algorand_tx_id: txId
            }])
            .select() // Return the inserted row
            .single();

        if (insertError) throw insertError;

        // Create JWT Payload
        const payload = {
            id: newUser.id,
            email: newUser.email
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_token_123',
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    success: true,
                    msg: 'User registered',
                    token,
                    txId,
                    explorerUrl: txId ? `https://testnet.algoexplorer.io/tx/${txId}` : null,
                    user: newUser
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        console.error(err.message);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // Check User
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check Password
        if (user.password !== passwordHash) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate Token
        // Payload must match middleware expectations (if any)
        const payload = {
            id: user.id,
            email: user.email
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_token_123',
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    msg: 'Logged in',
                    user,
                    token
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        console.error(err.message);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
});

module.exports = router;
