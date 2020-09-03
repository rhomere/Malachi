using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Malachi.Services.Api.Controllers
{
    public class OfficialsController : Controller
    {
        // GET: Officials
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public Responses.GetOfficialsResponse GetOfficials(Requests.GetOfficialsRequest request)
        {
            var response = new Responses.GetOfficialsResponse();
            var officialsResult = Services.OfficialsService.GetOfficials(request);
            if (officialsResult.GetType() == typeof(string))
            {
                response.Data.StatusCode = (int)Common.HttpStatusCode.Ok;
                response.Errors.Add(officialsResult.ToString());
            }
            else if (officialsResult.GetType() == typeof(List<Malachi.Models.Official>))
            {
                response.Officials = officialsResult as List<Malachi.Models.Official>;
            }
            else
                throw new Exception();
            return response;
        }
    }
}