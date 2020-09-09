using Malachi.Services.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Malachi.Services.Api.Controllers
{
    public class AddressController : ApiController
    {
        Address[] Addresses = new Address[]
        {
            new Address { Id = Guid.Parse("5e070a7e-0da4-49c0-91f8-36081bb4afa3"), Address1 = "467 NE 107TH Street", City = "Miami", Zip = "33161", MunicipalityId = 1 },
            new Address { Id = Guid.Parse("eb783df0-a56c-4d43-8055-e94e9dd7135f"), Address1 = "45 SE 5TH Street", City = "Miami", Zip = "33313", MunicipalityId = 1 },
            new Address { Id = Guid.Parse("aff7c028-27ad-45c4-914a-6707adaeb1dc"), Address1 = "3015 NW 79th Street", City = "Miami", Zip = "33147", MunicipalityId = 1 },
        };

        public IEnumerable<Address> GetAllAddresses()
        {
            return Addresses;
        }

        public IHttpActionResult GetAddress(string id)
        {
            var address = Addresses.FirstOrDefault(a => a.Id == Guid.Parse(id));
            if (address == null)
            {
                return NotFound();
            }
            return Ok(address);
        }
    }
}
