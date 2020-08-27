// This file will handle all the values for the South Carolina property Characteristics
function VirginiaProfile(policyForm, occupiedBy) {
    var virginia = {};

    // Characteristics to be used
    // Medical Payments
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        virginia['MedicalPayments'] = [0, 500];
    } else {
        virginia['MedicalPayments'] = [0, 5000, 10000];
    }

    // Water Backup
    virginia['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        virginia['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        virginia['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    virginia['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%"];

    // Mold
    virginia['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        virginia['PersonalLiability'] = [0, 500000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        virginia['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        virginia['PersonalLiability'] = [0, 100000, 300000, 500000, 1000000];
    }


    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    virginia.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    virginia.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    virginia.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    virginia.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 300000;
        }
    };

    // Coverage F
    virginia.getCoverageF = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 500;
        } else {
            return 5000;
        }
    };

    // AOP Deductible
    virginia.getAOP = function (policyForm, occupiedBy) {
        return '$1,000';
    };

    // Coverage Form
    virginia.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    virginia.getMold = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // WaterBackup
    virginia.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    virginia.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    virginia.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    virginia.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    virginia.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    };


    return virginia;
}