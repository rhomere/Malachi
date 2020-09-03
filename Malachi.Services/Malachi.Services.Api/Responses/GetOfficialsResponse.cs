using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Malachi.Services.Api.Responses
{
    public class GetOfficialsResponse : BaseResponse
    {
        public List<Malachi.Models.Official> Officials { get; set; }
    }
}