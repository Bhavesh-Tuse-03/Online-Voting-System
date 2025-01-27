pragma solidity ^0.5.0;

contract Voting {
    mapping(bytes32 => uint256) public votesReceived;
    string[] public candidateList = ["Yash Thorve","Rohan Shinde","Vishwajeet Tulse","Bhavesh Tuse"];
    bool public votingStarted = false;
    string public adminUsername = "Admin";
    string public adminPassword = "Admin@123";

    event Voted(string candidate);
    event VotingStarted();
    event VotingEnded();

    // Function to start the voting process
    function startVoting() public {
        require(!votingStarted, "Voting is already started");
        votingStarted = true;
        emit VotingStarted();
    }

    // Function to end the voting process
    function endVoting() public {
        require(votingStarted, "Voting is not started yet");
        votingStarted = false;
        emit VotingEnded();
    }

    // Function to get total votes for a candidate
    function totalVotesFor(
        string memory candidate
    ) public view returns (uint256) {
        bytes32 candidateBytes = keccak256(abi.encodePacked(candidate));
        require(!votingStarted, "Voting is in process");
        require(isValidCandidate(candidate), "Candidate is not valid");
        return votesReceived[candidateBytes];
    }

    // Function to vote for a candidate
    function voteForCandidate(string memory candidate) public {
        bytes32 candidateBytes = keccak256(abi.encodePacked(candidate));
        require(votingStarted, "Voting is not started yet");
        require(isValidCandidate(candidate), "Candidate is not valid");
        votesReceived[candidateBytes]++;
    }

    // Function to check if the candidate is valid
    function isValidCandidate(
        string memory candidate
    ) public view returns (bool) {
        for (uint256 i = 0; i < candidateList.length; i++) {
            if (
                keccak256(abi.encodePacked(candidateList[i])) ==
                keccak256(abi.encodePacked(candidate))
            ) {
                return true;
            }
        }
        return false;
    }

    // Function to check if the input username and password match the stored values
    function authenticateAdmin(
        string memory _username,
        string memory _password
    ) public view returns (bool) {
        return (stringsEqual(_username, adminUsername) &&
            stringsEqual(_password, adminPassword));
    }


    // Helper function to compare strings
    function stringsEqual(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        bytes memory ba = bytes(a);
        bytes memory bb = bytes(b);
        if (ba.length != bb.length) {
            return false;
        }
        for (uint256 i = 0; i < ba.length; i++) {
            if (ba[i] != bb[i]) {
                return false;
            }
        }
        return true;
    }
}
