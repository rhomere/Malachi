// This file will handle all the values for the New Jersey property Characteristics
function FloridaProfile(policyForm, occupiedBy) {
    var florida = {};

    // Characteristics to be used
    // Medical Payments
    florida['MedicalPayments'] = [0, 500, 5000, 10000];

    // Water Backup
    florida['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        florida['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        florida['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    florida['WindDeductible'] = ["Non Applicable", "2%", "3%", "5%", '10%'];

    // Mold
    florida['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        florida['PersonalLiability'] = [0, 50000, 100000, 300000, 500000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        florida['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        florida['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }


    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    florida.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    florida.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    florida.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    florida.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 300000;
        }
    };

    // Coverage F
    florida.getCoverageF = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 500;
        } else {
            return 5000;
        }
    };

    // AOP Deductible
    florida.getAOP = function(policyForm, occupiedBy) {
        return '$2,500';
    };

    // Coverage Form
    florida.getCoverageForm = function(policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    florida.getMold = function(policyForm, occupiedBy) {
        return 'Excluded';
    };

    // WaterBackup
    florida.getWaterBackup = function(policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    florida.getIncreasedLossAssessment = function(policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    florida.getOrdinanceAndLaw = function(policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    florida.getPersonalInjury = function(policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    florida.getOffPremesisTheftBuyback = function(policyForm, occupiedBy) {
        return 'Excluded';
    };

    return florida;
}