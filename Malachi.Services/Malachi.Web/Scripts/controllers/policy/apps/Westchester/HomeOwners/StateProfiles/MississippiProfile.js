// This file will handle all the values for the Mississippi property Characteristics
function MississippiProfile(policyForm, occupiedBy) {
    var mississippi = {};

    // Characteristics to be used
    // Medical Payments
    mississippi['MedicalPayments'] = [0, 500, 1000, 2500, 5000, 10000];

    // Water Backup
    mississippi['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        mississippi['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        mississippi['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    mississippi['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%", "10%"];

    // Mold
    mississippi['Mold'] = ["Excluded", "$2,500", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        mississippi['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        mississippi['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        mississippi['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }

    // Off Premesis Theft Buyback
    if (policyForm == "DP-3") {
        mississippi["OffPremisesTheftBuyback"] = ["Excluded", "$5,000", "$10,000"];
    } else {
        mississippi["OffPremisesTheftBuyback"] = ["Included", "Excluded"];
    }

    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    mississippi.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    mississippi.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') return 0;

        if (policyForm == 'DP-1') {
            return Math.round(coverageALimit * .15);
        } else {
            return Math.round(coverageALimit * .25);
        }
    }

    // Coverage D
    mississippi.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    mississippi.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 100000;
        }
    };

    // Coverage F
    mississippi.getCoverageF = function (policyForm, occupiedBy) {
        return 500;
    };

    // AOP Deductible
    mississippi.getAOP = function (policyForm, occupiedBy) {
        return '$2,500';
    };

    // Coverage Form
    mississippi.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    mississippi.getMold = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Water Backup
    mississippi.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    mississippi.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    mississippi.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    mississippi.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    mississippi.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return "Excluded";
    };

    return mississippi;
}