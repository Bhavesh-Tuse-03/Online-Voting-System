const express = require('express');
const Web3 = require('web3');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure that web3 is connected to the correct provider
const web3 = new Web3('http://127.0.0.1:7545');

// Load the contract ABI
const contractABI = require('./build/contracts/Voting.json').abi;
// Specify the deployed contract address
const contractAddress = '0x81a6B425B9661F91dcf511385451504a5F382405';
// Create a contract instance
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

// Set a default sender address
const defaultAccount = '0x0a867D615e2a50FCAB8a43821Ee104E6FDaFd9A5';

// Set default "from" address for transactions
web3.eth.defaultAccount = defaultAccount;
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'online_voting_system',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});
// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('Front End'));
app.use(cors());

let numberOfVotes = 25;

// Route to authenticate an admin
app.post('/authenticateAdmin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Execute the contract method to authenticate the admin
        const authenticated = await contractInstance.methods.authenticateAdmin(username, password).call();

        res.status(200).json({ authenticated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to authenticate admin' });
    }
});

// Route to start the voting process
app.post('/startVoting', async (req, res) => {
    try {
        // Execute the contract method to start the voting process
        await contractInstance.methods.startVoting().send({ from: defaultAccount });

        res.status(200).json({ message: 'Voting started successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start voting' });
    }
});

// Route to end the voting process
app.post('/endVoting', async (req, res) => {
    try {
        // Execute the contract method to end the voting process
        await contractInstance.methods.endVoting().send({ from: defaultAccount });

        res.status(200).json({ message: 'Voting ended successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to end voting' });
    }
});

// Route to vote for a candidate
app.post('/voteForCandidate', async (req, res) => {
    const { candidate } = req.body;
    try {
        // Execute the contract method to vote for a candidate
        await contractInstance.methods.voteForCandidate(candidate).send({ from: defaultAccount, gas: 500000 });
        numberOfVotes += 1;

        res.status(200).json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});


// Route to get total votes for a candidate
app.get('/totalVotesFor', async (req, res) => {
    const { candidate } = req.query;

    try {
        // Execute the contract method to get total votes for the candidate
        const totalVotes = await contractInstance.methods.totalVotesFor(candidate).call();  

        res.status(200).json({ totalVotes,numberOfVotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get total votes for the candidate' });
    }
});
app.post('/register', async (req, res) => {
    const { username, email, mobileNumber, voterid, password } = req.body;

    const query = 'INSERT INTO users (username, email, mobileNumber, voterId, password) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [username, email, mobileNumber, voterid, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to register user');
        }
        res.status(200).send('User registered successfully');
    });
});
app.post('/authenticate', async (req, res) => {
    const { voterid, password } = req.body;

    try {
        // Check if the user exists in the database
        const query = 'SELECT * FROM users WHERE voterId = ? AND password = ?';
        db.query(query, [voterid, password], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to authenticate user' });
            }

            if (result.length === 1) {
                // Redirect the user upon successful authentication
                res.status(200).json({ authenticated: true });
            } else {
                // User not found or password incorrect
                res.status(401).json({ authenticated: false });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});