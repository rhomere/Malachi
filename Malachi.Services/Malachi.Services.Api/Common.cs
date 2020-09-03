using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Malachi.Services.Api
{
    public class Common
    {
        public enum HttpStatusCode
        {
            Ok = 200,
            Created = 201,
            Accepted = 202,
            BadRequest = 400,
            Denied = 401,
            Forbiden = 403
        }
    }
}