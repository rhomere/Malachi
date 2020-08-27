MALACHIAPP.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().startsWith(text) || item[prop].toString().replace("$", "").toLowerCase().startsWith(text)) {
                        itemMatches = true;
                        break;
                    }
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});

MALACHIAPP.filter('prettyDateFilter', function () {
    return function (time) {

        var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
            diff = (((new Date()).getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);

        if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
            return;

        return day_diff == 0 && (
                diff < 60 && "just now" ||
                diff < 120 && "1 minute ago" ||
                diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
                diff < 7200 && "1 hour ago" ||
                diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
            day_diff == 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
    };
});

MALACHIAPP.filter('escape', function () {
    return window.encodeURIComponent;
});

MALACHIAPP.filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);

MALACHIAPP.filter('premiumOrderBy', ['orderByFilter', function(orderBy) {
    return function(riskCompanies, parent) {
        var out = [];
        var premiums = parent.Policy.CurrentVersion.Premiums;

        var noDeclines = $.grep(riskCompanies, function (riskCompany) { return !parent.isRiskCompanyDeclined(riskCompany.Id) });
        var declines = $.grep(riskCompanies, function (riskCompany) { return parent.isRiskCompanyDeclined(riskCompany.Id) });

        var orderedRiskCompanies = noDeclines.sort(function (a, b) {
            var premiumOne = $.grep(premiums, function (premium) { return a.Id == premium.RiskCompanyId; })[0].Premium;
            var premiumTwo = $.grep(premiums, function (premium) { return b.Id == premium.RiskCompanyId; })[0].Premium;

            if (premiumOne > premiumTwo)
                return 1;
            else if (premiumOne < premiumTwo)
                return -1;

            return 0;
        });

        out = orderedRiskCompanies.concat(declines);
        return out;
    };
}]);

MALACHIAPP.filter('riskCompanyFilter', function () {
    return function (riskCompanies, parent) {
        var out = $.grep(riskCompanies, function(riskCompany) { return !parent.isRiskCompanyDeclined(riskCompany.Id); });
        return out;
    };
});

MALACHIAPP.filter('riskCompanyFormsOrderBy', ['orderByFilter', function (orderBy) {
    return function (riskCompanies, focusedRiskCompanyId) {
        var out = [];

        var selectedRiskCompany = $.grep(riskCompanies, function (riskCompany) { return riskCompany.Id == focusedRiskCompanyId })[0];
        out.push(selectedRiskCompany);

        var otherRiskCompanies = $.grep(riskCompanies, function (riskCompany) { return riskCompany.Id != focusedRiskCompanyId });
        var orderedRiskCompanies = orderBy(otherRiskCompanies, "Name");

        out = out.concat(orderedRiskCompanies);

        return out;
    };
}]);

MALACHIAPP.filter('statesFilter', function () {
    return function (states, search, beginsWith) {
        var arr = [];

        if (!states || states.length == 0)
            return arr;

        for (var i = 0; i < states.length; i++) {
            var state = states[i];

            if (beginsWith(state.Name, search)) {
                arr.push(state);
            }
        }

        return arr;
    };
});

MALACHIAPP.filter('roundup', function() {
        return function(value) {
            return Math.ceil(value);
        };
 });
