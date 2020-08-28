using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ExcelLibrary.SpreadSheet;
using Malachi.Data;
using Malachi.Models;
using Excel = Microsoft.Office.Interop.Excel;

namespace Malachi.Console
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

            var rowCount = 285;
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
            var count = 1;
            var na = "Unknown";
            
            for (int row = 2; row <= rowCount; row++)
            {
                var municipalityId = $"{xlRange.Cells[row, muniIdCol].Value2}";
                var address = $"{xlRange.Cells[row, houseNumcol].Value2} {xlRange.Cells[row, streetNameCol].Value2}";
                var city = $"{xlRange.Cells[row, mailingMunicipalityCol].Value2}";
                var zip = $"{xlRange.Cells[row, zipCol].Value2}-{xlRange.Cells[row, zipExtCol].Value2}";

                if (string.IsNullOrWhiteSpace(address)) address = na;
                if (string.IsNullOrWhiteSpace(city)) city = na;
                if (string.IsNullOrWhiteSpace(zip)) zip = na;

                var pocoAddress = new Address
                {
                    Address1 = address,
                    City = city,
                    Id = Guid.NewGuid(),
                    MunicipalityId = int.Parse(municipalityId),
                    Zip = zip
                };

                using (var context = new GovernmentModel())
                {
                    context.Addresses.Add(pocoAddress);
                    context.SaveChangesAsync();
                }

                System.Console.WriteLine($"#{count} - {address} {city} {zip}");
                count++;
            }
            System.Console.ReadLine();
        }
    }
}
