// This file will handle all the values for the South Carolina property Characteristics
function SouthCarolinaProfile(policyForm, occupiedBy) {
    var southCarolina = {};

    // Characteristics to be used
    // Medical Payments
    southCarolina['MedicalPayments'] = [0, 500, 5000, 10000];

    // Water Backup
    southCarolina['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        southCarolina['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        southCarolina['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    southCarolina['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%"];

    // Mold
    southCarolina['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        southCarolina['PersonalLiability'] = [0, 50000, 100000, 300000, 500000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        southCarolina['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        southCarolina['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }


    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    southCarolina.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    southCarolina.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    southCarolina.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    southCarolina.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 300000;
        }
    };

    // Coverage F
    southCarolina.getCoverageF = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 500;
        } else {
            return 5000;
        }
    };

    // AOP Deductible
    southCarolina.getAOP = function (policyForm, occupiedBy) {
        return '$1,000';
    };

    // Coverage Form
    southCarolina.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    southCarolina.getMold = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // WaterBackup
    southCarolina.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    southCarolina.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    southCarolina.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    southCarolina.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    southCarolina.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    };


    return southCarolina;
}