// This file will handle all the values for the Alabama property Characteristics
function AlabamaProfile(policyForm, occupiedBy) {
    var alabama = {};

    // Characteristics to be used
    // Medical Payments
    alabama['MedicalPayments'] = [0, 500, 1000, 2500, 5000, 10000];

    // Water Backup
    alabama['WaterBackup'] = ["$0", "$5,000", "$10,000", "$20,000", "$25,000"];

    // AOP Deductible
    if (policyForm == 'HO-8' || policyForm == 'DP-1' || occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        alabama['AOPDeductible'] = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    } else {
        alabama['AOPDeductible'] = ["$1,000", "$2,500", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];
    }

    // Wind Deductible
    alabama['WindDeductible'] = ["Non Applicable", "1%", "2%", "3%", "5%", "10%"];

    // Mold
    alabama['Mold'] = ["Excluded", "$2,500", "$5,000", "$10,000"];

    // Personal Liability
    if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
        alabama['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
        alabama['PersonalLiability'] = [0, 50000, 100000, 300000];
    } else {
        alabama['PersonalLiability'] = [0, 50000, 100000, 300000, 500000, 1000000];
    }

    // Off Premesis Theft Buyback
    if (policyForm == "DP-3") {
        alabama["OffPremisesTheftBuyback"] = ["Excluded", "$5,000", "$10,000"];
    } else {
        alabama["OffPremisesTheftBuyback"] = ["Included", "Excluded"];
    }

    //-------------------------------------------------------------------------------------------------------------\\

    // This Section will deal with the Default Values

    // Coverage B
    alabama.getCoverageB = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-6') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage C
    alabama.getCoverageC = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') return 0;

        if (policyForm == 'DP-1') {
            return Math.round(coverageALimit * .15);
        } else {
            return Math.round(coverageALimit * .25);
        }
    }

    // Coverage D
    alabama.getCoverageD = function (policyForm, occupiedBy, coverageALimit) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'DP-1') return 0;

        return Math.round(coverageALimit * .10);
    }

    // Coverage E
    alabama.getCoverageE = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant') {
            return 500000;
        } else if (policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 50000;
        } else {
            return 100000;
        }
    };

    // Coverage F
    alabama.getCoverageF = function (policyForm, occupiedBy) {
        return 500;
    };

    // AOP Deductible
    alabama.getAOP = function (policyForm, occupiedBy) {
        return '$2,500';
    };

    // Coverage Form
    alabama.getCoverageForm = function (policyForm, occupiedBy) {
        if (occupiedBy == 'Builder\'s Risk' || occupiedBy == 'Vacant' || policyForm == 'HO-8' || policyForm == 'DP-1') {
            return 'Basic';
        } else {
            return 'Special';
        }
    };

    // Mold
    alabama.getMold = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Water Backup
    alabama.getWaterBackup = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Increased Loss Assessment
    alabama.getIncreasedLossAssessment = function (policyForm, occupiedBy) {
        return '$0';
    };

    // Ordinance & Law
    alabama.getOrdinanceAndLaw = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Personal Injury
    alabama.getPersonalInjury = function (policyForm, occupiedBy) {
        return 'Excluded';
    };

    // Off Premesis Theft Buyback
    alabama.getOffPremesisTheftBuyback = function (policyForm, occupiedBy) {
        return "Excluded";
    };

    return alabama;
}