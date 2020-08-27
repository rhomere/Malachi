using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ExcelLibrary.SpreadSheet;
using Excel = Microsoft.Office.Interop.Excel;

namespace Malachi.Console
{
    class Program
    {
        static void Main(string[] args)
        {
            var fileName = @"C:\Users\User\Desktop\test.xlsx";
            //Workbook book = Workbook.Load(fileName);
            //Worksheet sheet = book.Worksheets[1];
            Excel.Application xlApp = new Excel.Application();
            Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(fileName);
            Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[2];
            Excel.Range xlRange = xlWorksheet.UsedRange;

            var rowCount = 285;
            var muniCol = 2;
            var addyCol = 13;
            var cityCol = 21;
            var zipCol = 22;
            var count = 1;
            var na = "Unknown";
            
            for (int row = 2; row <= rowCount; row++)
            {
                var municipalityId = xlRange.Cells[row, muniCol].Value2;
                var address = xlRange.Cells[row, addyCol].Value2;
                var city = xlRange.Cells[row, cityCol].Value2;
                var zip = xlRange.Cells[row, zipCol].Value2;

                if (string.IsNullOrWhiteSpace(address)) address = na;
                if (string.IsNullOrWhiteSpace(city)) city = na;
                if (string.IsNullOrWhiteSpace(zip)) zip = na;

                System.Console.WriteLine($"#{count} - {municipalityId} - {address} - {city} - {zip}");
                count++;
            }
            System.Console.ReadLine();
        }
    }
}
