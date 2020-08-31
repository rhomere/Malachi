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
    }
}
