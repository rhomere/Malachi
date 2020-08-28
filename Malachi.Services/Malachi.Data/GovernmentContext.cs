using Malachi.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Malachi.Data
{
    public class GovernmentContext : DbContext
    {
        public DbSet<Address> Addresses { get; set; }
    }
}
