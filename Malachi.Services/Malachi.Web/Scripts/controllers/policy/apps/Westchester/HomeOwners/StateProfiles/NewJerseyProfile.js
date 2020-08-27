// This file will handle all the values for the New Jersey property Characteristics
function NewJerseyProfile(policyForm, occupiedBy) {
    var newJersey = {};

    // Characteristics to be used
    // Medical Payments
    newJersey['MedicalPayments'] = [0, 500, 5000, 10000];

    // Water Backup
    newJersey['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        newJersey['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }
    else {
        newJersey['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    newJersey['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%"];

    // Mold
    newJersey['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    newJersey['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];

    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    newJersey.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    newJersey.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    newJersey.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') return 0;
        if (policyForm == "HO-8") return Math.round(coverageALimit * .10);
        return Math.round(coverageALimit * .20);
    }

    // Coverage E
    newJersey.getCoverageE = function (policyForm, occupiedBy) {
        if (policyForm == 'HO-8' || policyForm == 'DP-1' || policyForm == 'DP-3') {
            return 50000;
        } else {
            return 500000;
        }
    };

    // Coverage F
    newJersey.getCoverageF = function (policyForm, occupiedBy) {
        if (policyForm == 'HO-3' || policyForm == 'HO-6') {
            return 5000;
        } else {
            return 500;
        }
    };

    // AOP Deductible
    newJersey.getAOP = function(policyForm, occupiedBy)
    {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return '$500';
        } else {
            return '$1,000';
        }
    }

    // Coverage Form
    newJersey.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    }

    // Mold
    newJersey.getMold = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Excluded';
        } else {
            return '$5,000';
        }
    }

    // WaterBackup
    newJersey.getWaterBackup = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return '$0';
        } else {
            return '$5,000';
        }
    }

    // Increased Loss Assessment
    newJersey.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    }

    // Ordinance & Law
    newJersey.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    }

    // Personal Injury
    newJersey.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    }

    // Off Premesis Theft Buyback
    newJersey.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    }


    return newJersey;
}