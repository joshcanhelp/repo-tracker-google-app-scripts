/**
 * Google Sheet helpers.
 */

function SheetUtil() {
  this.sheet = SpreadsheetApp.getActiveSheet();
}

/**
 * Get non-empty values for a range.
 *
 * @param {string} range - The range of cells to get.
 */
SheetUtil.prototype.getValues = function(range) {
  return this.sheet
    .getRange(range)
    .getValues()[0]
    .filter(function(el) {
      return el.length;
    });
};

/**
 * Get a value for a cell.
 *
 * @param {integer} row - The row number, 1-based.
 * @param {integer} col - The column number, 1-based.
 */
SheetUtil.prototype.getValue = function(row, col, lower) {
  var value = this.sheet.getRange(row, col).getValue();
  return lower ? value.toString().toLowerCase() : value;
};

/**
 * Set a value for a cell.
 *
 * @param {integer} row - The row number, 1-based.
 * @param {integer} col - The column number, 1-based.
 */
SheetUtil.prototype.setValue = function(row, col, val) {
  this.sheet.getRange(row, col).setValue(val);
};

/**
 * Get all repo names.
 */
SheetUtil.prototype.getRepoNames = function() {
  return this.sheet
    .getSheets()[0]
    .getRange("A:A")
    .getValues()
    .filter(function(el) {
      return el && el !== "Name";
    });
};
