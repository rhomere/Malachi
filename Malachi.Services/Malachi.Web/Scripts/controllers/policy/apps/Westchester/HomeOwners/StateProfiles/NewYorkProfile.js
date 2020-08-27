// This file will handle all the values for the New Jersey property Characteristics
function NewYorkProfile(policyForm, occupiedBy) {
    var newYork = {};

    // Characteristics to be used
    // Medical Payments
    newYork['MedicalPayments'] = [0, 500, 5000, 10000];

    // Water Backup
    newYork['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        newYork['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }
    else {
        newYork['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    newYork['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%"];

    // Mold
    newYork['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    newYork['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];

    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    newYork.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    newYork.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    newYork.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') return 0;
        if (policyForm == "HO-8") return Math.round(coverageALimit * .10);
        return Math.round(coverageALimit * .20);
    }

    // Coverage E
    newYork.getCoverageE = function (policyForm, occupiedBy) {
        if (policyForm == 'HO-8' || policyForm == 'DP-1' || policyForm == 'DP-3') {
            return 50000;
        } else {
            return 500000;
        }
    };

    // Coverage F
    newYork.getCoverageF = function (policyForm, occupiedBy) {
        if (policyForm == 'HO-3' || policyForm == 'HO-6') {
            return 5000;
        } else {
            return 500;
        }
    };

    // AOP Deductible
    newYork.getAOP = function(policyForm, occupiedBy)
    {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return '$500';
        } else {
            return '$1,000';
        }
    }

    // Coverage Form
    newYork.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    }

    // Mold
    newYork.getMold = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Excluded';
        } else {
            return '$5,000';
        }
    }

    // WaterBackup
    newYork.getWaterBackup = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return '$0';
        } else {
            return '$5,000';
        }
    }

    // Increased Loss Assessment
    newYork.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    }

    // Ordinance & Law
    newYork.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    }

    // Personal Injury
    newYork.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    }

    // Off Premesis Theft Buyback
    newYork.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    }


    return newYork;
}