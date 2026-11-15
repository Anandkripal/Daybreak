"""Saved OpenXML checks do not claim native Excel calculation or rendering."""
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


class WorkbookTests(unittest.TestCase):
    def test_saved_controls_and_native_objects(self):
        with zipfile.ZipFile(ROOT / 'excel/daybreak-analyst-review.xlsx') as book:
            root = ET.fromstring(book.read('xl/worksheets/sheet1.xml'))
            cells = {cell.get('r'): cell for cell in root.findall('.//s:c', NS)}
            for address, expected in [('B22', 43800), ('C22', 25380), ('D22', 18420), ('D26', 14400)]:
                self.assertIsNotNone(cells[address].find('s:f', NS))
                self.assertEqual(float(cells[address].find('s:v', NS).text), expected)
            self.assertIn('XLOOKUP', cells['D26'].find('s:f', NS).text)
            self.assertIn('SUMIFS', cells['B7'].find('s:f', NS).text)
            self.assertIsNotNone(root.find('.//s:dataValidation', NS))
            audit = ET.fromstring(book.read('xl/worksheets/sheet5.xml'))
            self.assertIsNotNone(audit.find('.//s:conditionalFormatting', NS))
            audit_cells = {cell.get('r'): cell for cell in audit.findall('.//s:c', NS)}
            for row in range(7, 19):
                for column in 'EFG':
                    self.assertEqual(float(audit_cells[f'{column}{row}'].find('s:v', NS).text), 0)
            chart = book.read('xl/drawings/charts/chart1.xml').decode()
            self.assertIn('19647E', chart)
            self.assertIn('J23:J34', chart.replace('$', ''))
            self.assertEqual(len([name for name in book.namelist() if name.startswith('xl/tables/table')]), 2)
            self.assertFalse(any('pivotTable' in name for name in book.namelist()))


if __name__ == '__main__':
    unittest.main()
