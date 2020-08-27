// This file will handle all the values for the South Carolina property Characteristics
function NorthCarolinaProfile(policyForm, occupiedBy) {
    var northCarolina = {};

    // Characteristics to be used
    // Medical Payments
    northCarolina['MedicalPayments'] = [0, 500, 5000, 10000];

    // Water Backup
    northCarolina['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        northCarolina['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        northCarolina['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    northCarolina['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%"];

    // Mold
    northCarolina['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        northCarolina['PersonalLiability'] = [0, 50000, 100000, 300000, 500000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        northCarolina['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        northCarolina['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }


    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    northCarolina.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    northCarolina.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    northCarolina.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    northCarolina.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 300000;
        }
    };

    // Coverage F
    northCarolina.getCoverageF = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 500;
        } else {
            return 5000;
        }
    };

    // AOP Deductible
    northCarolina.getAOP = function (policyForm, occupiedBy) {
        return '$1,000';
    };

    // Coverage Form
    northCarolina.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    northCarolina.getMold = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // WaterBackup
    northCarolina.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    northCarolina.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    northCarolina.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    northCarolina.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    northCarolina.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    };


    return northCarolina;
}