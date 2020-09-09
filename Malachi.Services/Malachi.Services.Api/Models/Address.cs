using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Malachi.Services.Api.Models
{
    public class Address
    {
        public Guid Id { get; set; }
        public int? CityId { get; set; }
        public int MunicipalityId { get; set; }
        public string Address1 { get; set; }
        public string City { get; set; }
        public string Zip { get; set; }
    }
}