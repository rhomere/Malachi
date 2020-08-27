// This file will handle all the values for the louisiana property Characteristics
function LouisianaProfile(policyForm, occupiedBy) {
    var louisiana = {};

    // Characteristics to be used
    // Medical Payments
    louisiana['MedicalPayments'] = [0, 500, 1000, 2500, 5000, 10000];

    // Water Backup
    louisiana['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        louisiana['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        louisiana['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    louisiana['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%", "10%"];

    // Mold
    louisiana['Mold'] = ["Excluded", "$2,500", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        louisiana['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        louisiana['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        louisiana['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }

    // Off Premesis Theft Buyback
    if (policyForm == "DP-3") {
        louisiana["OffPremisesTheftBuyback"] = ["Excluded", "$5,000", "$10,000"];
    } else {
        louisiana["OffPremisesTheftBuyback"] = ["Included", "Excluded"];
    }

    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    louisiana.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    louisiana.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') return 0;

        if (policyForm == 'DP-1') {
            return Math.round(coverageALimit * .15);
        } else {
            return Math.round(coverageALimit * .25);
        }
    }

    // Coverage D
    louisiana.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    louisiana.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 100000;
        }
    };

    // Coverage F
    louisiana.getCoverageF = function (policyForm, occupiedBy) {
        return 500;
    };

    // AOP Deductible
    louisiana.getAOP = function (policyForm, occupiedBy) {
        return '$2,500';
    };

    // Coverage Form
    louisiana.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    louisiana.getMold = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Water Backup
    louisiana.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    louisiana.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    louisiana.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    louisiana.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    louisiana.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return "Excluded";
    };

    return louisiana;
}