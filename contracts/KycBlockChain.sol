pragma solidity >=0.4.21 <0.7.0;

contract KycBlockChain{

    enum Entity { Customer, Organisation } 

    struct Customer{
        string c_name;
        string data_hash;
        address bank_address;
        mapping(address => bool) access;
        bool exists;
        Entity entity;
    }

    struct Organisation{
        string b_name;
        bool exists;
        Entity entity;
    }

    mapping(address => Customer) allCustomers;
    mapping(address => Organisation) allOrganisations;

    function isOrg() internal view returns(bool){
        if(allOrganisations[msg.sender].exists){
            return true;
        }
        return false;
    }

    function isCus() internal view returns(bool){
        if(allCustomers[msg.sender].exists){
            return true;
        }
        return false;
    }
    
    
    
    function newCustomer(string memory _name, string memory _hash, address _bank) public payable returns(bool){
        require(!isCus(),"Customer Already Exists!");
        require(allOrganisations[_bank].exists,"No such Bank!");
        allCustomers[msg.sender].c_name = _name;
        allCustomers[msg.sender].data_hash = _hash;
        allCustomers[msg.sender].bank_address = _bank;
        allCustomers[msg.sender].access[msg.sender] = true;
        allCustomers[msg.sender].exists = true;
        allCustomers[msg.sender].entity = Entity.Customer;
        return true;

    }

    function newOrganisation(string memory _name) public payable returns(bool){
        require(!isOrg(),"Organisation already exists with the same address!");
        allOrganisations[msg.sender].b_name = _name;
        allOrganisations[msg.sender].exists = true;
        allOrganisations[msg.sender].entity = Entity.Organisation;
        return true;
    }

    function viewCustomerData(address _address) public view returns(string memory){
        require(isOrg(),"Access Denied");
        if(allCustomers[_address].exists){
            return allCustomers[_address].data_hash;
        }
        return "No such Customer in the database";
    }
    
}