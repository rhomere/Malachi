using Malachi.Data;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Excel = Microsoft.Office.Interop.Excel;

namespace Malachi.ConsoleTwo
{
    class Program
    {
        static void Main(string[] args)
        {
            //AddressBulkUpload();

            PoliciticianBulkUpload();
        }

        public static void AddressBulkUpload()
        {
            var fileName = @"C:\Users\rhomere\Desktop\GeoActual_Ranges.csv";
            //Workbook book = Workbook.Load(fileName);
            //Worksheet sheet = book.Worksheets[1];
            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(fileName);
            Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[1];
            Excel.Range xlRange = xlWorksheet.UsedRange;

            //var rowCount = 589451;
            var rowCount = 589451;
            var mailingMunicipalityCol = 9;
            var houseNumcol = 10;
            var zipCol = 15;
            var zipExtCol = 16;
            var muniIdCol = 17;
            var streetNameCol = 18;

            //var muniCol = 2;
            //var addyCol = 13;
            //var cityCol = 21;
            //var zipCol = 22;
            var count = 500001;
            var na = "Unknown";

            // Create data table
            DataTable dt = new DataTable();
            dt.Columns.Add("Id", typeof(Guid));
            dt.Columns.Add("CityId", typeof(int));
            dt.Columns.Add("MunicipalityId", typeof(int));
            dt.Columns.Add("Address1", typeof(string));
            dt.Columns.Add("City", typeof(string));
            dt.Columns.Add("Zip", typeof(string));

            for (int row = 500001; row <= rowCount; row++)
            {
                var municipalityId = $"{xlRange.Cells[row, muniIdCol].Value2}";
                var address = $"{xlRange.Cells[row, houseNumcol].Value2} {xlRange.Cells[row, streetNameCol].Value2}";
                var city = $"{xlRange.Cells[row, mailingMunicipalityCol].Value2}";
                var zip = $"{xlRange.Cells[row, zipCol].Value2}-{xlRange.Cells[row, zipExtCol].Value2}";

                if (string.IsNullOrWhiteSpace(address) && string.IsNullOrWhiteSpace(city) && string.IsNullOrWhiteSpace(zip))
                    break;

                if (string.IsNullOrWhiteSpace(address)) address = na;
                if (string.IsNullOrWhiteSpace(city)) city = na;
                if (string.IsNullOrWhiteSpace(zip)) zip = na;

                var poco = new Data.Address
                {
                    Address1 = address,
                    City = city,
                    Id = Guid.NewGuid(),
                    MunicipalityId = int.Parse(municipalityId),
                    CityId = 1,
                    Zip = zip
                };

                // add row
                dt.Rows.Add(poco.Id, null, poco.MunicipalityId, poco.Address1, poco.City, poco.Zip);

                //using (var context = new governmentdbEntities1())
                //{
                //    context.Addresses.Add(poco);
                //    context.SaveChanges();
                //}

                //System.Threading.Thread.Sleep(1);
                System.Console.WriteLine($"#{count} - {address} {city} {zip}");
                count++;
            }

            SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString.ToString());
            connection.Open();
            SqlCommand cmd = new SqlCommand("dbo.BulkInsertAddresses", connection);
            cmd.CommandType = CommandType.StoredProcedure;
            SqlParameter sqlParam = cmd.Parameters.AddWithValue("@addyTableType", dt);
            sqlParam.SqlDbType = SqlDbType.Structured;
            cmd.ExecuteNonQuery();
            connection.Close();
            System.Console.ReadLine();
        }

        public static void PoliciticianBulkUpload()
        {
            var fileName = @"C:\Users\rhomere\Desktop\Current.xlsx";
            //Workbook book = Workbook.Load(fileName);
            //Worksheet sheet = book.Worksheets[1];
            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(fileName);
            Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[1];
            Excel.Range xlRange = xlWorksheet.UsedRange;

            var rowCount = 86;
            var cityCol = 1;
            var politicianName = 2;
            var positionCol = 3;

            var count = 86;
            //var na = "Unknown";

            // Create data table
            DataTable dt = new DataTable();
            dt.Columns.Add("Id", typeof(Guid));
            dt.Columns.Add("FullName", typeof(string));
            dt.Columns.Add("Position", typeof(string));
            dt.Columns.Add("MunicipalityId", typeof(int));
            //dt.Columns.Add("CountyId", typeof(int));
            //dt.Columns.Add("StateId", typeof(int));

            for (int row = 2; row <= rowCount; row++)
            {
                var city = $"{xlRange.Cells[row, cityCol].Value2}";
                var fullName = $"{xlRange.Cells[row, politicianName].Value2}";
                var position = $"{xlRange.Cells[row, positionCol].Value2}";

                var municipalityId = GetMunicipality(city);

                if (string.IsNullOrWhiteSpace(fullName) && string.IsNullOrWhiteSpace(position))
                    break;

                var poco = new
                {
                    Id = Guid.NewGuid(),
                    FullName = fullName,
                    Position = position,
                    MunicipalityId = municipalityId
                };

                // add row
                dt.Rows.Add(poco.Id, poco.FullName, poco.Position, poco.MunicipalityId);

                System.Console.WriteLine($"#{count} - {fullName} {position} {municipalityId} {city}");
                count++;
            }

            SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString.ToString());
            connection.Open();
            SqlCommand cmd = new SqlCommand("dbo.BulkInsertOfficials", connection);
            cmd.CommandType = CommandType.StoredProcedure;
            SqlParameter sqlParam = cmd.Parameters.AddWithValue("@officialTableType", dt);
            sqlParam.SqlDbType = SqlDbType.Structured;
            cmd.ExecuteNonQuery();
            connection.Close();
            System.Console.ReadLine();
        }

        private static int GetMunicipality(string city)
        {
            switch (city.ToLower())
            {
                case "miami":
                    return 1;
                case "miami beach":
                    return 2;
                case "coral gables":
                    return 3;
                case "hialeah":
                    return 4;
                case "miami springs":
                    return 5;
                case "north miami":
                    return 6;
                case "north miami beach":
                    return 7;
                case "opa locka":
                    return 8;
                case "south miami":
                    return 9;
                case "homestead":
                    return 10;
                case "miami shores":
                    return 11;
                case "bal harbour":
                    return 12;
                case "bay harbor islands":
                    return 13;
                case "surfside":
                    return 14;
                case "west miami":
                    return 15;
                case "florida city":
                    return 16;
                case "biscayne park":
                    return 17;
                case "el portal":
                    return 18;
                case "golden beach":
                    return 19;
                case "pinecrest":
                    return 20;
                case "indian creek village":
                    return 21;
                case "medley":
                    return 22;
                case "north bay village":
                    return 23;
                case "key biscayne":
                    return 24;
                case "un-incorporated":
                    return 25;
                case "virginia gardens":
                    return 26;
                case "hialeah gardens":
                    return 27;
                case "aventura":
                    return 28;
                case "sunny isles beach":
                    return 31;
                case "miami lakes":
                    return 32;
                case "palmetto bay":
                    return 33;
                case "miami gardens":
                    return 34;
                case "doral":
                    return 35;
                case "cutler bay":
                    return 37;
                default:
                    return 0;
            }
        }
    }
}
