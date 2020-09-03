using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Malachi.Models
{
    public class Official
    {
        public string Name { get; set; }
        public string Position { get; set; }
        public int MunicipalityId { get; set; }
        public int Index { get; set; }

        public Official(Malachi.Data.Official poco)
        {
            Name = poco.Name;
            Position = poco.Position;
            MunicipalityId = poco.MunicipalityId;
            Index = GetIndex(poco.Position);
        }

        private int GetIndex(string position)
        {
            switch (position.ToLower())
            {
                case "mayor":
                    return 1;
                case "president":
                    return 1;
                case "vice mayor":
                    return 2;
                case "vice-president":
                    return 2;
                case "commissioner":
                    return 3;
                case "councilmember":
                    return 3;
                case "manager":
                    return 4;
                case "attorney":
                    return 5;
                case "clerk":
                    return 6;
                default:
                    throw new Exception();
            }
        }
    }
}
