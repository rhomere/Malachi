// This file will handle all the values for the New Jersey property Characteristics
function TexasProfile(policyForm, occupiedBy) {
    var texas = {};

    // Characteristics to be used
    // Medical Payments
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        texas['MedicalPayments'] = [0, 500, 5000, 10000];
    } else {
        texas['MedicalPayments'] = [0, 500, 1000, 5000, 10000];
    }
    

    // Water Backup
    texas['WaterBackup'] = ["$0", "$5,000", "$10,000", '$20,000', '$25,000'];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        texas['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        texas['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    texas['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%", "10%"];

    // Mold
    texas['Mold'] = ["Excluded", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        texas['PersonalLiability'] = [0, 50000, 100000, 300000, 500000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
      texas['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
      texas['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }


    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    texas.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    texas.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8') return 0;

        if (policyForm == 'HO-6') {
            return Math.round(15000);
        } else {
            return Math.round(coverageALimit * .10);
        }
    }

    // Coverage D
    texas.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    texas.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 300000;
        }
    };

    // Coverage F
    texas.getCoverageF = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 500;
        } else {
            return 5000;
        }
    };

    // AOP Deductible
    texas.getAOP = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-3' || policyForm == 'HO-6' || policyForm == 'DP-3') {
            return "$1,000";
        } else {
            return '$1,000';
        }
    };

    // Coverage Form
    texas.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    texas.getMold = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Excluded';
        } else {
            return '$5,000';
        }

    };

    // WaterBackup
    texas.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    texas.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    texas.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    texas.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    texas.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    return texas;
}