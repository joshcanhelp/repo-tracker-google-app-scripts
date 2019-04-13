/**
 * Google Sheet helpers.
 */

function SheetUtil() {
  this.sheet = SpreadsheetApp.getActiveSheet();
}

/**
 * Get non-empty values for a range.
 *
 * @param {string} rowNum - The row number to get.
 */
SheetUtil.prototype.getRowValues = function(rowNum) {
  return this.getRow(rowNum).filter(function(el) {
    return el.length;
  });
};

/**
 *
 */
SheetUtil.prototype.getRow = function(rowNum) {
  return this.sheet.getRange(rowNum + ":" + rowNum).getValues()[0];
};

/**
 * Get a value for a cell.
 *
 * @param {integer} row - The row number, 1-based.
 * @param {integer} col - The column number, 1-based.
 *
 * @return {*}
 */
SheetUtil.prototype.getValue = function(row, col) {
  return this.sheet.getRange(row, col).getValue();
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
 * Get an index of all updatable columns
 */
SheetUtil.prototype.getUpdateIndex = function() {
  var rowIndex = {};
  var rowValues = this.getRowValues(2);

  this.getRow(2).forEach(function(el, index) {
    if (el === rowValues[0]) {
      rowIndex[index + 1] = rowValues.shift();
    }
  });

  return rowIndex;
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
