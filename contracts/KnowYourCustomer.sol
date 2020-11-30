pragma solidity >=0.4.21 <0.7.0;

contract KnowYourCustomer{
    
    enum Status {Accepted, Rejected}
    
    struct KYC_Member{
        string mem_name;
        string mem_dob;
        string mem_aadhar;
        string mem_pan;
        string mem_address;
        Status kyc_status;
        mapping(address => bool) hasAccess;
    }
    
    mapping(address => KYC_Member) private KYC_Members;
    
    function CreateKYCMember(string memory _name, string memory _dob, string memory _aadhar, string memory _pan, string memory _address) public {
        KYC_Members[msg.sender].mem_name = _name;
        KYC_Members[msg.sender].mem_dob = _dob;
        KYC_Members[msg.sender].mem_aadhar = _aadhar;
        KYC_Members[msg.sender].mem_pan = _pan;
        KYC_Members[msg.sender].mem_address = _address;
        KYC_Members[msg.sender].kyc_status = Status.Rejected;
        KYC_Members[msg.sender].hasAccess[msg.sender] = true;
    }
    
    function GiveAccessTo(address _AccessToAddress) public {
        KYC_Members[msg.sender].hasAccess[_AccessToAddress] = true;
    }
    
    function GetKycData(address _memadd) public returns(string memory, string memory, string memory, string memory, string memory){
        require(KYC_Members[_memadd].hasAccess[msg.sender],"You dont have access");
        return(KYC_Members[_memadd].mem_name,KYC_Members[_memadd].mem_dob,KYC_Members[_memadd].mem_aadhar,KYC_Members[_memadd].mem_pan,KYC_Members[_memadd].mem_address);

    }

    function Get() public view returns(string memory, string memory, string memory, string memory, string memory){
            return(KYC_Members[msg.sender].mem_name,KYC_Members[msg.sender].mem_dob,KYC_Members[msg.sender].mem_aadhar,KYC_Members[msg.sender].mem_pan,KYC_Members[msg.sender].mem_address);
    }


}
