using Malachi.Data;
using Malachi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Malachi.Services.Api.Services
{
    public class OfficialsService
    {
        public static object GetOfficials(Requests.GetOfficialsRequest request)
        {
            using(var context = new governmentdbEntities1())
            {
                var addressRes = context.Addresses.FirstOrDefault(x => x.Address1.ToLower() == request.Address.ToLower() && x.City == request.City || x.Address1.ToLower().Contains(request.Address) && x.City.ToLower() == request.City.ToLower());
                if (addressRes == null)
                {
                    return "Address not found";
                }
                var officials = context.Officials.Where(x => x.MunicipalityId == addressRes.MunicipalityId).ToList();
                var officialsList = officials.Select(x => new Malachi.Models.Official(x)).OrderBy(x => x.Index).ToList();
                if (officialsList.Count == 0)
                {
                    return "Officials not found";
                }
                return officialsList;
            }
        }
    }
}