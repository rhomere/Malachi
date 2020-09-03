using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Malachi.Services.Api.Responses
{
    public class BaseResponse
    {
        public HttpResponse Data { get; set; }
        public List<string> Errors { get; set; }

        public BaseResponse()
        {
            Data.StatusCode = (int)Common.HttpStatusCode.Ok;
        }
    }
}