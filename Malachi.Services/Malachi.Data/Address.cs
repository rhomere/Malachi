//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Malachi.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class Address
    {
        public System.Guid Id { get; set; }
        public Nullable<int> CityId { get; set; }
        public int MunicipalityId { get; set; }
        public string Address1 { get; set; }
        public string City { get; set; }
        public string Zip { get; set; }
    }
}