// This file will handle all the values for the South Carolina property Characteristics
function GeorgiaProfile(policyForm, occupiedBy) {
    var georgia = {};

    // Characteristics to be used
    // Medical Payments
    georgia['MedicalPayments'] = [0, 500, 5000, 10000];

    // Water Backup
    georgia['WaterBackup'] = ["Excluded", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        georgia['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        georgia['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    georgia['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%"];

    // Mold
    georgia['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        georgia['PersonalLiability'] = [0, 50000, 100000, 300000, 500000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        georgia['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        georgia['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }


    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    georgia.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    georgia.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    georgia.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    georgia.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 300000;
        }
    };

    // Coverage F
    georgia.getCoverageF = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 500;
        } else {
            return 5000;
        }
    };

    // AOP Deductible
    georgia.getAOP = function (policyForm, occupiedBy) {
        return '$1,000';
    };

    // Coverage Form
    georgia.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    georgia.getMold = function (policyForm, occupiedBy) {
        return '$0';
    };

    // WaterBackup
    georgia.getWaterBackup = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Increased Loss Assessment
    georgia.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    georgia.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    georgia.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    georgia.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    };


    return georgia;
}