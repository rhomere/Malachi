// This part will handle the values for the multi state object to help with the property characteristic lists
function GetStateHelper(stateCode, policyForm, occupiedBy) {
    // this function will return the correct helper object based off the state code 
    switch (stateCode) {
        case 'NJ':
            return NewJerseyProfile(policyForm, occupiedBy);
        case 'NY':
            return NewYorkProfile(policyForm, occupiedBy);
        case 'FL':
            return FloridaProfile(policyForm, occupiedBy);
        case 'AL':
            return AlabamaProfile(policyForm, occupiedBy);
        case 'MS':
            return MississippiProfile(policyForm, occupiedBy);
        case 'TX':
            return TexasProfile(policyForm, occupiedBy);
        case 'SC':
            return SouthCarolinaProfile(policyForm, occupiedBy);
        case 'NC':
            return NorthCarolinaProfile(policyForm, occupiedBy);
        case 'GA':
            return GeorgiaProfile(policyForm, occupiedBy);
        case 'LA':
            return LouisianaProfile(policyForm, occupiedBy);
        case 'VA':
            return VirginiaProfile(policyForm, occupiedBy);
        default:
            return null;
    }

}