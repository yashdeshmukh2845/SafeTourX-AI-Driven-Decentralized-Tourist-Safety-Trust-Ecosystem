const supabase = require('./utils/supabase');

async function testConnection() {
    console.log("🔍 Testing Supabase Connection...");

    try {
        // 1. Check Users
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (userError) throw userError;
        console.log(`✅ Connection Successful! Found ${users === null ? '0 (or access denied to count)' : 'users'} in 'users' table.`);

        // 2. Try to select top 5 users to see if data exists
        const { data: userList, error: listError } = await supabase
            .from('users')
            .select('username, email')
            .limit(5);

        if (listError) throw listError;

        if (userList.length > 0) {
            console.log("📄 Found Data in 'users' table:");
            console.table(userList);
        } else {
            console.log("⚠️ 'users' table is empty. (This is expected if you haven't registered anyone yet)");
        }

        // 3. Check Incidents
        const { count: incidentCount, error: incidentError } = await supabase
            .from('incidents')
            .select('count', { count: 'exact', head: true });

        if (!incidentError) {
            console.log(`✅ 'incidents' table is accessible.`);
        }

    } catch (err) {
        console.error("❌ Connection Failed or Error:", err.message);
        console.log("Hint: Did you run the 'supabase_setup.sql' script in the Supabase SQL Editor?");
        try {
            const fs = require('fs');
            fs.appendFileSync('db_output.txt', `❌ Connection Failed or Error: ${err.message}\n`);
        } catch (e) { }
    }
}


testConnection();
