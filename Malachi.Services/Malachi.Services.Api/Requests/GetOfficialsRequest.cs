using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Malachi.Services.Api.Requests
{
    public class GetOfficialsRequest
    {
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string zip { get; set; }
    }
}